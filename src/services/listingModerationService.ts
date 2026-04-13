/**
 * Listing Moderation Service
 * İlan gönderiminde otomatik kontrol zinciri + moderasyon skoru.
 */
import {
  collection, getDocs, query, where, limit, doc,
  updateDoc, addDoc, serverTimestamp, getDoc
} from 'firebase/firestore';
import { db } from '../firebase';

// ── Tipler ────────────────────────────────────────────────────────────────────

export type ModerationDecision = 'approve' | 'queue' | 'reject';

export interface ModerationCheck {
  id: string;
  label: string;
  passed: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  penalty: number;
  detail?: string;
}

export interface ModerationResult {
  score: number;           // 0-100 (yüksek = iyi)
  decision: ModerationDecision;
  checks: ModerationCheck[];
  suggestions: string[];   // Satıcıya gösterilecek öneriler
  rejectReason?: string;
  autoAction: boolean;     // true = otomatik uygulandı
}

export interface SmartListingAnalysis {
  titleScore: number;       // 0-100
  descScore: number;        // 0-100
  priceScore: number;       // 0-100
  overallQuality: number;   // 0-100
  suggestions: string[];
  priceComparison?: {
    avgPrice: number;
    minPrice: number;
    maxPrice: number;
    userPrice: number;
    status: 'below_avg' | 'avg' | 'above_avg' | 'very_high' | 'very_low';
  };
  salesProbability: 'high' | 'medium' | 'low';
}

// ── Sabitler ──────────────────────────────────────────────────────────────────

const CONTACT_PATTERNS = [
  /\b(telegram|tele(gram)?\.me|t\.me)\b/gi,
  /\b(whatsapp|wa\.me)\b/gi,
  /\b(discord\.gg|discord\.com\/invite)\b/gi,
  /\+90\s?[0-9]{10}/g,
  /0?5[0-9]{2}[\s\-]?[0-9]{3}[\s\-]?[0-9]{4}/g,
];

const FRAUD_PATTERNS = [
  /\b(hesap\s*paylaş|şifr(e|em)i ver|güven\s*çekme|banka\s*trans[fş]er|dışarı\s*öde)\b/gi,
  /\b(önce\s*ödeme|güven\s*parası|emanet\s*ücret)\b/gi,
  /\b(dolandır|kazık|sahte|kandır)\b/gi,
];

const QUALITY_THRESHOLDS = {
  titleMinLen: 10,
  titleMaxLen: 100,
  descMinLen: 50,
  descGoodLen: 200,
  minImages: 1,
};

// ── Moderation Checks ─────────────────────────────────────────────────────────

async function checkBannedWords(text: string): Promise<ModerationCheck> {
  try {
    const snap = await getDocs(query(collection(db, 'siteSettings'), limit(10)));
    const modDoc = snap.docs.find(d => d.id === 'moderation');
    const bannedWords: string[] = modDoc?.data()?.bannedWords || [];
    const found = bannedWords.filter(w => w && text.toLowerCase().includes(w.toLowerCase()));
    return {
      id: 'banned_words', label: 'Yasaklı Kelime',
      passed: found.length === 0, severity: 'critical', penalty: found.length > 0 ? -50 : 0,
      detail: found.length > 0 ? `Bulunan: "${found[0]}"` : undefined,
    };
  } catch {
    return { id: 'banned_words', label: 'Yasaklı Kelime', passed: true, severity: 'critical', penalty: 0 };
  }
}

function checkContactInfo(text: string): ModerationCheck {
  const found = CONTACT_PATTERNS.some(p => p.test(text));
  CONTACT_PATTERNS.forEach(p => p.lastIndex = 0);
  return {
    id: 'contact_info', label: 'Dış İletişim Bilgisi',
    passed: !found, severity: 'high', penalty: found ? -40 : 0,
    detail: found ? 'Telegram, WhatsApp veya telefon numarası tespit edildi' : undefined,
  };
}

function checkFraudPatterns(text: string): ModerationCheck {
  const found = FRAUD_PATTERNS.some(p => p.test(text));
  FRAUD_PATTERNS.forEach(p => p.lastIndex = 0);
  return {
    id: 'fraud_pattern', label: 'Dolandırıcılık Kalıbı',
    passed: !found, severity: 'critical', penalty: found ? -60 : 0,
    detail: found ? 'Şüpheli ifade/kalıp tespit edildi' : undefined,
  };
}

async function checkDuplicateTitle(title: string, sellerId: string): Promise<ModerationCheck> {
  try {
    const snap = await getDocs(query(
      collection(db, 'products'),
      where('sellerId', '==', sellerId),
      where('title', '==', title),
      limit(1)
    ));
    const isDup = !snap.empty;
    return {
      id: 'duplicate_title', label: 'Tekrar Eden Başlık',
      passed: !isDup, severity: 'medium', penalty: isDup ? -20 : 0,
      detail: isDup ? 'Aynı başlıkla aktif bir ilanınız var' : undefined,
    };
  } catch {
    return { id: 'duplicate_title', label: 'Tekrar Eden Başlık', passed: true, severity: 'medium', penalty: 0 };
  }
}

async function checkPriceAnomaly(price: number, category: string): Promise<ModerationCheck> {
  try {
    const snap = await getDocs(query(
      collection(db, 'products'),
      where('category', '==', category),
      where('status', '==', 'active'),
      limit(50)
    ));
    const prices = snap.docs.map(d => Number(d.data().price || 0)).filter(p => p > 0);
    if (prices.length < 3) return { id: 'price_anomaly', label: 'Fiyat Anomalisi', passed: true, severity: 'medium', penalty: 0 };
    const avg = prices.reduce((s, p) => s + p, 0) / prices.length;
    const ratio = price / avg;
    const anomaly = ratio > 10 || ratio < 0.05;
    return {
      id: 'price_anomaly', label: 'Fiyat Anomalisi',
      passed: !anomaly, severity: 'medium', penalty: anomaly ? -15 : 0,
      detail: anomaly ? `Kategori ortalamasına göre ${ratio > 1 ? 'çok yüksek' : 'çok düşük'} (ort: ${avg.toFixed(0)}₺)` : undefined,
    };
  } catch {
    return { id: 'price_anomaly', label: 'Fiyat Anomalisi', passed: true, severity: 'medium', penalty: 0 };
  }
}

function checkTitleQuality(title: string): ModerationCheck {
  const len = title?.trim().length || 0;
  const tooShort = len < QUALITY_THRESHOLDS.titleMinLen;
  const tooLong = len > QUALITY_THRESHOLDS.titleMaxLen;
  const allCaps = title === title.toUpperCase() && len > 5;
  const issue = tooShort || tooLong || allCaps;
  return {
    id: 'title_quality', label: 'Başlık Kalitesi',
    passed: !issue, severity: 'low', penalty: issue ? -10 : 0,
    detail: tooShort ? 'Başlık çok kısa' : tooLong ? 'Başlık çok uzun' : allCaps ? 'Tamamı büyük harf' : undefined,
  };
}

function checkDescQuality(desc: string): ModerationCheck {
  const len = desc?.trim().length || 0;
  const tooShort = len < QUALITY_THRESHOLDS.descMinLen;
  return {
    id: 'desc_quality', label: 'Açıklama Kalitesi',
    passed: !tooShort, severity: 'low', penalty: tooShort ? -10 : 0,
    detail: tooShort ? `Açıklama çok kısa (${len} karakter, min ${QUALITY_THRESHOLDS.descMinLen})` : undefined,
  };
}

function checkHasImages(images: string[] | string | undefined): ModerationCheck {
  const count = Array.isArray(images) ? images.length : (images ? 1 : 0);
  const noImage = count < QUALITY_THRESHOLDS.minImages;
  return {
    id: 'has_images', label: 'Görsel',
    passed: !noImage, severity: 'low', penalty: noImage ? -5 : 0,
    detail: noImage ? 'Görsel eklenmemiş' : undefined,
  };
}

// ── Ana Fonksiyon ─────────────────────────────────────────────────────────────

export async function runListingModeration(listing: {
  title: string;
  description: string;
  price: number;
  category: string;
  sellerId: string;
  images?: string[] | string;
}): Promise<ModerationResult> {
  const fullText = `${listing.title} ${listing.description}`;

  const [bannedCheck, dupCheck, priceCheck] = await Promise.all([
    checkBannedWords(fullText),
    checkDuplicateTitle(listing.title, listing.sellerId),
    checkPriceAnomaly(listing.price, listing.category),
  ]);

  const checks: ModerationCheck[] = [
    bannedCheck,
    checkContactInfo(fullText),
    checkFraudPatterns(fullText),
    dupCheck,
    priceCheck,
    checkTitleQuality(listing.title),
    checkDescQuality(listing.description),
    checkHasImages(listing.images),
  ];

  // Skor hesapla (100'den penaltıları düş)
  const totalPenalty = checks.reduce((s, c) => s + Math.min(0, c.penalty), 0);
  const score = Math.max(0, Math.min(100, 100 + totalPenalty));

  // Karar
  let decision: ModerationDecision = 'approve';
  let rejectReason: string | undefined;
  const criticalFail = checks.some(c => c.severity === 'critical' && !c.passed);
  const highFail = checks.filter(c => c.severity === 'high' && !c.passed).length;

  if (criticalFail || score < 30) {
    decision = 'reject';
    const failed = checks.find(c => !c.passed && (c.severity === 'critical' || c.severity === 'high'));
    rejectReason = failed?.detail || 'İlan kriterleri sağlamıyor';
  } else if (score < 65 || highFail > 0) {
    decision = 'queue';
  }

  // Öneriler
  const suggestions: string[] = [];
  checks.filter(c => !c.passed).forEach(c => {
    if (c.id === 'title_quality') suggestions.push('Başlığınızı 10-100 karakter arasında, açıklayıcı tutun');
    if (c.id === 'desc_quality') suggestions.push('Açıklamanızı en az 50 karakter olacak şekilde detaylandırın');
    if (c.id === 'price_anomaly') suggestions.push('Fiyatınızı benzer ilanlarla karşılaştırın');
    if (c.id === 'has_images') suggestions.push('En az bir görsel ekleyin — satış ihtimalini artırır');
    if (c.id === 'duplicate_title') suggestions.push('Başlığı benzersiz yapın');
    if (c.id === 'contact_info') suggestions.push('İletişim bilgisi paylaşmayın — platform güvencesini kaybedersiniz');
    if (c.id === 'fraud_pattern') suggestions.push('Şüpheli ifade kullanmaktan kaçının');
    if (c.id === 'banned_words') suggestions.push('Yasaklı kelimeyi kaldırın ve yeniden deneyin');
  });
  if (listing.description?.length < 200) suggestions.push('Daha detaylı açıklama, alıcı güvenini artırır');
  if (!listing.images || (Array.isArray(listing.images) && listing.images.length < 2)) {
    suggestions.push('Birden fazla görsel eklemek satış hızını artırır');
  }

  return { score, decision, checks, suggestions, rejectReason, autoAction: true };
}

// ── Satıcı Ön Analiz (IlanEkle için anlık) ────────────────────────────────────

export async function analyzeListingQuality(listing: {
  title: string;
  description: string;
  price: number;
  category: string;
}): Promise<SmartListingAnalysis> {
  const suggestions: string[] = [];

  // Başlık skoru
  const tLen = listing.title?.trim().length || 0;
  let titleScore = 0;
  if (tLen >= 20 && tLen <= 80) titleScore = 100;
  else if (tLen >= 10) titleScore = 65;
  else if (tLen > 0) titleScore = 30;
  if (listing.title === listing.title?.toUpperCase() && tLen > 5) { titleScore -= 20; suggestions.push('Tamamı büyük harf başlık profesyonel görünmüyor'); }
  if (tLen < 15) suggestions.push('Başlığınız çok kısa — alıcı arama sonuçlarında göremeyebilir');

  // Açıklama skoru
  const dLen = listing.description?.trim().length || 0;
  let descScore = 0;
  if (dLen >= 300) descScore = 100;
  else if (dLen >= 150) descScore = 75;
  else if (dLen >= 50) descScore = 50;
  else descScore = 20;
  if (dLen < 100) suggestions.push('Açıklamayı 150+ karakter yapın — dönüşüm oranını %40 artırır');
  if (dLen < 300) suggestions.push('Teslim yöntemi, garanti ve özellik bilgisi ekleyin');

  // Fiyat skoru ve karşılaştırma
  let priceScore = 60;
  let priceComparison: SmartListingAnalysis['priceComparison'] | undefined;
  try {
    const snap = await getDocs(query(
      collection(db, 'products'),
      where('category', '==', listing.category),
      where('status', '==', 'active'),
      limit(50)
    ));
    const prices = snap.docs.map(d => Number(d.data().price || 0)).filter(p => p > 0);
    if (prices.length >= 3) {
      const avg = prices.reduce((s, p) => s + p, 0) / prices.length;
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      const ratio = listing.price / avg;
      let status: SmartListingAnalysis['priceComparison']['status'] = 'avg';
      if (ratio < 0.5) { status = 'very_low'; priceScore = 50; suggestions.push('Fiyatınız piyasanın çok altında — gerçek fiyat mı?'); }
      else if (ratio < 0.8) { status = 'below_avg'; priceScore = 90; suggestions.push('Rekabetçi fiyat! Hızlı satış yapabilirsiniz'); }
      else if (ratio <= 1.2) { status = 'avg'; priceScore = 80; }
      else if (ratio <= 2.0) { status = 'above_avg'; priceScore = 60; suggestions.push('Fiyatınız piyasa ortalamasının üstünde — satış hızını etkileyebilir'); }
      else { status = 'very_high'; priceScore = 30; suggestions.push('Fiyatınız çok yüksek — benzer ilanlarla karşılaştırın'); }
      priceComparison = { avgPrice: avg, minPrice: min, maxPrice: max, userPrice: listing.price, status };
    }
  } catch { /* no-op */ }

  const overallQuality = Math.round((titleScore + descScore + priceScore) / 3);
  let salesProbability: 'high' | 'medium' | 'low' = 'low';
  if (overallQuality >= 70) salesProbability = 'high';
  else if (overallQuality >= 45) salesProbability = 'medium';

  if (overallQuality < 50) suggestions.push('İlan kalitesi düşük — başlık, açıklama ve fiyatı gözden geçirin');

  return { titleScore: Math.max(0, Math.min(100, titleScore)), descScore, priceScore: Math.max(0, Math.min(100, priceScore)), overallQuality, suggestions, priceComparison, salesProbability };
}

// ── Firestore'a moderasyon kaydı ──────────────────────────────────────────────

export async function saveModerationResult(productId: string, result: ModerationResult, actorId?: string): Promise<void> {
  await updateDoc(doc(db, 'products', productId), {
    moderationScore: result.score,
    moderationDecision: result.decision,
    moderationChecks: result.checks,
    moderationSuggestions: result.suggestions,
    moderationRejectReason: result.rejectReason || null,
    moderatedAt: serverTimestamp(),
    status: result.decision === 'reject' ? 'rejected' : result.decision === 'queue' ? 'pending' : 'active',
  });
  await addDoc(collection(db, 'adminLogs'), {
    actorId: actorId || 'system',
    action: `moderation.${result.decision}`,
    entity: 'products',
    entityId: productId,
    details: { score: result.score, decision: result.decision },
    createdAt: serverTimestamp(),
  });
}

// ── Red Şablonları ────────────────────────────────────────────────────────────

export const REJECTION_TEMPLATES = [
  { id: 'banned_word',    label: 'Yasaklı Kelime',        text: 'İlanınızda yasaklı kelime/ifade tespit edildi. Lütfen ilanı düzenleyip yeniden gönderin.' },
  { id: 'contact_info',   label: 'İletişim Bilgisi',      text: 'İlan içinde platform dışı iletişim bilgisi (Telegram, WhatsApp, telefon) bulunamaz.' },
  { id: 'fraud',          label: 'Dolandırıcılık Şüphesi',text: 'İlanınız dolandırıcılık riski taşıyan ifadeler içeriyor. İnceleme ekibimiz sizinle iletişime geçecek.' },
  { id: 'low_quality',    label: 'Yetersiz Kalite',       text: 'İlan başlığı veya açıklaması kalite standartlarımızı karşılamıyor. Lütfen düzenleyin.' },
  { id: 'wrong_category', label: 'Yanlış Kategori',       text: 'İlanınız yanlış kategoriye eklenmiş. Doğru kategoriyi seçip tekrar gönderebilirsiniz.' },
  { id: 'price_issue',    label: 'Fiyat Sorunu',          text: 'İlan fiyatı gerçekçi görünmüyor. Platform kural dışı fiyatlandırmaya izin vermez.' },
  { id: 'duplicate',      label: 'Tekrar Eden İlan',      text: 'Bu başlıkla zaten aktif bir ilanınız var. Önce mevcut ilanı güncelleyin.' },
  { id: 'other',          label: 'Diğer',                 text: '' },
];
