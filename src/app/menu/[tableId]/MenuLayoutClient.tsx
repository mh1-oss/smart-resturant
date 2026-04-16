"use client";

import { useState, useEffect } from "react";
import { 
  House, 
  Star, 
  Plus, 
  Minus, 
  ShoppingBag, 
  X, 
  UtensilsCrossed,
  CheckCircle2,
  CreditCard
} from "lucide-react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn, formatCurrency } from "@/lib/utils";
import { requestBill, createOrder } from "@/app/actions/order";
import { useCart } from "@/context/CartContext";
import { useOrder } from "@/context/OrderContext";

export default function MenuLayoutClient({ 
  children,
  currency,
  taxRate
}: { 
  children: React.ReactNode,
  currency: string,
  taxRate: string
}) {
  const pathname = usePathname();
  const { tableId } = useParams();
  const { cart, updateQuantity, totalPrice, totalItems, clearCart } = useCart();
  const { orders: customerOrders, refreshOrders, hasOrders } = useOrder();
  
  // UI State
  const [showCartPanel, setShowCartPanel] = useState(false);
  const [showOrdersPanel, setShowOrdersPanel] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Lock body scroll when any panel is open
  useEffect(() => {
    if (showCartPanel || showOrdersPanel || showBillModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showCartPanel, showOrdersPanel, showBillModal]);

  // Event listener for external bill request trigger
  useEffect(() => {
    const handleOpenBill = () => {
      if (!hasOrders) {
        alert("لا يمكن طلب الحساب حالياً لعدم وجود طلبات مسجلة على هذه الطاولة.");
        return;
      }
      setShowBillModal(true);
    };
    window.addEventListener("OPEN_BILL_MODAL", handleOpenBill);
    return () => window.removeEventListener("OPEN_BILL_MODAL", handleOpenBill);
  }, [hasOrders]);

  const handleRequestBill = async () => {
    setIsRequesting(true);
    const result = await requestBill(tableId as string);
    if (result.success) {
      setIsSuccess(true);
      setTimeout(() => {
        setShowBillModal(false);
        setIsSuccess(false);
      }, 3000);
    } else {
      alert(result.error || "حدث خطأ أثناء طلب الحساب");
    }
    setIsRequesting(false);
  };

  const handleConfirmOrder = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    try {
      const result = await createOrder(tableId as string, cart);
      if (result.success) {
        clearCart();
        setShowCartPanel(false);
        refreshOrders(); // Refresh status
        setShowOrdersPanel(true);
      } else {
        alert(result.error);
      }
    } catch (err) {
      alert("حدث خطأ أثناء إرسال الطلب");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
           key={pathname}
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           exit={{ opacity: 0, x: -20 }}
           transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {children}
        </motion.div>
      </AnimatePresence>

      <div className="fixed inset-x-6 bottom-[108px] z-[100] flex items-center justify-between pointer-events-none">
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="pointer-events-auto">
          <button
            onClick={() => setShowOrdersPanel(true)}
            className="group relative flex h-[58px] items-center gap-3 rounded-full bg-white px-6 font-black text-slate-700 shadow-xl shadow-slate-200/50 ring-1 ring-slate-200/60 hover:bg-slate-50 transition-all active:scale-92"
          >
            <span className="text-[15px]">طلباتي</span>
            <UtensilsCrossed className="h-5 w-5 text-slate-600 group-hover:rotate-12 transition-transform" />
            {customerOrders.some(o => ["Pending", "Preparing", "Ready"].includes(o.status)) && (
              <span className="absolute -top-1 -right-1 flex h-6 w-6">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-6 w-6 bg-rose-500 border-[3px] border-white shadow-sm"></span>
              </span>
            )}
          </button>
        </motion.div>

        <AnimatePresence>
          {totalItems > 0 && (
            <motion.div initial={{ x: 20, opacity: 0, scale: 0.8 }} animate={{ x: 0, opacity: 1, scale: 1 }} exit={{ x: 20, opacity: 0, scale: 0.8 }} className="pointer-events-auto">
              <button
                onClick={() => setShowCartPanel(true)}
                className="flex h-[58px] items-center gap-4 rounded-full bg-slate-900 pl-2 pr-6 text-white shadow-2xl shadow-slate-900/30 ring-4 ring-white transition-all active:scale-92"
              >
                <div className="flex flex-col items-end">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-0.5">السلة</p>
                  <p className="text-sm font-black leading-none">{formatCurrency(totalPrice, currency)}</p>
                </div>
                <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white/10 backdrop-blur-md">
                  <ShoppingBag className="h-5 w-5" />
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-black border-2 border-slate-900">{totalItems}</span>
                </div>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showCartPanel && (
           <div className="fixed inset-0 z-[200]">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCartPanel(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
             <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }} className="absolute inset-x-0 bottom-0 max-h-[90vh] rounded-t-[40px] bg-white p-8 shadow-2xl">
               <div className="mb-6 flex items-center justify-between">
                 <h2 className="text-2xl font-black text-slate-900">سلة طلباتك</h2>
                 <button onClick={() => setShowCartPanel(false)} className="rounded-full bg-slate-100 p-3"><X className="h-6 w-6" /></button>
               </div>
               <div className="no-scrollbar max-h-[45vh] space-y-4 overflow-y-auto">
                 {cart.map((item) => (
                   <div key={item.id} className="flex items-center gap-4 rounded-3xl bg-slate-50 p-4">
                     {item.image_url && <img src={item.image_url} alt={item.name} className="h-16 w-16 rounded-2xl object-cover" />}
                     <div className="flex-1 text-right">
                       <h4 className="font-black text-slate-900">{item.name}</h4>
                       <p className="text-sm font-bold text-slate-500">{formatCurrency(item.price, currency)}</p>
                     </div>
                     <div className="flex items-center gap-3 bg-white rounded-2xl p-1.5 shadow-sm">
                       <button onClick={() => updateQuantity(item.id, -1)} className="h-8 w-8 text-slate-400 hover:text-slate-900"><Minus className="h-4 w-4 mx-auto" /></button>
                       <span className="w-4 text-center font-black text-slate-900">{item.quantity}</span>
                       <button onClick={() => updateQuantity(item.id, 1)} className="h-8 w-8 text-slate-400 hover:text-slate-900"><Plus className="h-4 w-4 mx-auto" /></button>
                     </div>
                   </div>
                 ))}
               </div>
               <div className="mt-8 space-y-6">
                 <div className="flex items-center justify-between px-2 pt-4 border-t border-slate-100">
                   <span className="text-lg font-bold text-slate-500">الإجمالي النهائي</span>
                   <span className="text-3xl font-black text-slate-900">{formatCurrency(totalPrice * (1 + (Number(taxRate) / 100)), currency)}</span>
                 </div>
                 <button onClick={handleConfirmOrder} disabled={isSubmitting} className="premium-button w-full h-18 text-xl disabled:opacity-50">
                   {isSubmitting ? "جاري الإرسال..." : "تأكيد وإرسال الطلب"}
                 </button>
               </div>
             </motion.div>
           </div>
        )}

        {showOrdersPanel && (
           <div className="fixed inset-0 z-[200]">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowOrdersPanel(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
             <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }} className="absolute inset-x-0 bottom-0 max-h-[90vh] rounded-t-[40px] bg-white p-8 shadow-2xl flex flex-col">
               <div className="mb-8 flex items-center justify-between">
                 <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2"><UtensilsCrossed className="h-6 w-6 text-slate-500" />حالة الطلبات</h2>
                 <button onClick={() => setShowOrdersPanel(false)} className="rounded-full bg-slate-100 p-3"><X className="h-6 w-6" /></button>
               </div>
               <div className="no-scrollbar flex-1 overflow-y-auto space-y-4">
                 {customerOrders.map((order) => (
                   <div key={order.id} className="rounded-3xl border border-slate-100 bg-white shadow-sm p-5">
                     <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                       <span className="text-xs font-bold text-slate-400">{new Date(order.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</span>
                       <div className={cn(
                        "px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5",
                        order.status === "Pending" ? "bg-amber-100 text-amber-600" : 
                        order.status === "Preparing" ? "bg-rose-100 text-rose-600" : 
                        order.status === "Ready" ? "bg-emerald-100 text-emerald-600 border border-emerald-200" :
                        order.status === "Served" ? "bg-slate-100 text-slate-600" : "bg-red-100 text-red-600"
                      )}>
                        {order.status === "Pending" ? "بانتظار التأكيد" : order.status === "Preparing" ? "قيد التحضير" : order.status === "Ready" ? "جاهز للتقديم!" : order.status === "Served" ? "تم التقديم" : "ملغى"}
                      </div>
                     </div>
                     <div className="space-y-2">
                        {order.items.map((item: any) => (
                            <div key={item.id} className="flex justify-between text-sm">
                                <span className="font-bold text-slate-700">{item.item_name || item.menuItem?.name} <span className="text-[10px] text-slate-400">x{item.quantity}</span></span>
                                <span className="font-black text-slate-900">{formatCurrency(item.price_at_time * item.quantity, currency)}</span>
                            </div>
                        ))}
                     </div>
                   </div>
                 ))}
                 {customerOrders.length === 0 && <div className="text-center py-10 font-bold text-slate-400">لا يوجد طلبات سابقة.</div>}
               </div>
             </motion.div>
           </div>
        )}

        {showBillModal && (
          <div className="fixed inset-0 z-[500] flex items-end sm:items-center justify-center p-0 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !isRequesting && setShowBillModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="relative w-full max-w-md bg-white p-8 rounded-t-[40px] sm:rounded-[40px] shadow-2xl">
              {isSuccess ? (
                 <div className="text-center py-10 space-y-4">
                   <div className="h-20 w-20 mx-auto rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center animate-bounce"><CheckCircle2 size={48} /></div>
                   <h3 className="text-2xl font-black text-slate-900">تم إرسال الطلب</h3>
                   <p className="font-bold text-slate-500">النادل في طريقه إليك الآن</p>
                 </div>
              ) : (
                 <>
                   <div className="text-center mb-8">
                     <div className="mx-auto h-20 w-20 rounded-[32px] bg-slate-50 text-slate-900 flex items-center justify-center mb-4"><CreditCard size={40} /></div>
                     <h2 className="text-2xl font-black text-slate-900">طلب الحساب</h2>
                     <p className="text-sm font-bold text-slate-400 leading-relaxed">سوف يتم إرسال نادل إلى طاولتك فوراً لإتمام عملية الدفع.</p>
                   </div>
                   <div className="flex gap-4">
                     <button onClick={() => setShowBillModal(false)} disabled={isRequesting} className="flex-1 py-4 font-black text-slate-600 bg-slate-100 rounded-2xl active:scale-95 transition-transform">إلغاء</button>
                     <button onClick={handleRequestBill} disabled={isRequesting} className="flex-[2] py-4 font-black text-white bg-slate-900 rounded-2xl shadow-xl active:scale-95 transition-transform">{isRequesting ? "جاري الإرسال..." : "نعم، أطلب الحساب"}</button>
                   </div>
                 </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200/60 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-around px-4 py-4">
          {[
            { href: `/menu/${tableId}`, label: "الرئيسية", icon: House },
            { href: `/menu/${tableId}/offers`, label: "العروض", icon: Star }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.label} href={item.href}>
                <motion.div whileTap={{ scale: 0.9 }} className={cn("flex flex-col items-center gap-1 transition-all duration-300", isActive ? "text-slate-900 scale-110" : "text-slate-400 hover:text-slate-600")}>
                  <div className={cn("p-1 rounded-xl transition-all", isActive && "bg-slate-100")}><Icon className="h-6 w-6" strokeWidth={isActive ? 2.5 : 2} /></div>
                  <span className="text-[10px] font-black">{item.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
