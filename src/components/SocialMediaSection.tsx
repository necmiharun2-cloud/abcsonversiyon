import { Link } from 'react-router-dom';

export default function SocialMediaSection() {
  const platforms = [
    { name: 'Twitch', color: 'bg-[#6441a5]', icon: '🎮' },
    { name: 'Discord', color: 'bg-[#5865f2]', icon: '💬' },
    { name: 'Facebook', color: 'bg-[#1877f2]', icon: '📘' },
    { name: 'Spotify', color: 'bg-[#1db954]', icon: '🎵' },
    { name: 'İnstagram', color: 'bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]', icon: '📸' },
    { name: 'X', color: 'bg-[#000000]', icon: '𝕏' },
    { name: 'TikTok', color: 'bg-[#000000]', icon: '🎵' },
    { name: 'YouTube', color: 'bg-[#ff0000]', icon: '▶️' },
  ];

  return (
    <section className="py-8 text-center relative">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#111218] via-[#1e2030] to-[#111218] -z-10 rounded-3xl opacity-50" />
      
      <div className="mb-8 pt-8">
        <span className="text-xs font-bold text-white/40 tracking-widest uppercase mb-2 block bg-white/5 w-max mx-auto px-3 py-1 rounded-full">• KEŞFET</span>
        <h2 className="text-3xl font-bold text-white mb-2">Sosyal Medya İlanları</h2>
        <p className="text-white/60 text-sm">Popüler sosyal medya kategorilerindeki binlerce ilanı keşfet!</p>
      </div>

      <div className="grid grid-cols-4 md:grid-cols-8 gap-4 px-4 max-w-[1400px] mx-auto mb-12">
        {platforms.map((platform) => (
          <Link
            key={platform.name}
            to={`/ilan-pazari?q=${encodeURIComponent(platform.name)}`}
            className={`${platform.color} rounded-2xl px-4 py-4 flex flex-col items-center justify-center gap-2 hover:-translate-y-1 transition-transform duration-300 shadow-lg w-full`}
          >
            <div className="text-2xl text-white">
              {platform.icon}
            </div>
            <div className="flex flex-col items-center">
              <span className="text-white font-bold text-sm">{platform.name}</span>
              <span className="text-white/70 text-[10px]">İlanları</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
