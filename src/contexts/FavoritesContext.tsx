import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, setDoc, deleteDoc, onSnapshot, collection, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface FavoritesContextType {
  favorites: string[];
  toggleFavorite: (productId: string) => Promise<void>;
  isFavorite: (productId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType>({
  favorites: [],
  toggleFavorite: async () => {},
  isFavorite: () => false,
});

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      setFavorites([]);
      return;
    }

    const q = query(collection(db, 'favorites'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const favIds = snapshot.docs.map(doc => doc.data().productId);
      setFavorites(favIds);
    });

    return unsubscribe;
  }, [user]);

  const toggleFavorite = async (productId: string) => {
    if (!user) {
      toast.error('Favorilere eklemek için giriş yapmalısınız.');
      return;
    }

    const favoriteId = `${user.uid}_${productId}`;
    const favDocRef = doc(db, 'favorites', favoriteId);

    if (favorites.includes(productId)) {
      try {
        await deleteDoc(favDocRef);
        toast.success('Favorilerden çıkarıldı.');
      } catch (error) {
        toast.error('Bir hata oluştu.');
      }
    } else {
      try {
        await setDoc(favDocRef, {
          userId: user.uid,
          productId: productId,
          createdAt: new Date().toISOString()
        });
        toast.success('Favorilere eklendi.');
      } catch (error) {
        toast.error('Bir hata oluştu.');
      }
    }
  };

  const isFavorite = (productId: string) => favorites.includes(productId);

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export const useFavorites = () => useContext(FavoritesContext);
