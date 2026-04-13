/**
 * Automation Service — Admin Panel Background Engine
 * Tüm otomatik işlemleri çalıştırır.
 */
import {
  collection, getDocs, query, limit, orderBy, doc, updateDoc,
  addDoc, serverTimestamp, where, setDoc, Timestamp, getDoc
} from 'firebase/firestore';
import { db } from '../firebase';

export interface AutomationResult {
  rule: string;
  count: number;
  details: string[];
  errors: string[];
}

export interface AutomationConfig {
  listingBannedWordCheck: boolean;
  listingDuplicateCheck: boolean;
  listingPriceAnomaly: boolean;
  userRiskScore: boolean;
  multiAccountDetection: boolean;
  failedPaymentTracking: boolean;
  autoOrderComplete: boolean;
  ticketAutoAssign: boolean;
  ticketFaqAutoReply: boolean;
  giveawayAutoClose: boolean;
  campaignAutoActivate: boolean;
  withdrawalAutoQueue: boolean;
  criticalAlerts: boolean;
  messageProfanityCheck: boolean;
  autoOrderCompleteDays: number;
  priceAnomalyMinMultiplier: number;
  priceAnomalyMaxMultiplier: number;
  withdrawalAutoMaxAmount: number;
}

export const DEFAULT_CONFIG: AutomationConfig = {
  listingBannedWordCheck: true,
  listingDuplicateCheck: true,
  listingPriceAnomaly: true,
  userRiskScore: true,
  multiAccountDetection: true,
  failedPaymentTracking: true,
  autoOrderComplete: true,
  ticketAutoAssign: true,
  ticketFaqAutoReply: true,
  giveawayAutoClose: true,
  campaignAutoActivate: true,
  withdrawalAutoQueue: true,
  criticalAlerts: true,
  messageProfanityCheck: true,
  autoOrderCompleteDays: 3,
  priceAnomalyMinMultiplier: 0.05,
  priceAnomalyMaxMultiplier: 20,
  withdrawalAutoMaxAmount: 500,
};

const TICKET_DEPARTMENTS: { keywords: string[]; dept: string }[] = [
  { keywords: ['ödeme', 'para', 'fiyat', 'ücret', 'bakiye', 'çekim', 'iade', 'komisyon'], dept: 'finance' },
  { keywords: ['teknik', 'hata', 'çalışmıyor', 'sorun', 'bug', 'sistem', 'login', 'şifre'], dept: 'technical' },
  { keywords: ['ilan', 'satış', 'ürün', 'onay', 'reddedildi', 'moderasyon'], dept: 'moderation' },
  { keywords: ['hesap', 'profil', 'doğrulama', 'askıya', 'ban', 'yasak'], dept: 'accounts' },
];

const FAQ_PATTERNS: { pattern: RegExp; reply: string }[] = [
  {
    pattern: /para.?çek|çekim.?ne.?zaman|ödeme.?ne.?zaman|bakiye.?ne.?zaman/i,
    reply: 'Para çekim işlemleriniz genellikle 1-3 iş günü içinde hesabınıza aktarılır. Hafta sonu yapılan talepler Pazartesi günü işleme alınır.',
  },
  {
    pattern: /ilan.?nasıl.?ekl|nasıl.?ilan.?ver|ilan.?ekle/i,
    reply: '"İlan Ekle" sayfasından ilan başlığı, açıklama ve fiyat bilgilerini girerek ilanınızı yayınlayabilirsiniz. İlanınız moderasyon onayından sonra yayına alınır.',
  },
  {
    pattern: /şifr.?unutt|şifre.?sıfır|parola.?sıfır/i,
    reply: 'Şifrenizi sıfırlamak için giriş sayfasındaki "Şifremi Unuttum" bağlantısını kullanabilirsiniz. E-postanıza sıfırlama bağlantısı gönderilecektir.',
  },
  {
    pattern: /hesap.?askıya|neden.?askıya|ban.?nedeni|neden.?yasaklandı/i,
    reply: 'Hesabınız kullanım koşullarına aykırı davranış nedeniyle kısıtlanmış olabilir. Detaylı bilgi için destek ekibimize e-posta gönderebilirsiniz.',
  },
  {
    pattern: /kargo|teslimat|ne.?zaman.?gelir|sipariş.?durumu/i,
    reply: 'Sipariş durumunuzu "Siparişlerim" sayfasından takip edebilirsiniz. Dijital ürünler anında teslim edilir, fiziksel ürünler için kargo bilgisi siparişinizde görüntülenir.',
  },
];

const log = async (rule: string, entityId: string, details: any, actorRole = 'system') => {
  try {
    await addDoc(collection(db, 'adminLogs'), {
      actorId: 'system', actorRole, action: rule, entity: 'automation',
      entityId, details, createdAt: serverTimestamp(),
    });
  } catch { /* silent */ }
};

const sendSystemNotification = async (userId: string, title: string, body: string, link?: string) => {
  try {
    await addDoc(collection(db, 'notifications'), {
      userId, title, message: body, body, link: link || null, isRead: false, read: false,
      type: 'system', createdAt: serverTimestamp(),
    });
  } catch { /* silent */ }
};

const sendAdminAlert = async (type: string, message: string, data?: any) => {
  try {
    await addDoc(collection(db, 'adminAlerts'), {
      type, message, data: data || {}, resolved: false,
      severity: ['critical', 'high'].includes(type) ? 'high' : 'medium',
      createdAt: serverTimestamp(),
    });
  } catch { /* silent */ }
};

// ─── 1. LISTING BANNED WORD CHECK ──────────────────────────────────────────────
export async function runListingBannedWordCheck(): Promise<AutomationResult> {
  const result: AutomationResult = { rule: 'listing.bannedWordCheck', count: 0, details: [], errors: [] };
  try {
    const [productsSnap, settingsSnap] = await Promise.all([
      getDocs(query(collection(db, 'products'), where('moderationStatus', '==', 'approved'), limit(500))),
      getDocs(collection(db, 'siteSettings')),
    ]);
    const settingsDoc = settingsSnap.docs.find(d => d.id === 'moderation');
    const bannedWords: string[] = settingsDoc?.data()?.bannedWords || [];
    if (bannedWords.length === 0) return result;

    for (const d of productsSnap.docs) {
      const p = d.data();
      const text = `${p.title || ''} ${p.description || ''}`.toLowerCase();
      const found = bannedWords.filter(w => text.includes(w.toLowerCase()));
      if (found.length > 0) {
        await updateDoc(doc(db, 'products', d.id), {
          moderationStatus: 'flagged', flagReason: `Yasaklı kelime: ${found.join(', ')}`,
          flaggedAt: serverTimestamp(), flaggedBy: 'system',
        });
        await log('listing.bannedWordFlagged', d.id, { words: found, title: p.title });
        result.count++;
        result.details.push(`"${p.title?.slice(0, 40)}" — kelimeler: ${found.join(', ')}`);
      }
    }
  } catch (e: any) { result.errors.push(e.message); }
  return result;
}

// ─── 2. DUPLICATE LISTING DETECTION ─────────────────────────────────────────
export async function runDuplicateListingCheck(): Promise<AutomationResult> {
  const result: AutomationResult = { rule: 'listing.duplicateCheck', count: 0, details: [], errors: [] };
  try {
    const snap = await getDocs(query(collection(db, 'products'), limit(500)));
    const products = snap.docs.map(d => ({ id: d.id, ...d.data() as any }));
    const seen = new Map<string, string>();

    for (const p of products) {
      if (p.moderationStatus === 'deleted') continue;
      const key = `${p.sellerId || p.userId}_${(p.title || '').toLowerCase().trim()}`;
      if (seen.has(key)) {
        const originalId = seen.get(key)!;
        if (p.id !== originalId) {
          await updateDoc(doc(db, 'products', p.id), {
            moderationStatus: 'flagged', flagReason: 'Tekrar eden ilan',
            flaggedAt: serverTimestamp(), flaggedBy: 'system', duplicateOf: originalId,
          });
          await log('listing.duplicateFlagged', p.id, { originalId, title: p.title });
          result.count++;
          result.details.push(`"${p.title?.slice(0, 40)}" — orijinal: ${originalId.slice(0, 8)}`);
        }
      } else {
        seen.set(key, p.id);
      }
    }
  } catch (e: any) { result.errors.push(e.message); }
  return result;
}

// ─── 3. PRICE ANOMALY DETECTION ─────────────────────────────────────────────
export async function runPriceAnomalyCheck(config: AutomationConfig): Promise<AutomationResult> {
  const result: AutomationResult = { rule: 'listing.priceAnomaly', count: 0, details: [], errors: [] };
  try {
    const snap = await getDocs(query(collection(db, 'products'), where('moderationStatus', 'in', ['approved', 'pending']), limit(500)));
    const products = snap.docs.map(d => ({ id: d.id, ...d.data() as any }));

    const categoryPrices = new Map<string, number[]>();
    products.forEach(p => {
      const price = Number(p.price || 0);
      if (price > 0) {
        const cat = p.category || 'other';
        if (!categoryPrices.has(cat)) categoryPrices.set(cat, []);
        categoryPrices.get(cat)!.push(price);
      }
    });

    for (const p of products) {
      const price = Number(p.price || 0);
      if (price <= 0) continue;
      const cat = p.category || 'other';
      const prices = categoryPrices.get(cat) || [];
      if (prices.length < 3) continue;

      const avg = prices.reduce((s, v) => s + v, 0) / prices.length;
      const isAnomaly = price < avg * config.priceAnomalyMinMultiplier || price > avg * config.priceAnomalyMaxMultiplier;
      if (isAnomaly && !p.priceAnomalyFlag) {
        await updateDoc(doc(db, 'products', p.id), {
          priceAnomalyFlag: true, priceAnomalyReason: `Fiyat anormalliği: ${price}₺ (kategori ort: ${avg.toFixed(2)}₺)`,
          priceAnomalyAt: serverTimestamp(),
        });
        await sendAdminAlert('price_anomaly', `Fiyat anormalliği: ${p.title?.slice(0, 40)} — ${price}₺`, { productId: p.id });
        await log('listing.priceAnomaly', p.id, { price, avg, category: cat });
        result.count++;
        result.details.push(`"${p.title?.slice(0, 40)}" — ${price}₺ (ort: ${avg.toFixed(0)}₺)`);
      }
    }
  } catch (e: any) { result.errors.push(e.message); }
  return result;
}

// ─── 4. USER RISK SCORE ───────────────────────────────────────────────────────
export async function runUserRiskScore(): Promise<AutomationResult> {
  const result: AutomationResult = { rule: 'user.riskScore', count: 0, details: [], errors: [] };
  try {
    const usersSnap = await getDocs(query(collection(db, 'users'), limit(300)));
    for (const ud of usersSnap.docs) {
      const u = ud.data();
      let risk = 0;
      const reasons: string[] = [];

      if (!u.emailVerified) { risk += 20; reasons.push('E-posta doğrulanmamış'); }
      if (!u.kycVerified && u.totalOrders > 5) { risk += 15; reasons.push('KYC tamamlanmamış'); }
      if (u.failedPayments > 2) { risk += u.failedPayments * 5; reasons.push(`${u.failedPayments} başarısız ödeme`); }
      if (u.reportCount > 0) { risk += u.reportCount * 10; reasons.push(`${u.reportCount} rapor`); }
      if (u.disputeCount > 1) { risk += u.disputeCount * 8; reasons.push(`${u.disputeCount} uyuşmazlık`); }

      const createdAt = u.createdAt?.toDate?.();
      if (createdAt) {
        const daysSince = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSince < 7) { risk += 15; reasons.push('Yeni hesap (<7 gün)'); }
      }

      const level = risk >= 60 ? 'high' : risk >= 30 ? 'medium' : 'low';
      if (u.riskScore !== risk || u.riskLevel !== level) {
        await updateDoc(doc(db, 'users', ud.id), {
          riskScore: risk, riskLevel: level, riskReasons: reasons, riskUpdatedAt: serverTimestamp(),
        });
        if (level === 'high' && u.riskLevel !== 'high') {
          await sendAdminAlert('high_risk_user', `Yüksek riskli kullanıcı: ${u.email || ud.id.slice(0, 10)} (${risk} puan)`, { userId: ud.id, risk, reasons });
          result.count++;
          result.details.push(`${u.email || ud.id.slice(0, 10)} — risk: ${risk} (${level})`);
        }
      }
    }
  } catch (e: any) { result.errors.push(e.message); }
  return result;
}

// ─── 5. MULTI-ACCOUNT DETECTION ──────────────────────────────────────────────
export async function runMultiAccountDetection(): Promise<AutomationResult> {
  const result: AutomationResult = { rule: 'user.multiAccount', count: 0, details: [], errors: [] };
  try {
    const snap = await getDocs(query(collection(db, 'users'), limit(500)));
    const users = snap.docs.map(d => ({ id: d.id, ...d.data() as any }));

    const phoneMap = new Map<string, string[]>();
    const ipMap = new Map<string, string[]>();
    const emailPrefixMap = new Map<string, string[]>();

    users.forEach(u => {
      if (u.phone) {
        const p = u.phone.replace(/\D/g, '');
        if (p.length >= 10) {
          if (!phoneMap.has(p)) phoneMap.set(p, []);
          phoneMap.get(p)!.push(u.id);
        }
      }
      if (u.lastIp) {
        if (!ipMap.has(u.lastIp)) ipMap.set(u.lastIp, []);
        ipMap.get(u.lastIp)!.push(u.id);
      }
      if (u.email) {
        const prefix = u.email.split('@')[0].replace(/[\d.+_-]/g, '').toLowerCase();
        if (prefix.length >= 4) {
          if (!emailPrefixMap.has(prefix)) emailPrefixMap.set(prefix, []);
          emailPrefixMap.get(prefix)!.push(u.id);
        }
      }
    });

    const flagged = new Set<string>();
    const checkMap = (map: Map<string, string[]>, reason: string) => {
      map.forEach((ids) => {
        if (ids.length >= 2 && !flagged.has(ids.join(','))) {
          flagged.add(ids.join(','));
          ids.forEach(async (id) => {
            const u = users.find(x => x.id === id);
            if (!u?.multiAccountSuspect) {
              await updateDoc(doc(db, 'users', id), { multiAccountSuspect: true, multiAccountReason: reason, multiAccountWith: ids.filter(x => x !== id) });
              await log('user.multiAccountFlagged', id, { reason, relatedIds: ids });
            }
          });
          result.count++;
          result.details.push(`${reason}: ${ids.map(id => id.slice(0, 8)).join(', ')}`);
        }
      });
    };

    checkMap(phoneMap, 'Aynı telefon numarası');
    checkMap(ipMap, 'Aynı IP adresi');
    if (result.count > 0) {
      await sendAdminAlert('multi_account', `${result.count} çoklu hesap şüphesi tespit edildi`);
    }
  } catch (e: any) { result.errors.push(e.message); }
  return result;
}

// ─── 6. FAILED PAYMENT TRACKING ──────────────────────────────────────────────
export async function runFailedPaymentTracking(): Promise<AutomationResult> {
  const result: AutomationResult = { rule: 'payment.failedTracking', count: 0, details: [], errors: [] };
  try {
    const snap = await getDocs(query(collection(db, 'transactions'), where('status', '==', 'failed'), limit(200)));
    const failed = snap.docs.map(d => ({ id: d.id, ...d.data() as any }));

    const byUser = new Map<string, any[]>();
    failed.forEach(t => {
      const uid = t.userId;
      if (!byUser.has(uid)) byUser.set(uid, []);
      byUser.get(uid)!.push(t);
    });

    byUser.forEach(async (txns, uid) => {
      if (txns.length >= 3) {
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          await updateDoc(userRef, { failedPayments: txns.length, failedPaymentAlerted: true });
        }
        if (txns.length >= 5) {
          await sendAdminAlert('failed_payments', `${uid.slice(0, 10)} kullanıcısının ${txns.length} başarısız ödemesi var`, { userId: uid, count: txns.length });
          await sendSystemNotification(uid, 'Ödeme Sorunu', `Son ${txns.length} ödeme girişiminiz başarısız. Lütfen kart bilgilerinizi kontrol edin.`);
        }
        result.count++;
        result.details.push(`Kullanıcı ${uid.slice(0, 8)}: ${txns.length} başarısız ödeme`);
      }
    });
  } catch (e: any) { result.errors.push(e.message); }
  return result;
}

// ─── 7. AUTO ORDER COMPLETE ───────────────────────────────────────────────────
export async function runAutoOrderComplete(config: AutomationConfig): Promise<AutomationResult> {
  const result: AutomationResult = { rule: 'order.autoComplete', count: 0, details: [], errors: [] };
  try {
    const cutoff = new Date(Date.now() - config.autoOrderCompleteDays * 24 * 60 * 60 * 1000);
    const snap = await getDocs(query(collection(db, 'orders'), where('status', '==', 'delivered'), limit(200)));
    for (const d of snap.docs) {
      const o = d.data();
      const deliveredAt = o.deliveredAt?.toDate?.() || o.createdAt?.toDate?.();
      if (deliveredAt && deliveredAt < cutoff) {
        await updateDoc(doc(db, 'orders', d.id), {
          status: 'completed', completedAt: serverTimestamp(), autoCompleted: true,
        });
        if (o.sellerId) {
          await sendSystemNotification(o.sellerId, 'Sipariş Tamamlandı', `#${d.id.slice(0, 8)} numaralı sipariş otomatik olarak tamamlandı.`, `/siparis/${d.id}`);
        }
        await log('order.autoCompleted', d.id, { days: config.autoOrderCompleteDays });
        result.count++;
        result.details.push(`Sipariş ${d.id.slice(0, 8)} — ${config.autoOrderCompleteDays} gün sonra otomatik tamamlandı`);
      }
    }
  } catch (e: any) { result.errors.push(e.message); }
  return result;
}

// ─── 8. TICKET AUTO ASSIGN ───────────────────────────────────────────────────
export async function runTicketAutoAssign(): Promise<AutomationResult> {
  const result: AutomationResult = { rule: 'ticket.autoAssign', count: 0, details: [], errors: [] };
  try {
    const snap = await getDocs(query(collection(db, 'supportTickets'), where('status', '==', 'open'), where('department', '==', null), limit(100)));
    for (const d of snap.docs) {
      const t = d.data();
      const text = `${t.subject || ''} ${t.description || ''} ${t.message || ''}`.toLowerCase();
      let dept = 'general';
      for (const { keywords, dept: d2 } of TICKET_DEPARTMENTS) {
        if (keywords.some(kw => text.includes(kw))) { dept = d2; break; }
      }
      if (dept !== 'general' || !t.department) {
        await updateDoc(doc(db, 'supportTickets', d.id), {
          department: dept, autoAssigned: true, assignedAt: serverTimestamp(),
        });
        result.count++;
        result.details.push(`Ticket ${d.id.slice(0, 8)} → ${dept}`);
      }
    }
  } catch (e: any) { result.errors.push(e.message); }
  return result;
}

// ─── 9. TICKET FAQ AUTO-REPLY ─────────────────────────────────────────────────
export async function runTicketFaqAutoReply(): Promise<AutomationResult> {
  const result: AutomationResult = { rule: 'ticket.faqAutoReply', count: 0, details: [], errors: [] };
  try {
    const snap = await getDocs(query(collection(db, 'supportTickets'), where('status', '==', 'open'), where('autoReplied', '==', null), limit(50)));
    for (const d of snap.docs) {
      const t = d.data();
      const text = `${t.subject || ''} ${t.description || ''} ${t.message || ''}`;
      for (const { pattern, reply } of FAQ_PATTERNS) {
        if (pattern.test(text)) {
          const replies = Array.isArray(t.replies) ? t.replies : [];
          await updateDoc(doc(db, 'supportTickets', d.id), {
            replies: [...replies, { text: reply, authorRole: 'system', isAdmin: true, isAutoReply: true, createdAt: new Date().toISOString() }],
            autoReplied: true, status: 'pending_user', lastReplyAt: serverTimestamp(),
          });
          if (t.userId) {
            await sendSystemNotification(t.userId, 'Destek Talebi Yanıtlandı', `"${t.subject}" talebinize otomatik yanıt gönderildi.`, `/destek-sistemi`);
          }
          result.count++;
          result.details.push(`Ticket ${d.id.slice(0, 8)}: SSS auto-reply`);
          break;
        }
      }
    }
  } catch (e: any) { result.errors.push(e.message); }
  return result;
}

// ─── 10. GIVEAWAY AUTO CLOSE ─────────────────────────────────────────────────
export async function runGiveawayAutoClose(): Promise<AutomationResult> {
  const result: AutomationResult = { rule: 'giveaway.autoClose', count: 0, details: [], errors: [] };
  try {
    const snap = await getDocs(query(collection(db, 'giveaways'), where('status', '==', 'active'), limit(50)));
    const now = new Date();
    for (const d of snap.docs) {
      const g = d.data();
      const endsAt = g.endsAt?.toDate?.();
      if (endsAt && endsAt < now) {
        const participants = g.participants || [];
        let winner = null;
        if (participants.length > 0) {
          winner = participants[Math.floor(Math.random() * participants.length)];
        }
        await updateDoc(doc(db, 'giveaways', d.id), {
          status: 'completed', winner, completedAt: serverTimestamp(), autoCompleted: true,
        });
        if (winner) {
          await sendSystemNotification(winner, '🎉 Çekiliş Kazandınız!', `"${g.title}" çekilişini kazandınız! Ödülünüz: ${g.prize}`, '/cekilisler');
          await sendAdminAlert('giveaway_completed', `Çekiliş "${g.title}" otomatik kapandı. Kazanan: ${winner.slice(0, 10)}`);
        }
        await log('giveaway.autoClose', d.id, { title: g.title, winner, participants: participants.length });
        result.count++;
        result.details.push(`"${g.title}" — ${participants.length} katılımcı, kazanan: ${winner ? winner.slice(0, 8) : 'yok'}`);
      }
    }
  } catch (e: any) { result.errors.push(e.message); }
  return result;
}

// ─── 11. CAMPAIGN AUTO ACTIVATE/DEACTIVATE ───────────────────────────────────
export async function runCampaignAutoActivate(): Promise<AutomationResult> {
  const result: AutomationResult = { rule: 'campaign.autoActivate', count: 0, details: [], errors: [] };
  try {
    const snap = await getDocs(query(collection(db, 'coupons'), limit(100)));
    const now = new Date();
    for (const d of snap.docs) {
      const c = d.data();
      const startsAt = c.startsAt?.toDate?.();
      const expiresAt = c.expiresAt?.toDate?.();
      let newActive = c.active;

      if (expiresAt && expiresAt < now && c.active) {
        newActive = false;
        await updateDoc(doc(db, 'coupons', d.id), { active: false, autoDeactivatedAt: serverTimestamp() });
        result.count++;
        result.details.push(`Kupon ${c.code} süresi doldu, pasife alındı`);
        await log('coupon.autoDeactivate', d.id, { code: c.code });
      } else if (startsAt && startsAt <= now && !c.active && !expiresAt) {
        await updateDoc(doc(db, 'coupons', d.id), { active: true, autoActivatedAt: serverTimestamp() });
        result.count++;
        result.details.push(`Kupon ${c.code} başlangıç tarihi geldi, aktif edildi`);
        await log('coupon.autoActivate', d.id, { code: c.code });
      }

      if (c.usageLimit && c.usedCount >= c.usageLimit && c.active) {
        await updateDoc(doc(db, 'coupons', d.id), { active: false, limitReachedAt: serverTimestamp() });
        result.count++;
        result.details.push(`Kupon ${c.code} kullanım limitine ulaştı, pasife alındı`);
      }
    }
  } catch (e: any) { result.errors.push(e.message); }
  return result;
}

// ─── 12. WITHDRAWAL AUTO QUEUE ────────────────────────────────────────────────
export async function runWithdrawalAutoQueue(config: AutomationConfig): Promise<AutomationResult> {
  const result: AutomationResult = { rule: 'withdrawal.autoQueue', count: 0, details: [], errors: [] };
  try {
    const snap = await getDocs(query(collection(db, 'withdrawals'), where('status', '==', 'Beklemede'), limit(100)));
    for (const d of snap.docs) {
      const w = d.data();
      if (w.autoQueueChecked) continue;

      const amount = Number(w.amount || 0);
      if (amount > config.withdrawalAutoMaxAmount) {
        await updateDoc(doc(db, 'withdrawals', d.id), { autoQueueChecked: true, autoQueueResult: 'manual_review', status: 'Beklemede' });
        continue;
      }

      let userSnap;
      try { userSnap = await getDoc(doc(db, 'users', w.userId)); } catch { continue; }
      if (!userSnap.exists()) continue;
      const u = userSnap.data();

      const meetsRequirements =
        u.emailVerified &&
        !u.isBanned &&
        !u.isFrozen &&
        (u.riskLevel === 'low' || !u.riskLevel) &&
        (u.disputeCount || 0) === 0 &&
        (u.failedPayments || 0) < 3 &&
        !u.multiAccountSuspect;

      await updateDoc(doc(db, 'withdrawals', d.id), {
        autoQueueChecked: true,
        autoQueueResult: meetsRequirements ? 'eligible' : 'manual_review',
        autoQueueAt: serverTimestamp(),
      });

      if (meetsRequirements) {
        result.count++;
        result.details.push(`${w.userId?.slice(0, 8)} — ${amount}₺ oto onay kuyruğuna alındı`);
        await sendSystemNotification(w.userId, 'Çekim Talebiniz İşleniyor', `${amount}₺ çekim talebiniz otomatik onay kuyruğuna alındı.`);
      }
    }
  } catch (e: any) { result.errors.push(e.message); }
  return result;
}

// ─── 13. CRITICAL ALERTS ─────────────────────────────────────────────────────
export async function runCriticalAlerts(): Promise<AutomationResult> {
  const result: AutomationResult = { rule: 'system.criticalAlerts', count: 0, details: [], errors: [] };
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const [ordersSnap, withdrawalsSnap, disputesSnap] = await Promise.all([
      getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(50))),
      getDocs(query(collection(db, 'withdrawals'), where('status', '==', 'Beklemede'), limit(50))),
      getDocs(query(collection(db, 'disputes'), where('status', '==', 'open'), limit(50))),
    ]);

    const recentOrders = ordersSnap.docs.filter(d => d.data().createdAt?.toDate?.() > oneHourAgo);
    if (recentOrders.length > 20) {
      await sendAdminAlert('critical', `Son 1 saatte anormal sipariş hacmi: ${recentOrders.length} sipariş`, { count: recentOrders.length });
      result.count++; result.details.push(`Anormal sipariş hacmi: ${recentOrders.length}/saat`);
    }

    const largeWithdrawals = withdrawalsSnap.docs.filter(d => Number(d.data().amount || 0) > 5000);
    if (largeWithdrawals.length > 0) {
      await sendAdminAlert('high', `${largeWithdrawals.length} büyük çekim talebi bekliyor (>5000₺)`, { count: largeWithdrawals.length });
      result.count++; result.details.push(`${largeWithdrawals.length} büyük çekim bekliyor`);
    }

    const openDisputes = disputesSnap.docs.length;
    if (openDisputes > 10) {
      await sendAdminAlert('medium', `${openDisputes} açık uyuşmazlık var`, { count: openDisputes });
      result.count++; result.details.push(`${openDisputes} açık uyuşmazlık`);
    }
  } catch (e: any) { result.errors.push(e.message); }
  return result;
}

// ─── 13. MESSAGE PROFANITY CHECK ────────────────────────────────────────────
export async function runMessageProfanityCheck(): Promise<AutomationResult> {
  const result: AutomationResult = { rule: 'message.profanityCheck', count: 0, details: [], errors: [] };
  try {
    const settingsSnap = await getDocs(query(collection(db, 'siteSettings'), limit(10)));
    const modDoc = settingsSnap.docs.find(d => d.id === 'moderation');
    const bannedWords: string[] = modDoc?.data()?.bannedWords || [];
    if (bannedWords.length === 0) {
      result.details.push('Yasaklı kelime listesi boş — atlandı');
      return result;
    }

    // Son 500 mesajı tara
    const msgsSnap = await getDocs(query(
      collection(db, 'messages'),
      orderBy('createdAt', 'desc'),
      limit(500)
    ));

    for (const d of msgsSnap.docs) {
      const msg = d.data();
      const text = String(msg.text || msg.body || msg.content || '').toLowerCase();
      const found = bannedWords.filter(w => w && text.includes(w.toLowerCase()));
      if (found.length > 0 && !msg.flagged) {
        await updateDoc(doc(db, 'messages', d.id), { flagged: true, flagReason: `Yasaklı kelime: ${found[0]}`, flaggedAt: serverTimestamp() });
        await sendAdminAlert('medium', `Mesajda yasaklı kelime: "${found[0]}"`, { messageId: d.id, senderId: msg.senderId || '', word: found[0] });
        await log('message.flagged', d.id, { word: found[0], senderId: msg.senderId || '' });
        result.count++;
        result.details.push(`Mesaj ${d.id.slice(0, 8)}: "${found[0]}"`)
      }
    }

    // Ayrıca chats/*/messages koleksiyonunu tara
    const chatsSnap = await getDocs(query(collection(db, 'chats'), limit(100)));
    for (const chatDoc of chatsSnap.docs) {
      const chatMsgsSnap = await getDocs(query(
        collection(db, 'chats', chatDoc.id, 'messages'),
        orderBy('createdAt', 'desc'),
        limit(50)
      ));
      for (const d of chatMsgsSnap.docs) {
        const msg = d.data();
        const text = String(msg.text || '').toLowerCase();
        const found = bannedWords.filter(w => w && text.includes(w.toLowerCase()));
        if (found.length > 0 && !msg.flagged) {
          await updateDoc(doc(db, 'chats', chatDoc.id, 'messages', d.id), { flagged: true, flagReason: `Yasaklı kelime: ${found[0]}`, flaggedAt: serverTimestamp() });
          await sendAdminAlert('medium', `Sohbette yasaklı kelime: "${found[0]}"`, { chatId: chatDoc.id, messageId: d.id, senderId: msg.senderId || '', word: found[0] });
          await log('chat.message.flagged', d.id, { chatId: chatDoc.id, word: found[0] });
          result.count++;
          result.details.push(`Sohbet ${chatDoc.id.slice(0, 8)} — "${found[0]}"`)
        }
      }
    }
  } catch (e: any) { result.errors.push(e.message); }
  return result;
}

// ─── MAIN RUNNER ─────────────────────────────────────────────────────────────
export async function runAllAutomations(config: AutomationConfig): Promise<AutomationResult[]> {
  const results: AutomationResult[] = [];
  const runners: Array<() => Promise<AutomationResult>> = [];

  if (config.listingBannedWordCheck) runners.push(() => runListingBannedWordCheck());
  if (config.listingDuplicateCheck) runners.push(() => runDuplicateListingCheck());
  if (config.listingPriceAnomaly) runners.push(() => runPriceAnomalyCheck(config));
  if (config.userRiskScore) runners.push(() => runUserRiskScore());
  if (config.multiAccountDetection) runners.push(() => runMultiAccountDetection());
  if (config.failedPaymentTracking) runners.push(() => runFailedPaymentTracking());
  if (config.autoOrderComplete) runners.push(() => runAutoOrderComplete(config));
  if (config.ticketAutoAssign) runners.push(() => runTicketAutoAssign());
  if (config.ticketFaqAutoReply) runners.push(() => runTicketFaqAutoReply());
  if (config.giveawayAutoClose) runners.push(() => runGiveawayAutoClose());
  if (config.campaignAutoActivate) runners.push(() => runCampaignAutoActivate());
  if (config.withdrawalAutoQueue) runners.push(() => runWithdrawalAutoQueue(config));
  if (config.criticalAlerts) runners.push(() => runCriticalAlerts());
  if (config.messageProfanityCheck) runners.push(() => runMessageProfanityCheck());

  for (const runner of runners) {
    try { results.push(await runner()); } catch (e: any) { results.push({ rule: 'unknown', count: 0, details: [], errors: [e.message] }); }
  }

  return results;
}

export async function loadAutomationConfig(): Promise<AutomationConfig> {
  try {
    const snap = await getDocs(collection(db, 'siteSettings'));
    const doc2 = snap.docs.find(d => d.id === 'automation');
    if (doc2) return { ...DEFAULT_CONFIG, ...doc2.data() };
  } catch { /* use defaults */ }
  return DEFAULT_CONFIG;
}

export async function saveAutomationConfig(config: AutomationConfig): Promise<void> {
  await setDoc(doc(db, 'siteSettings', 'automation'), { ...config, updatedAt: serverTimestamp() }, { merge: true });
}
