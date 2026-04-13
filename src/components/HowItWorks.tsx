import { UserPlus, Search, CreditCard, CheckCircle } from "lucide-react";

const steps = [
  { icon: UserPlus, title: "Kayıt Ol", desc: "Ücretsiz hesap oluştur", color: "text-primary", bg: "bg-primary/10", num: "1" },
  { icon: Search, title: "Ürün Bul", desc: "Binlerce ilan arasından seç", color: "text-accent", bg: "bg-accent/10", num: "2" },
  { icon: CreditCard, title: "Güvenle Öde", desc: "Güvenli ödeme sistemiyle öde", color: "text-success", bg: "bg-success/10", num: "3" },
  { icon: CheckCircle, title: "Teslim Al", desc: "Anında otomatik teslimat", color: "text-[hsl(var(--badge-vitrin))]", bg: "bg-[hsl(var(--badge-vitrin))]/10", num: "4" },
];

const HowItWorks = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-1 h-6 bg-success rounded-full" />
        <h2 className="text-lg font-bold text-foreground">Nasıl Çalışır?</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {steps.map((step, i) => (
          <div key={step.title} className="relative bg-card rounded-xl border border-border p-5 text-center space-y-3 group hover:border-primary/30 transition-all">
            <div className="absolute top-3 left-3 w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground">
              {step.num}
            </div>
            <div className={`w-14 h-14 rounded-2xl ${step.bg} flex items-center justify-center mx-auto group-hover:scale-110 transition-transform`}>
              <step.icon className={`h-7 w-7 ${step.color}`} />
            </div>
            <h3 className="text-sm font-bold text-foreground">{step.title}</h3>
            <p className="text-xs text-muted-foreground">{step.desc}</p>
            {i < steps.length - 1 && (
              <div className="hidden md:block absolute top-1/2 -right-3 text-muted-foreground/30 text-lg">→</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HowItWorks;
