import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { safeGetItem, safeSetItem } from '../lib/safeStorage';

export interface CartItem {
  id: string;
  title: string;
  price: number;
  originalPrice: number;
  seller: string;
  sellerId: string;
  image: string;
  meta?: Record<string, unknown>;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = safeGetItem('cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    safeSetItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (newItem: Omit<CartItem, 'quantity'>) => {
    const itemWithNumbers = {
      ...newItem,
      price: Number(newItem.price || 0),
      originalPrice: Number(newItem.originalPrice || 0)
    };
    setItems(prev => {
      const existing = prev.find(item => item.id === itemWithNumbers.id);
      if (existing) {
        return prev.map(item => 
          item.id === itemWithNumbers.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...itemWithNumbers, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return;
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, quantity } : item
    ));
  };

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const clearCart = () => setItems([]);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, cartCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
