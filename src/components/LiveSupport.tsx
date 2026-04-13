import { MessageCircle, X, Send, Paperclip, Smile } from "lucide-react";
import { useState } from "react";

const LiveSupport = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { from: "support", text: "Merhaba! 👋 İtemSatış destek ekibine hoş geldiniz. Size nasıl yardımcı olabiliriz?", time: "Şimdi" },
  ]);

  const sendMessage = () => {
    if (!message.trim()) return;
    setMessages(prev => [...prev, { from: "user", text: message, time: "Şimdi" }]);
    setMessage("");
    setTimeout(() => {
      setMessages(prev => [...prev, { from: "support", text: "Talebiniz alınmıştır. Kısa süre içinde size dönüş yapacağız. Ortalama yanıt süremiz 2-5 dakikadır.", time: "Şimdi" }]);
    }, 1500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="mb-3 w-80 bg-card rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col" style={{ maxHeight: 420 }}>
          <div className="bg-primary p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary-foreground">
              <div className="relative">
                <MessageCircle className="h-5 w-5" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-success border-2 border-primary" />
              </div>
              <div>
                <span className="font-semibold text-sm block">Canlı Destek</span>
                <span className="text-[10px] text-primary-foreground/70">Çevrimiçi · Ort. yanıt: ~2 dk</span>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-primary-foreground/70 hover:text-primary-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[200px]">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-xl p-3 ${
                  msg.from === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-secondary text-foreground rounded-bl-sm"
                }`}>
                  <p className="text-sm">{msg.text}</p>
                  <p className={`text-[10px] mt-1 ${msg.from === "user" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{msg.time}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-border">
            <div className="flex gap-2">
              <button className="p-2 text-muted-foreground hover:text-foreground transition-colors shrink-0">
                <Paperclip className="h-4 w-4" />
              </button>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Mesajınızı yazın..."
                className="flex-1 bg-secondary border border-border rounded-xl py-2 px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button
                onClick={sendMessage}
                className="p-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all flex items-center justify-center hover:scale-105 relative"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {!open && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center animate-pulse">
            1
          </span>
        )}
      </button>
    </div>
  );
};

export default LiveSupport;
