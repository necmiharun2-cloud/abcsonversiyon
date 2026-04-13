import { Search, AlertTriangle, MessageSquarePlus, Filter, CheckCircle2, User, Send, Paperclip, Smile, AlertCircle, MoreVertical, Phone, Video, Info, Clock, Check, CheckCheck, Pin, Archive, Trash2, Bell, BellOff, X, ExternalLink } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import React, { useState, useEffect, useRef } from 'react';
import { chatService, Chat, ChatMessage } from '../services/chatService';
import { detectContactInfo } from '../lib/contactDetection';

export default function Messages() {
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = chatService.getChats(user.uid, (fetchedChats) => {
      setChats(fetchedChats);
      
      // Handle activeChatId from navigation state
      const stateActiveChatId = location.state?.activeChatId;
      if (stateActiveChatId && !selectedChatId) {
        setSelectedChatId(stateActiveChatId);
        // Clear the location state to prevent re-selection on refresh
        window.history.replaceState({}, document.title);
      }
    });
    return unsubscribe;
  }, [user, location.state, selectedChatId]);

  useEffect(() => {
    if (!selectedChatId) return;
    const unsubscribe = chatService.getMessages(selectedChatId, (fetchedMessages) => {
      setMessages(fetchedMessages);
    });
    return unsubscribe;
  }, [selectedChatId]);

  useEffect(() => {
    // Scroll only the messages container, not the entire page
    if (chatContainerRef.current && messages.length > 0) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!messageText.trim() || !selectedChatId || !user) return;
    
    // Check for contact info
    const detection = detectContactInfo(messageText);
    if (detection.hasContactInfo) {
      toast.error((t) => (
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-400">İletişim Bilgisi Tespit Edildi!</p>
            <p className="text-sm text-gray-300">Telefon, IBAN, sosyal medya vb. paylaşmak yasaktır.</p>
            {detection.violations.length > 0 && (
              <p className="text-xs text-gray-400 mt-1">{detection.violations[0]}</p>
            )}
          </div>
        </div>
      ), { duration: 5000 });
      return;
    }
    
    const textToSend = messageText.trim();
    setMessageText('');
    
    try {
      await chatService.sendMessage(selectedChatId, user.uid, textToSend);
    } catch (error) {
      console.error('Mesaj gönderme hatası:', error);
      toast.error('Mesaj gönderilemedi. Lütfen tekrar deneyin.');
      setMessageText(textToSend);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!chatId) return;
    
    try {
      await chatService.deleteChat(chatId);
      toast.success('Sohbet silindi.');
      if (selectedChatId === chatId) {
        setSelectedChatId(null);
      }
      setChatToDelete(null);
    } catch (error) {
      console.error('Sohbet silme hatası:', error);
      toast.error('Sohbet silinemedi.');
    }
  };

  const filteredChats = chats.filter(chat => {
    const otherId = chat.participants.find(p => p !== user?.uid);
    const name = otherId ? chat.participantNames?.[otherId] : '';
    return name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const selectedChat = chats.find(c => c.id === selectedChatId);
  const otherParticipantId = selectedChat?.participants.find(p => p !== user?.uid);
  const otherParticipantName = otherParticipantId ? selectedChat?.participantNames?.[otherParticipantId] : 'Kullanıcı';
  const otherParticipantAvatar = otherParticipantId ? selectedChat?.participantAvatars?.[otherParticipantId] : '';

  const formatMessageTime = (timestamp: any) => {
    if (!timestamp?.toDate) return '';
    const date = timestamp.toDate();
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  };

  if (loading) return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
    </div>
  );
  
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="max-w-[1600px] mx-auto h-[calc(100vh-140px)]">
      {/* Warning Banner */}
      <div className="bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent border border-red-500/20 rounded-xl p-4 mb-4 flex items-start gap-3">
        <div className="p-2 bg-red-500/20 rounded-lg">
          <AlertTriangle className="text-red-400 w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3 className="text-red-400 font-bold text-sm mb-1">Önemli Güvenlik Uyarısı</h3>
          <p className="text-gray-400 text-xs leading-relaxed">
            Site dışı iletişim kurmak alışveriş güvenliğini sağlayamayacağımız için <span className="text-red-400 font-semibold">yasaktır</span>. 
            Telefon, IBAN, sosyal medya hesapları paylaşmak 2 saat ban ile cezalandırılır.
          </p>
        </div>
      </div>

      <div className="flex gap-4 h-[calc(100%-100px)]">
        {/* Sidebar */}
        <div className="w-full md:w-[380px] flex flex-col gap-3 bg-[#111218] rounded-2xl border border-white/5 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-white/5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Mesajlarım</h2>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white">
                  <Archive className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <button 
              onClick={() => toast.success('Yeni sohbet başlatmak için bir ilana gidip satıcıya mesaj gönderin.')}
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
            >
              <MessageSquarePlus className="w-5 h-5" />
              Yeni Sohbet Başlat
            </button>
          </div>

          {/* Search */}
          <div className="px-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Sohbet ara..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1a1b23] border border-white/5 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
              />
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto px-2 pb-2">
            {filteredChats.length > 0 ? filteredChats.map((chat, index) => {
              const otherId = chat.participants.find(p => p !== user.uid);
              const name = otherId ? chat.participantNames?.[otherId] : 'Kullanıcı';
              const avatar = otherId ? chat.participantAvatars?.[otherId] : '';
              const isSelected = selectedChatId === chat.id;
              const isOnline = Math.random() > 0.5;
              
              return (
                <div 
                  key={chat.id}
                  onClick={() => setSelectedChatId(chat.id)}
                  className={`p-3 rounded-xl cursor-pointer transition-all flex items-center gap-3 group relative ${
                    isSelected 
                      ? 'bg-emerald-500/10 border border-emerald-500/30' 
                      : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="relative">
                    {avatar ? (
                      <img src={avatar} alt={name} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#23242f] to-[#111218] flex items-center justify-center text-white font-bold">
                        {(name || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    {isOnline && (
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#111218]"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className={`font-semibold truncate ${isSelected ? 'text-emerald-400' : 'text-white'}`}>
                        {name}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {chat.lastMessageAt?.toDate ? formatMessageTime(chat.lastMessageAt) : ''}
                      </span>
                    </div>
                    <p className={`text-sm truncate ${isSelected ? 'text-emerald-400/70' : 'text-gray-400'}`}>
                      {chat.lastMessage || 'Henüz mesaj yok'}
                    </p>
                  </div>
                  
                  {/* Delete button - visible on hover */}
                  <button
                    onClick={(e) => setChatToDelete(chat.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 rounded-lg transition-all text-gray-400 hover:text-red-400"
                    title="Sohbeti sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  
                  {index === 0 && (
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  )}

                  {/* Delete confirmation modal */}
                  {chatToDelete === chat.id && (
                    <div 
                      className="absolute inset-0 bg-[#111218]/95 rounded-xl flex items-center justify-center gap-2 z-10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="text-xs text-gray-400">Silinsin mi?</span>
                      <button
                        onClick={(e) => handleDeleteChat(chat.id, e)}
                        className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-xs font-medium transition-colors"
                      >
                        Evet
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setChatToDelete(null);
                        }}
                        className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-medium transition-colors"
                      >
                        Hayır
                      </button>
                    </div>
                  )}
                </div>
              );
            }) : (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquarePlus className="w-8 h-8 text-gray-500" />
                </div>
                <p className="text-gray-500 text-sm">Henüz bir sohbetiniz bulunmuyor.</p>
                <p className="text-gray-600 text-xs mt-2">Bir ilana gidip satıcıya mesaj gönderin.</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 bg-[#111218] rounded-2xl border border-white/5 flex flex-col overflow-hidden">
          {selectedChatId ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#111218]">
                <div className="flex items-center gap-3">
                  <div 
                    className="relative cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => otherParticipantId && navigate(`/profile/${otherParticipantId}`)}
                  >
                    {otherParticipantAvatar ? (
                      <img src={otherParticipantAvatar} className="w-10 h-10 rounded-full object-cover" alt="" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#23242f] to-[#111218] flex items-center justify-center text-white font-bold">
                        {(otherParticipantName || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#111218]"></div>
                  </div>
                  <div>
                    <div 
                      className="text-white font-bold cursor-pointer hover:text-emerald-400 transition-colors flex items-center gap-2"
                      onClick={() => otherParticipantId && navigate(`/profile/${otherParticipantId}`)}
                    >
                      {otherParticipantName}
                      <ExternalLink className="w-3 h-3 opacity-50" />
                    </div>
                    {/* Product Info Link */}
                    {selectedChat?.productId && (
                      <div 
                        className="text-xs text-gray-400 hover:text-emerald-400 transition-colors cursor-pointer flex items-center gap-1 mt-0.5"
                        onClick={() => navigate(`/product/${selectedChat.productId}`)}
                      >
                        <span className="truncate max-w-[200px]">{selectedChat.productTitle || 'Ürün'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </div>
                    )}
                    {!selectedChat?.productId && (
                      <div className="text-xs text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                        Çevrimiçi
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white">
                    <Phone className="w-5 h-5" />
                  </button>
                  <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white">
                    <Video className="w-5 h-5" />
                  </button>
                  <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white">
                    <Info className="w-5 h-5" />
                  </button>
                  <div className="w-px h-6 bg-white/10 mx-1"></div>
                  <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto bg-[#0f1116]">
                <div className="space-y-1">
                  {messages.map((msg, idx) => {
                    const isMe = msg.senderId === user.uid;
                    const showDate = idx === 0 || (msg.createdAt?.toDate && messages[idx-1].createdAt?.toDate && 
                      new Date(msg.createdAt.toDate()).toDateString() !== new Date(messages[idx-1].createdAt.toDate()).toDateString());

                    return (
                      <React.Fragment key={msg.id || idx}>
                        {showDate && (
                          <div className="flex justify-center my-6">
                            <span className="bg-[#1a1b23] text-gray-500 text-[10px] px-4 py-1.5 rounded-full uppercase tracking-wider font-medium">
                              {msg.createdAt?.toDate ? new Date(msg.createdAt.toDate()).toLocaleDateString('tr-TR', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              }) : 'Bugün'}
                            </span>
                          </div>
                        )}
                        <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-2`}>
                          <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                            <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                              isMe 
                                ? 'bg-gradient-to-br from-emerald-600 to-emerald-500 text-white rounded-br-md' 
                                : 'bg-[#1a1b23] text-gray-200 rounded-bl-md border border-white/5'
                            }`}>
                              {msg.text}
                            </div>
                            <div className="flex items-center gap-1 mt-1 px-1">
                              <span className="text-[10px] text-gray-500">
                                {formatMessageTime(msg.createdAt)}
                              </span>
                              {isMe && (
                                <CheckCheck className="w-3 h-3 text-emerald-500" />
                              )}
                            </div>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-white/5 bg-[#111218]">
                <div className="flex items-end gap-3">
                  <button 
                    type="button" 
                    className="p-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  
                  <div className="flex-1 relative">
                    <input 
                      ref={inputRef}
                      type="text" 
                      placeholder="Mesajınızı yazın..." 
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="w-full bg-[#1a1b23] border border-white/10 rounded-2xl py-3.5 px-5 pr-12 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                    />
                    <button 
                      type="button" 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1"
                    >
                      <Smile className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => handleSendMessage()}
                    disabled={!messageText.trim()}
                    className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                <div className="text-center mt-2">
                  <span className="text-[10px] text-gray-600">Enter ile gönder • Shift+Enter ile yeni satır</span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#0f1116]">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20">
                <MessageSquarePlus className="w-12 h-12 text-emerald-500" />
              </div>
              
              <h2 className="text-xl font-bold text-white mb-3">Mesajlaşmaya Başlayın</h2>
              
              <div className="space-y-3 text-sm text-gray-400 max-w-md">
                <p>
                  Bir sohbet seçin veya <span className="text-emerald-400 font-semibold">yeni bir sohbet başlatın</span>.
                </p>
                
                <div className="bg-[#111218] rounded-xl p-4 border border-white/5 mt-6">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div className="text-left text-xs leading-relaxed">
                      <p className="text-gray-300 mb-2">
                        <span className="text-emerald-400 font-semibold">itemTR</span> sizinle hiçbir şekilde Chat, Facebook veya Instagram üzerinden iletişime geçmez!
                      </p>
                      <p className="text-gray-500">
                        İlanınızın satıldığını size itemTR başlığıyla SMS, e-posta ve bildirimler sayfanızdan ulaşabileceğiniz teslimat mesajı gönderiyoruz.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
