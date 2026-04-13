/**
 * Trust Score Service
 * Çok sinyalli güven puanı motoru — her kullanıcı için 0-100 arası skor üretir.
 */
import {
  collection, getDocs, query, where, limit, doc,
  updateDoc, addDoc, serverTimestamp, Timestamp, getDoc
} from 'firebase/firestore';
import { db } from '../firebase';

// ── Tip Tanımları ─────────────────────────────────────────────────────────────

export interface TrustScore {
  total: number;           // 0-100
  level: TrustLevel;
  badges: TrustBadge[];
  breakdown: ScoreBreakdown;
  restrictions: UserRestrictions;
  riskReasons: string[];
  calculatedAt: string;
}

export type TrustLevel =
  | 'trusted'      // 80-100 — Güvenilir Satıcı
  | 'standard'     // 60-79  — Standart Satıcı
  | 'new'          // 35-59  — Yeni Satıcı
  | 'risky'        // 0-34   — İnceleme Altında

export interface TrustBadge {
  id: string;
  label: string;
  color: string;
  icon: string;
}

export interface ScoreBreakdown {
  accountAge: number;
  emailVerified: number;
  phoneVerified: number;
  kycVerified: number;
  completedOrders: number;
  cancelPenalty: number;
  disputePenalty: number;
  complaintPenalty: number;
  avgRating: number;
  deliverySpeed: number;
  chargebackPenalty: number;
}

export interface UserRestrictions {
  maxActiveListings: number | null;  // null = sınırsız
  msgLimitPerHour: number | null;
  withdrawDelayDays: number;
  requiresManualReview: boolean;
  isUnderWatch: boolean;
}

// ── Sabit Sınır Değerleri ─────────────────────────────────────────────────────

const LEVEL_THRESHOLDS = {
  trusted: 80,
  standard: 60,
  new: 35,
} as const;

const RESTRICTIONS_BY_LEVEL: Record<TrustLevel, UserRestrictions> = {
  trusted:  { maxActiveListings: null, msgLimitPerHour: null, withdrawDelayDays: 0,  requiresManualReview: false, isUnderWatch: false },
  standard: { maxActiveListings: null, msgLimitPerHour: null, withdrawDelayDays: 1,  requiresManualReview: false, isUnderWatch: false },
  new:      { maxActiveListings: 10,   msgLimitPerHour: 30,   withdrawDelayDays: 3,  requiresManualReview: false, isUnderWatch: false },
  risky:    { maxActiveListings: 3,    msgLimitPerHour: 10,   withdrawDelayDays: 7,  requiresManualReview: true,  isUnderWatch: true  },
};

const BADGE_DEFS: Record<string, TrustBadge> = {
  trusted_seller:   { id: 'trusted_seller',   label: 'Güvenilir Satıcı',   color: 'emerald', icon: 'shield' },
  fast_delivery:    { id: 'fast_delivery',     label: 'Hızlı Teslimat',     color: 'blue',    icon: 'zap' },
  low_risk:         { id: 'low_risk',          label: 'Düşük Risk',         color: 'green',   icon: 'check' },
  verified_id:      { id: 'verified_id',       label: 'Kimlik Doğrulanmış', color: 'purple',  icon: 'badge-check' },
  top_seller:       { id: 'top_seller',        label: 'Çok Satan',          color: 'amber',   icon: 'trophy' },
  new_seller:       { id: 'new_seller',        label: 'Yeni Satıcı',        color: 'gray',    icon: 'user' },
  under_review:     { id: 'under_review',      label: 'İnceleme Altında',   color: 'red',     icon: 'eye' },
  high_rating:      { id: 'high_rating',       label: 'Yüksek Puan',        color: 'yellow',  icon: 'star' },
};

// ── Skor Hesaplama ─────────────────────────────────────────────────────────────

export function calculateTrustScore(userData: any, orders: any[], disputes: any[], complaints: any[]): TrustScore {
  const breakdown: ScoreBreakdown = {
    accountAge: 0, emailVerified: 0, phoneVerified: 0, kycVerified: 0,
    completedOrders: 0, cancelPenalty: 0, disputePenalty: 0,
    complaintPenalty: 0, avgRating: 0, deliverySpeed: 0, chargebackPenalty: 0,
  };
  const riskReasons: string[] = [];

  // 1. Hesap yaşı (max 12 puan)
  const createdAt = userData.createdAt?.toDate?.() || new Date(userData.createdAt || Date.now());
  const ageMonths = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30);
  breakdown.accountAge = Math.min(12, Math.floor(ageMonths * 1.5));

  // 2. E-posta doğrulama (8 puan)
  if (userData.emailVerified || userData.email) breakdown.emailVerified = 8;

  // 3. Telefon doğrulama (10 puan)
  if (userData.smsVerified || userData.phoneVerified) breakdown.phoneVerified = 10;
  else riskReasons.push('Telefon doğrulanmamış');

  // 4. Kimlik doğrulama (20 puan)
  if (userData.kycStatus === 'verified') breakdown.kycVerified = 20;
  else if (userData.kycStatus === 'pending') breakdown.kycVerified = 5;
  else riskReasons.push('KYC tamamlanmamış');

  // 5. Tamamlanan sipariş (max 20 puan)
  const completed = orders.filter((o: any) => o.status === 'completed' || o.status === 'Tamamlandı').length;
  breakdown.completedOrders = Math.min(20, completed * 2);

  // 6. İptal oranı cezası (max -15)
  const cancelled = orders.filter((o: any) => o.status === 'cancelled' || o.status === 'İptal').length;
  const cancelRate = orders.length > 0 ? cancelled / orders.length : 0;
  if (cancelRate > 0.3) { breakdown.cancelPenalty = -15; riskReasons.push(`İptal oranı yüksek (%${Math.round(cancelRate * 100)})`); }
  else if (cancelRate > 0.15) { breakdown.cancelPenalty = -8; riskReasons.push(`İptal oranı orta (%${Math.round(cancelRate * 100)})`); }
  else if (cancelRate > 0.05) breakdown.cancelPenalty = -3;

  // 7. Uyuşmazlık oranı cezası (max -20)
  const openDisputes = disputes.filter((d: any) => d.status !== 'resolved' && d.status !== 'closed').length;
  const disputeRate = orders.length > 0 ? disputes.length / orders.length : 0;
  if (disputeRate > 0.2 || openDisputes > 3) { breakdown.disputePenalty = -20; riskReasons.push(`Uyuşmazlık oranı yüksek (${disputes.length})`); }
  else if (disputeRate > 0.1 || openDisputes > 1) { breakdown.disputePenalty = -10; riskReasons.push(`Uyuşmazlık var (${disputes.length})`); }
  else if (disputes.length > 0) breakdown.disputePenalty = -5;

  // 8. Son 30 gün şikayet cezası (max -15)
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const recentComplaints = complaints.filter((c: any) => {
    const t = c.createdAt?.toDate?.()?.getTime?.() || new Date(c.createdAt || 0).getTime();
    return t > thirtyDaysAgo;
  }).length;
  if (recentComplaints >= 5) { breakdown.complaintPenalty = -15; riskReasons.push(`Son 30 günde ${recentComplaints} şikayet`); }
  else if (recentComplaints >= 3) { breakdown.complaintPenalty = -8; riskReasons.push(`Son 30 günde ${recentComplaints} şikayet`); }
  else if (recentComplaints >= 1) breakdown.complaintPenalty = -4;

  // 9. Ortalama puan (max 10 puan)
  const rating = Number(userData.rating || userData.averageRating || 0);
  if (rating >= 4.8) breakdown.avgRating = 10;
  else if (rating >= 4.5) breakdown.avgRating = 7;
  else if (rating >= 4.0) breakdown.avgRating = 4;
  else if (rating >= 3.0) breakdown.avgRating = 1;
  else if (rating > 0 && rating < 3.0) { breakdown.avgRating = -5; riskReasons.push(`Düşük puan (${rating.toFixed(1)})`); }

  // 10. Chargeback / iade riski (max -10)
  const chargebacks = orders.filter((o: any) => o.chargebacked || o.fraudFlag).length;
  if (chargebacks > 0) { breakdown.chargebackPenalty = -10; riskReasons.push(`${chargebacks} chargeback/iade riski`); }

  // Toplam hesapla
  const raw = Object.values(breakdown).reduce((s, v) => s + v, 0);
  const total = Math.max(0, Math.min(100, raw));

  // Seviye belirle
  let level: TrustLevel = 'risky';
  if (total >= LEVEL_THRESHOLDS.trusted) level = 'trusted';
  else if (total >= LEVEL_THRESHOLDS.standard) level = 'standard';
  else if (total >= LEVEL_THRESHOLDS.new) level = 'new';

  // Rozetler
  const badges: TrustBadge[] = [];
  if (level === 'trusted') badges.push(BADGE_DEFS.trusted_seller);
  if (level === 'risky') badges.push(BADGE_DEFS.under_review);
  if (level === 'new') badges.push(BADGE_DEFS.new_seller);
  if (breakdown.kycVerified === 20) badges.push(BADGE_DEFS.verified_id);
  if (rating >= 4.8 && (userData.reviewCount || 0) >= 10) badges.push(BADGE_DEFS.high_rating);
  if (completed >= 50) badges.push(BADGE_DEFS.top_seller);
  if (riskReasons.length === 0 && total >= 60) badges.push(BADGE_DEFS.low_risk);

  return {
    total,
    level,
    badges,
    breakdown,
    restrictions: RESTRICTIONS_BY_LEVEL[level],
    riskReasons,
    calculatedAt: new Date().toISOString(),
  };
}

// ── Firestore'a Kaydet ve Logla ───────────────────────────────────────────────

export async function computeAndSaveTrustScore(userId: string): Promise<TrustScore | null> {
  try {
    const userSnap = await getDoc(doc(db, 'users', userId));
    if (!userSnap.exists()) return null;
    const userData = userSnap.data();

    const [ordersSnap, disputesSnap, complaintsSnap] = await Promise.all([
      getDocs(query(collection(db, 'orders'), where('sellerId', '==', userId), limit(200))),
      getDocs(query(collection(db, 'disputes'), where('sellerId', '==', userId), limit(50))),
      getDocs(query(collection(db, 'reports'), where('targetId', '==', userId), limit(50))),
    ]);

    const orders    = ordersSnap.docs.map(d => d.data());
    const disputes  = disputesSnap.docs.map(d => d.data());
    const complaints = complaintsSnap.docs.map(d => d.data());

    const score = calculateTrustScore(userData, orders, disputes, complaints);

    const prevScore = userData.trustScore?.total ?? null;

    await updateDoc(doc(db, 'users', userId), {
      trustScore: score.total,
      trustLevel: score.level,
      trustBadges: score.badges.map(b => b.id),
      trustRestrictions: score.restrictions,
      trustRiskReasons: score.riskReasons,
      trustBreakdown: score.breakdown,
      trustCalculatedAt: serverTimestamp(),
      // risk kısıtları flat
      maxActiveListings: score.restrictions.maxActiveListings,
      withdrawDelayDays: score.restrictions.withdrawDelayDays,
      requiresManualReview: score.restrictions.requiresManualReview,
      isUnderWatch: score.restrictions.isUnderWatch,
    });

    if (prevScore !== null && Math.abs(prevScore - score.total) >= 3) {
      await addDoc(collection(db, 'trustScoreLogs'), {
        userId,
        prevScore,
        newScore: score.total,
        level: score.level,
        riskReasons: score.riskReasons,
        createdAt: serverTimestamp(),
      });
    }

    return score;
  } catch (e) {
    console.error('trustScore error:', e);
    return null;
  }
}

export async function batchComputeTrustScores(userIds: string[]): Promise<void> {
  for (const uid of userIds) {
    await computeAndSaveTrustScore(uid);
  }
}

// ── Yardımcı Fonksiyonlar ─────────────────────────────────────────────────────

export function getTrustLevelLabel(level: TrustLevel): string {
  const map: Record<TrustLevel, string> = {
    trusted: 'Güvenilir Satıcı',
    standard: 'Standart Satıcı',
    new: 'Yeni Satıcı',
    risky: 'İnceleme Altında',
  };
  return map[level] || 'Bilinmiyor';
}

export function getTrustLevelColor(level: TrustLevel): string {
  const map: Record<TrustLevel, string> = {
    trusted: 'text-emerald-400',
    standard: 'text-blue-400',
    new: 'text-gray-400',
    risky: 'text-red-400',
  };
  return map[level] || 'text-gray-400';
}

export function getTrustLevelBg(level: TrustLevel): string {
  const map: Record<TrustLevel, string> = {
    trusted: 'bg-emerald-500/10 border-emerald-500/20',
    standard: 'bg-blue-500/10 border-blue-500/20',
    new: 'bg-gray-500/10 border-gray-500/20',
    risky: 'bg-red-500/10 border-red-500/20',
  };
  return map[level] || 'bg-gray-500/10 border-gray-500/20';
}

export function getSimplifiedTrustLabel(score: number): string {
  if (score >= 80) return 'Yüksek Güven';
  if (score >= 60) return 'Orta Güven';
  if (score >= 35) return 'Düşük Güven';
  return 'Riskli';
}

export function getSimplifiedTrustStars(score: number): number {
  if (score >= 80) return 5;
  if (score >= 65) return 4;
  if (score >= 50) return 3;
  if (score >= 35) return 2;
  return 1;
}
