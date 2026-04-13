import { Bell, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, onSnapshot, orderBy, query, where, doc, updateDoc } from 'firebase/firestore';

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt?: any;
};

export default function Notifications() {
  const { user, loading } = useAuth();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [selected, setSelected] = useState<NotificationItem | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) })) as NotificationItem[];
      setItems(docs);
      setSelected((prev) => prev ?? docs[0] ?? null);
      setFetching(false);
    }, () => {
      setItems([]);
      setFetching(false);
    });
    return unsub;
  }, [user]);

  const markAsRead = async (item: NotificationItem) => {
    if (!item || item.isRead) return;
    setSelected({ ...item, isRead: true });
    try {
      await updateDoc(doc(db, 'notifications', item.id), { isRead: true });
    } catch {
      // no-op: UI optimistic update only
    }
  };

  if (loading) return <div className="text-center py-20 text-white">Yükleniyor...</div>;
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div className="flex flex-col md:flex-row h-[600px] bg-[#1a1b23] rounded-xl border border-white/5 overflow-hidden">
        <div className="w-full md:w-[350px] border-r border-white/5 overflow-y-auto bg-[#111218]/50">
          {fetching ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
              <Loader2 className="w-8 h-8 text-gray-500 animate-spin mb-4" />
              <p className="text-gray-400 text-sm">Bildirimler yükleniyor.</p>
            </div>
          ) : items.length === 0 ? (
            <div className="h-full flex items-center justify-center p-8 text-gray-400 text-sm text-center">
              Henüz bildiriminiz bulunmuyor.
            </div>
          ) : (
            items.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setSelected(item);
                  markAsRead(item);
                }}
                className={`w-full text-left px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors ${selected?.id === item.id ? 'bg-white/5' : ''}`}
              >
                <div className="flex items-center gap-2">
                  {!item.isRead && <span className="w-2 h-2 rounded-full bg-[#5b68f6]" />}
                  <p className="text-white font-medium text-sm line-clamp-1">{item.title}</p>
                </div>
                <p className="text-gray-400 text-xs line-clamp-2 mt-1">{item.message}</p>
              </button>
            ))
          )}
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#8b5cf6] rounded-full blur-[100px] opacity-10 pointer-events-none"></div>
          {selected ? (
            <div className="relative z-10 max-w-2xl text-left w-full">
              <h2 className="text-2xl font-bold text-white mb-2">{selected.title}</h2>
              <p className="text-gray-400 mb-4">
                {selected.createdAt?.toDate ? selected.createdAt.toDate().toLocaleString('tr-TR') : 'Yeni'}
              </p>
              <div className="bg-[#111218] border border-white/5 rounded-xl p-5 text-gray-200 whitespace-pre-wrap">
                {selected.message}
              </div>
            </div>
          ) : (
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-b from-[#8b5cf6] to-[#5b68f6] flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(139,92,246,0.3)]">
                <div className="w-24 h-24 rounded-full bg-[#1a1b23] flex items-center justify-center">
                  <Bell className="w-10 h-10 text-[#8b5cf6]" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Bildirim Seçilmedi</h2>
              <p className="text-gray-400">Bildirimleri görüntülemek için soldan bir bildirim seçin.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
