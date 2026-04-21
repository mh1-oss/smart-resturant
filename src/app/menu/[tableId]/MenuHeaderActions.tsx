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
      whileHover={hasOrders ? { scale: 1.02, y: -1 } : {}}
      onClick={handleOpenBill}
      disabled={!hasOrders}
      className={cn(
        "flex items-center gap-2.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full transition-all group relative shrink-0 overflow-hidden",
        hasOrders 
          ? "bg-white/90 backdrop-blur-md border border-slate-200/50 text-slate-900 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.02]" 
          : "bg-slate-50/40 border border-slate-100/20 text-slate-300 cursor-not-allowed opacity-50"
      )}
    >
      {/* Background Glow Effect */}
      {hasOrders && (
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 -skew-x-12 translate-x-full group-hover:-translate-x-full" />
      )}

      <div 
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-full shadow-sm transition-all duration-500",
          hasOrders ? "text-white" : "bg-slate-200/50 text-slate-400"
        )}
        style={hasOrders ? { 
          backgroundColor: 'var(--brand-primary)',
          boxShadow: '0 0 15px color-mix(in srgb, var(--brand-primary) 30%, transparent)'
        } : {}}
      >
        {hasOrders ? <CreditCard className="h-3.5 w-3.5 animate-pulse" /> : <Lock className="h-3.5 w-3.5" />}
      </div>
      <span className="text-[11px] sm:text-xs font-black tracking-wide whitespace-nowrap pt-0.5">
        طلب الحساب
      </span>

      {!hasOrders && (
        <span className="absolute -bottom-12 right-0 left-0 text-[9px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 whitespace-nowrap text-center px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl ring-1 ring-slate-100 pointer-events-none z-50">
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
