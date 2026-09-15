import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

import { Product } from '@/types/database';

const CART_STORAGE_KEY = 'jr_cart';

export interface CartVariant {
  size?: string;
  color?: string;
}

export interface CartItem extends Product {
  quantity: number;
  /** Chave da linha no carrinho. Igual ao id do produto quando não há
   *  variação, para que quem já chamava as funções com o id siga funcionando. */
  lineId: string;
  selectedSize?: string;
  selectedColor?: string;
}

/** Mesmo produto em tamanhos diferentes são linhas diferentes do carrinho. */
export const cartLineId = (productId: string, variant?: CartVariant) =>
  variant?.size || variant?.color
    ? `${productId}::${variant.size ?? ''}::${variant.color ?? ''}`
    : productId;

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, variant?: CartVariant) => void;
  removeFromCart: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      const parsed: CartItem[] = stored ? JSON.parse(stored) : [];
      // Carrinhos salvos antes das variações não têm lineId.
      return parsed.map((item) => ({ ...item, lineId: item.lineId ?? item.id }));
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch {
      // localStorage unavailable (private mode / quota exceeded)
    }
  }, [cartItems]);

  const addToCart = (product: Product, variant?: CartVariant) => {
    const lineId = cartLineId(product.id, variant);
    setCartItems(currentItems => {
      const existingItem = currentItems.find(item => item.lineId === lineId);

      if (existingItem) {
        return currentItems.map(item =>
          item.lineId === lineId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [
          ...currentItems,
          {
            ...product,
            quantity: 1,
            lineId,
            selectedSize: variant?.size,
            selectedColor: variant?.color,
          },
        ];
      }
    });
  };

  const removeFromCart = (lineId: string) => {
    setCartItems(currentItems =>
      currentItems.filter(item => item.lineId !== lineId)
    );
  };

  const updateQuantity = (lineId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(lineId);
      return;
    }

    setCartItems(currentItems =>
      currentItems.map(item =>
        item.lineId === lineId ? { ...item, quantity } : item
      )
    );
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const clearCart = () => {
    setCartItems([]);
    try { localStorage.removeItem(CART_STORAGE_KEY); } catch { /* noop */ }
  };

  const value: CartContextType = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    getTotalItems,
    getTotalPrice,
    clearCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};