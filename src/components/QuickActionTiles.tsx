import { Link } from 'react-router-dom';
import { Wallet, Key, Gift, Percent, Instagram } from 'lucide-react';

const quickActions = [
  { name: 'Bakiye Yükle', icon: Wallet, path: '/bakiye-yukle', color: 'bg-teal-600 hover:bg-teal-700' },
  { name: 'CD Keys', icon: Key, path: '/cd-key', color: 'bg-purple-600 hover:bg-purple-700' },
  { name: 'Ücretsiz Çekilişler', icon: Gift, path: '/cekilisler', color: 'bg-pink-600 hover:bg-pink-700' },
  { name: 'Günün Fırsatları', icon: Percent, path: '/firsatlar', color: 'bg-orange-600 hover:bg-orange-700' },
  { name: 'Instagram', icon: Instagram, path: 'https://instagram.com/itemTR', external: true, color: 'bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' },
];

export default function QuickActionTiles() {
  return (
    <section className="py-6">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {quickActions.map((action) => {
            const content = (
              <div className="flex items-center gap-3">
                <action.icon className="w-5 h-5" />
                <span className="font-semibold text-sm">{action.name}</span>
              </div>
            );

            if (action.external) {
              return (
                <a
                  key={action.name}
                  href={action.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-center px-4 py-3 rounded-xl text-white transition-all ${action.color}`}
                >
                  {content}
                </a>
              );
            }

            return (
              <Link
                key={action.name}
                to={action.path}
                className={`flex items-center justify-center px-4 py-3 rounded-xl text-white transition-all ${action.color}`}
              >
                {content}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
