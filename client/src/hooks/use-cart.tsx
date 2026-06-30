import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { CartItem } from "@/lib/api";

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  updateQuantity: (id: number, quantity: number) => void;
  removeItem: (id: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try { return JSON.parse(localStorage.getItem("sanova_cart") || "[]"); }
    catch { return []; }
  });

  useEffect(() => { localStorage.setItem("sanova_cart", JSON.stringify(items)); }, [items]);

  const addItem = (newItem: CartItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.productId === newItem.productId && i.pack === newItem.pack && i.scent === newItem.scent);
      if (existing) return prev.map(i => i.id === existing.id ? { ...i, quantity: i.quantity + newItem.quantity } : i);
      return [...prev, { ...newItem, id: Date.now() }];
    });
  };

  const updateQuantity = (id: number, quantity: number) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantity } : i));
  };

  const removeItem = (id: number) => setItems(prev => prev.filter(i => i.id !== id));
  const clearCart = () => setItems([]);

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, updateQuantity, removeItem, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
