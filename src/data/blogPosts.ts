import { listingImage } from '../lib/media';

export type BlogPost = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  image: string;
  category: string;
  readTime?: string;
};

export const blogPosts: BlogPost[] = [
  {
    id: 'ea-fc-division-rivals-rehberi',
    title: 'EA FC Division Rivals Nedir? Haftalık Ödüller ve Puan Kazanma Stratejileri',
    excerpt: 'Division Rivals, oyuncuların benzer beceri seviyelerine sahip rakiplerle çevrimiçi karşılaştığı rekabetçi bir oyun modudur. Bu rehberde puan kazanma stratejilerini öğreneceksiniz.',
    content: 'Division Rivals, oyuncuların benzer beceri seviyelerine sahip rakiplerle çevrimiçi karşılaştığı rekabetçi bir oyun modudur. Bu modda başarılı olmak için takımınızı sürekli geliştirmeli ve haftalık ödülleri kaçırmamalısınız.',
    date: '9 saat önce',
    author: 'GameMaster',
    image: listingImage(800, 400, 'EA FC Division Rivals'),
    category: 'Rehber',
    readTime: '10 DK OKUMA',
  },
  {
    id: 'valorant-yeni-ajan-rehberi',
    title: 'Valorant Yeni Ajan Rehberi: Tüm Yetenekler ve Stratejiler',
    excerpt: 'Yeni gelen ajan ile metayı nasıl domine edebilirsiniz? En iyi yetenek kombinasyonları ve harita bazlı stratejiler...',
    content: 'Yeni gelen ajan ile metayı nasıl domine edebilirsiniz? En iyi yetenek kombinasyonları ve harita bazlı stratejiler. Valorant\'ın son güncellemesiyle birlikte aramıza katılan bu yeni ajan, özellikle kontrol uzmanı rolünde fark yaratıyor.',
    date: '2 saat önce',
    author: 'GamerX',
    image: listingImage(800, 400, 'Valorant Agent'),
    category: 'Rehber',
    readTime: '8 DK OKUMA',
  },
  {
    id: 'cs2-fps-artirma-yontemleri-2026',
    title: 'CS2 FPS Artırma Yöntemleri: 2026 Güncel Rehber',
    excerpt: 'Counter Strike 2\'de daha yüksek FPS almak için yapmanız gereken tüm ayarlar...',
    content: 'Counter Strike 2\'de daha yüksek FPS almak için yapmanız gereken tüm ayarlar. Başlatma seçeneklerinden ekran kartı ayarlarına kadar adım adım ilerleyin.',
    date: '5 saat önce',
    author: 'ProPlayer',
    image: listingImage(800, 400, 'CS2 FPS Guide'),
    category: 'Rehber',
    readTime: '12 DK OKUMA',
  },
  {
    id: 'steam-ilkbahar-indirimleri-10-oyun',
    title: 'Steam İlkbahar İndirimleri Başladı: Alınması Gereken 10 Oyun',
    excerpt: 'Steam\'de büyük indirimler başladı! Bütçe dostu ve mutlaka oynanması gereken oyunlar...',
    content: 'Steam\'de büyük indirimler başladı! Bütçe dostu ve mutlaka oynanması gereken oyunları bir araya getirdik. AAA yapimlardan bağımsız oyunlara kadar birçok kategoride ciddi fiyat düşüşleri mevcut.',
    date: '1 gün önce',
    author: 'SteamExpert',
    image: listingImage(800, 400, 'Steam Sale'),
    category: 'Haber',
    readTime: '6 DK OKUMA',
  },
  {
    id: 'pubg-mobile-yeni-harita',
    title: 'PUBG Mobile Yeni Harita: Tam İnceleme ve Taktikler',
    excerpt: 'Yeni eklenen harita ile ilgili bilmeniz gereken her şey. En iyi iniş noktaları ve loot rotaları...',
    content: 'PUBG Mobile\'ın yeni haritası oyun deneyimini tamamen değiştiriyor. Bu rehberde en iyi iniş noktalarını, loot rotalarını ve rakiplerinizi alt etmenin yollarını keşfedeceksiniz.',
    date: '2 gün önce',
    author: 'MobileGamer',
    image: listingImage(800, 400, 'PUBG Mobile Map'),
    category: 'İnceleme',
    readTime: '15 DK OKUMA',
  },
  {
    id: 'roblox-gamepass-satin-alma-rehberi',
    title: 'Roblox Gamepass Satın Alma Rehberi: En İyi Değerler',
    excerpt: 'Roblox\'ta Gamepass satın alırken dikkat etmeniz gerekenler ve en iyi değer sunan oyunlar...',
    content: 'Roblox Gamepass\'ler oyun deneyiminizi büyük ölçüde geliştirebilir. Ancak doğru seçim yapmak önemli. Bu rehberde en iyi değeri sunan Gamepass\'leri inceliyoruz.',
    date: '3 gün önce',
    author: 'RobloxPro',
    image: listingImage(800, 400, 'Roblox Gamepass'),
    category: 'Rehber',
    readTime: '7 DK OKUMA',
  },
  {
    id: 'lol-yeni-sezon-metasi',
    title: 'LoL Yeni Sezon Metası: En Güçlü Şampiyonlar ve Build\'ler',
    excerpt: 'Yeni sezon ile birlikte değişen metayı analiz ediyoruz. Tier list ve önerilen build\'ler...',
    content: 'League of Legends yeni sezonu ile birlikte büyük değişiklikler geldi. Bu rehberde yeni metaya uygun şampiyon seçimleri ve build önerilerini bulacaksınız.',
    date: '4 gün önce',
    author: 'LoLExpert',
    image: listingImage(800, 400, 'League of Legends Meta'),
    category: 'Rehber',
    readTime: '11 DK OKUMA',
  },
  {
    id: 'minecraft-mod-rehberi-2026',
    title: 'Minecraft En İyi Modlar 2026: Kurulum ve Öneriler',
    excerpt: 'Minecraft deneyiminizi zirveye taşıyacak en iyi modlar ve detaylı kurulum rehberi...',
    content: 'Minecraft modları oyunu tamamen değiştirebilir. Bu rehberde grafik iyileştirmelerinden gameplay değişikliklerine kadar en iyi modları ve kurulum adımlarını inceliyoruz.',
    date: '5 gün önce',
    author: 'CraftMaster',
    image: listingImage(800, 400, 'Minecraft Mods'),
    category: 'Rehber',
    readTime: '9 DK OKUMA',
  },
];
