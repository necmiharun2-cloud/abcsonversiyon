# Yapılan düzeltmeler

## Admin panel
- `/admin` giriş kontrolündeki yanlış yönlendirme düzeltildi: `/giris` yerine `/login`.
- Firestore sorguları daha dayanıklı hale getirildi. `createdAt` index'i olmayan koleksiyonlarda sırasız `limit()` sorgusuna düşecek şekilde fallback eklendi.
- Boş gelen **Uyusmazliklar** sekmesi tamamlandı. Artık dispute kayıtları listeleniyor ve yönetici çözüm / red kararı verebiliyor.
- Support ticket kapatma işlemi merkezi fonksiyona taşındı; log yazımı ve hata yakalama eklendi.
- Giveaway oluşturma ve kazanan seçme işlemleri merkezi fonksiyonlara taşındı; admin log yazımı ve hata yakalama eklendi.
- Finans sekmesindeki manuel işlem özelliği geliştirildi. Artık sadece `transactions` kaydı değil, ilgili kullanıcının `balanceAvailableCents`, `balanceHeldCents` ve `balance` alanları da transaction içinde güncelleniyor.
- Dashboard ve sekme geçişleri URL query param ile senkron hale getirildi.
- Uyusmazlık badge sayacı `active` yerine gerçek açık durumlar (`open`, `active`, `pending`) ile hesaplanıyor.

## Rota / navigasyon düzeltmeleri
- `NavMenu`
  - `/giveaways` -> `/cekilisler`
  - `/category` -> `/firsatlar`
  - `/create-listing` -> `/ilan-ekle`
- `MobileMenu`
  - `/create-listing` -> `/ilan-ekle`
  - `/deposit` -> `/bakiye-yukle`
- `FeaturedListings`
  - `/category` -> `/ilan-pazari`
- `ListingCard`
  - `/listing/1` -> `/ilan-pazari`
- `HeroCarousel`
  - `/category/cd-key` -> `/cd-key`
  - `/category` -> `/firsatlar`
  - `/deposit` -> `/bakiye-yukle`
  - `/category/sosyal-medya` -> `/ilan-pazari?q=Sosyal%20Medya`
- `Streamers`
  - Bozuk `/yayinci-basvurusu` linki kaldırıldı. Üstteki CTA artık mevcut başvuru modalını açıyor.

## Not
- Bu paket içinde kod düzeltmeleri yapıldı ve dosyalar sözdizimi açısından kontrol edildi.
- Canlı Firebase verisi ve Vercel deploy'u bu ortamda tamamen doğrulanamadığı için, son adım olarak kendi makinenizde `npm run build` ve Vercel redeploy yapmanız gerekir.
