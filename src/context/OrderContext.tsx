"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getCustomerOrders } from "@/app/actions/order";
import { useParams } from "next/navigation";

interface OrderContextType {
  orders: any[];
  hasOrders: boolean;
  isLoading: boolean;
  refreshOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const { tableId } = useParams();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      if (tableId) {
        // DineIn logic
        const result = await getCustomerOrders(tableId as string);
        if (result.success && result.orders) {
          setOrders(result.orders);
        }
      } else {
        // Delivery logic: Check localStorage for phone number
        const savedPhone = typeof window !== "undefined" ? localStorage.getItem("delivery_phone") : null;
        if (savedPhone) {
          // Import dynamic to avoid circular if needed, but here it's fine
          const { getDeliveryOrders } = await import("@/app/actions/order");
          const result = await getDeliveryOrders(savedPhone);
          if (result.success && result.orders) {
            setOrders(result.orders);
          }
        }
      }
    } catch (error) {
      console.error("OrderContext: Failed to fetch orders", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, [tableId]);

  const hasOrders = orders.length > 0;

  return (
    <OrderContext.Provider value={{ orders, hasOrders, isLoading, refreshOrders: fetchOrders }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error("useOrder must be used within an OrderProvider");
  }
  return context;
}
