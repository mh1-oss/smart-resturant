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
      whileTap={hasOrders ? { scale: 0.92 } : {}}
      whileHover={hasOrders ? { scale: 1.02 } : {}}
      onClick={handleOpenBill}
      disabled={!hasOrders}
      className={cn(
        "flex items-center gap-2 sm:gap-3 px-3 py-1.5 sm:px-6 sm:py-3 rounded-[18px] sm:rounded-2xl transition-all group relative shrink-0",
        hasOrders 
          ? "bg-white border-2 border-slate-100 text-slate-900 shadow-xl shadow-slate-200/40" 
          : "bg-slate-50/50 border border-slate-100/50 text-slate-300 cursor-not-allowed opacity-60"
      )}
    >
      <div 
        className={cn(
          "flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl shadow-md transition-transform",
          hasOrders ? "text-white group-hover:rotate-12" : "bg-slate-200 text-slate-400"
        )}
        style={hasOrders ? { backgroundColor: 'var(--brand-primary)' } : {}}
      >
        {hasOrders ? <CreditCard className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
      </div>
      <span className="text-[11px] sm:text-sm font-black tracking-tight whitespace-nowrap">
        طلب الحساب
      </span>
      {!hasOrders && (
        <span className="absolute -bottom-10 right-0 left-0 text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-center px-4 py-1 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm pointer-events-none">
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
