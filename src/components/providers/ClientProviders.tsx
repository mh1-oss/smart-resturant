"use client";

import React from "react";
import SessionProvider from "@/components/providers/SessionProvider";
import { CartProvider } from "@/context/CartContext";
import { OrderProvider } from "@/context/OrderContext";

interface ClientProvidersProps {
  children: React.ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <SessionProvider>
      <CartProvider>
        <OrderProvider>
          {children}
        </OrderProvider>
      </CartProvider>
    </SessionProvider>
  );
}
