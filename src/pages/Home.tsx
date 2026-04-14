import SEOHead from '../components/SEOHead';
import HeroSection from '../components/HeroSection';
import PopularCategories from '../components/PopularCategories';
import ShowcaseListings from '../components/ShowcaseListings';
import ServerListings from '../components/ServerListings';
import HomeBuyListings from '../components/HomeBuyListings';
import NewListings from '../components/NewListings';
import StoriesStrip from '../components/StoriesStrip';
import DealsSection from '../components/DealsSection';
import CdKeyBestSellers from '../components/CdKeyBestSellers';
import BudgetTiles from '../components/BudgetTiles';
import BlogPreviewSection from '../components/BlogPreviewSection';
import SocialMediaSection from '../components/SocialMediaSection';
import GameMoneySection from '../components/GameMoneySection';
import EPinSection from '../components/EPinSection';
import HomeSidebar from '../components/HomeSidebar';
import FeaturedProductsCarousel from '../components/FeaturedProductsCarousel';

export default function Home() {
  return (
    <div className="bg-[#111218] min-h-screen">
      <SEOHead
        title="itemTR - Güvenli Oyun İçi Alışveriş ve İlan Pazarı"
        description="itemTR ile Valorant VP, PUBG UC, League of Legends RP, hesap ve dijital ürün alım satımını güvenli şekilde yap. Hızlı teslimat, güvenli ödeme, gerçek satıcılar."
        canonical="/"
      />
      {/* Hero Section with Category Tabs */}
      <HeroSection />

      {/* Stories Strip - Game Stats Bar */}
      <div className="max-w-[1400px] mx-auto px-4 mt-1">
        <StoriesStrip />
      </div>

      {/* Popular Categories Grid */}
      <div className="max-w-[1400px] mx-auto px-4 mt-4">
        <PopularCategories />
      </div>

      {/* 2-Column Layout for Main Content and Sidebar */}
      <div className="max-w-[1400px] mx-auto px-4 mt-6 flex flex-col lg:flex-row gap-6">
        {/* Main Content (Left ~75%) */}
        <div className="flex-1 min-w-0 flex flex-col gap-6">
          {/* Showcase Listings - Vitrin İlanları */}
          <ShowcaseListings />

          {/* New Listings - Yeni İlanlar */}
          <NewListings />

          {/* Server Listings */}
          <ServerListings />

          {/* Home Buy Listings */}
          <HomeBuyListings />
        </div>

        {/* Sidebar (Right ~25%) */}
        <div className="w-full lg:w-[320px] shrink-0">
          <div className="sticky top-24 flex flex-col gap-6">
            <HomeSidebar />
          </div>
        </div>
      </div>

      {/* Social Media Section */}
      <div className="max-w-[1400px] mx-auto px-4 mt-10">
        <SocialMediaSection />
      </div>

      {/* Featured Products Carousel */}
      <div className="max-w-[1400px] mx-auto px-4 mt-10">
        <FeaturedProductsCarousel />
      </div>

      {/* Game Money Section */}
      <div className="max-w-[1400px] mx-auto px-4 mt-10">
        <GameMoneySection />
      </div>

      {/* E-Pin Section */}
      <div className="max-w-[1400px] mx-auto px-4 mt-10">
        <EPinSection />
      </div>

      {/* Deals Section with Countdown Timer */}
      <div className="max-w-[1400px] mx-auto px-4 mt-10">
        <DealsSection />
      </div>

      {/* CD Key Best Sellers */}
      <div className="max-w-[1400px] mx-auto px-4 mt-10">
        <CdKeyBestSellers />
      </div>

      {/* Budget Tiles - Price-based browsing */}
      <div className="max-w-[1400px] mx-auto px-4 mt-10">
        <BudgetTiles />
      </div>

      {/* Blog Preview Section */}
      <div className="max-w-[1400px] mx-auto px-4 mt-10 mb-10">
        <BlogPreviewSection />
      </div>

      {/* Static SEO content block - crawlable by all bots */}
      <div className="max-w-[1400px] mx-auto px-4 pb-8">
        <div className="border-t border-white/5 pt-8">
          <h2 className="text-white font-bold text-lg mb-3">itemTR — Türkiye'nin Dijital Oyun Pazarı</h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-4">
            itemTR, oyuncular için tasarlanmış güvenli bir alım-satım platformudur. Valorant VP, PUBG Mobile UC, League of Legends RP, Steam Cüzdan Kodu, Discord Nitro ve daha onlarca dijital ürünü uygun fiyatla, anında teslimle satın alabilirsiniz. Satıcı doğrulama sistemi ve alıcı koruma güvencesiyle tüm işlemler için 7/24 destek sunulmaktadır.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mb-6">
            {[
              { label: 'Valorant VP', href: '/ilan-pazari?q=Valorant' },
              { label: 'PUBG Mobile UC', href: '/ilan-pazari?q=PUBG' },
              { label: 'LoL RP', href: '/ilan-pazari?q=League+of+Legends' },
              { label: 'Steam Cüzdan', href: '/ilan-pazari?q=Steam' },
              { label: 'Discord Nitro', href: '/ilan-pazari?q=Discord' },
              { label: 'Roblox Robux', href: '/roblox' },
              { label: 'CD Key', href: '/cd-key' },
              { label: 'Hediye Kartı', href: '/hediye-kartlari' },
              { label: 'Hesap Satışı', href: '/ilan-pazari?q=hesap' },
              { label: 'E-Pin', href: '/ilan-pazari?q=epin' },
              { label: 'MMO Oyunlar', href: '/ilan-pazari?q=MMO' },
              { label: 'Freelancer', href: '/ilan-pazari?q=freelancer' },
            ].map(({ label, href }) => (
              <a key={href} href={href} className="text-xs text-gray-400 hover:text-amber-400 transition-colors py-1 px-2 bg-white/5 rounded-lg text-center">
                {label}
              </a>
            ))}
          </div>
          <div className="flex flex-wrap gap-4 text-xs text-gray-500">
            <a href="/hakkimizda" className="hover:text-gray-300">Hakkımızda</a>
            <a href="/sss" className="hover:text-gray-300">Sıkça Sorulan Sorular</a>
            <a href="/destek-sistemi" className="hover:text-gray-300">Destek</a>
            <a href="/gizlilik-politikasi" className="hover:text-gray-300">Gizlilik Politikası</a>
            <a href="/kullanici-sozlesmesi" className="hover:text-gray-300">Kullanıcı Sözleşmesi</a>
            <a href="/iade-politikasi" className="hover:text-gray-300">İade Politikası</a>
            <a href="/legal/telif-ihlali" className="hover:text-gray-300">Telif Hakkı İhlali</a>
          </div>
        </div>
      </div>
    </div>
  );
}
