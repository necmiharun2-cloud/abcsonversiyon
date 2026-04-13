import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Star, MessageSquare } from 'lucide-react';

export default function Reviews() {
  const { user, loading } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchReviews = async () => {
      setIsLoading(true);
      try {
        // Fetch reviews where the user is the seller
        const q = query(
          collection(db, 'reviews'),
          where('sellerId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        setReviews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReviews();
  }, [user]);

  if (loading) return <div className="text-center py-20 text-white">Yükleniyor...</div>;
  if (!user) return <Navigate to="/login" />;

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, rev) => acc + (rev.rating || 0), 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <div className="max-w-[1200px] mx-auto py-8 px-4">
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <Link to="/" className="hover:text-white transition-colors">Ana Sayfa</Link>
        <span>›</span>
        <Link to="/kontrol-merkezi" className="hover:text-white transition-colors">Kontrol Merkezi</Link>
        <span>›</span>
        <span className="text-white font-medium">Değerlendirmelerim</span>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Summary Sidebar */}
        <div className="w-full md:w-72 flex-shrink-0">
          <div className="bg-[#1a1b23] rounded-2xl border border-white/5 p-6 text-center">
            <h2 className="text-lg font-bold text-white mb-4">Genel Puan</h2>
            <div className="text-5xl font-bold text-white mb-2">{averageRating}</div>
            <div className="flex items-center justify-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  className={`w-5 h-5 ${star <= Number(averageRating) ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`} 
                />
              ))}
            </div>
            <p className="text-sm text-gray-400">{reviews.length} Değerlendirme</p>
          </div>
        </div>

        {/* Reviews List */}
        <div className="flex-1">
          <div className="bg-[#1a1b23] rounded-2xl border border-white/5 p-6 md:p-8">
            <h2 className="text-xl font-bold text-white mb-6">Son Değerlendirmeler</h2>
            
            {isLoading ? (
              <div className="text-center py-12 text-gray-400">Yükleniyor...</div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Henüz bir değerlendirme almadınız.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-[#111218] rounded-xl p-5 border border-white/5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                          {review.buyerName?.charAt(0) || 'A'}
                        </div>
                        <div>
                          <p className="text-white font-medium">{review.buyerName || 'Anonim Kullanıcı'}</p>
                          <p className="text-xs text-gray-500">
                            {review.createdAt?.toDate ? review.createdAt.toDate().toLocaleDateString('tr-TR') : 'Yeni'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className={`w-4 h-4 ${star <= (review.rating || 5) ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm">{review.comment || 'Yorum yapılmadı.'}</p>
                    {review.productTitle && (
                      <div className="mt-4 pt-4 border-t border-white/5">
                        <p className="text-xs text-gray-500">
                          Satın alınan ürün: <span className="text-blue-400">{review.productTitle}</span>
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
