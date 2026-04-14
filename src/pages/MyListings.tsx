import { HelpCircle, Rocket, FileText, Search, Edit, Trash2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import ConfirmationModal from '../components/ConfirmationModal';

export default function MyListings() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'active' | 'passive'>('active');
  const [listings, setListings] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string }>({ isOpen: false, id: '' });

  useEffect(() => {
    const fetchListings = async () => {
      if (!user) return;
      setFetching(true);
      try {
        const q = query(
          collection(db, 'products'),
          where('sellerId', '==', user.uid),
          where('status', '==', activeTab)
        );
        const querySnapshot = await getDocs(q);
        const fetchedListings = querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as object) }));
        setListings(fetchedListings);
      } catch (error) {
        console.error('Error fetching listings:', error);
        setListings([]);
        toast.error('İlanlar yüklenirken bir hata oluştu.');
      } finally {
        setFetching(false);
      }
    };

    fetchListings();
  }, [user, activeTab]);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
      setListings(listings.filter(l => l.id !== id));
      toast.success('İlan başarıyla silindi.');
    } catch (error) {
      toast.error('İlan silinirken bir hata oluştu.');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'passive' : 'active';
    try {
      await updateDoc(doc(db, 'products', id), { status: newStatus });
      setListings(listings.filter(l => l.id !== id));
      toast.success(`İlan ${newStatus === 'active' ? 'aktif' : 'pasif'} duruma getirildi.`);
    } catch (error) {
      toast.error('İlan durumu güncellenirken bir hata oluştu.');
    }
  };

  const handleComingSoon = (feature: string) => {
    toast.success(`${feature} özelliği yakında eklenecek!`);
  };

  if (loading) return <div className="text-center py-20 text-white">Yükleniyor...</div>;
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="max-w-[1400px] mx-auto space-y-8">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex gap-8 border-b border-white/10 w-full md:w-auto">
          <button 
            onClick={() => setActiveTab('active')}
            className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'active' ? 'text-white' : 'text-gray-400 hover:text-gray-300'}`}
          >
            Aktif İlanlarım
            {activeTab === 'active' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#5b68f6] shadow-[0_0_10px_rgba(91,104,246,0.8)]"></div>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('passive')}
            className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'passive' ? 'text-white' : 'text-gray-400 hover:text-gray-300'}`}
          >
            Pasif İlanlarım
            {activeTab === 'passive' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#5b68f6] shadow-[0_0_10px_rgba(91,104,246,0.8)]"></div>
            )}
          </button>
        </div>
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 w-full md:w-auto">
          <Link 
            to="/ilan-yukari-tasima"
            className="w-full sm:w-auto bg-[#5b68f6]/20 hover:bg-[#5b68f6]/30 text-[#60a5fa] border border-[#5b68f6]/30 px-4 py-2 rounded-full font-medium transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <HelpCircle className="w-4 h-4" />
            İlan Yukarı Taşıma Nedir?
          </Link>
          <Link 
            to="/ilan-yukari-tasima"
            className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-full font-medium transition-colors flex items-center justify-center gap-2 text-sm shadow-[0_0_15px_rgba(168,85,247,0.4)]"
          >
            <Rocket className="w-4 h-4" />
            Otomatik İlan Yukarı Taşıma
          </Link>
        </div>
      </div>

      {/* Content Area */}
      {fetching ? (
        <div className="text-center py-20 text-white">İlanlar yükleniyor...</div>
      ) : listings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <div key={listing.id} className="bg-[#1a1b23] rounded-xl border border-white/5 overflow-hidden flex flex-col hover:border-emerald-400 hover:shadow-[0_0_20px_rgba(52,211,153,0.4)] hover:scale-105 transition-all duration-300">
              {listing.image ? (
                <img src={listing.image} alt={listing.title} className="w-full h-48 object-cover" />
              ) : (
                <div className="w-full h-48 bg-[#111218] text-gray-400 text-xs flex items-center justify-center">Görsel Yok</div>
              )}
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-white font-bold mb-2 line-clamp-2">{listing.title}</h3>
                <div className="text-emerald-400 font-bold text-lg mb-4">{(Number(listing.price) || 0).toFixed(2)} ₺</div>
                <div className="mt-auto flex gap-2">
                  <Link
                    to={`/ilan-duzenle/${listing.id}`}
                    className="bg-[#23242f] hover:bg-[#2d2e3b] text-white p-2 rounded-lg transition-colors"
                    title="İlanı düzenle"
                  >
                    <Edit className="w-5 h-5" />
                  </Link>
                  <button 
                    onClick={() => handleToggleStatus(listing.id, listing.status)}
                    className="flex-1 bg-[#23242f] hover:bg-[#2d2e3b] text-white py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    {listing.status === 'active' ? 'Pasife Al' : 'Aktife Al'}
                  </button>
                  <button 
                    onClick={() => setDeleteModal({ isOpen: true, id: listing.id })}
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-500 p-2 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#1a1b23] border border-white/5 rounded-xl p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
          <div className="w-24 h-24 bg-[#111218] rounded-full flex items-center justify-center mb-6 border border-white/5 relative">
            <FileText className="w-10 h-10 text-gray-400" />
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#1a1b23] rounded-full flex items-center justify-center">
              <Search className="w-5 h-5 text-[#5b68f6]" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            {activeTab === 'active' ? 'Aktif ilan bulunamadı.' : 'Pasif ilan bulunamadı.'}
          </h3>
          <p className="text-gray-400 text-sm">
            {activeTab === 'active' ? 'Satıcıya ait hiçbir aktif ilan bulunamadı.' : 'Satıcıya ait hiçbir pasif ilan bulunamadı.'}
          </p>
        </div>
      )}

      <ConfirmationModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: '' })}
        onConfirm={() => handleDelete(deleteModal.id)}
        title="İlanı Sil"
        message="Bu ilanı silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
        confirmText="Evet, Sil"
        cancelText="Vazgeç"
      />
    </div>
  );
}
