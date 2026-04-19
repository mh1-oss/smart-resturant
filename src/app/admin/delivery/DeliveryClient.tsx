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
  User,
  Zap
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

  // Helper to extract lat/lng from any string/URL
  const extractCoordinates = (str?: string) => {
    if (!str) return null;
    const decodedStr = decodeURIComponent(str);
    // Robust regex to find lat/lng coordinates in URLs or strings
    // Matches patterns like: q=33.123,44.123 or @33.123,44.123,17z or 33.123, 44.123
    const regex = /(-?\d{1,3}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)/;
    const match = decodedStr.match(regex);
    if (match) {
        return `${match[1]},${match[2]}`;
    }
    return null;
  };

  const openInMaps = (address: string, locationUrl?: string) => {
    // Check locationUrl first, then fallback to searching coordinates inside the address string
    const coords = extractCoordinates(locationUrl) || extractCoordinates(address);
    if (coords) {
      // Use direct coordinates query for Google Maps
      window.open(`https://www.google.com/maps/search/?api=1&query=${coords}`, '_blank');
      return;
    }
    if (locationUrl && locationUrl.startsWith('http')) {
      window.open(locationUrl, '_blank');
      return;
    }
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  const openInWaze = (address: string, locationUrl?: string) => {
    const coords = extractCoordinates(locationUrl) || extractCoordinates(address);
    if (coords) {
      // Use direct coordinates for Waze
      window.open(`https://waze.com/ul?ll=${coords}&navigate=yes`, '_blank');
    } else {
      // Fallback: search by address in Waze
      const encodedAddress = encodeURIComponent(address);
      window.open(`https://waze.com/ul?q=${encodedAddress}&navigate=yes`, '_blank');
    }
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
                {myOrders.map(order => {
                  const gpsCoords = extractCoordinates(order.customer_location_url) || extractCoordinates(order.customer_address);
                  const hasGps = !!gpsCoords;
                  
                  return (
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
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">طلب رقم #{order.id}</span>
                                    {hasGps && (
                                        <div className="flex flex-col items-start gap-1">
                                            <span className="flex items-center gap-1 bg-emerald-100 text-emerald-600 text-[8px] font-black px-1.5 py-0.5 rounded-md animate-pulse">
                                                <Zap size={8} /> GPS مفعل
                                            </span>
                                            <span className="text-[7px] text-slate-400 font-bold bg-slate-50 px-1 rounded">{gpsCoords}</span>
                                        </div>
                                    )}
                                </div>
                                <h3 className="text-xl font-black text-slate-900">{order.customer_name}</h3>
                            </div>
                            <div className="h-12 w-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black shadow-lg shadow-emerald-500/20">
                                <Truck size={20} />
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex flex-col gap-3">
                                <div className="flex items-start gap-3 text-right">
                                    <MapPin className="h-5 w-5 text-rose-500 shrink-0 mt-1" />
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-slate-600 leading-relaxed">{order.customer_address}</p>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3 mt-2">
                                    <button 
                                    onClick={() => openInMaps(order.customer_address, order.customer_location_url)}
                                    className="h-12 rounded-xl bg-blue-50 text-blue-600 font-black text-[10px] flex items-center justify-center gap-2 border border-blue-100 hover:bg-blue-100 transition-colors"
                                    >
                                        <Navigation size={14} className="text-blue-500" />
                                        خرائط جوجل
                                    </button>
                                    <button 
                                    onClick={() => openInWaze(order.customer_address, order.customer_location_url)}
                                    className="h-12 rounded-xl bg-cyan-50 text-cyan-700 font-black text-[10px] flex items-center justify-center gap-2 border border-cyan-100 hover:bg-cyan-100 transition-colors"
                                    >
                                        <ExternalLink size={14} className="text-cyan-500" />
                                        تطبيق ويز (Waze)
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 pt-4 border-t border-slate-50">
                                <a href={`tel:${order.customer_phone}`} className="flex items-center gap-3 text-slate-600 hover:text-emerald-600 transition-colors">
                                    <Phone className="h-5 w-5 text-emerald-500 shrink-0" />
                                    <span className="text-sm font-bold">{order.customer_phone}</span>
                                </a>
                                <a 
                                  href={`https://wa.me/${order.customer_phone.replace(/\s+/g, '')}`} 
                                  target="_blank" 
                                  className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-2 rounded-xl text-xs font-black hover:bg-emerald-100 transition-colors"
                                >
                                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                                  واتساب
                                </a>
                            </div>
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
                );
                })}
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
                {availableOrders.map(order => {
                  const hasGps = !!extractCoordinates(order.customer_location_url);
                  return (
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
                            <div className="h-14 w-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-xl font-black relative">
                                {order.id}
                                {hasGps && (
                                    <div className="absolute -top-1 -right-1 h-5 w-5 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                                        <Zap size={8} />
                                    </div>
                                )}
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
                            <div className="flex items-start gap-2 mb-3">
                                <MapPin size={14} className="text-rose-500 shrink-0 mt-1" />
                                <span>{order.customer_address}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <button 
                                onClick={() => openInMaps(order.customer_address, order.customer_location_url)}
                                className="h-10 rounded-lg bg-white border border-slate-200 text-slate-600 text-[9px] font-black flex items-center justify-center gap-1"
                                >
                                Google Maps
                                </button>
                                <button 
                                onClick={() => openInWaze(order.customer_address, order.customer_location_url)}
                                className="h-10 rounded-lg bg-white border border-slate-200 text-slate-600 text-[9px] font-black flex items-center justify-center gap-1"
                                >
                                Waze App
                                </button>
                            </div>
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
                   );
                })}
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
