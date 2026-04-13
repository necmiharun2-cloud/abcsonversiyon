// Contact Information Detection Utility
// Detects phone numbers, IBAN, addresses, social media links, etc.

export interface ContactDetectionResult {
  hasContactInfo: boolean;
  violations: string[];
  severity: 'low' | 'medium' | 'high';
}

// Turkish phone number patterns
const PHONE_PATTERNS = [
  /(?:\+90|0)?\s*(?:\([0-9]{3}\)|[0-9]{3})\s*[0-9]{3}\s*[0-9]{2}\s*[0-9]{2}/g,
  /(?:\+90|0)?\s*[0-9]{3}\s*[0-9]{3}\s*[0-9]{4}/g,
  /(?:\+90|0)?\s*[0-9]{4}\s*[0-9]{3}\s*[0-9]{2}\s*[0-9]{2}/g,
  /\b5[0-9]{2}\s*[0-9]{3}\s*[0-9]{2}\s*[0-9]{2}\b/g,
  /\b5[0-9]{9,10}\b/g,
];

// IBAN patterns (Turkish and international)
const IBAN_PATTERNS = [
  /TR\s*[0-9]{2}\s*[0-9]{4}\s*[0-9]{4}\s*[0-9]{4}\s*[0-9]{4}\s*[0-9]{4}\s*[0-9]{2}/gi,
  /TR[0-9]{24,26}/gi,
  /[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}/g,
];

// Social media patterns
const SOCIAL_MEDIA_PATTERNS = [
  // Instagram
  /(?:instagram\.com|instagr\.am)\/[a-zA-Z0-9_.-]+/gi,
  /@[\w.]{2,30}(?:\s|$|[,.;!?])/gi,
  /\binstagram\b/gi,
  /\bins(?:ta)?gram\b/gi,
  /ig\s*:\s*[\w.]+/gi,
  
  // Twitter/X
  /(?:twitter\.com|x\.com)\/[a-zA-Z0-9_]+/gi,
  /twitter\s*:\s*@?[\w]+/gi,
  
  // Facebook
  /(?:facebook\.com|fb\.com|fb\.me)\/[a-zA-Z0-9.]+/gi,
  /\bfacebook\b/gi,
  /fb\s*:\s*[\w.]+/gi,
  
  // Discord
  /discord(?:\.gg|\.com)\/[a-zA-Z0-9-]+/gi,
  /\bdiscord\b/gi,
  /discord\s*:\s*[\w.]+/gi,
  
  // Telegram
  /(?:t\.me|telegram\.me|telegram\.org)\/[a-zA-Z0-9_]+/gi,
  /\btelegram\b/gi,
  /tg\s*:\s*@?[\w]+/gi,
  
  // WhatsApp
  /wa\.me\/[0-9]+/gi,
  /\bwhatsapp\b/gi,
  /whatsapp\s*(?:numarası|no|nummer)?\s*[:=]?\s*[0-9]+/gi,
  
  // TikTok
  /(?:tiktok\.com|vm\.tiktok\.com)\/@?[a-zA-Z0-9_.]+/gi,
  /\btiktok\b/gi,
  
  // YouTube
  /(?:youtube\.com|youtu\.be)\/(channel|user|c)?\/?[a-zA-Z0-9_-]+/gi,
  /\byoutube\b/gi,
  
  // Twitch
  /twitch\.tv\/[a-zA-Z0-9_]+/gi,
  /\btwitch\b/gi,
  
  // Skype
  /skype\s*:\s*[\w.]+/gi,
  /\bskype\b/gi,
];

// Email patterns
const EMAIL_PATTERNS = [
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
];

// Address patterns (Turkish)
const ADDRESS_PATTERNS = [
  /(?:mahalle|mah\.?|sokak|sok\.?|cadde|cad\.?|bulvar|bul\.?|no:?|daire|d:?|kat|site)\s*[a-zA-Z0-9ğüşıöçĞÜŞİÖÇ\s.]+/gi,
  /\d{5}\s*[a-zA-ZğüşıöçĞÜŞİÖÇ]+(?:\s+[a-zA-ZğüşıöçĞÜŞİÖÇ]+)*\s*(?:\/\s*[a-zA-ZğüşıöçĞÜŞİÖÇ]+)?/g, // Turkish postal code + city
];

// Bank account patterns
const BANK_PATTERNS = [
  /iban\s*[:=]?\s*[A-Z]{2}[0-9]{2}[A-Z0-9]+/gi,
  /(?:ziraat|iş|garanti|akbank|yapıkredi|halkbank|vakıfbank|denizbank|qnb|fibabanka|enkaza|türkiyeişbank)\s*(?:bank)?\s*[:=]?\s*[0-9\s]+/gi,
  /hesap\s*(?:no|numarası)?\s*[:=]?\s*[0-9]{10,}/gi,
];

// Website patterns (excluding common allowed domains)
const WEBSITE_PATTERNS = [
  /(?<!itemtr\.com)(?<!localhost)(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?/gi,
];

// Suspicious phrases
const SUSPICIOUS_PHRASES = [
  /(?:özel\s*mesaj|dm\s*at|mesaj\s*at|ulaş|ulaşmak|iletişime\s*geç|tel\s*ver|numaramı\s*al)/gi,
  /(?:site\s*dışına|platform\s*dışına|buradan\s*devam)/gi,
  /(?:daha\s*uygun|daha\s*ucuz|indirimli|kampanyalı)\s*(?:fiyat|fiyata)/gi,
];

// Whitelisted domains that should not trigger detection
const WHITELIST_DOMAINS = [
  'itemtr.com',
  'localhost',
  'itemsatis.com',
  'google.com',
  'youtube.com',
  'twitch.tv',
];

function isWhitelisted(text: string): boolean {
  const lowerText = text.toLowerCase();
  return WHITELIST_DOMAINS.some(domain => lowerText.includes(domain));
}

function normalizeText(text: string): string {
  // Remove extra whitespace and normalize
  return text.replace(/\s+/g, ' ').trim();
}

export function detectContactInfo(text: string): ContactDetectionResult {
  const violations: string[] = [];
  const normalizedText = normalizeText(text);
  
  // Check phone numbers
  for (const pattern of PHONE_PATTERNS) {
    const matches = normalizedText.match(pattern);
    if (matches) {
      violations.push(`Telefon numarası tespit edildi: ${matches[0]}`);
    }
  }
  
  // Check IBAN
  for (const pattern of IBAN_PATTERNS) {
    const matches = normalizedText.match(pattern);
    if (matches) {
      violations.push(`IBAN tespit edildi`);
    }
  }
  
  // Check social media
  for (const pattern of SOCIAL_MEDIA_PATTERNS) {
    const matches = normalizedText.match(pattern);
    if (matches && !isWhitelisted(normalizedText)) {
      // Filter out whitelisted domains
      const filteredMatches = matches.filter(m => 
        !WHITELIST_DOMAINS.some(d => m.toLowerCase().includes(d))
      );
      if (filteredMatches.length > 0) {
        violations.push(`Sosyal medya bağlantısı tespit edildi: ${filteredMatches[0]}`);
      }
    }
  }
  
  // Check emails (only if not whitelisted)
  for (const pattern of EMAIL_PATTERNS) {
    const matches = normalizedText.match(pattern);
    if (matches && !isWhitelisted(normalizedText)) {
      // Allow if it's a well-known support email
      const suspiciousEmails = matches.filter(m => 
        !m.includes('@itemtr.com') && 
        !m.includes('@gmail.com') // Allow Gmail for now as it's common
      );
      if (suspiciousEmails.length > 0) {
        violations.push(`E-posta adresi tespit edildi`);
      }
    }
  }
  
  // Check bank accounts
  for (const pattern of BANK_PATTERNS) {
    const matches = normalizedText.match(pattern);
    if (matches) {
      violations.push(`Banka hesap bilgisi tespit edildi`);
    }
  }
  
  // Check suspicious phrases
  for (const pattern of SUSPICIOUS_PHRASES) {
    const matches = normalizedText.match(pattern);
    if (matches) {
      violations.push(`Şüpheli ifade tespit edildi: "${matches[0]}"`);
    }
  }
  
  // Determine severity
  let severity: 'low' | 'medium' | 'high' = 'low';
  if (violations.length >= 3) {
    severity = 'high';
  } else if (violations.length >= 2) {
    severity = 'medium';
  } else if (violations.length === 1) {
    severity = 'low';
  }
  
  // Check for direct website links (high severity if found)
  for (const pattern of WEBSITE_PATTERNS) {
    const matches = normalizedText.match(pattern);
    if (matches && !isWhitelisted(normalizedText)) {
      const externalLinks = matches.filter(m => 
        !WHITELIST_DOMAINS.some(d => m.toLowerCase().includes(d))
      );
      if (externalLinks.length > 0) {
        severity = 'high';
        violations.push(`Harici site bağlantısı tespit edildi`);
      }
    }
  }
  
  return {
    hasContactInfo: violations.length > 0,
    violations,
    severity
  };
}

export function getContactInfoWarningMessage(violations: string[]): string {
  return `⚠️ İletişim Bilgisi Paylaşımı Tespit Edildi!\n\nKurallarımıza göre telefon numarası, IBAN, sosyal medya hesabı vb. iletişim bilgilerini paylaşmak yasaktır.\n\nTespit edilen ihlaller:\n${violations.map((v, i) => `${i + 1}. ${v}`).join('\n')}\n\nBu işlem 2 saatlik site dışına yönlendirme engeli ile cezalandırılacaktır.`;
}

export function formatBanEndTime(hours: number): string {
  const endTime = new Date(Date.now() + hours * 60 * 60 * 1000);
  return endTime.toLocaleString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}
