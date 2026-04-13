import { useState } from "react";
import { Mail, Bell, Gift } from "lucide-react";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-[hsl(var(--badge-vitrin))]/20 border border-primary/20 p-6 md:p-8">
      <div className="absolute -right-8 -top-8 opacity-5">
        <Mail className="w-40 h-40 text-primary" />
      </div>
      <div className="relative flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold text-foreground">Fırsatları Kaçırmayın!</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Kampanya, çekiliş ve özel indirimleri e-posta ile ilk siz öğrenin.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
            <span className="flex items-center gap-1"><Gift className="h-3.5 w-3.5 text-accent" /> Haftalık çekilişler</span>
            <span className="flex items-center gap-1">🔥 Özel indirimler</span>
            <span className="flex items-center gap-1">📰 Güncel haberler</span>
          </div>
        </div>
        {subscribed ? (
          <div className="flex items-center gap-2 px-6 py-3 rounded-xl bg-success/20 text-success text-sm font-medium">
            ✅ Başarıyla abone oldunuz!
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2 w-full md:w-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-posta adresiniz"
              className="flex-1 md:w-64 bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              required
            />
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors whitespace-nowrap"
            >
              Abone Ol
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Newsletter;
