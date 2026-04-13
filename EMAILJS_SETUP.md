# EmailJS Kurulum Rehberi - Firebase Spam Sorunu Çözümü

## Sorun
Firebase default `firebaseapp.com` domain'inden e-posta gönderiyor ve bu spam klasörüne düşüyor.

## Çözüm: EmailJS + Gmail SMTP
Kendi Gmail hesabınızdan e-posta göndermek için EmailJS kullanın.

## Adım 1: EmailJS Hesabı Oluştur
1. https://www.emailjs.com/ adresine git
2. Ücretsiz hesap oluştur (200 e-posta/ay ücretsiz)

## Adım 2: Email Service Ekle
1. EmailJS Dashboard → "Email Services" → "Add New Service"
2. "Gmail" seç
3. Service Name: `service_itemtr`
4. Gmail hesabını bağla:
   - Email: `itemtr.official@gmail.com`
   - Şifre: `ihnzrsmperhmcggs` (16 haneli uygulama şifresi)
5. Save

## Adım 3: Email Template Oluştur
1. "Email Templates" → "Create New Template"
2. Template Name: `template_reset`
3. Subject: `🔐 itemTR - Şifre Sıfırlama Kodunuz`
4. Content:
```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; }
        .header { background: #5b68f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .code { font-size: 32px; font-weight: bold; color: #5b68f6; text-align: center; padding: 20px; background: #f0f0f0; border-radius: 8px; margin: 20px 0; letter-spacing: 4px; }
        .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>itemTR - Şifre Sıfırlama</h2>
        </div>
        <p>Merhaba {{to_name}},</p>
        <p>Şifrenizi sıfırlamak için doğrulama kodunuz:</p>
        <div class="code">{{reset_code}}</div>
        <p>Bu kod 30 dakika boyunca geçerlidir.</p>
        <p>Eğer bu talebi siz yapmadıysanız, lütfen bu e-postayı dikkate almayın.</p>
        <div class="footer">
            <p>Saygılarımızla,<br>itemTR Ekibi</p>
            <p><a href="https://itemtr.com">www.itemtr.com</a></p>
        </div>
    </div>
</body>
</html>
```

## Adım 4: Public Key Al
1. Dashboard → "Account" → "API Keys"
2. Public Key'i kopyala (örnek: `XxXxXxXxXxXxXxXxX`)

## Adım 5: Kodu Güncelle
`src/pages/ForgotPassword.tsx` dosyasında EMAILJS_CONFIG'i güncelle:

```typescript
const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_itemtr',    // EmailJS'de oluşturduğun service ID
  TEMPLATE_ID: 'template_reset',   // EmailJS'de oluşturduğun template ID
  PUBLIC_KEY: 'XxXxXxXxXxXxXxXxX', // EmailJS dashboard'dan aldığın public key
  SMTP_USER: 'itemtr.official@gmail.com',
};
```

## Adım 6: Test Et
1. `npm run build`
2. `npm run preview`
3. Şifremi unuttum sayfasına git
4. E-posta gönder
5. Spam klasörüne düşmeyecek!

## Önemli Notlar
- Gmail'de 2-Faktörlü Doğrulama aktif olmalı
- Uygulama Şifresi kullanılmalı (normal şifre değil)
- EmailJS ücretsiz: 200 e-posta/ay
- Daha fazla kullanım için plan yükseltme yapılabilir

## Alternatif: Backend Deploy (Firebase Functions)
Eğer EmailJS kullanmak istemezseniz, Firebase Functions deploy edilebilir. Ancak bunun için Google Cloud Billing aktifleştirilmeli.
