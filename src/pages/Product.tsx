import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import SEOHead from '../components/SEOHead';
import { useAuth } from '../contexts/AuthContext';
import { db, storage } from '../firebase';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Breadcrumb from '../components/Product/Breadcrumb';
import ProductGallery from '../components/Product/ProductGallery';
import SellerCard from '../components/Product/SellerCard';
import PurchaseCard from '../components/Product/PurchaseCard';
import ProductDetails from '../components/Product/ProductDetails';
import SimilarProducts from '../components/Product/SimilarProducts';
import toast from 'react-hot-toast';
import { findMockListingById } from '../lib/catalog';

export default function Product() {
  const { id } = useParams();
  const { user } = useAuth();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [issueUploading, setIssueUploading] = useState(false);

  const withCreatedAtFallback = (p: any) => {
    if (!p) return p;
    if (p.createdAt) return p;
    // Some older/mock listings might not have createdAt; show 30-day countdown from now.
    return { ...p, createdAt: new Date() };
  };
  
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      if (id) {
        try {
          const docRef = doc(db, 'products', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProduct(withCreatedAtFallback({ id: docSnap.id, ...docSnap.data() }));
          } else {
            const mock = findMockListingById(id);
            if (mock) {
              setProduct(withCreatedAtFallback(mock));
            } else {
              toast.error('Ürün bulunamadı.');
            }
          }
        } catch (error) {
          console.error('Error fetching product:', error);
          const mock = findMockListingById(id);
          if (mock) setProduct(withCreatedAtFallback(mock));
          else toast.error('Ürün yüklenemedi.');
        }
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="text-center py-20 text-white">Yükleniyor...</div>;
  if (!product) return <div className="text-center py-20 text-white">Ürün bulunamadı.</div>;

  const handleIssueReport = async (file?: File) => {
    if (!user) {
      toast.error('Sorun bildirimi için giriş yapmalısınız.');
      return;
    }
    try {
      let attachmentUrl = '';
      if (file) {
        setIssueUploading(true);
        const fileRef = ref(storage, `support-attachments/${product.id}/${Date.now()}_${file.name}`);
        await uploadBytes(fileRef, file);
        attachmentUrl = await getDownloadURL(fileRef);
      }
      await addDoc(collection(db, 'supportTickets'), {
        userId: user?.uid || '',
        subject: `Ürün Sorun Bildirimi #${product.id}`,
        category: 'Ürün Sorunu',
        message: `${product.title} ürünü için sorun bildirimi oluşturuldu.`,
        status: 'Beklemede',
        channel: 'product-issue',
        attachmentUrl,
        productId: product.id,
        createdAt: serverTimestamp(),
      });
      toast.success('Sorun kaydı başarıyla oluşturuldu.');
    } catch {
      toast.error('Sorun kaydı oluşturulamadı.');
    } finally {
      setIssueUploading(false);
    }
  };

  return (
    <div className="max-w-[1320px] mx-auto">
      <Breadcrumb category={product.category} title={product.title} />
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column */}
        <div className="flex-1 space-y-6 min-w-0">
          <ProductGallery image={product.image} title={product.title} createdAt={product.createdAt} />
          <ProductDetails product={product} />
        </div>

        {/* Right Column */}
        <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 space-y-6">
          <SellerCard 
            sellerName={product.sellerName} 
            sellerAvatar={product.sellerAvatar} 
            sellerId={product.sellerId}
            productId={product.id}
            productTitle={product.title}
          />
          <PurchaseCard product={product} />
          
          {/* Help Banner */}
          <div className="bg-[#1a1b23] rounded-xl border border-white/5 p-6 text-center">
            <div className="w-12 h-12 bg-[#23242f] rounded-full flex items-center justify-center mx-auto mb-4 text-[#5b68f6] font-bold text-xl">
              ?
            </div>
            <h3 className="text-white font-bold mb-2">Yardıma mı ihtiyacınız var?</h3>
            <Link 
              to="/destek-sistemi"
              className="text-gray-400 text-xs mb-6 underline cursor-pointer hover:text-white block"
            >
              Buraya tıklayarak yardım merkezi sayfamıza ulaşabilirsiniz.
            </Link>
            <label className="w-full bg-red-500/10 text-red-500 hover:bg-red-500/20 font-medium py-2.5 rounded text-sm transition-colors border border-red-500/20 block cursor-pointer">
              {issueUploading ? 'Yükleniyor...' : 'Akıllı Sorun Bildir (Ses/Ekran Kaydı)'}
              <input
                type="file"
                accept="audio/*,video/*"
                className="hidden"
                onChange={(e) => handleIssueReport(e.target.files?.[0])}
              />
            </label>
            <button
              onClick={() => handleIssueReport()}
              className="w-full mt-2 bg-white/5 hover:bg-white/10 text-white font-medium py-2.5 rounded text-sm transition-colors border border-white/10"
            >
              Yazılı Sorun Bildir
            </button>
          </div>
        </div>
      </div>

      <SimilarProducts category={product.category} currentProductId={product.id} />
      {product && (
        <SEOHead
          title={product.title || 'Ürün Detayı'}
          description={product.description ? product.description.substring(0, 160) : 'Ürün detayları ve satın alma seçenekleri itemTR\'de.'}
          canonical={`/product/${product.id}`}
        />
      )}
    </div>
  );
}
