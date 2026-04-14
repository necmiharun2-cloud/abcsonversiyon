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
    </div>
  );
}
