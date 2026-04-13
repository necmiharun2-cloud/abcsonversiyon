# Firebase Email Hemen Düzeltme Adımları

## 1. Sender Name Doldur
- Ekranda "Sender name: not provided" yazıyor
- Kalem (düzenle) ikonuna tıkla
- Sender name: `itemTR` yaz

## 2. Email Template Türkçeleştir
Aynı sayfada Template language kısmında düzenle:
- Language: Türkçe seç
- Veya manuel olarak Template'i düzenle:

### Subject:
```
%s için şifre sıfırlama talebi
```

### Message:
```
Merhaba,

%s hesabınız için şifre sıfırlama talebinde bulundunuz.

Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:
%s

Bu talebi siz yapmadıysanız, bu e-postayı dikkate almayın.

Saygılarımızla,
itemTR Ekibi
```

## 3. Önemli: From Adresi Sorunu
Firebase default `noreply@...firebaseapp.com` adresinden gönderiyor. 
Bu adresler bazı email sağlayıcılarında (Gmail, Hotmail) spam'a düşer veya engellenir.

### Çözüm A: Custom Domain (Önerilen)
1. Firebase Console → Authentication → Templates
2. "Customize email domain" seçeneğini bul
3. Kendi domain'ini ekle (örn: noreply@itemtr.com)
4. DNS doğrulaması yap

### Çözüm B: EmailJS (Hızlı - 5 dakika)
EmailJS kullanarak frontend'den direkt email gönder:
- Ücretsiz: 200 email/ay
- Hiç billing gerekmez
- Kodu değiştirmem yeterli

### Çözüm C: SendGrid/Mailgun
- Ücretsiz tier mevcut (100 email/gün)
- Backend fonksiyonu gerekir
- Billing gerekebilir

## 4. Hemen Test Et
Değişiklikleri kaydettikten sonra:
1. Uygulamaya git
2. Şifremi unuttum'a tıkla
3. Email gönder
4. Spam/Junk klasörünü kontrol et

---

**Ne istiyorsun?**
- A) EmailJS entegre edeyim (en hızlı, ücretsiz)
- B) Sen Firebase Console'da düzeltmeleri yap, ben bekliyorum
- C) SendGrid ücretsiz hesap açalım
