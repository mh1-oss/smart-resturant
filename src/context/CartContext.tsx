"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface CartItem {
  cartId: string; // Unique ID for this specific selection
  id: number;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  image_url?: string;
  selectedVariants?: any[];
  selectedAddOns?: any[];
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: any, variants?: any[], addons?: any[], notes?: string) => void;
  removeFromCart: (cartId: string) => void;
  updateQuantity: (cartId: string, delta: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        setCart([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: any, variants: any[] = [], addons: any[] = [], notes: string = "") => {
    // Generate a unique ID based on item ID and selections
    const selectionKey = JSON.stringify({ v: variants.map(v=>v.id).sort(), a: addons.map(a=>a.id).sort(), n: notes });
    const cartId = `${product.id}-${selectionKey}`;

    // Calculate total price for this item including additions
    const addonsPrice = addons.reduce((sum, item) => sum + Number(item.price), 0);
    const basePrice = variants.length > 0 ? Number(variants[0].price) : Number(product.price);
    const itemPrice = basePrice + addonsPrice;

    setCart((prev) => {
      const existing = prev.find((item) => item.cartId === cartId);
      if (existing) {
        return prev.map((item) =>
          item.cartId === cartId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { 
        cartId,
        id: product.id, 
        name: product.name,
        price: itemPrice,
        quantity: 1, 
        notes,
        image_url: product.image_url,
        selectedVariants: variants,
        selectedAddOns: addons
      }];
    });
  };

  const removeFromCart = (cartId: string) => {
    setCart((prev) => prev.filter((item) => item.cartId !== cartId));
  };

  const updateQuantity = (cartId: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.cartId === cartId) {
          const nextQty = Math.max(0, item.quantity + delta);
          return { ...item, quantity: nextQty };
        }
        return item;
      }).filter(item => item.quantity > 0)
    );
  };

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
