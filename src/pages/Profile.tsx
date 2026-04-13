import { useAuth } from '../contexts/AuthContext';
import { Navigate, useLocation, useParams, Link } from 'react-router-dom';
import ProfileWarningModal from '../components/ProfileWarningModal';
import { Package, Star, Trophy, Users, UserPlus, Edit3, X, Camera, ShieldCheck, Award } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, limit, addDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, loading } = useAuth();
  const { id } = useParams();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('ilanlar');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: '',
    bio: '',
    avatar: ''
  });
  const [viewedUser, setViewedUser] = useState<any>(null);
  const [fetchingUser, setFetchingUser] = useState(true);
  const [listings, setListings] = useState<any[]>([]);
  const [fetchingListings, setFetchingListings] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [followers, setFollowers] = useState<any[]>([]);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [followDocId, setFollowDocId] = useState<string | null>(null);
  const [followBusy, setFollowBusy] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      setFetchingUser(true);
      if (id) {
        try {
          const docRef = doc(db, 'users', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setViewedUser({ id: docSnap.id, ...docSnap.data() });
          } else {
            const fb = (location.state as any)?.fallbackProfile;
            // If a user doc is missing (mock listings / legacy data / incomplete profile),
            // still render a minimal profile instead of hard-failing.
            setViewedUser({
              id,
              username: (fb?.id === id ? fb.username : undefined) || 'Kullanıcı',
              avatar: (fb?.id === id ? fb.avatar : undefined) || '',
              createdAt: new Date().toISOString(),
              role: 'user',
              balance: 0,
              soldCount: 0,
              rating: 0,
              reviewCount: 0,
              storeLevel: 'standard',
              isVerifiedSeller: false,
            });
          }
        } catch (error) {
          console.error('Error fetching user:', error);
          // Permission denied or network errors shouldn't block opening a seller profile page.
          // Show a minimal fallback profile instead of "Kullanıcı bulunamadı."
          const fb = (location.state as any)?.fallbackProfile;
          if (id) {
            setViewedUser({
              id,
              username: (fb?.id === id ? fb.username : undefined) || 'Kullanıcı',
              avatar: (fb?.id === id ? fb.avatar : undefined) || '',
              createdAt: new Date().toISOString(),
              role: 'user',
              balance: 0,
              soldCount: 0,
              rating: 0,
              reviewCount: 0,
              storeLevel: 'standard',
              isVerifiedSeller: false,
            });
          }
        }
      } else if (user) {
        setViewedUser({
          id: user.uid,
          displayName: user.displayName,
          email: user.email,
          avatar: user.photoURL,
          // Add other profile fields if needed
        });
        setProfileData({
          displayName: user.displayName || '',
          bio: '',
          avatar: user.photoURL || ''
        });
      }
      setFetchingUser(false);
    };
    fetchUser();
  }, [id, user, location.state]);

  useEffect(() => {
    const fetchListings = async () => {
      if (!viewedUser || activeTab !== 'ilanlar') return;
      setFetchingListings(true);
      try {
        const q = query(
          collection(db, 'products'),
          where('sellerId', '==', viewedUser.id),
          where('status', '==', 'active')
        );
        const querySnapshot = await getDocs(q);
        const fetchedListings = querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as object) }));
        setListings(fetchedListings);
      } catch (error) {
        console.error('Error fetching listings:', error);
      } finally {
        setFetchingListings(false);
      }
    };
    fetchListings();
  }, [viewedUser, activeTab]);

  useEffect(() => {
    const fetchSocialData = async () => {
      if (!viewedUser) return;
      try {
        const reviewsQuery = query(collection(db, 'reviews'), where('targetUserId', '==', viewedUser.id), limit(20));
        const followersQuery = query(collection(db, 'followers'), where('targetUserId', '==', viewedUser.id), limit(20));
        const [reviewsSnap, followersSnap] = await Promise.all([getDocs(reviewsQuery), getDocs(followersQuery)]);
        setReviews(reviewsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setFollowers(followersSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch {
        setReviews([]);
        setFollowers([]);
      }
    };
    fetchSocialData();
  }, [viewedUser]);

  useEffect(() => {
    const fetchFollowState = async () => {
      if (!user || !viewedUser || viewedUser.id === user.uid) {
        setFollowDocId(null);
        return;
      }
      try {
        const q = query(
          collection(db, 'followers'),
          where('followerId', '==', user.uid),
          where('targetUserId', '==', viewedUser.id),
          limit(1)
        );
        const snap = await getDocs(q);
        setFollowDocId(snap.empty ? null : snap.docs[0].id);
      } catch {
        setFollowDocId(null);
      }
    };
    fetchFollowState();
  }, [user, viewedUser]);

  const handleFollowToggle = async () => {
    if (!user || !viewedUser || viewedUser.id === user.uid) return;
    setFollowBusy(true);
    try {
      if (followDocId) {
        await deleteDoc(doc(db, 'followers', followDocId));
        setFollowDocId(null);
        setFollowers((prev) => prev.filter((f) => f.id !== followDocId));
        toast.success('Takipten çıkıldı.');
      } else {
        const ref = await addDoc(collection(db, 'followers'), {
          followerId: user.uid,
          followerName: user.displayName || user.email?.split('@')[0] || 'Kullanıcı',
          targetUserId: viewedUser.id,
          createdAt: new Date().toISOString(),
        });
        setFollowDocId(ref.id);
        setFollowers((prev) => [
          { id: ref.id, followerId: user.uid, followerName: user.displayName || 'Kullanıcı', targetUserId: viewedUser.id, createdAt: new Date().toISOString() },
          ...prev,
        ]);
        toast.success('Kullanıcı takip edildi.');
      }
    } catch {
      toast.error('Takip işlemi başarısız oldu.');
    } finally {
      setFollowBusy(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    if (!user) return;
    setUploadingAvatar(true);
    try {
      const avatarRef = ref(storage, `avatars/${user.uid}/${Date.now()}_${file.name}`);
      await uploadBytes(avatarRef, file);
      const avatarUrl = await getDownloadURL(avatarRef);
      setProfileData((prev) => ({ ...prev, avatar: avatarUrl }));
      toast.success('Profil görseli yüklendi.');
    } catch {
      toast.error('Görsel yüklenemedi.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        username: profileData.displayName.trim(),
        bio: profileData.bio.trim(),
        avatar: profileData.avatar || '',
      });
      setViewedUser((prev: any) => ({
        ...prev,
        username: profileData.displayName.trim(),
        bio: profileData.bio.trim(),
        avatar: profileData.avatar || prev?.avatar || '',
      }));
      toast.success('Profil bilgileriniz başarıyla güncellendi!');
      setIsEditModalOpen(false);
    } catch {
      toast.error('Profil güncellenemedi.');
    }
  };

  if (loading || fetchingUser) {
    return <div className="text-center py-20 text-white">Yükleniyor...</div>;
  }

  if (!user && !id) {
    return <Navigate to="/login" />;
  }

  if (!viewedUser) {
    return <div className="text-center py-20 text-white">Kullanıcı bulunamadı.</div>;
  }

  const isOwnProfile = !id || id === user?.uid;
  const ratingValue = Number(viewedUser.rating || 0);
  const reviewCount = reviews.length || Number(viewedUser.reviewCount || 0);
  const followerCount = followers.length || Number(viewedUser.followerCount || 0);

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {isOwnProfile && <ProfileWarningModal />}
      
      {/* Professional Header */}
      <div className="bg-gradient-to-br from-[#111218] via-[#1a1b23] to-[#111218] rounded-2xl border border-white/5 overflow-hidden relative">
        {/* Top accent line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#059669] via-[#e91e63] to-[#f06292]" />
        
        {/* Cover area with pattern */}
        <div className="h-48 w-full relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#059669]/10 via-transparent to-[#10b981]/10" />
          <div className="absolute inset-0 opacity-30" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)', backgroundSize: '24px 24px'}} />
          <div className="absolute top-4 right-4 flex items-center gap-2 text-xs text-gray-300 bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Üyelik: {viewedUser.createdAt?.toDate ? viewedUser.createdAt.toDate().toLocaleDateString('tr-TR') : 'Bilinmiyor'}
          </div>
        </div>

        {/* Profile Info Section */}
        <div className="px-8 pb-8 relative">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
            {/* Avatar */}
            <div className="-mt-16 relative z-10">
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-[#059669] to-[#10b981] p-1">
                <div className="w-full h-full rounded-xl bg-[#111218] overflow-hidden flex items-center justify-center">
                  {viewedUser.avatar ? (
                    <img src={viewedUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-bold text-white">
                      {(viewedUser.username || viewedUser.displayName || viewedUser.email?.[0] || 'U').toString().charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full border-4 border-[#111218] flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
            </div>
            
            {/* User Info */}
            <div className="flex-1 pt-2">
              <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
                <h1 className="text-2xl font-bold text-white">{viewedUser.username || viewedUser.displayName || viewedUser.email?.split('@')[0] || 'Kullanıcı'}</h1>
                <div className="flex items-center gap-2">
                  {viewedUser.isVerifiedSeller && (
                    <span className="flex items-center gap-1 bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-medium border border-emerald-500/30">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Onaylı Satıcı
                    </span>
                  )}
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    viewedUser.storeLevel === 'corporate' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                    viewedUser.storeLevel === 'pro' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                    'bg-gray-500/20 text-gray-400 border-gray-500/30'
                  }`}>
                    {viewedUser.storeLevel === 'corporate' ? 'Kurumsal' : viewedUser.storeLevel === 'pro' ? 'Pro' : 'Standart'} Mağaza
                  </span>
                </div>
              </div>
              <p className="text-gray-400 text-sm">{viewedUser.bio || 'Henüz bir biyografi eklenmemiş.'}</p>
            </div>
            
            {/* Action Button */}
            <div className="flex flex-col gap-3">
              {isOwnProfile ? (
                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Profilini Düzenle
                </button>
              ) : (
                <button 
                  onClick={handleFollowToggle}
                  disabled={followBusy}
                  className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <UserPlus className="w-4 h-4" />
                  {followBusy ? 'İşleniyor...' : followDocId ? 'Takibi Bırak' : 'Takip Et'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#1a1b23] rounded-xl border border-white/5 p-5 hover:border-white/10 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
            </div>
            <span className="text-sm text-gray-400">Puan</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-white">{ratingValue.toFixed(1)}</span>
            <span className="text-gray-500">/10</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">{reviewCount} değerlendirme</p>
        </div>
        
        <div className="bg-[#1a1b23] rounded-xl border border-white/5 p-5 hover:border-white/10 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Package className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-sm text-gray-400">İşlem</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-white">{viewedUser.soldCount || 0}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">başarılı satış</p>
        </div>
        
        <div className="bg-[#1a1b23] rounded-xl border border-white/5 p-5 hover:border-white/10 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-sm text-gray-400">İlan</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-white">{listings.length}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">aktif ilan</p>
        </div>
        
        <div className="bg-[#1a1b23] rounded-xl border border-white/5 p-5 hover:border-white/10 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-sm text-gray-400">Takipçi</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-white">{followerCount}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">takipçi</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-[#1a1b23] rounded-xl border border-white/5 p-1.5 flex flex-wrap gap-1">
        {[
          { id: 'ilanlar', label: 'İlanlar', icon: Package, count: listings.length },
          { id: 'degerlendirmeler', label: 'Değerlendirmeler', icon: Star, count: reviewCount },
          { id: 'basarimlar', label: 'Başarımlar', icon: Trophy, count: null },
          { id: 'takipciler', label: 'Takipçiler', icon: Users, count: followerCount },
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-lg font-medium transition-all flex-1 justify-center ${
              activeTab === tab.id 
                ? 'bg-gradient-to-r from-[#059669]/20 to-[#10b981]/20 text-white border border-emerald-400/30' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.count !== null && (
              <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? 'bg-[#e91e63]/30 text-pink-300' : 'bg-white/10 text-gray-500'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-[#1a1b23] rounded-xl border border-white/5 p-6 min-h-[400px]">
        {activeTab === 'ilanlar' && (
          <div className="w-full">
            {fetchingListings ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 border-4 border-emerald-400/30 border-t-[#e91e63] rounded-full animate-spin mb-4" />
                <p className="text-gray-400">İlanlar yükleniyor...</p>
              </div>
            ) : listings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {listings.map((listing) => (
                  <Link key={listing.id} to={`/product/${listing.id}`} className="bg-[#111218] rounded-xl border border-white/5 overflow-hidden hover:border-emerald-400 hover:shadow-[0_0_20px_rgba(52,211,153,0.4)] hover:scale-105 transition-all duration-300 group flex flex-col">
                    <div className="relative h-40">
                      {listing.image ? (
                        <img src={listing.image} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#23242f] to-[#111218] flex items-center justify-center text-gray-500 text-sm">
                          Görsel Yok
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-medium text-white border border-white/10">
                        {listing.category}
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="text-white font-semibold mb-3 line-clamp-2 group-hover:text-[#e91e63] transition-colors">{listing.title}</h3>
                      <div className="mt-auto flex items-center justify-between">
                        <div className="price-text font-bold text-lg">{listing.price.toFixed(2)} ₺</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-[#059669]/20 to-[#10b981]/10 rounded-2xl flex items-center justify-center mb-6 border border-emerald-400/20">
                  <Package className="w-10 h-10 text-[#e91e63]" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Aktif ilan bulunamadı</h2>
                <p className="text-gray-500">Kullanıcıya ait hiçbir aktif ilan bulunamadı.</p>
              </div>
            )}
          </div>
        )}
        {activeTab === 'degerlendirmeler' && (
          <div className="w-full max-w-3xl mx-auto space-y-4">
            {reviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-500/20 to-amber-500/10 rounded-2xl flex items-center justify-center mb-6 border border-yellow-500/20">
                  <Star className="w-10 h-10 text-yellow-500" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Değerlendirme bulunamadı</h2>
                <p className="text-gray-500">Henüz değerlendirme yapılmamış.</p>
              </div>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="bg-[#111218] p-6 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#059669] to-[#10b981] flex items-center justify-center text-white font-bold">
                        {(review.authorName || 'K').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-white font-semibold">{review.authorName || 'Kullanıcı'}</div>
                        <div className="text-xs text-gray-500">{review.createdAt?.toDate ? review.createdAt.toDate().toLocaleDateString('tr-TR') : 'Yeni'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-yellow-500/20 px-3 py-1 rounded-full">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-yellow-500 font-bold text-sm">{Number(review.rating || 0).toFixed(1)}</span>
                    </div>
                  </div>
                  <p className="text-gray-300">{review.comment || 'Yorum yok.'}</p>
                </div>
              ))
            )}
          </div>
        )}
        {activeTab === 'basarimlar' && (
          <div className="w-full max-w-3xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'İlk Satış', icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-500/20', border: 'border-yellow-500/20' },
                { name: 'Güvenilir Satıcı', icon: ShieldCheckIcon, color: 'text-emerald-500', bg: 'bg-emerald-500/20', border: 'border-emerald-500/20' },
                { name: 'Hızlı Teslimat', icon: ZapIcon, color: 'text-blue-500', bg: 'bg-blue-500/20', border: 'border-blue-500/20' },
                { name: 'Popüler', icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/20', border: 'border-purple-500/20' },
              ].map((b, i) => (
                <div key={i} className={`bg-[#111218] p-6 rounded-xl border ${b.border} flex flex-col items-center gap-3 hover:border-white/20 transition-colors`}> 
                  <div className={`w-14 h-14 rounded-xl ${b.bg} flex items-center justify-center`}>
                    <b.icon className={`w-7 h-7 ${b.color}`} />
                  </div>
                  <span className="text-white font-semibold text-sm text-center">{b.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'takipciler' && (
          <div className="w-full max-w-3xl mx-auto">
            {followers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/10 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/20">
                  <Users className="w-10 h-10 text-purple-500" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Takipçi bulunamadı</h2>
                <p className="text-gray-500">Henüz takipçi yok.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {followers.map((follower) => (
                  <div key={follower.id} className="bg-[#111218] p-4 rounded-xl border border-white/5 flex items-center justify-between hover:border-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#059669] to-[#10b981] flex items-center justify-center text-white font-bold">
                        {(follower.followerName || 'K').charAt(0).toUpperCase()}
                      </div>
                      <span className="text-white font-medium">{follower.followerName || 'Kullanıcı'}</span>
                    </div>
                    <span className="text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full">{follower.createdAt?.toDate ? follower.createdAt.toDate().toLocaleDateString('tr-TR') : 'Yeni'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1a1b23] w-full max-w-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h3 className="text-xl font-bold text-white">Profili Düzenle</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateProfile} className="p-6 space-y-6">
              <div className="flex flex-col items-center gap-4">
                <div className="relative group cursor-pointer">
                  {viewedUser.avatar ? (
                    <img src={viewedUser.avatar} alt="Avatar" className="w-24 h-24 rounded-2xl object-cover border-2 border-white/10 group-hover:opacity-50 transition-opacity" />
                  ) : (
                    <div className="w-24 h-24 rounded-2xl border-2 border-white/10 bg-[#111218] flex items-center justify-center">
                      <UserPlus className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleAvatarUpload(file);
                    }}
                  />
                </div>
                <span className="text-xs text-gray-400">{uploadingAvatar ? 'Yükleniyor...' : 'Fotoğrafı değiştirmek için tıklayın'}</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Görünen Ad</label>
                <input 
                  type="text"
                  value={profileData.displayName}
                  onChange={(e) => setProfileData({...profileData, displayName: e.target.value})}
                  className="w-full bg-[#23242f] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-400 transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Hakkımda</label>
                <textarea 
                  rows={3}
                  value={profileData.bio}
                  onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                  className="w-full bg-[#23242f] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-400 transition-colors resize-none"
                  placeholder="Kendinizden bahsedin..."
                ></textarea>
              </div>
              
              <button 
                type="submit"
                className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 rounded-lg transition-colors"
              >
                Değişiklikleri Kaydet
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper icons
function SearchIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
    </svg>
  )
}

function ShieldCheckIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /><path d="m9 12 2 2 4-4" />
    </svg>
  )
}

function ZapIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
    </svg>
  )
}
