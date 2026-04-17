"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Truck, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  Package, 
  Navigation,
  Clock,
  RefreshCcw,
  Loader2,
  ExternalLink,
  User
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { claimDeliveryOrder, markOrderDelivered, getDriverUpdates } from "@/app/actions/order";
import { playNotificationSound } from "@/lib/audio";
import { motion, AnimatePresence } from "framer-motion";

export default function DeliveryClient({ 
  driverId,
  driverName,
  initialAvailableOrders,
  initialMyOrders,
  currency
}: { 
  driverId: string,
  driverName: string,
  initialAvailableOrders: any[],
  initialMyOrders: any[],
  currency: string
}) {
  const [availableOrders, setAvailableOrders] = useState(initialAvailableOrders);
  const [myOrders, setMyOrders] = useState(initialMyOrders);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const result = await getDriverUpdates(driverId);
      if (result.success && result.availableOrders && result.myOrders) {
        if (result.availableOrders.length > availableOrders.length) {
          playNotificationSound();
        }
        setAvailableOrders(result.availableOrders);
        setMyOrders(result.myOrders);
      }
    } catch (error) {
      console.error("Delivery polling failed:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [driverId, availableOrders.length]);

  useEffect(() => {
    const interval = setInterval(refreshData, 10000);
    return () => clearInterval(interval);
  }, [refreshData]);

  const handleClaim = async (orderId: number) => {
    setLoadingId(orderId);
    const result = await claimDeliveryOrder(orderId, driverId);
    if (result.success) {
      const claimedOrder = availableOrders.find(o => o.id === orderId);
      if (claimedOrder) {
        setAvailableOrders(prev => prev.filter(o => o.id !== orderId));
        setMyOrders(prev => [...prev, { ...claimedOrder, status: "Shipped", driver_id: driverId }]);
      }
    } else {
      alert("فشل في استلام الطلب، ربما استلمه سائق آخر");
      refreshData();
    }
    setLoadingId(null);
  };

  const handleComplete = async (orderId: number) => {
    setLoadingId(orderId);
    const result = await markOrderDelivered(orderId);
    if (result.success) {
      setMyOrders(prev => prev.filter(o => o.id !== orderId));
    } else {
      alert("فشل في تحديث حالة الطلب");
    }
    setLoadingId(null);
  };

  const openInMaps = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  return (
    <div className="space-y-12 pb-24">
      {/* Driver Welcome Card */}
      <div className="premium-card p-8 bg-slate-900 text-white relative overflow-hidden group">
        <div className="absolute -right-10 -top-10 opacity-10 group-hover:scale-125 transition-transform duration-700">
           <Truck size={180} className="rotate-12" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
             <div className="h-20 w-20 rounded-[2rem] bg-white/10 backdrop-blur-md flex items-center justify-center text-4xl font-black">
                {driverName[0]}
             </div>
             <div>
                <h1 className="text-3xl font-black mb-1">مرحباً كابتن {driverName}</h1>
                <p className="text-white/50 font-bold">لديك {myOrders.length} طلبات قيد التوصيل</p>
             </div>
          </div>
          <button 
            onClick={refreshData}
            disabled={isRefreshing}
            className="h-16 px-8 rounded-2xl bg-white/10 hover:bg-white/20 transition-all backdrop-blur-md flex items-center gap-3 font-black"
          >
            <RefreshCcw className={cn("h-5 w-5", isRefreshing && "animate-spin")} />
            تحديث الطلبات
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Active Deliveries */}
        <div className="space-y-8">
           <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                 <Navigation size={24} />
              </div>
              <div>
                 <h2 className="text-2xl font-black text-slate-900 leading-tight">طلباتي الحالية</h2>
                 <p className="text-sm font-bold text-slate-400">الطلبات التي خرجت معك للتوصيل</p>
              </div>
           </div>

           <div className="space-y-6">
              <AnimatePresence mode="popLayout">
                {myOrders.map(order => (
                  <motion.div 
                    key={order.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="premium-card p-0 overflow-hidden border-emerald-100"
                  >
                    <div className="p-8 border-b border-slate-50">
                       <div className="flex justify-between items-start mb-6">
                          <div>
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">طلب رقم #{order.id}</span>
                             <h3 className="text-xl font-black text-slate-900">{order.customer_name}</h3>
                          </div>
                          <div className="h-12 w-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black shadow-lg shadow-emerald-500/20">
                             <Truck size={20} />
                          </div>
                       </div>
                       
                       <div className="space-y-4">
                          <button 
                            onClick={() => openInMaps(order.customer_address)}
                            className="flex items-start gap-3 text-right group w-full"
                          >
                             <MapPin className="h-5 w-5 text-rose-500 shrink-0 mt-1" />
                             <div className="flex-1">
                                <p className="text-sm font-bold text-slate-600 leading-relaxed group-hover:text-slate-900 transition-colors">{order.customer_address}</p>
                                <span className="text-[10px] font-black text-blue-500 uppercase flex items-center gap-1 mt-1">
                                   <ExternalLink size={10} /> فتح في الخرائط
                                </span>
                             </div>
                          </button>
                          <a href={`tel:${order.customer_phone}`} className="flex items-center gap-3 text-slate-600 hover:text-emerald-600 transition-colors">
                             <Phone className="h-5 w-5 text-emerald-500 shrink-0" />
                             <span className="text-sm font-bold">{order.customer_phone}</span>
                          </a>
                       </div>
                    </div>

                    <div className="bg-slate-50/50 p-6 flex flex-col gap-4">
                       <div className="max-h-32 overflow-y-auto pr-2 custom-scrollbar space-y-2">
                          {order.items.map((i: any) => (
                             <div key={i.id} className="flex justify-between text-xs font-bold text-slate-500 bg-white p-2 rounded-lg border border-slate-100">
                                <span>{i.quantity}x {i.item_name}</span>
                                <span>{formatCurrency(Number(i.price_at_time) * i.quantity, currency)}</span>
                             </div>
                          ))}
                       </div>
                       <button 
                         onClick={() => handleComplete(order.id)}
                         disabled={loadingId === order.id}
                         className="w-full h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black flex items-center justify-center gap-3 shadow-xl shadow-emerald-600/20 transition-all active:scale-95"
                       >
                         {loadingId === order.id ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={24} />}
                         تم التوصيل واستلام المبلغ
                       </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {myOrders.length === 0 && (
                <div className="py-20 text-center bg-white/50 border-2 border-dashed border-slate-200 rounded-[3rem]">
                   <Package className="h-16 w-16 text-slate-200 mx-auto mb-4" />
                   <p className="text-slate-400 font-bold">لا توجد لديك طلبات قيد التوصيل حالياً</p>
                </div>
              )}
           </div>
        </div>

        {/* Available Orders */}
        <div className="space-y-8">
           <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                 <Package size={24} />
              </div>
              <div>
                 <h2 className="text-2xl font-black text-slate-900 leading-tight">طلب ديليفري جاهز</h2>
                 <p className="text-sm font-bold text-slate-400">بانتظار سائق لاستلامه</p>
              </div>
           </div>

           <div className="space-y-6">
              <AnimatePresence mode="popLayout">
                {availableOrders.map(order => (
                  <motion.div 
                    key={order.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="premium-card p-6 border-slate-100 bg-white/70"
                  >
                     <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4">
                           <div className="h-14 w-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-xl font-black">
                              {order.id}
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">طلب خارجي</p>
                              <p className="text-lg font-black text-slate-900 leading-none">{order.customer_name}</p>
                           </div>
                        </div>
                        <div className="flex flex-col items-end">
                           <span className="text-xl font-black text-indigo-600">{formatCurrency(order.items.reduce((sum: number, i: any) => sum + (Number(i.price_at_time) * i.quantity), 0), currency)}</span>
                           <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold mt-1">
                              <Clock size={10} />
                              {new Date(order.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                           </div>
                        </div>
                     </div>

                     <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 mb-6 font-bold text-slate-500 text-sm">
                        <MapPin size={14} className="inline ml-2 text-rose-500" />
                        {order.customer_address}
                     </div>

                     <button 
                       onClick={() => handleClaim(order.id)}
                       disabled={loadingId === order.id}
                       className="w-full h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-indigo-600/10"
                     >
                        {loadingId === order.id ? <Loader2 className="animate-spin" /> : <Truck size={20} />}
                        استلام الطلب الآن
                     </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              {availableOrders.length === 0 && (
                <div className="py-20 text-center bg-slate-50/30 border-2 border-dashed border-slate-100 rounded-[3rem]">
                   <p className="text-slate-300 font-black">لا توجد طلبات جاهزة حالياً</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
