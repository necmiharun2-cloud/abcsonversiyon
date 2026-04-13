import { X, Send, User, Bot, HelpCircle, MessageSquare, Clock, Wallet } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: string;
}

interface SupportAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
}

export default function SupportAssistant({ isOpen, onClose, userName }: SupportAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const faqQuestions = [
    { id: '1', text: 'Kartımdan para kesilmesine rağmen bakiyeme eklenmedi', answer: 'Merhaba! Ödemeniz banka onayından geçtikten sonra otomatik olarak bakiyenize yansır. Eğer 15 dakika içinde yansımadıysa lütfen ödeme dekontunuzla birlikte destek talebi oluşturun.' },
    { id: '2', text: 'Ürün iadesi var mı?', answer: 'Dijital ürünlerde (hesap, kod vb.) ürün teslim edildikten sonra iade yapılamamaktadır. Ancak ürün hatalıysa veya açıklamadaki gibi değilse satıcı ile iletişime geçebilir veya destek talebi açabilirsiniz.' },
    { id: '3', text: 'Mesai saatleriniz nedir?', answer: 'Destek ekibimiz her gün 09:00 - 00:00 saatleri arasında hizmet vermektedir. Bu saatler dışındaki talepleriniz bir sonraki gün mesai başlangıcında yanıtlanır.' }
  ];

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const initialMessages: Message[] = [
        { id: 'init-1', text: `Merhaba ${userName}, ben itemTR Asistan. 👋`, sender: 'bot', timestamp: getCurrentTime() },
        { id: 'init-2', text: 'itemTR hakkında nasıl yardımcı olabilirim? 😊', sender: 'bot', timestamp: getCurrentTime() }
      ];
      setMessages(initialMessages);
    }
  }, [isOpen, userName]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const getCurrentTime = () => {
    const now = new Date();
    return now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
  };

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: getCurrentTime()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      let botResponse = "Üzgünüm, bu konuda size yardımcı olamıyorum. Lütfen canlı desteğe bağlanmayı deneyin.";
      
      // Check if it matches any FAQ
      const matchedFaq = faqQuestions.find(q => q.text.toLowerCase() === text.toLowerCase());
      if (matchedFaq) {
        botResponse = matchedFaq.answer;
      } else if (text.toLowerCase().includes('merhaba')) {
        botResponse = "Merhaba! Size nasıl yardımcı olabilirim?";
      } else if (text.toLowerCase().includes('fiyat')) {
        botResponse = "İlan fiyatları satıcılar tarafından belirlenmektedir. İndirim taleplerinizi satıcıya mesaj atarak iletebilirsiniz.";
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: getCurrentTime()
      };

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-[#1a1b23] w-full max-w-2xl h-[600px] rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#111218]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#5b68f6]/20 flex items-center justify-center border border-[#5b68f6]/30">
                <Bot className="w-6 h-6 text-[#5b68f6]" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">itemTR Asistan</h3>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[10px] text-emerald-400 font-medium uppercase tracking-wider">Çevrimiçi</span>
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide" ref={scrollRef}>
            {/* FAQ Section */}
            <div className="space-y-3">
              <div className="flex flex-col items-center gap-1 mb-4">
                <span className="text-white font-bold text-sm">Sık Sorulan Sorular</span>
                <span className="text-gray-500 text-[10px]">Size yardımcı olabilecek hazır sorular:</span>
              </div>
              <div className="space-y-2">
                {faqQuestions.map(q => (
                  <button 
                    key={q.id}
                    onClick={() => handleSendMessage(q.text)}
                    className="w-full text-left p-3 rounded-xl bg-[#111218] border border-white/5 hover:border-[#5b68f6]/50 hover:bg-[#5b68f6]/5 transition-all text-gray-300 text-xs flex items-center gap-3 group"
                  >
                    <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-[#5b68f6]/20 group-hover:text-[#5b68f6] transition-colors">
                      {q.id === '1' && <Wallet className="w-3.5 h-3.5" />}
                      {q.id === '2' && <RefreshCwIcon className="w-3.5 h-3.5" />}
                      {q.id === '3' && <Clock className="w-3.5 h-3.5" />}
                    </div>
                    {q.text}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative flex items-center justify-center py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5"></div>
              </div>
              <span className="relative bg-[#1a1b23] px-4 text-[10px] text-gray-500 uppercase tracking-widest">Konuşma Başladı</span>
            </div>

            {/* Messages */}
            {messages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${msg.sender === 'user' ? 'bg-[#5b68f6] border-white/10' : 'bg-[#111218] border-white/10'}`}>
                    {msg.sender === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-[#5b68f6]" />}
                  </div>
                  <div className="space-y-1">
                    <div className={`p-3 rounded-2xl text-sm leading-relaxed ${msg.sender === 'user' ? 'bg-[#5b68f6] text-white rounded-tr-none' : 'bg-[#111218] text-gray-300 rounded-tl-none border border-white/5'}`}>
                      {msg.text}
                    </div>
                    <div className={`text-[10px] text-gray-500 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#111218] border border-white/10 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-[#5b68f6]" />
                  </div>
                  <div className="bg-[#111218] border border-white/5 p-3 rounded-2xl rounded-tl-none flex gap-1">
                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-[#111218] border-t border-white/5">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputValue);
              }}
              className="relative"
            >
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Mesajınızı yazın..."
                className="w-full bg-[#1a1b23] border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-[#5b68f6] transition-colors"
              />
              <button 
                type="submit"
                disabled={!inputValue.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#5b68f6] hover:text-[#4a55d6] disabled:text-gray-600 transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function RefreshCwIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  )
}
