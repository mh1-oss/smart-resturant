"use client";

import { useState } from "react";
import { 
  House, 
  Star, 
  Plus, 
  Minus, 
  ShoppingBag, 
  X, 
  CheckCircle2,
  UtensilsCrossed
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn, formatCurrency } from "@/lib/utils";
import { createOrder } from "@/app/actions/order";
import { useCart } from "@/context/CartContext";
import { useOrder } from "@/context/OrderContext";

export default function MenuLayoutClient({ 
  children,
  tableId,
  currency,
  taxRate
}: { 
  children: React.ReactNode,
  tableId: string,
  currency: string,
  taxRate: string
}) {
  const pathname = usePathname();
  const { cart, updateQuantity, totalPrice, totalItems, clearCart } = useCart();
  const { orders: customerOrders, refreshOrders } = useOrder();
  
  const [showCartPanel, setShowCartPanel] = useState(false);
  const [showOrdersPanel, setShowOrdersPanel] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleConfirmOrder = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    try {
      const result = await createOrder(parseInt(tableId), cart);
      if (result.success) {
        setIsSuccess(true);
        clearCart();
        refreshOrders();
        setTimeout(() => {
          setIsSuccess(false);
          setShowCartPanel(false);
          setShowOrdersPanel(true);
        }, 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--theme-bg)' }}>
        <div className="pb-40">
          {children}
        </div>
      </div>

      <div className="fixed inset-x-4 bottom-[124px] z-[100] flex items-center justify-between pointer-events-none">
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="pointer-events-auto">
          <button
            onClick={() => setShowOrdersPanel(true)}
            className="flex h-[52px] items-center gap-2 rounded-full bg-white px-5 font-black text-slate-700 shadow-xl ring-1 ring-slate-200 active:scale-95"
          >
            <span className="text-sm">طلباتي</span>
            <UtensilsCrossed size={18} style={{ color: 'var(--brand-accent)' }} />
          </button>
        </motion.div>

        <AnimatePresence>
          {totalItems > 0 && (
            <motion.div 
              key="cart-button"
              initial={{ x: 20, opacity: 0 }} 
              animate={{ x: 0, opacity: 1 }} 
              exit={{ x: 20, opacity: 0 }} 
              className="pointer-events-auto"
            >
              <button
                onClick={() => setShowCartPanel(true)}
                className="flex h-[52px] items-center gap-3 rounded-full px-6 text-white shadow-2xl active:scale-95"
                style={{ backgroundColor: 'var(--brand-primary)' }}
              >
                <div className="flex flex-col items-end">
                  <p className="text-[10px] font-bold text-white/70 leading-none mb-0.5">الطاولة</p>
                  <p className="text-sm font-black leading-none">{formatCurrency(totalPrice, currency)}</p>
                </div>
                <ShoppingBag size={20} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showCartPanel && (
           <div key="cart-panel" className="fixed inset-0 z-[200]">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCartPanel(false)} className="absolute inset-0" style={{ backgroundColor: 'color-mix(in srgb, var(--brand-primary) 60%, transparent)' }} />
             <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="absolute inset-x-0 bottom-0 max-h-[85vh] rounded-t-[32px] bg-white p-6 shadow-2xl flex flex-col">
               <div className="mb-6 flex items-center justify-between">
                 <h2 className="text-xl font-black text-slate-900">سلة طلباتك</h2>
                 <button onClick={() => setShowCartPanel(false)} className="rounded-full bg-slate-100 p-2"><X size={20} /></button>
               </div>

               <div className="flex-1 overflow-y-auto space-y-3 no-scrollbar">
                 {isSuccess ? (
                    <div className="py-20 text-center space-y-4">
                      <div className="h-20 w-20 mx-auto rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center animate-bounce"><CheckCircle2 size={48} /></div>
                      <h3 className="text-xl font-black text-slate-900">تم إرسال الطلب للمطبخ!</h3>
                      <p className="text-sm font-bold text-slate-400">ستصلك وجبتك قريباً</p>
                    </div>
                 ) : cart.length > 0 ? (
                   cart.map((item) => (
                     <div key={item.id} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                       <div className="h-14 w-14 rounded-xl overflow-hidden shrink-0 bg-slate-200">
                          <img src={item.image_url || "/placeholder-menu.jpg"} alt={item.name} className="h-full w-full object-cover" />
                       </div>
                       <div className="flex-1 text-right">
                         <h4 className="text-sm font-black text-slate-900">{item.name}</h4>
                         <p className="text-xs font-bold text-slate-500">{formatCurrency(item.price, currency)}</p>
                       </div>
                       <div className="flex items-center gap-2 bg-white rounded-xl p-1 shadow-sm">
                         <button onClick={() => updateQuantity(item.id, -1)} className="p-1 text-slate-400"><Minus size={14} /></button>
                         <span className="text-sm font-black w-4 text-center">{item.quantity}</span>
                         <button onClick={() => updateQuantity(item.id, 1)} className="p-1 text-slate-400"><Plus size={14} /></button>
                       </div>
                     </div>
                   ))
                 ) : (
                   <div className="py-20 text-center space-y-2">
                     <ShoppingBag className="mx-auto text-slate-200 h-16 w-16" />
                     <p className="text-slate-400 font-bold">السلة فارغة</p>
                   </div>
                 )}
               </div>

               <div className="mt-6 pt-6 border-t border-slate-100 space-y-4 pb-2">
                 <div className="flex items-center justify-between px-2">
                   <span className="font-bold text-slate-500">الإجمالي النهائي</span>
                   <span className="text-2xl font-black text-slate-900">{formatCurrency(totalPrice * (1 + (Number(taxRate) / 100)), currency)}</span>
                 </div>
                 <button 
                  onClick={handleConfirmOrder} 
                  disabled={isSubmitting || cart.length === 0}
                  className="w-full h-16 text-white rounded-2xl font-black text-lg shadow-xl active:scale-95 transition-transform flex items-center justify-center gap-3 disabled:opacity-50"
                  style={{ backgroundColor: 'var(--brand-primary)' }}
                 >
                   {isSubmitting ? "جاري الإرسال..." : "تأكيد وإرسال الطلب"}
                   <UtensilsCrossed size={20} />
                 </button>
               </div>
             </motion.div>
           </div>
        )}

        {showOrdersPanel && (
           <div key="orders-panel" className="fixed inset-0 z-[200]">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowOrdersPanel(false)} className="absolute inset-0" style={{ backgroundColor: 'color-mix(in srgb, var(--brand-primary) 60%, transparent)' }} />
             <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="absolute inset-x-0 bottom-0 max-h-[85vh] rounded-t-[32px] bg-white p-6 shadow-2xl flex flex-col">
               <div className="mb-6 flex items-center justify-between">
                 <h2 className="text-xl font-black text-slate-900">طلبات طاولتك</h2>
                 <button onClick={() => setShowOrdersPanel(false)} className="rounded-full bg-slate-100 p-2"><X size={20} /></button>
               </div>
               <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar">
                 {customerOrders.map((order) => (
                   <div key={order.id} className="rounded-2xl border border-slate-100 bg-white p-4">
                     <div className="flex items-center justify-between mb-3">
                       <span className="text-xs font-bold text-slate-400">{new Date(order.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</span>
                       <span className={cn(
                         "px-3 py-1 rounded-lg text-[10px] font-black uppercase",
                         order.status === "Pending" ? "bg-[var(--brand-accent)] text-white" : 
                         ["Served", "Ready"].includes(order.status) ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-600"
                       )}>
                         {order.status === "Pending" ? "بانتظار التأكيد" : order.status === "Preparing" ? "قيد التحضير" : order.status === "Ready" ? "جاهز!" : "تم التقديم"}
                       </span>
                     </div>
                     <div className="space-y-1">
                        {order.items.map((item: any) => (
                          <div key={item.id} className="flex justify-between text-xs font-bold text-slate-600">
                            <span>{item.item_name} x{item.quantity}</span>
                            <span>{formatCurrency(item.price_at_time * item.quantity, currency)}</span>
                          </div>
                        ))}
                     </div>
                   </div>
                 ))}
               </div>
             </motion.div>
           </div>
        )}
      </AnimatePresence>

      <nav className="fixed inset-x-6 bottom-6 z-50 overflow-hidden animate-entrance">
        <div className="mx-auto max-w-3xl glass-morphism rounded-[32px] p-2 shadow-2xl shadow-slate-900/5 border-white/50">
          <div className="flex items-stretch h-14 relative">
            {[
              { href: `/menu/${tableId}`, label: "الرئيسية", icon: House },
              { href: `/menu/${tableId}/offers`, label: "العروض", icon: Star }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.label} 
                  href={item.href} 
                  prefetch={true}
                  className={cn(
                    "relative flex-1 flex items-center justify-center gap-3 transition-all duration-500",
                    isActive ? "text-white" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-2xl z-0 shadow-lg"
                      style={{ backgroundColor: 'var(--brand-primary)' }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <motion.div
                    animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                    whileTap={{ scale: 0.9 }}
                    className="flex items-center gap-2 relative z-10"
                  >
                    <Icon size={18} className={isActive ? "stroke-[2.5]" : "stroke-2"} />
                    <span className="text-xs font-black">{item.label}</span>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}
