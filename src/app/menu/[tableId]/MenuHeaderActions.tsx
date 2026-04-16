"use client";

import { CreditCard, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { useOrder } from "@/context/OrderContext";

export default function MenuHeaderActions() {
  const { hasOrders } = useOrder();

  const handleOpenBill = () => {
    window.dispatchEvent(new CustomEvent("OPEN_BILL_MODAL"));
  };

  return (
    <motion.button
      whileTap={hasOrders ? { scale: 0.95 } : {}}
      whileHover={hasOrders ? { scale: 1.05 } : {}}
      onClick={handleOpenBill}
      disabled={!hasOrders}
      className={cn(
        "flex items-center gap-3 px-6 py-3 rounded-2xl transition-all group relative",
        hasOrders 
          ? "bg-white border border-slate-200 text-slate-900 shadow-xl shadow-slate-200/50" 
          : "bg-slate-50 border border-slate-100 text-slate-300 cursor-not-allowed opacity-60"
      )}
    >
      <div className={cn(
        "flex h-8 w-8 items-center justify-center rounded-xl shadow-lg transition-transform",
        hasOrders ? "bg-slate-900 text-white group-hover:rotate-12" : "bg-slate-200 text-slate-400"
      )}>
        {hasOrders ? <CreditCard className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
      </div>
      <span className="text-sm font-black tracking-tight">
        طلب الحساب
      </span>
      {!hasOrders && (
        <span className="absolute -bottom-8 right-0 left-0 text-[9px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-center">
            اطلب وجبتك أولاً لتفعيل الزر
        </span>
      )}
    </motion.button>
  );
}

// Helper to handle class names since I used 'cn' which might not be imported here
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
