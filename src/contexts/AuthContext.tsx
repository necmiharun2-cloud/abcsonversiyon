import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { addDoc, collection, doc, getDocs, increment, limit, onSnapshot, query, runTransaction, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { isAdminEmail } from '../config/admin';

export interface UserProfile {
  uid: string;
  username: string;
  email: string;
  avatar?: string;
  balance: number;
  balanceAvailableCents?: number;
  balanceHeldCents?: number;
  role: 'admin' | 'moderator' | 'user';
  bio?: string;
  accountStatus?: 'active' | 'frozen' | 'banned';
  salesEnabled?: boolean;
  riskNote?: string;
  createdAt: string;
  listingCount: number;
  soldCount: number;
  rating: number;
  reviewCount: number;
  storeLevel?: 'standard' | 'pro' | 'corporate';
  isVerifiedSeller?: boolean;
  kycStatus?: 'none' | 'pending' | 'verified' | 'rejected';
  kycReferenceId?: string;
  smsVerified?: boolean;
  withdrawEnabled?: boolean;
  phone?: string;
  notifications?: {
    orders: boolean;
    messages: boolean;
    system: boolean;
    marketing: boolean;
  };
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, profile: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile: () => void;
    let claimRunId = 0;

    const claimPendingGifts = async (firebaseUser: User) => {
      const run = ++claimRunId;
      const email = (firebaseUser.email || '').toLowerCase().trim();
      if (!email) return;

      try {
        const q = query(
          collection(db, 'gifts'),
          where('toEmail', '==', email),
          where('status', '==', 'pending'),
          limit(25)
        );
        const snap = await getDocs(q);
        const giftDocs = snap.docs;
        if (giftDocs.length === 0) return;

        // process sequentially to avoid contention
        for (const g of giftDocs) {
          if (run !== claimRunId) return; // cancelled by new auth event

          const giftRef = doc(db, 'gifts', g.id);
          const receiverRef = doc(db, 'users', firebaseUser.uid);
          const receiverTxRef = doc(collection(db, 'transactions'));

          await runTransaction(db, async (tx) => {
            const [giftSnap, receiverSnap] = await Promise.all([tx.get(giftRef), tx.get(receiverRef)]);
            if (!giftSnap.exists()) return;

            const gift = giftSnap.data() as any;
            if (gift.status !== 'pending') return;
            if (gift.toUserId) return; // already claimed

            const amount = Number(gift.amount || 0);
            const currency = String(gift.currency || 'TRY');
            if (!amount || amount <= 0 || currency !== 'TRY') return;

            const receiverBalance = Number((receiverSnap.data() as any)?.balance || 0);
            const nextReceiverBalance = receiverBalance + amount;

            tx.update(receiverRef, { balance: nextReceiverBalance });
            tx.update(giftRef, { status: 'delivered', toUserId: firebaseUser.uid, deliveredAt: serverTimestamp() });
            tx.set(receiverTxRef, {
              userId: firebaseUser.uid,
              type: 'gift_receive',
              amount,
              direction: 'credit',
              refId: giftRef.id,
              createdAt: serverTimestamp(),
              meta: { fromUserId: gift.fromUserId || null, fromEmail: String(gift.fromEmail || '') },
            });
          });

          // Notify receiver (best-effort; non-blocking)
          void addDoc(collection(db, 'notifications'), {
            userId: firebaseUser.uid,
            title: 'Hediye Teslim Edildi!',
            message: 'Bekleyen hediyeniz hesabınıza yüklendi.',
            type: 'success',
            isRead: false,
            createdAt: serverTimestamp(),
          }).catch(() => {});
        }
      } catch (e) {
        console.error('Claim pending gifts failed:', e);
      }
    };

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      // Safety: never keep UI blocked too long
      const safetyTimer = setTimeout(() => {
        setLoading(false);
      }, 8000);

      setUser(firebaseUser);
      
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }

      if (firebaseUser) {
        // Write access log (best-effort, non-blocking; MUST NOT block auth loading)
        void addDoc(collection(db, 'users', firebaseUser.uid, 'accessLogs'), {
          createdAt: serverTimestamp(),
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
          platform: typeof navigator !== 'undefined' ? (navigator.platform || '') : '',
        }).catch(() => {
          // no-op
        });

        // Claim any pending gifts addressed to this email (best-effort, non-blocking)
        void claimPendingGifts(firebaseUser);

        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const normalizedEmail = (firebaseUser.email || '').toLowerCase().trim();
        const shouldBootstrapAdmin = isAdminEmail(normalizedEmail);
        
        // Listen to profile changes
        unsubscribeProfile = onSnapshot(userDocRef, async (docSnap) => {
          if (docSnap.exists()) {
            const raw = docSnap.data() as UserProfile;
            const availableCents = typeof (raw as any).balanceAvailableCents === 'number' ? (raw as any).balanceAvailableCents : undefined;
            const nextProfile: UserProfile = availableCents != null
              ? {
                  ...raw,
                  balanceAvailableCents: availableCents,
                  balanceHeldCents: typeof (raw as any).balanceHeldCents === 'number' ? (raw as any).balanceHeldCents : 0,
                  balance: availableCents / 100,
                }
              : raw;

            if (shouldBootstrapAdmin && raw.role !== 'admin') {
              try {
                await updateDoc(userDocRef, { role: 'admin' });
              } catch (error) {
                console.error('Admin bootstrap update failed:', error);
              }
            }
            setProfile(nextProfile);
          } else {
            // Create profile if it doesn't exist
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              email: firebaseUser.email || '',
              avatar: firebaseUser.photoURL || '',
              balance: 0,
              balanceAvailableCents: 0,
              balanceHeldCents: 0,
              role: shouldBootstrapAdmin ? 'admin' : 'user',
              bio: '',
              accountStatus: 'active',
              salesEnabled: true,
              riskNote: '',
              createdAt: new Date().toISOString(), // Keeping string for now as it's easier for simple display, but using Timestamp is better. Actually, I'll use ISO string to match the interface.
              listingCount: 0,
              soldCount: 0,
              rating: 0,
              reviewCount: 0,
              storeLevel: 'standard',
              isVerifiedSeller: false,
              kycStatus: 'none',
              kycReferenceId: '',
              smsVerified: false,
              withdrawEnabled: false,
              phone: '',
              notifications: {
                orders: true,
                messages: true,
                system: true,
                marketing: false,
              },
            };
            setDoc(userDocRef, newProfile);
            setProfile(newProfile);
          }
          setLoading(false);
          clearTimeout(safetyTimer);
        }, (error) => {
          console.error("Error fetching profile:", error);
          setLoading(false);
          clearTimeout(safetyTimer);
        });
      } else {
        setProfile(null);
        setLoading(false);
        clearTimeout(safetyTimer);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
