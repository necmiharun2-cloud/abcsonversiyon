import { 
  MessageSquare, TrendingUp, Users, Plus, Heart, Share2, X, Trash2, 
  Settings, Hash, Clock, Search, Image, BarChart3, Sparkles, Send,
  ThumbsUp, Flame, Gamepad2, HandMetal, Bookmark, MoreHorizontal,
  Award, Zap, Eye, Filter, ChevronDown, Check, AlertCircle, FileText,
  AlertTriangle, Ban
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { Timestamp, collection, addDoc, query, orderBy, onSnapshot, doc, updateDoc, increment, arrayUnion, arrayRemove, deleteDoc, writeBatch, getDoc, where, limit, getDocs } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '../firebase';
import { detectContactInfo, getContactInfoWarningMessage, formatBanEndTime } from '../lib/contactDetection';

type TabType = 'feed' | 'groups' | 'listings';
type ReactionType = 'like' | 'heart' | 'fire' | 'game' | 'clap';

const REACTIONS = [
  { type: 'like', icon: ThumbsUp, emoji: '👍', color: '#3B82F6' },
  { type: 'heart', icon: Heart, emoji: '❤️', color: '#EF4444' },
  { type: 'fire', icon: Flame, emoji: '🔥', color: '#F97316' },
  { type: 'game', icon: Gamepad2, emoji: '🎮', color: '#8B5CF6' },
  { type: 'clap', icon: HandMetal, emoji: '👏', color: '#10B981' },
];

const POST_CATEGORIES = [
  { id: 'genel', name: 'Genel', icon: MessageSquare },
  { id: 'satis', name: 'Satış', icon: Award },
  { id: 'yardim', name: 'Yardım', icon: AlertCircle },
  { id: 'tartisma', name: 'Tartışma', icon: MessageSquare },
  { id: 'duyuru', name: 'Duyuru', icon: Zap },
];

const LISTING_CATEGORIES = [
  'Roblox', 'Valorant', 'CS2', 'Minecraft', 'PUBG Mobile', 
  'Steam', 'Discord', 'Fortnite', 'LOL', 'Diğer'
];

export default function Topluluk() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('feed');
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isListingModalOpen, setIsListingModalOpen] = useState(false);
  
  // Post form state
  const [newPost, setNewPost] = useState({ 
    title: '', 
    content: '', 
    category: 'genel',
    tags: [] as string[]
  });
  const [newGroup, setNewGroup] = useState({ name: '', description: '' });
  
  // Listing form state
  const [newListing, setNewListing] = useState({
    title: '',
    description: '',
    category: 'Roblox',
    price: '',
    tags: [] as string[]
  });
  const [listingImage, setListingImage] = useState<File | null>(null);
  const [listingImagePreview, setListingImagePreview] = useState<string | null>(null);
  
  // Versus mode
  const [versusMode, setVersusMode] = useState(false);
  const [acceptedRules, setAcceptedRules] = useState(false);
  
  // Data
  const [posts, setPosts] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  
  // UI state
  const [commentText, setCommentText] = useState('');
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [creatingPost, setCreatingPost] = useState(false);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [creatingListing, setCreatingListing] = useState(false);
  const [focusPostId, setFocusPostId] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<any | null>(null);
  const [groupPosts, setGroupPosts] = useState<any[]>([]);
  const [groupNewPost, setGroupNewPost] = useState('');
  const [creatingGroupPost, setCreatingGroupPost] = useState(false);
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const [activeReactions, setActiveReactions] = useState<Record<string, ReactionType>>({});
  
  // Contact info detection state
  const [showContactWarning, setShowContactWarning] = useState(false);
  const [contactWarnings, setContactWarnings] = useState<string[]>([]);
  const [isBanned, setIsBanned] = useState(false);
  const [banEndTime, setBanEndTime] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check for existing ban on mount
  useEffect(() => {
    if (user) {
      const banKey = `contact_ban_${user.uid}`;
      const banData = localStorage.getItem(banKey);
      if (banData) {
        const ban = JSON.parse(banData);
        if (new Date(ban.endTime) > new Date()) {
          setIsBanned(true);
          setBanEndTime(formatBanEndTime(0).replace(new Date().toLocaleString('tr-TR').split(' ')[0], new Date(ban.endTime).toLocaleString('tr-TR')));
        } else {
          localStorage.removeItem(banKey);
        }
      }
    }
  }, [user]);

  // Function to apply ban
  const applyBan = async (userId: string) => {
    const banHours = 2;
    const endTime = new Date(Date.now() + banHours * 60 * 60 * 1000);
    
    // Store ban in localStorage
    localStorage.setItem(`contact_ban_${userId}`, JSON.stringify({
      startTime: new Date().toISOString(),
      endTime: endTime.toISOString()
    }));
    
    // Store ban in Firestore for server-side enforcement
    try {
      await addDoc(collection(db, 'userBans'), {
        userId,
        type: 'contact_info',
        startTime: Timestamp.now(),
        endTime: Timestamp.fromDate(endTime),
        reason: 'İletişim bilgisi paylaşımı',
        createdAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error creating ban record:', error);
    }
    
    setBanEndTime(endTime.toLocaleString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }));
    setIsBanned(true);
  };

  // Load posts
  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(fetchedPosts);
    }, (error) => {
      console.error('Posts snapshot error:', error);
      toast.error('Topluluk akışı yüklenemedi.');
      setPosts([]);
    });
    return unsubscribe;
  }, []);

  // Load groups
  useEffect(() => {
    const q = query(collection(db, 'groups'), orderBy('memberCount', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedGroups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGroups(fetchedGroups);
    }, (error) => {
      console.error('Groups snapshot error:', error);
      setGroups([]);
    });
    return unsubscribe;
  }, []);

  // Load activities
  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(10));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedActivities = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setActivities(fetchedActivities);
    });
    return unsubscribe;
  }, []);

  // Load group posts
  useEffect(() => {
    if (!selectedGroup) {
      setGroupPosts([]);
      return;
    }
    const q = query(collection(db, 'groupPosts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const posts = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((post: any) => post.groupId === selectedGroup.id);
      setGroupPosts(posts);
    });
    return unsubscribe;
  }, [selectedGroup]);

  // Scroll to focused post
  useEffect(() => {
    if (!focusPostId) return;
    const exists = posts.some((p) => p.id === focusPostId);
    if (!exists) return;
    const t = setTimeout(() => {
      const el = document.getElementById(`post-${focusPostId}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
    return () => clearTimeout(t);
  }, [focusPostId, posts]);

  // Load comments
  useEffect(() => {
    if (!activeCommentsPostId) {
      setComments([]);
      return;
    }
    const q = query(collection(db, `posts/${activeCommentsPostId}/comments`), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedComments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setComments(fetchedComments);
    });
    return unsubscribe;
  }, [activeCommentsPostId]);

  // Handlers
  const handleReaction = async (postId: string, reaction: ReactionType) => {
    if (!user) {
      toast.error('Tepki vermek için giriş yapmalısınız.');
      return;
    }
    const postRef = doc(db, 'posts', postId);
    try {
      const reactionField = `reactions.${reaction}`;
      await updateDoc(postRef, {
        [reactionField]: increment(1)
      });
      setActiveReactions(prev => ({ ...prev, [postId]: reaction }));
      setShowReactionPicker(null);
    } catch (error) {
      toast.error('Bir hata oluştu.');
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!user) {
      toast.error('Yorum yapmak için giriş yapmalısınız.');
      return;
    }
    if (!commentText.trim()) return;

    // Check for contact info
    const detection = detectContactInfo(commentText);
    if (detection.hasContactInfo) {
      setContactWarnings(detection.violations);
      setShowContactWarning(true);
      
      // Apply ban for high severity violations
      if (detection.severity === 'high') {
        await applyBan(user.uid);
        setCommentText('');
      }
      return;
    }

    try {
      await addDoc(collection(db, `posts/${postId}/comments`), {
        postId,
        authorId: user.uid,
        authorName: profile?.username || user.displayName || 'Kullanıcı',
        authorAvatar: profile?.avatar || user.photoURL || '',
        text: commentText,
        createdAt: Timestamp.now()
      });
      
      await updateDoc(doc(db, 'posts', postId), {
        commentCount: increment(1)
      });
      
      setCommentText('');
      toast.success('Yorumunuz eklendi!');
    } catch (error) {
      toast.error('Yorum eklenemedi.');
    }
  };

  const handleDeletePost = async (postId: string, authorId: string) => {
    if (!user || user.uid !== authorId) {
      toast.error('Sadece kendi gönderinizi silebilirsiniz.');
      return;
    }

    if (!window.confirm('Bu gönderiyi silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'posts', postId));
      toast.success('Gönderi silindi.');
      setActiveCommentsPostId(null);
    } catch (error) {
      toast.error('Gönderi silinirken hata oluştu.');
    }
  };

  const handleCreatePost = async (e: any) => {
    e.preventDefault();
    if (!user) {
      toast.error('Gönderi paylaşmak için giriş yapmalısınız.');
      return;
    }
    if (!newPost.content.trim()) {
      toast.error('Lütfen bir içerik yazın.');
      return;
    }
    if (!acceptedRules) {
      toast.error('Topluluk kurallarını kabul etmelisiniz.');
      return;
    }

    // Check for contact info in post content
    const contentDetection = detectContactInfo(newPost.content);
    const titleDetection = detectContactInfo(newPost.title);
    
    if (contentDetection.hasContactInfo || titleDetection.hasContactInfo) {
      const allViolations = [...contentDetection.violations, ...titleDetection.violations];
      setContactWarnings(allViolations);
      setShowContactWarning(true);
      
      // Apply ban for high severity violations
      if (contentDetection.severity === 'high' || titleDetection.severity === 'high') {
        await applyBan(user.uid);
        setIsPostModalOpen(false);
        setNewPost({ title: '', content: '', category: 'genel', tags: [] });
      }
      return;
    }

    if (creatingPost) return;
    setCreatingPost(true);
    
    const loadingToastId = toast.loading('Paylaşılıyor...');

    try {
      const postData = {
        authorId: user.uid,
        authorName: profile?.username || user.displayName || 'Kullanıcı',
        authorAvatar: profile?.avatar || user.photoURL || '',
        title: newPost.title.trim(),
        content: newPost.content.trim(),
        category: newPost.category,
        tags: newPost.tags,
        versusMode,
        likes: 0,
        commentCount: 0,
        shareCount: 0,
        reactions: { like: 0, heart: 0, fire: 0, game: 0, clap: 0 },
        createdAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, 'posts'), postData);
      setIsPostModalOpen(false);
      setNewPost({ title: '', content: '', category: 'genel', tags: [] });
      setAcceptedRules(false);
      setVersusMode(false);
      toast.success('Gönderi paylaşıldı!', { id: loadingToastId });
      
      const createdId = docRef.id;
      if (createdId) {
        setActiveCommentsPostId(createdId);
        setFocusPostId(createdId);
      }
    } catch (error) {
      toast.dismiss(loadingToastId);
      toast.error('Gönderi paylaşılamadı.');
    } finally {
      setCreatingPost(false);
    }
  };

  const handleListingImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setListingImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setListingImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('İlan eklemek için giriş yapmalısınız.');
      return;
    }
    if (!newListing.title.trim() || !newListing.description.trim()) {
      toast.error('Lütfen zorunlu alanları doldurun.');
      return;
    }

    setCreatingListing(true);
    const loadingToastId = toast.loading('İlan yayınlanıyor...');

    try {
      let imageUrl = '';
      if (listingImage) {
        const imageRef = ref(storage, `listings/${user.uid}/${Date.now()}_${listingImage.name}`);
        await uploadBytes(imageRef, listingImage);
        imageUrl = await getDownloadURL(imageRef);
      }

      await addDoc(collection(db, 'listings'), {
        ...newListing,
        price: parseFloat(newListing.price) || 0,
        image: imageUrl,
        authorId: user.uid,
        authorName: profile?.username || user.displayName || 'Kullanıcı',
        authorAvatar: profile?.avatar || user.photoURL || '',
        status: 'active',
        createdAt: Timestamp.now()
      });

      setIsListingModalOpen(false);
      setNewListing({ title: '', description: '', category: 'Roblox', price: '', tags: [] });
      setListingImage(null);
      setListingImagePreview(null);
      toast.success('İlan başarıyla yayınlandı!', { id: loadingToastId });
    } catch (error) {
      toast.dismiss(loadingToastId);
      toast.error('İlan yayınlanamadı.');
    } finally {
      setCreatingListing(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Grup kurmak için giriş yapmalısınız.');
      return;
    }

    if (!newGroup.name.trim() || !newGroup.description.trim()) {
      toast.error('Lütfen tüm alanları doldurun.');
      return;
    }

    if (creatingGroup) return;
    setCreatingGroup(true);

    try {
      await addDoc(collection(db, 'groups'), {
        name: newGroup.name.trim(),
        description: newGroup.description.trim(),
        ownerId: user.uid,
        ownerName: profile?.username || user.displayName || 'Kullanıcı',
        members: [user.uid],
        memberCount: 1,
        createdAt: Timestamp.now()
      });

      setNewGroup({ name: '', description: '' });
      setIsGroupModalOpen(false);
      toast.success('Grup oluşturuldu!');
    } catch (error) {
      toast.error('Grup oluşturulamadı.');
    } finally {
      setCreatingGroup(false);
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    if (!user) {
      toast.error('Gruplara katılmak için giriş yapmalısınız.');
      return;
    }

    try {
      const groupRef = doc(db, 'groups', groupId);
      const groupSnapshot = await getDoc(groupRef);
      const groupData = groupSnapshot.data();
      const members = groupData?.members || [];

      if (members.includes(user.uid)) {
        await updateDoc(groupRef, {
          members: arrayRemove(user.uid),
          memberCount: increment(-1)
        });
        toast.success('Gruptan ayrıldınız.');
      } else {
        await updateDoc(groupRef, {
          members: arrayUnion(user.uid),
          memberCount: increment(1)
        });
        toast.success('Gruba katıldınız!');
      }
    } catch (error) {
      toast.error('İşlem başarısız.');
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp?.toDate) return '-';
    const date = timestamp.toDate();
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (hours < 1) return 'Az önce';
    if (hours < 24) return `${hours} saat önce`;
    if (days < 7) return `${days} gün önce`;
    return date.toLocaleDateString('tr-TR');
  };

  const getTotalReactions = (post: any) => {
    if (!post.reactions) return post.likes || 0;
    return Object.values(post.reactions).reduce((sum: number, val: any) => sum + val, 0);
  };

  const filteredPosts = filterTag
    ? posts.filter(p => 
        p.title?.toLowerCase().includes(filterTag.toLowerCase()) || 
        p.content?.toLowerCase().includes(filterTag.toLowerCase())
      )
    : posts;

  const searchedPosts = searchQuery
    ? filteredPosts.filter(p =>
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.authorName?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredPosts;

  const trending = [
    { tag: '#Valorant', count: 128 },
    { tag: '#CS2', count: 95 },
    { tag: '#Roblox', count: 78 },
    { tag: '#Steam', count: 64 },
    { tag: '#Minecraft', count: 52 }
  ];

  // Group Detail View
  if (selectedGroup) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-gradient-to-br from-[#1a1b23] to-[#111218] rounded-2xl border border-white/5 overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-[#5b68f6]/20 to-[#8b5cf6]/20"></div>
          <div className="px-6 pb-6">
            <div className="flex items-end gap-4 -mt-10">
              <div className="w-20 h-20 rounded-xl bg-[#5b68f6] flex items-center justify-center text-3xl text-white font-bold shadow-lg">
                {selectedGroup.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 pb-1">
                <h1 className="text-2xl font-bold text-white">{selectedGroup.name}</h1>
                <p className="text-sm text-gray-400 mt-0.5">{selectedGroup.description}</p>
              </div>
              <button
                onClick={() => setSelectedGroup(null)}
                className="mb-1 px-4 py-2 bg-[#23242f] hover:bg-[#2d2e3b] text-white rounded-lg text-sm font-medium"
              >
                ← Geri
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#1a1b23] rounded-xl border border-white/5 p-4 text-center">
            <p className="text-2xl font-bold text-white">{selectedGroup.memberCount || 0}</p>
            <p className="text-xs text-gray-400 mt-1">Üye</p>
          </div>
          <div className="bg-[#1a1b23] rounded-xl border border-white/5 p-4 text-center">
            <p className="text-2xl font-bold text-white">{groupPosts.length}</p>
            <p className="text-xs text-gray-400 mt-1">Mesaj</p>
          </div>
          <div className="bg-[#1a1b23] rounded-xl border border-white/5 p-4 text-center">
            <p className="text-sm font-bold text-[#5b68f6]">{selectedGroup.ownerName}</p>
            <p className="text-xs text-gray-400 mt-1">Kurucu</p>
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); }} className="bg-[#1a1b23] rounded-xl border border-white/5 p-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={groupNewPost}
              onChange={(e) => setGroupNewPost(e.target.value)}
              placeholder="Grup mesajı yazınız..."
              className="flex-1 bg-[#111218] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#5b68f6]"
            />
            <button type="submit" className="bg-[#5b68f6] hover:bg-[#4a55d6] text-white px-6 py-3 rounded-lg font-medium">
              Gönder
            </button>
          </div>
        </form>

        <div className="bg-[#1a1b23] rounded-xl border border-white/5 p-5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#5b68f6]" />
            Grup Mesajları
          </h3>
          <div className="space-y-3">
            {groupPosts.length > 0 ? groupPosts.map(post => (
              <div key={post.id} className="flex gap-3 p-3 bg-[#23242f] rounded-xl">
                <div className="w-10 h-10 rounded-full bg-[#5b68f6]/30 flex items-center justify-center text-sm text-[#5b68f6] font-bold flex-shrink-0">
                  {(post.authorName || 'K').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-white">{post.authorName}</span>
                    <span className="text-xs text-gray-500">{formatDate(post.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-300">{post.content}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-400">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Henüz mesaj yok</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left Sidebar - Activity */}
      <div className="w-full lg:w-72 shrink-0 space-y-4 order-2 lg:order-1">
        {/* Activity Feed */}
        <div className="bg-[#1a1b23] rounded-xl border border-white/5 p-4">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            Topluluk Aktiviteleri
          </h3>
          <div className="space-y-3">
            {activities.slice(0, 5).map((activity, idx) => (
              <div key={activity.id || idx} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5b68f6] to-[#8b5cf6] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {(activity.authorName || 'K')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-300 line-clamp-2">
                    <span className="font-bold text-white">{activity.authorName}</span>{' '}
                    yeni bir gönderi paylaştı
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{formatDate(activity.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trending */}
        <div className="bg-[#1a1b23] rounded-xl border border-white/5 p-4">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Yükselen Başlıklar
          </h3>
          <div className="space-y-2">
            {trending.map((item, i) => (
              <button
                key={i}
                onClick={() => setFilterTag(item.tag)}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#23242f] transition-colors group"
              >
                <span className="text-sm text-gray-300 group-hover:text-white flex items-center gap-2">
                  <Hash className="w-3 h-3" />
                  {item.tag.replace('#', '')}
                </span>
                <span className="text-xs text-gray-500">{item.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 space-y-4 order-1 lg:order-2">
        {/* Header */}
        <div className="bg-[#1a1b23] rounded-xl border border-white/5 p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-[#5b68f6]" />
              Topluluk
            </h1>
            <div className="flex bg-[#111218] rounded-lg p-1">
              {[
                { id: 'feed', label: 'Akış', icon: MessageSquare },
                { id: 'groups', label: 'Gruplar', icon: Users },
                { id: 'listings', label: 'İlanlar', icon: Award },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-[#5b68f6] text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ara..."
              className="w-full bg-[#111218] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#5b68f6]"
            />
          </div>
        </div>

        {activeTab === 'feed' && (
          <>
            {/* Create Post Box - Professional Style */}
            <div className="bg-[#1a1b23] rounded-xl border border-white/5 p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5b68f6] to-[#8b5cf6] flex items-center justify-center text-white font-bold flex-shrink-0">
                  {user ? (profile?.username || user.displayName || 'K')[0].toUpperCase() : '?'}
                </div>
                <div className="flex-1">
                  <button
                    onClick={() => setIsPostModalOpen(true)}
                    className="w-full bg-[#111218] border border-white/10 rounded-xl px-4 py-3 text-left text-gray-500 hover:border-[#5b68f6]/50 transition-colors"
                  >
                    {user ? (
                      <span>Merhaba {profile?.username || user.displayName?.split(' ')[0] || 'Kullanıcı'}! Gönderini buradan paylaş...</span>
                    ) : (
                      <span>Gönderi paylaşmak için giriş yap...</span>
                    )}
                  </button>
                  
                  {/* Media Actions */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => setIsPostModalOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#23242f] transition-colors text-sm"
                      >
                        <Image className="w-4 h-4" />
                        <span className="hidden sm:inline">Görsel</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                      </button>
                      <button 
                        onClick={() => setIsPostModalOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#23242f] transition-colors text-sm"
                      >
                        <BarChart3 className="w-4 h-4" />
                        <span className="hidden sm:inline">Anket</span>
                      </button>
                      <button 
                        onClick={() => setIsPostModalOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#23242f] transition-colors text-sm"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span className="hidden sm:inline">GIF</span>
                      </button>
                    </div>
                    <button
                      onClick={() => setIsPostModalOpen(true)}
                      className="bg-[#5b68f6] hover:bg-[#4a55d6] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Paylaş
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {POST_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setFilterTag(filterTag === cat.id ? null : cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    filterTag === cat.id
                      ? 'bg-[#5b68f6] text-white'
                      : 'bg-[#23242f] text-gray-300 hover:bg-[#2d2e3b]'
                  }`}
                >
                  <cat.icon className="w-3.5 h-3.5" />
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Posts Feed */}
            <div className="space-y-4">
              {searchedPosts.map(post => (
                <div
                  key={post.id}
                  id={`post-${post.id}`}
                  className="bg-[#1a1b23] rounded-xl border border-white/5 hover:border-white/10 transition-all"
                >
                  {/* Post Header */}
                  <div className="p-4 pb-0">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {post.authorAvatar ? (
                          <img src={post.authorAvatar} alt={post.authorName} className="w-10 h-10 rounded-full" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5b68f6] to-[#8b5cf6] flex items-center justify-center text-white font-bold">
                            {(post.authorName || 'K')[0].toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{post.authorName}</span>
                            {post.versusMode && (
                              <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full font-bold">
                                VERSUS
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">{formatDate(post.createdAt)}</span>
                        </div>
                      </div>
                      <button className="text-gray-500 hover:text-white p-1">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="p-4">
                    {post.title && <h3 className="text-white font-bold mb-2">{post.title}</h3>}
                    <p className="text-gray-300 text-sm leading-relaxed">{post.content}</p>
                  </div>

                  {/* Reactions Bar */}
                  <div className="px-4 py-2 border-t border-white/5">
                    <div className="flex items-center gap-2 flex-wrap">
                      {post.reactions && Object.entries(post.reactions).map(([key, value]: [string, any]) => 
                        value > 0 && (
                          <span key={key} className="flex items-center gap-1 bg-[#23242f] px-2 py-1 rounded-full text-xs">
                            <span>{REACTIONS.find(r => r.type === key)?.emoji}</span>
                            <span className="text-gray-300">{value}</span>
                          </span>
                        )
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="px-4 py-2 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-1 relative">
                      {REACTIONS.slice(0, 5).map(reaction => (
                        <button
                          key={reaction.type}
                          onClick={() => handleReaction(post.id, reaction.type as ReactionType)}
                          className={`p-2 rounded-lg transition-all hover:scale-110 ${
                            activeReactions[post.id] === reaction.type 
                              ? 'bg-[#5b68f6]/20' 
                              : 'hover:bg-[#23242f]'
                          }`}
                          title={reaction.type}
                        >
                          <span className="text-lg">{reaction.emoji}</span>
                        </button>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveCommentsPostId(activeCommentsPostId === post.id ? null : post.id)}
                        className="flex items-center gap-1.5 text-gray-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-[#23242f] transition-colors text-sm"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>{post.commentCount || 0}</span>
                      </button>
                      <button className="flex items-center gap-1.5 text-gray-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-[#23242f] transition-colors text-sm">
                        <Share2 className="w-4 h-4" />
                        <span>{post.shareCount || 0}</span>
                      </button>
                      <button className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-[#23242f] transition-colors">
                        <Bookmark className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Comments Section */}
                  {activeCommentsPostId === post.id && (
                    <div className="px-4 py-3 border-t border-white/5 bg-[#111218]/50">
                      <div className="flex gap-2 mb-3">
                        <input
                          type="text"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Yorum yaz..."
                          className="flex-1 bg-[#1a1b23] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#5b68f6]"
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          className="bg-[#5b68f6] hover:bg-[#4a55d6] text-white px-3 py-2 rounded-lg text-sm font-medium"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="space-y-2">
                        {comments.map(comment => (
                          <div key={comment.id} className="flex items-start gap-2">
                            <div className="w-6 h-6 rounded-full bg-[#5b68f6]/30 flex items-center justify-center text-[10px] text-[#5b68f6] font-bold flex-shrink-0">
                              {comment.authorName?.[0]?.toUpperCase() || 'K'}
                            </div>
                            <div className="flex-1 bg-[#23242f] rounded-lg px-3 py-1.5">
                              <span className="text-xs font-bold text-white">{comment.authorName}</span>
                              <span className="text-xs text-gray-300 ml-2">{comment.text}</span>
                            </div>
                          </div>
                        ))}
                        {comments.length === 0 && (
                          <p className="text-xs text-gray-500 text-center py-2">Henüz yorum yapılmamış.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {searchedPosts.length === 0 && (
                <div className="text-center py-12 bg-[#1a1b23] rounded-xl border border-white/5">
                  <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 font-medium">Henüz gönderi yok</p>
                  <button
                    onClick={() => setIsPostModalOpen(true)}
                    className="mt-4 text-[#5b68f6] hover:text-[#4a55d6] text-sm font-medium"
                  >
                    İlk gönderiyi sen paylaş →
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'groups' && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Gruplar</h2>
              <button
                onClick={() => setIsGroupModalOpen(true)}
                className="bg-[#5b68f6] hover:bg-[#4a55d6] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Yeni Grup
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {groups.map(group => (
                <div key={group.id} className="bg-[#1a1b23] rounded-xl border border-white/5 overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => setSelectedGroup(group)}
                        className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#5b68f6] to-[#8b5cf6] flex items-center justify-center text-lg text-white font-bold flex-shrink-0"
                      >
                        {group.name.charAt(0).toUpperCase()}
                      </button>
                      <div className="flex-1 min-w-0">
                        <button onClick={() => setSelectedGroup(group)} className="text-white font-bold hover:text-[#5b68f6] text-left">
                          {group.name}
                        </button>
                        <p className="text-xs text-gray-400 mt-0.5">{group.memberCount || 0} üye</p>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-2 bg-[#111218]/50 border-t border-white/5 flex justify-end">
                    <button
                      onClick={() => handleJoinGroup(group.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                        group.members?.includes(user?.uid)
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-[#5b68f6] hover:bg-[#4a55d6] text-white'
                      }`}
                    >
                      {group.members?.includes(user?.uid) ? 'Katıldın' : 'Katıl'}
                    </button>
                  </div>
                </div>
              ))}

              {groups.length === 0 && (
                <div className="col-span-2 text-center py-12 bg-[#1a1b23] rounded-xl border border-white/5">
                  <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Henüz grup yok</p>
                  <button
                    onClick={() => setIsGroupModalOpen(true)}
                    className="mt-4 text-[#5b68f6] text-sm font-medium"
                  >
                    İlk grubu sen oluştur →
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'listings' && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">İlanlar</h2>
              <button
                onClick={() => setIsListingModalOpen(true)}
                className="bg-gradient-to-r from-[#5b68f6] to-[#8b5cf6] hover:from-[#4a55d6] hover:to-[#7c5ce7] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                İlan Ekle
              </button>
            </div>

            {/* Quick Add Listing Card */}
            <div className="bg-gradient-to-r from-[#5b68f6]/10 to-[#8b5cf6]/10 border border-[#5b68f6]/20 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#5b68f6]/20 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-[#5b68f6]" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">Yeni İlan Ekle</h3>
                    <p className="text-sm text-gray-400">Ürün veya hizmetinizi listeleyin</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsListingModalOpen(true)}
                  className="bg-[#5b68f6] hover:bg-[#4a55d6] text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  İlan Ekle
                </button>
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button className="px-4 py-2 bg-[#5b68f6] text-white rounded-full text-sm font-medium whitespace-nowrap">
                Tümü
              </button>
              {LISTING_CATEGORIES.slice(0, 6).map(cat => (
                <button key={cat} className="px-4 py-2 bg-[#23242f] text-gray-300 rounded-full text-sm font-medium whitespace-nowrap hover:bg-[#2d2e3b]">
                  {cat}
                </button>
              ))}
            </div>

            <div className="text-center py-12 bg-[#1a1b23] rounded-xl border border-white/5">
              <Award className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Henüz ilan yok</p>
              <button
                onClick={() => setIsListingModalOpen(true)}
                className="mt-4 text-[#5b68f6] text-sm font-medium"
              >
                İlk ilanı sen ekle →
              </button>
            </div>
          </>
        )}
      </div>

      {/* Right Sidebar - Groups */}
      <div className="w-full lg:w-72 shrink-0 space-y-4 order-3">
        <div className="bg-[#1a1b23] rounded-xl border border-white/5 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              Gruplar
            </h3>
            <div className="flex gap-1">
              <button className="text-xs text-[#5b68f6] font-bold px-2 py-1 bg-[#5b68f6]/10 rounded">Popüler</button>
              <button className="text-xs text-gray-400 px-2 py-1 hover:text-white">En Yeni</button>
            </div>
          </div>
          <div className="space-y-2">
            {groups.slice(0, 5).map(group => (
              <button
                key={group.id}
                onClick={() => setSelectedGroup(group)}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#23242f] transition-colors text-left group"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#5b68f6] to-[#8b5cf6] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {group.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate group-hover:text-[#5b68f6]">{group.name}</p>
                  <p className="text-xs text-gray-400">{group.memberCount || 0} üye</p>
                </div>
              </button>
            ))}
          </div>
          {groups.length > 5 && (
            <button className="w-full mt-3 text-xs text-[#5b68f6] hover:text-[#4a55d6] font-medium">
              Tümünü Gör ({groups.length})
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="bg-[#1a1b23] rounded-xl border border-white/5 p-4">
          <h3 className="text-sm font-bold text-white mb-3">İstatistikler</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Toplam Gönderi</span>
              <span className="text-sm font-bold text-white">{posts.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Toplam Grup</span>
              <span className="text-sm font-bold text-white">{groups.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Bugün Aktif</span>
              <span className="text-sm font-bold text-emerald-400">
                {posts.filter(p => {
                  const date = p.createdAt?.toDate?.();
                  if (!date) return false;
                  return date.toDateString() === new Date().toDateString();
                }).length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#1a1b23] w-full max-w-xl rounded-2xl border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#1a1b23] flex items-center justify-between p-4 border-b border-white/5">
              <h2 className="text-lg font-bold text-white">Gönderi Paylaş</h2>
              <button onClick={() => setIsPostModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreatePost} className="p-4 space-y-4">
              {/* User Info */}
              <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5b68f6] to-[#8b5cf6] flex items-center justify-center text-white font-bold">
                  {(profile?.username || user?.displayName || 'K')[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{profile?.username || user?.displayName || 'Kullanıcı'}</p>
                  <p className="text-xs text-gray-400">{user?.email}</p>
                </div>
              </div>

              {/* Category Selection */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {POST_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setNewPost(p => ({ ...p, category: cat.id }))}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                      newPost.category === cat.id
                        ? 'bg-[#5b68f6] text-white'
                        : 'bg-[#23242f] text-gray-300 hover:bg-[#2d2e3b]'
                    }`}
                  >
                    <cat.icon className="w-3 h-3" />
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost(p => ({ ...p, title: e.target.value }))}
                  placeholder="Başlık (isteğe bağlı)"
                  className="w-full bg-[#111218] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#5b68f6] mb-3"
                />
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost(p => ({ ...p, content: e.target.value }))}
                  rows={5}
                  placeholder="Ne düşünüyorsun?"
                  className="w-full bg-[#111218] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#5b68f6] resize-none"
                  maxLength={1000}
                />
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <button type="button" className="p-2 text-gray-400 hover:text-white hover:bg-[#23242f] rounded-lg">
                      <Image className="w-5 h-5" />
                    </button>
                    <button type="button" className="p-2 text-gray-400 hover:text-white hover:bg-[#23242f] rounded-lg">
                      <BarChart3 className="w-5 h-5" />
                    </button>
                    <button type="button" className="p-2 text-gray-400 hover:text-white hover:bg-[#23242f] rounded-lg">
                      <Sparkles className="w-5 h-5" />
                    </button>
                  </div>
                  <span className="text-xs text-gray-500">{newPost.content.length}/1000</span>
                </div>
              </div>

              {/* Versus Mode */}
              <div className="flex items-center justify-between p-3 bg-[#23242f] rounded-xl">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-white">Versus Modu</span>
                </div>
                <button
                  type="button"
                  onClick={() => setVersusMode(!versusMode)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    versusMode ? 'bg-purple-500' : 'bg-[#111218]'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    versusMode ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              {/* Rules Checkbox */}
              <label className="flex items-start gap-3 cursor-pointer">
                <div className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
                  acceptedRules ? 'bg-[#5b68f6] border-[#5b68f6]' : 'border-gray-500'
                }`}>
                  {acceptedRules && <Check className="w-3 h-3 text-white" />}
                </div>
                <input
                  type="checkbox"
                  checked={acceptedRules}
                  onChange={(e) => setAcceptedRules(e.target.checked)}
                  className="hidden"
                />
                <span className="text-sm text-gray-300">
                  <span className="text-gray-400">Topluluk </span>
                  <span className="text-[#5b68f6] hover:underline cursor-pointer">Kurallarını</span>
                  <span className="text-gray-400"> okudum, kabul ediyorum.</span>
                </span>
              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={creatingPost || !acceptedRules}
                className="w-full bg-[#5b68f6] hover:bg-[#4a55d6] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors"
              >
                {creatingPost ? 'Paylaşılıyor...' : 'Paylaş'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Create Group Modal */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#1a1b23] w-full max-w-md rounded-2xl border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <h2 className="text-lg font-bold text-white">Yeni Grup Oluştur</h2>
              <button onClick={() => setIsGroupModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateGroup} className="p-4 space-y-4">
              <input
                type="text"
                value={newGroup.name}
                onChange={(e) => setNewGroup(p => ({ ...p, name: e.target.value }))}
                placeholder="Grup adı"
                className="w-full bg-[#111218] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#5b68f6]"
                maxLength={50}
              />
              <textarea
                value={newGroup.description}
                onChange={(e) => setNewGroup(p => ({ ...p, description: e.target.value }))}
                placeholder="Grup açıklaması"
                rows={3}
                className="w-full bg-[#111218] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#5b68f6] resize-none"
                maxLength={200}
              />
              <button
                type="submit"
                disabled={creatingGroup}
                className="w-full bg-[#5b68f6] hover:bg-[#4a55d6] disabled:opacity-50 text-white font-bold py-3 rounded-xl"
              >
                {creatingGroup ? 'Oluşturuluyor...' : 'Grup Oluştur'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Create Listing Modal - Professional */}
      {isListingModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#1a1b23] w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#1a1b23] flex items-center justify-between p-5 border-b border-white/5">
              <div>
                <h2 className="text-xl font-bold text-white">İlan Ekle</h2>
                <p className="text-sm text-gray-400 mt-0.5">Ürün veya hizmetinizi listeleyin</p>
              </div>
              <button onClick={() => setIsListingModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateListing} className="p-5 space-y-5">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Kapak Görseli
                </label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative border-2 border-dashed border-white/10 rounded-xl overflow-hidden cursor-pointer hover:border-[#5b68f6]/50 transition-colors"
                >
                  {listingImagePreview ? (
                    <div className="aspect-video relative">
                      <img src={listingImagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Image className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-video flex flex-col items-center justify-center text-gray-500">
                      <Image className="w-10 h-10 mb-2" />
                      <span className="text-sm">Görsel yüklemek için tıkla</span>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleListingImageChange}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Kategori</label>
                <div className="grid grid-cols-5 gap-2">
                  {LISTING_CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNewListing(p => ({ ...p, category: cat }))}
                      className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                        newListing.category === cat
                          ? 'bg-[#5b68f6] text-white'
                          : 'bg-[#23242f] text-gray-300 hover:bg-[#2d2e3b]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  İlan Başlığı <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={newListing.title}
                  onChange={(e) => setNewListing(p => ({ ...p, title: e.target.value }))}
                  placeholder="Örn: Roblox 1000 Robux - Hızlı Teslimat"
                  className="w-full bg-[#111218] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#5b68f6]"
                  maxLength={80}
                />
                <p className="text-xs text-gray-500 mt-1">{newListing.title.length}/80</p>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Fiyat (₺)</label>
                <input
                  type="number"
                  value={newListing.price}
                  onChange={(e) => setNewListing(p => ({ ...p, price: e.target.value }))}
                  placeholder="0.00"
                  className="w-full bg-[#111218] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#5b68f6]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Açıklama <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={newListing.description}
                  onChange={(e) => setNewListing(p => ({ ...p, description: e.target.value }))}
                  rows={4}
                  placeholder="İlanınız hakkında detaylı bilgi verin..."
                  className="w-full bg-[#111218] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#5b68f6] resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">{newListing.description.length}/500</p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={creatingListing}
                className="w-full bg-gradient-to-r from-[#5b68f6] to-[#8b5cf6] hover:from-[#4a55d6] hover:to-[#7c5ce7] disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg"
              >
                {creatingListing ? 'Yayınlanıyor...' : 'İlanı Yayınla'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Contact Info Warning Modal */}
      {showContactWarning && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1a1b23] w-full max-w-md rounded-2xl border border-red-500/30 shadow-2xl">
            <div className="p-5 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">İletişim Bilgisi Tespit Edildi!</h2>
                  <p className="text-sm text-gray-400">Kurallar ihlal edildi</p>
                </div>
              </div>
            </div>
            
            <div className="p-5">
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4">
                <p className="text-sm text-red-300 font-medium mb-3">
                  Site kurallarına göre telefon numarası, IBAN, sosyal medya hesabı vb. iletişim bilgilerini paylaşmak yasaktır.
                </p>
                <div className="space-y-2">
                  <p className="text-xs text-gray-400 uppercase font-bold">Tespit Edilen İhlaller:</p>
                  {contactWarnings.map((warning, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-red-300">
                      <span className="text-red-500">•</span>
                      <span>{warning}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 text-yellow-400 font-bold mb-2">
                  <Ban className="w-5 h-5" />
                  <span>2 Saatlik Engel</span>
                </div>
                <p className="text-sm text-yellow-300">
                  Bu ihlal nedeniyle hesabınıza 2 saatlik site dışına yönlendirme engeli uygulanacaktır.
                </p>
              </div>
            </div>
            
            <div className="p-5 pt-0">
              <button
                onClick={() => setShowContactWarning(false)}
                className="w-full bg-[#23242f] hover:bg-[#2d2e3b] text-white font-bold py-3 rounded-xl transition-colors"
              >
                Anladım
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ban Overlay */}
      {isBanned && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-[#0f1117]">
          <div className="text-center max-w-md p-8">
            <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
              <Ban className="w-12 h-12 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-3">Hesabınız Geçici Olarak Kısıtlandı</h1>
            <p className="text-gray-400 mb-6">
              İletişim bilgisi paylaşımı tespit edildiği için hesabınız geçici olarak kısıtlanmıştır.
            </p>
            <div className="bg-[#111218] rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-400 mb-2">Kısıtlama Bitiş Tarihi:</p>
              <p className="text-lg font-bold text-white">{banEndTime}</p>
            </div>
            <p className="text-xs text-gray-500">
              Bu süre sonunda kısıtlama otomatik olarak kalkacaktır. Tekrar ihlal durumunda hesabınız kalıcı olarak yasaklanabilir.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
