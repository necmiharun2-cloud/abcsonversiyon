/**
 * Post-build prerender script
 * Her rota için dist/ altında kendi index.html'ini oluşturur,
 * sayfa-özel title/description/canonical inject eder.
 * Botlar artık her sayfada farklı meta içeriği görür.
 */

const fs = require('fs');
const path = require('path');

const DIST = path.resolve(__dirname, '../dist');
const BASE_HTML = path.join(DIST, 'index.html');

// Her rota için meta bilgileri
const ROUTES = [
  {
    path: '/',
    title: 'itemTR - Güvenli Oyun İçi Alışveriş ve İlan Pazarı',
    description: 'itemTR ile Valorant VP, PUBG UC, League of Legends RP, hesap ve dijital ürün alım satımını güvenli şekilde yap. Hızlı teslimat, güvenli ödeme, gerçek satıcılar.',
  },
  {
    path: '/login',
    title: 'Giriş Yap | itemTR',
    description: 'itemTR hesabınıza giriş yapın. E-posta, telefon veya Google ile güvenli giriş.',
  },
  {
    path: '/register',
    title: 'Kayıt Ol | itemTR',
    description: 'itemTR\'ye ücretsiz kayıt olun. Oyun içi ürün alın, satın, güvenli ödeme altyapısıyla işlem yapın.',
  },
  {
    path: '/ilan-pazari',
    title: 'İlan Pazarı - Oyun İçi Ürün Al Sat | itemTR',
    description: 'Valorant VP, PUBG UC, LoL RP, Steam cüzdan, hesap ve daha fazlasını güvenli şekilde al veya sat. Binlerce ilan sizi bekliyor.',
  },
  {
    path: '/alim-ilanlari',
    title: 'Alım İlanları | itemTR',
    description: 'Oyun içi ürün almak isteyenlerin ilanlarını inceleyin. Valorant, PUBG, LoL ve daha fazlası için alım ilanları.',
  },
  {
    path: '/magazalar',
    title: 'Mağazalar | itemTR',
    description: 'itemTR\'deki doğrulanmış mağazaları keşfedin. Güvenilir satıcılardan oyun içi ürün satın alın.',
  },
  {
    path: '/tum-kategoriler',
    title: 'Tüm Kategoriler | itemTR',
    description: 'Valorant, PUBG, LoL, Steam, Discord, Roblox ve daha fazlası. itemTR\'deki tüm oyun kategorilerini keşfedin.',
  },
  {
    path: '/roblox',
    title: 'Roblox Robux Al | itemTR',
    description: 'Güvenli ve hızlı Roblox Robux satın alın. En uygun fiyatlar, anında teslimat.',
  },
  {
    path: '/cd-key',
    title: 'CD Key & Oyun Kodu | itemTR',
    description: 'Steam, Epic Games, Origin ve daha fazlası için CD Key ve oyun kodlarını uygun fiyata satın alın.',
  },
  {
    path: '/hediye-kartlari',
    title: 'Hediye Kartları | itemTR',
    description: 'Steam, Google Play, iTunes ve daha fazlası için dijital hediye kartları. Anında teslimat.',
  },
  {
    path: '/top-up',
    title: 'Oyun Bakiyesi Yükle | itemTR',
    description: 'Valorant VP, PUBG UC, LoL RP ve daha fazlası için oyun bakiyesi yükleyin. Hızlı ve güvenli.',
  },
  {
    path: '/cekilisler',
    title: 'Çekilişler | itemTR',
    description: 'itemTR çekilişlerine katılın, oyun içi ödüller kazanın. Ücretsiz ve ücretli çekiliş seçenekleri.',
  },
  {
    path: '/firsatlar',
    title: 'Fırsatlar & İndirimler | itemTR',
    description: 'itemTR\'deki en iyi fırsatları ve indirimleri kaçırmayın. Oyun içi ürünlerde özel kampanyalar.',
  },
  {
    path: '/blog',
    title: 'Blog | itemTR',
    description: 'Oyun dünyasından haberler, rehberler ve ipuçları. itemTR blog ile güncel kalın.',
  },
  {
    path: '/hakkimizda',
    title: 'Hakkımızda | itemTR',
    description: 'itemTR hakkında bilgi edinin. Türkiye\'nin güvenli oyun içi alışveriş ve ilan pazarı.',
  },
  {
    path: '/sss',
    title: 'Sık Sorulan Sorular | itemTR',
    description: 'itemTR hakkında merak ettiğiniz her şey. Ödeme, teslimat, güvenlik ve daha fazlası.',
  },
  {
    path: '/kullanici-sozlesmesi',
    title: 'Kullanıcı Sözleşmesi | itemTR',
    description: 'itemTR kullanıcı sözleşmesi ve hizmet şartları.',
  },
  {
    path: '/gizlilik-politikasi',
    title: 'Gizlilik Politikası | itemTR',
    description: 'itemTR gizlilik politikası. Kişisel verilerinizin nasıl işlendiğini öğrenin.',
  },
  {
    path: '/mesafeli-satis-sozlesmesi',
    title: 'Mesafeli Satış Sözleşmesi | itemTR',
    description: 'itemTR mesafeli satış sözleşmesi ve tüketici hakları.',
  },
  {
    path: '/iade-politikasi',
    title: 'İade Politikası | itemTR',
    description: 'itemTR iade ve iptal politikası. Dijital ürün iade koşulları.',
  },
  {
    path: '/legal/telif-ihlali',
    title: 'Telif Hakkı İhlali Bildirimi | itemTR',
    description: 'itemTR telif hakkı ihlali bildirimi: DMCA ve fikri mülkiyet politikası, ihlal bildirme adımları ve iletişim bilgileri.',
  },
  {
    path: '/server-tanitimi',
    title: 'Sunucu Tanıtımı | itemTR',
    description: 'Discord ve oyun sunucularını tanıtın, topluluğunuzu büyütün. itemTR sunucu tanıtım platformu.',
  },
  {
    path: '/topluluk',
    title: 'Topluluk | itemTR',
    description: 'itemTR oyun topluluğuna katılın. Oyuncularla tanışın, deneyimlerinizi paylaşın.',
  },
  {
    path: '/yayincilar',
    title: 'Yayıncılar | itemTR',
    description: 'itemTR\'deki oyun yayıncılarını keşfedin. Favori yayıncınızı destekleyin.',
  },
  {
    path: '/sifremi-unuttum',
    title: 'Şifremi Unuttum | itemTR',
    description: 'itemTR hesap şifrenizi sıfırlayın. E-posta adresinize sıfırlama bağlantısı gönderin.',
  },
];

const BASE_URL = 'https://itemtr.com';

function injectMeta(html, route) {
  const { path: routePath, title, description } = route;
  const canonical = `${BASE_URL}${routePath}`;

  // title
  html = html.replace(
    /<title>.*?<\/title>/,
    `<title>${title}</title>`
  );

  // description
  html = html.replace(
    /<meta name="description" content=".*?"/,
    `<meta name="description" content="${description}"`
  );

  // canonical - ekle veya güncelle
  if (html.includes('<link rel="canonical"')) {
    html = html.replace(
      /<link rel="canonical" href=".*?"/,
      `<link rel="canonical" href="${canonical}"`
    );
  } else {
    html = html.replace(
      '</head>',
      `  <link rel="canonical" href="${canonical}" />\n  </head>`
    );
  }

  // og:title
  html = html.replace(
    /<meta property="og:title" content=".*?"/,
    `<meta property="og:title" content="${title}"`
  );

  // og:description
  html = html.replace(
    /<meta property="og:description" content=".*?"/,
    `<meta property="og:description" content="${description}"`
  );

  // og:url - ekle veya güncelle
  if (html.includes('property="og:url"')) {
    html = html.replace(
      /<meta property="og:url" content=".*?"/,
      `<meta property="og:url" content="${canonical}"`
    );
  } else {
    html = html.replace(
      '<meta property="og:image"',
      `<meta property="og:url" content="${canonical}" />\n    <meta property="og:image"`
    );
  }

  // twitter:title
  html = html.replace(
    /<meta name="twitter:title" content=".*?"/,
    `<meta name="twitter:title" content="${title}"`
  );

  // twitter:description
  html = html.replace(
    /<meta name="twitter:description" content=".*?"/,
    `<meta name="twitter:description" content="${description}"`
  );

  return html;
}

function main() {
  if (!fs.existsSync(BASE_HTML)) {
    console.error('dist/index.html bulunamadı. Önce npm run build çalıştırın.');
    process.exit(1);
  }

  const baseHtml = fs.readFileSync(BASE_HTML, 'utf-8');
  let count = 0;

  for (const route of ROUTES) {
    if (route.path === '/') {
      // Ana sayfa zaten dist/index.html
      const updated = injectMeta(baseHtml, route);
      fs.writeFileSync(BASE_HTML, updated, 'utf-8');
      console.log(`✓ / → dist/index.html`);
      count++;
      continue;
    }

    // /legal/telif-ihlali gibi nested path'ler için klasör oluştur
    const segments = route.path.replace(/^\//, '').split('/');
    const dir = path.join(DIST, ...segments);
    const outFile = path.join(dir, 'index.html');

    fs.mkdirSync(dir, { recursive: true });
    const updated = injectMeta(baseHtml, route);
    fs.writeFileSync(outFile, updated, 'utf-8');
    console.log(`✓ ${route.path} → dist${route.path}/index.html`);
    count++;
  }

  console.log(`\n✅ ${count} rota için prerender tamamlandı.`);
}

main();
