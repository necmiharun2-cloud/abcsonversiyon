import { Shield, Zap, Headphones, Lock, CreditCard, Users, Award, RefreshCcw } from "lucide-react";

const advantages = [
  { icon: Shield, title: "Güvenli Alışveriş", desc: "256-bit SSL şifreleme ile tüm işlemleriniz güvende", color: "text-primary", bg: "bg-primary/10" },
  { icon: Zap, title: "Anında Teslimat", desc: "Ödeme sonrası saniyeler içinde otomatik teslimat", color: "text-accent", bg: "bg-accent/10" },
  { icon: Lock, title: "itemTR Güvencesi", desc: "Her işlem platform güvencesi altında gerçekleşir", color: "text-success", bg: "bg-success/10" },
  { icon: Headphones, title: "7/24 Canlı Destek", desc: "Her zaman yanınızdayız, anında yardım alın", color: "text-[hsl(var(--badge-vitrin))]", bg: "bg-[hsl(var(--badge-vitrin))]/10" },
  { icon: CreditCard, title: "Çoklu Ödeme", desc: "Kredi kartı, Papara, kripto ve daha fazlası", color: "text-primary", bg: "bg-primary/10" },
  { icon: Users, title: "150K+ Üye", desc: "Türkiye'nin en büyük dijital pazaryeri topluluğu", color: "text-accent", bg: "bg-accent/10" },
  { icon: Award, title: "Satıcı Puanlama", desc: "Doğrulanmış satıcılar ve güvenilir puanlama sistemi", color: "text-success", bg: "bg-success/10" },
  { icon: RefreshCcw, title: "İade Garantisi", desc: "Sorunlu işlemlerde koşulsuz iade imkânı", color: "text-[hsl(var(--badge-vitrin))]", bg: "bg-[hsl(var(--badge-vitrin))]/10" },
];

const Advantages = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-1 h-6 bg-primary rounded-full" />
        <h2 className="text-lg font-bold text-foreground">Neden itemTR?</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {advantages.map((adv) => (
          <div
            key={adv.title}
            className="bg-card rounded-xl border border-border p-4 space-y-2 hover:border-primary/30 transition-all group"
          >
            <div className={`w-10 h-10 rounded-xl ${adv.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <adv.icon className={`h-5 w-5 ${adv.color}`} />
            </div>
            <h3 className="text-sm font-semibold text-foreground">{adv.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{adv.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Advantages;
