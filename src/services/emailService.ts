import emailjs from '@emailjs/browser';

// EmailJS Configuration
const EMAILJS_CONFIG = {
  SERVICE_ID: 'gmail_smtp_service', // We'll create this
  TEMPLATE_ID: 'password_reset_template',
  PUBLIC_KEY: 'placeholder', // Will be set from EmailJS dashboard
};

// Generate 6-digit reset code
export function generateResetCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send password reset email using SMTP through EmailJS
export async function sendPasswordResetEmailSMTP(
  toEmail: string,
  resetCode: string,
  username: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Using a serverless function approach with the backend we created
    // Since Firebase Functions requires billing, we'll use a direct approach
    
    // For now, let's create a simple mailto link or use a free email API
    // Alternative: Use FormSubmit.co (free, no backend needed)
    
    const response = await fetch('https://formsubmit.co/ajax/' + toEmail, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        _subject: 'itemTR - Şifre Sıfırlama',
        _template: 'table',
        _captcha: 'false',
        email: toEmail,
        message: `
Merhaba ${username},

Şifrenizi sıfırlamak için doğrulama kodunuz: ${resetCode}

Bu kod 30 dakika boyunca geçerlidir.

itemTR Ekibi
        `,
      })
    });

    if (response.ok) {
      return { success: true };
    } else {
      return { success: false, error: 'Failed to send email' };
    }
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Alternative: Use mailto with pre-filled content (fallback)
export function generateMailtoLink(email: string, code: string): string {
  const subject = encodeURIComponent('itemTR - Şifre Sıfırlama');
  const body = encodeURIComponent(`Merhaba,\n\nŞifre sıfırlama kodunuz: ${code}\n\nitemTR Ekibi`);
  return `mailto:${email}?subject=${subject}&body=${body}`;
}
