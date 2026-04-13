import { ArrowRight, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

type CategoryCard = {
  name: string;
  type: 'oyun' | 'lisans';
  image: string; // left visual
  subCategories: string[];
  route: string;
};

const cards: CategoryCard[] = [
  { name: 'PUBG Mobile', type: 'oyun', image: 'https://picsum.photos/seed/pubg-card/600/700', subCategories: ['UC', 'Random Hesap', 'Hesap', 'Popülerlik, Klan'], route: '/ilan-pazari?q=PUBG' },
  { name: 'Valorant', type: 'oyun', image: 'https://picsum.photos/seed/valorant-card/600/700', subCategories: ['VP', 'Random Hesap', 'Hesap'], route: '/ilan-pazari?q=Valorant' },
  { name: 'Mobile Legends', type: 'oyun', image: 'https://picsum.photos/seed/mobilelegends-card/600/700', subCategories: ['Elmas', 'Hesap'], route: '/ilan-pazari?q=Mobile%20Legends' },
  { name: 'League Of Legends', type: 'oyun', image: 'https://picsum.photos/seed/lol-card/600/700', subCategories: ['RP', 'Hesap', 'Random Hesap', 'Unranked Hesap'], route: '/ilan-pazari?q=League%20of%20Legends' },
  { name: 'Roblox', type: 'oyun', image: 'https://picsum.photos/seed/roblox-card/600/700', subCategories: ['Robux', 'Skin', 'İlan Pazarı', 'Random Hesap'], route: '/ilan-pazari?q=Roblox' },
  { name: 'Counter Strike 2', type: 'oyun', image: 'https://picsum.photos/seed/cs2-card/600/700', subCategories: ['Hesap', 'Prime', 'Skin', 'Övgü'], route: '/ilan-pazari?q=CS2' },
  { name: 'Free Fire', type: 'oyun', image: 'https://picsum.photos/seed/freefire-card/600/700', subCategories: ['Elmas', 'Hesap'], route: '/ilan-pazari?q=Free%20Fire' },
  { name: 'Minecraft', type: 'oyun', image: 'https://picsum.photos/seed/minecraft-card/600/700', subCategories: ['Hesap', 'Sunucu', 'Minecoin'], route: '/ilan-pazari?q=Minecraft' },
  { name: 'Metin 2', type: 'oyun', image: 'https://picsum.photos/seed/metin2-card/600/700', subCategories: ['Ejder Parası', 'İlan Pazarı', 'Hesap Satışı'], route: '/ilan-pazari?q=Metin%202' },
  { name: 'Steam', type: 'oyun', image: 'https://picsum.photos/seed/steam-card/600/700', subCategories: ['Hesap-Puan-Yorum', 'Cüzdan Kodu', 'Random Key', 'Random Hesap'], route: '/ilan-pazari?q=Steam' },
  { name: 'Genshin Impact', type: 'oyun', image: 'https://picsum.photos/seed/genshin-card/600/700', subCategories: ['Genesis Crystals', 'Hesap', 'Boost'], route: '/ilan-pazari?q=Genshin%20Impact' },
  { name: 'Marvel Rivals', type: 'oyun', image: 'https://picsum.photos/seed/marvelrivals-card/600/700', subCategories: ['Hesap', 'Boost', 'Skin'], route: '/ilan-pazari?q=Marvel%20Rivals' },
  { name: 'Age Of Empires Mobile', type: 'oyun', image: 'https://picsum.photos/seed/aoe-card/600/700', subCategories: ['Hesap', 'Paket', 'Boost'], route: '/ilan-pazari?q=Age%20Of%20Empires%20Mobile' },
  { name: 'Clash of Clans', type: 'oyun', image: 'https://picsum.photos/seed/coc-card/600/700', subCategories: ['Hesap', 'Taş', 'İlan Pazarı'], route: '/ilan-pazari?q=Clash%20of%20Clans' },
  { name: 'Growtopia', type: 'oyun', image: 'https://picsum.photos/seed/growtopia-card/600/700', subCategories: ['Gems', 'İlan Pazarı'], route: '/ilan-pazari?q=Growtopia' },
  { name: 'Wuthering Waves', type: 'oyun', image: 'https://picsum.photos/seed/wuthering-card/600/700', subCategories: ['Lunite', 'Hesap'], route: '/ilan-pazari?q=Wuthering%20Waves' },
  { name: 'Hediye Kartları', type: 'lisans', image: 'https://picsum.photos/seed/giftcard-card/600/700', subCategories: ['Apple Store', 'Google Play', 'itemTR', 'Playstation'], route: '/hediye-kartlari' },
  { name: 'Lisans Hizmetleri', type: 'lisans', image: 'https://picsum.photos/seed/license-card/600/700', subCategories: ['Canva', 'OpenAI ChatGPT', 'Office Programları', 'Freepik'], route: '/ilan-pazari?q=Lisans%20Hizmetleri' },
  { name: 'Platformlar', type: 'lisans', image: 'https://picsum.photos/seed/platform-card/600/700', subCategories: ['Xbox', 'Playstation', 'Netflix', 'Disney+'], route: '/ilan-pazari?q=Platform' },
  { name: 'Zula', type: 'oyun', image: 'https://picsum.photos/seed/zula-card/600/700', subCategories: ['Altın', 'Hesap', 'Random Hesap', 'Mobile'], route: '/ilan-pazari?q=Zula' },
  { name: 'Point Blank', type: 'oyun', image: 'https://picsum.photos/seed/pb-card/600/700', subCategories: ['TG', 'Hesap'], route: '/ilan-pazari?q=Point%20Blank' },
  { name: 'Discord', type: 'lisans', image: 'https://picsum.photos/seed/discord-card/600/700', subCategories: ['Nitro', 'Owo Cash'], route: '/ilan-pazari?q=Discord' },
  { name: 'Whiteout Survival', type: 'oyun', image: 'https://picsum.photos/seed/whiteout-card/600/700', subCategories: ['Frost Star', 'Hesap'], route: '/ilan-pazari?q=Whiteout%20Survival' },
];

export default function TumKategoriler() {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'tumu' | 'oyun' | 'lisans'>('tumu');
  const [page, setPage] = useState(1);
  const perPage = 15;

  const filteredCards = useMemo(
    () =>
      cards.filter((card) => {
        const byType = activeFilter === 'tumu' ? true : card.type === activeFilter;
        const byQuery = query.trim()
          ? `${card.name} ${card.subCategories.join(' ')}`.toLowerCase().includes(query.toLowerCase())
          : true;
        return byType && byQuery;
      }),
    [activeFilter, query]
  );

  const totalPages = Math.max(1, Math.ceil(filteredCards.length / perPage));
  const visibleCards = filteredCards.slice((page - 1) * perPage, page * perPage);

  const goToPage = (n: number) => {
    const safe = Math.min(totalPages, Math.max(1, n));
    setPage(safe);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="space-y-6">
      <div className="rounded-2xl p-6 sm:p-8 border border-white/10 bg-[radial-gradient(circle_at_15%_20%,rgba(64,122,197,0.45),transparent_45%),radial-gradient(circle_at_75%_30%,rgba(6,25,59,0.75),transparent_45%),linear-gradient(180deg,rgba(13,23,40,0.95),rgba(6,10,18,0.95))]">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Tüm Kategoriler</h1>
          <p className="text-white/70 text-sm sm:text-base mt-2">Yüzlerce kategori ve binlerce ürüne göz at!</p>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              type="text"
              placeholder="Kategori ara..."
              className="w-full h-11 rounded-xl bg-black/25 border border-white/15 pl-10 pr-3 text-sm text-white placeholder:text-white/45 focus:outline-none focus:border-[#ff6a00]"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => {
              setActiveFilter('tumu');
              setPage(1);
            }}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${activeFilter === 'tumu' ? 'btn-accent text-white' : 'bg-[#2a3142] text-white/85 hover:bg-[#36405a]'}`}
          >
            Tümü
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveFilter('oyun');
              setPage(1);
            }}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${activeFilter === 'oyun' ? 'btn-accent text-white' : 'bg-[#2a3142] text-white/85 hover:bg-[#36405a]'}`}
          >
            Oyun
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveFilter('lisans');
              setPage(1);
            }}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${activeFilter === 'lisans' ? 'btn-accent text-white' : 'bg-[#2a3142] text-white/85 hover:bg-[#36405a]'}`}
          >
            Lisans Hizmetleri
          </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {visibleCards.map((card) => (
          <article key={card.name} className="rounded-xl overflow-hidden border border-white/10 bg-[#151920]">
            <div className="grid grid-cols-[42%_58%] min-h-[190px]">
              <div className="relative">
                <img src={card.image} alt={card.name} className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-2 right-2 text-white text-sm font-extrabold leading-tight">{card.name}</div>
              </div>

              <div className="p-3 flex flex-col">
                <div className="text-xs text-white font-bold mb-2">Kategoriler</div>
                <div className="space-y-1.5">
                  {card.subCategories.slice(0, 4).map((sub) => (
                    <div key={`${card.name}-${sub}`} className="h-7 rounded-md border border-white/10 bg-[#2a2f39] px-2 text-[11px] text-white/90 flex items-center">
                      {sub}
                    </div>
                  ))}
                </div>

                <Link to={card.route} className="mt-auto h-8 rounded-md border border-white/10 bg-[#20242d] hover:bg-[#292e3a] text-white text-[11px] font-bold flex items-center justify-between px-2.5 transition-colors">
                  Tüm Kategorileri Gör
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2">
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => goToPage(n)}
            className={`w-8 h-8 rounded-md text-xs font-bold border transition-colors ${
              page === n ? 'btn-accent border-transparent text-white' : 'bg-[#151a22] border-white/10 text-white/75 hover:bg-[#1f2630]'
            }`}
          >
            {n}
          </button>
        ))}
        {totalPages > 5 && (
          <button
            type="button"
            onClick={() => goToPage(totalPages)}
            className="w-8 h-8 rounded-md text-xs font-bold border bg-[#151a22] border-white/10 text-white/75 hover:bg-[#1f2630] transition-colors"
          >
            {Math.min(9, totalPages)}
          </button>
        )}
      </div>
    </section>
  );
}
