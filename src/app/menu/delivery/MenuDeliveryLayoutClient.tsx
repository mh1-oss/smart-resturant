"use client";

import { useState, useEffect } from "react";
import { 
  House, 
  Star, 
  Plus, 
  Minus, 
  ShoppingBag, 
  X, 
  CheckCircle2,
  Truck,
  Phone,
  MapPin,
  Navigation,
  User,
  Zap
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn, formatCurrency } from "@/lib/utils";
import { createDeliveryOrder } from "@/app/actions/order";
import { useCart } from "@/context/CartContext";
import { useOrder } from "@/context/OrderContext";

declare global {
  interface Window {
    L: any;
  }
}

export default function MenuDeliveryLayoutClient({ 
  children,
  currency,
  taxRate,
  deliveryFee
}: { 
  children: React.ReactNode,
  currency: string,
  taxRate: string,
  deliveryFee: string
}) {
  const pathname = usePathname();
  const { cart, updateQuantity, totalPrice, totalItems, clearCart } = useCart();
  const { orders: customerOrders, refreshOrders } = useOrder();
  
  const [showCartPanel, setShowCartPanel] = useState(false);
  const [showOrdersPanel, setShowOrdersPanel] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [mapObj, setMapObj] = useState<any>(null);
  const [markerObj, setMarkerObj] = useState<any>(null);

  const [formData, setFormData] = useState({ name: "", phone: "", address: "", locationUrl: "" });

  useEffect(() => {
    setFormData({
      name: localStorage.getItem("delivery_name") || "",
      phone: localStorage.getItem("delivery_phone") || "",
      address: localStorage.getItem("delivery_address") || "",
      locationUrl: localStorage.getItem("delivery_locationUrl") || ""
    });
  }, []);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("متصفحك لا يدعم خاصية تحديد الموقع");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const locUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
        setFormData(prev => ({ ...prev, locationUrl: locUrl }));
        localStorage.setItem("delivery_locationUrl", locUrl);
        setIsLocating(false);
        setShowMap(true);
        // Initialize or move map
        setTimeout(() => initMap(latitude, longitude), 100);
      },
      (error) => {
        setIsLocating(false);
        console.error("Geolocation error:", error.code, error.message);
        let msg = "فشل تحديد الموقع";
        if (error.code === 1) msg = "يرجى منح إذن الوصول للموقع في المتصفح";
        else if (error.code === 2) msg = "الموقع غير متاح حالياً (GPS)";
        else if (error.code === 3) msg = "انتهى وقت المحاولة، يرجى المحاولة مرة أخرى";
        alert(msg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const initMap = (lat: number, lng: number) => {
    if (typeof window === 'undefined' || !window.L) return;

    const L = window.L;
    const container = document.getElementById('map-picker');
    if (!container) return;

    // Remove existing map if any
    if (mapObj) {
        mapObj.remove();
    }

    const newMap = L.map('map-picker').setView([lat, lng], 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(newMap);

    // Custom SVG Marker Icon for reliability
    const customIcon = L.divIcon({
        html: `<div class="bg-rose-500 w-8 h-8 rounded-full border-4 border-white shadow-lg flex items-center justify-center animate-pulse">
                <div class="w-2 h-2 bg-white rounded-full"></div>
              </div>`,
        className: 'custom-leaflet-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 32]
    });

    const newMarker = L.marker([lat, lng], { 
        draggable: true,
        icon: customIcon
    }).addTo(newMap);

    newMarker.on('dragend', function(event: any) {
        const marker = event.target;
        const position = marker.getLatLng();
        setFormData(prev => ({ 
            ...prev, 
            locationUrl: `https://www.google.com/maps?q=${position.lat},${position.lng}` 
        }));
    });

    setMapObj(newMap);
    setMarkerObj(newMarker);
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return alert("يرجى إدخال الاسم");
    if (!formData.phone) return alert("يرجى إدخال رقم الهاتف");
    if (!formData.address) return alert("يرجى إدخال تفاصيل العنوان");
    if (cart.length === 0) return alert("سلة التسوق فارغة");

    setIsSubmitting(true);
    try {
      localStorage.setItem("delivery_name", formData.name);
      localStorage.setItem("delivery_phone", formData.phone);
      localStorage.setItem("delivery_address", formData.address);
      localStorage.setItem("delivery_locationUrl", formData.locationUrl);

      const result = await createDeliveryOrder(cart, formData);
      if (result.success) {
        setIsSuccess(true);
        clearCart();
        refreshOrders();
        setTimeout(() => {
          setIsSuccess(false);
          setShowCheckoutModal(false);
          setShowCartPanel(false);
          setShowOrdersPanel(true);
        }, 3000);
      } else {
        alert(result.error || "فشل في إتمام الطلب، يرجى المحاولة لاحقاً");
      }
    } catch (err: any) {
      console.error(err);
      alert("حدث خطأ تقني: " + (err.message || "فشل الاتصال بالسيرفر"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="min-h-screen pb-40" style={{ backgroundColor: 'var(--theme-bg)' }}>
        {children}
      </div>

      <div className="fixed inset-x-4 bottom-[124px] z-[100] flex items-center justify-between pointer-events-none">
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="pointer-events-auto">
          <button
            onClick={() => setShowOrdersPanel(true)}
            className="flex h-[52px] items-center gap-2 rounded-full bg-white px-5 font-black text-slate-700 shadow-xl ring-1 ring-slate-200 active:scale-95"
          >
            <span className="text-sm">طلباتي</span>
            <Truck className="h-5 w-5" style={{ color: 'var(--brand-accent)' }} />
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
                className="flex h-[52px] items-center gap-3 rounded-full px-6 text-white shadow-2xl active:scale-95 transition-all"
                style={{ backgroundColor: 'var(--brand-primary)' }}
              >
                <div className="flex flex-col items-end">
                  <p className="text-[10px] font-bold text-white/70 leading-none mb-0.5 uppercase tracking-wider">السلة</p>
                  <p className="text-sm font-black leading-none">{formatCurrency(totalPrice, currency)}</p>
                </div>
                <ShoppingBag className="h-5 w-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showCartPanel && (
           <div key="cart-panel" className="fixed inset-0 z-[200]">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCartPanel(false)} className="absolute inset-0 backdrop-blur-sm" style={{ backgroundColor: 'color-mix(in srgb, var(--brand-primary) 40%, transparent)' }} />
             <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="absolute inset-x-0 bottom-0 max-h-[85vh] rounded-t-[32px] bg-white p-6 shadow-2xl flex flex-col">
               <div className="mb-6 flex items-center justify-between">
                 <h2 className="text-xl font-black text-slate-900">سلة طلباتك</h2>
                 <button onClick={() => setShowCartPanel(false)} className="rounded-full bg-slate-100 p-2"><X size={20} /></button>
               </div>
               
               <div className="flex-1 overflow-y-auto space-y-3 no-scrollbar">
                 {cart.map((item) => (
                   <div key={item.id} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                     <div className="h-14 w-14 rounded-xl overflow-hidden shrink-0">
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
                 ))}
               </div>

                <div className="mt-6 pt-6 border-t border-slate-100 space-y-3 pb-2">
                  <div className="flex items-center justify-between px-2 text-sm text-right">
                    <span className="font-bold text-slate-500">سعر الطلبات</span>
                    <span className="font-black text-slate-900">{formatCurrency(totalPrice * (1 + (Number(taxRate) / 100)), currency)}</span>
                  </div>
                  <div className="flex items-center justify-between px-2 text-sm text-right">
                    <span className="font-bold text-slate-500">سعر التوصيل</span>
                    <span className="font-black" style={{ color: 'var(--brand-accent)' }}>+{formatCurrency(Number(deliveryFee), currency)}</span>
                  </div>
                  <div className="flex items-center justify-between px-2 pt-3 border-t border-slate-50 text-right">
                    <span className="font-black text-slate-900">الإجمالي النهائي</span>
                    <span className="text-2xl font-black text-slate-900">{formatCurrency((totalPrice * (1 + (Number(taxRate) / 100))) + Number(deliveryFee), currency)}</span>
                  </div>
                  <button 
                   onClick={() => setShowCheckoutModal(true)} 
                   className="w-full h-16 text-white rounded-2xl font-black text-lg shadow-xl active:scale-95 transition-transform flex items-center justify-center gap-3"
                   style={{ backgroundColor: 'var(--brand-primary)' }}
                  >
                    متابعة الطلب
                    <ShoppingBag size={20} />
                  </button>
               </div>
             </motion.div>
           </div>
        )}

        {showCheckoutModal && (
          <div key="checkout-modal" className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !isSubmitting && setShowCheckoutModal(false)} className="absolute inset-0 backdrop-blur-md" style={{ backgroundColor: 'color-mix(in srgb, var(--brand-primary) 60%, transparent)' }} />
             <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="relative w-full max-w-md bg-white p-8 rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden overflow-y-auto max-h-[90vh]">
               {isSuccess ? (
                  <div className="text-center py-10 space-y-4">
                    <div className="h-20 w-20 mx-auto rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center animate-bounce"><CheckCircle2 size={48} /></div>
                    <h3 className="text-xl font-black text-slate-900">تم إرسال طلبك بنجاح</h3>
                    <p className="text-sm font-bold text-slate-400">سيتم الاتصال بك قريباً</p>
                  </div>
               ) : (
                  <form onSubmit={handleCheckoutSubmit} className="space-y-6">
                    <h2 className="text-xl font-black text-slate-900 text-center">بيانات التوصيل</h2>
                    <div className="space-y-4">
                      <div className="relative">
                        <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
                        <input type="text" required placeholder="الاسم" className="w-full h-14 pr-12 pl-4 rounded-xl bg-slate-50 border-none ring-1 ring-slate-200 font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                      </div>
                      <div className="relative">
                        <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
                        <input type="tel" required placeholder="رقم الهاتف" className="w-full h-14 pr-12 pl-4 rounded-xl bg-slate-50 border-none ring-1 ring-slate-200 font-bold" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                      </div>
                      <div className="relative">
                        <MapPin className="absolute right-4 top-4 text-slate-400 size-5" />
                        <textarea required placeholder="تفاصيل العنوان (المنطقة، الشارع، الدار...)" className="w-full h-24 pr-12 pl-4 py-4 rounded-xl bg-slate-50 border-none ring-1 ring-slate-200 font-bold resize-none" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                      </div>
                      <div className="relative group">
                        <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
                        <input type="url" placeholder="رابط الموقع (Google Maps)" className="w-full h-14 pr-12 pl-32 rounded-xl bg-slate-50 border-none ring-1 ring-slate-200 font-bold text-sm" value={formData.locationUrl} onChange={e => setFormData({...formData, locationUrl: e.target.value})} />
                          <button 
                            type="button"
                            onClick={handleGetLocation}
                            disabled={isLocating}
                             className={cn(
                               "absolute left-2 top-1/2 -translate-y-1/2 h-10 px-3 text-white text-[10px] font-black rounded-lg shadow-lg active:scale-95 transition-all flex items-center gap-1",
                               isLocating ? "bg-slate-400" : ""
                             )}
                             style={!isLocating ? { backgroundColor: 'var(--brand-primary)' } : {}}
                          >
                            {isLocating ? (
                              <div className="flex items-center gap-1">
                                <div className="h-2 w-2 rounded-full bg-white animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="h-2 w-2 rounded-full bg-white animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="h-2 w-2 rounded-full bg-white animate-bounce"></div>
                              </div>
                            ) : (
                              <>
                                <Navigation size={12} className="rotate-45" />
                                {showMap ? "تحديث الموقع" : "حدد موقعي"}
                              </>
                            )}
                          </button>
                      </div>

                      {showMap && (
                        <div className="space-y-2">
                           <div className="flex items-center justify-between px-1">
                              <span className="text-[10px] font-black text-slate-400 uppercase">حرك الدبوس لتحديد منزلك بدقة</span>
                              <span className="text-[10px] font-black flex items-center gap-1 animate-pulse" style={{ color: 'var(--brand-accent)' }}>
                                 <Zap size={10} /> تحديد دقيق
                              </span>
                           </div>
                           <div id="map-picker" className="h-48 w-full rounded-2xl border-2 border-slate-100 overflow-hidden z-10 shadow-inner">
                              {/* Map will be rendered here */}
                           </div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-4">
                      <button type="button" onClick={() => setShowCheckoutModal(false)} className="flex-1 h-14 font-black text-slate-500 bg-slate-100 rounded-xl">رجوع</button>
                      <button type="submit" disabled={isSubmitting} className="flex-[2] h-14 font-black text-white rounded-xl shadow-lg" style={{ backgroundColor: 'var(--brand-primary)' }}>
                        {isSubmitting ? "جاري الإرسال..." : "إتمام الطلب"}
                      </button>
                    </div>
                  </form>
               )}
             </motion.div>
          </div>
        )}

        {showOrdersPanel && (
           <div key="orders-panel" className="fixed inset-0 z-[200]">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowOrdersPanel(false)} className="absolute inset-0 backdrop-blur-sm" style={{ backgroundColor: 'color-mix(in srgb, var(--brand-primary) 40%, transparent)' }} />
             <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="absolute inset-x-0 bottom-0 max-h-[85vh] rounded-t-[32px] bg-white p-6 shadow-2xl flex flex-col">
               <div className="mb-6 flex items-center justify-between">
                 <h2 className="text-xl font-black text-slate-900">طلباتي</h2>
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
                          order.status === "Ready" ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-600"
                        )}>
                          {order.status === "Pending" ? "بانتظار التأكيد" : order.status === "Preparing" ? "قيد التحضير" : order.status === "Ready" ? "بالطريق" : "تم التوصيل"}
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

                     {order.driver && (
                        <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                          <div className="flex items-center gap-3 text-right">
                            <div className="h-10 w-10 rounded-full text-white flex items-center justify-center text-xs font-black" style={{ backgroundColor: 'var(--brand-primary)' }}>
                              {order.driver.name?.[0] || <User size={14} />}
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider leading-none mb-1">السائق</p>
                              <p className="text-sm font-black text-slate-900 leading-none">{order.driver.name}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                             <a 
                               href={`tel:${order.driver.phone}`} 
                               className="h-10 w-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center active:scale-95 transition-transform"
                               title="اتصال هاتف"
                             >
                                <Phone size={16} />
                             </a>
                             {order.driver.phone && (
                               <a 
                                 href={`https://wa.me/${order.driver.phone.replace(/\s+/g, '')}`} 
                                 target="_blank"
                                 className="h-10 px-4 rounded-xl bg-emerald-50 text-emerald-700 text-[10px] font-black flex items-center gap-2 active:scale-95 transition-transform"
                                 title="مراسلة واتساب"
                               >
                                  واتساب
                               </a>
                             )}
                          </div>
                        </div>
                      )}
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
              { href: `/menu/delivery`, label: "الرئيسية", icon: House },
              { href: `/menu/delivery/offers`, label: "العروض", icon: Star }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.label} 
                  href={item.href} 
                  className={cn(
                    "relative flex-1 flex items-center justify-center gap-3 transition-all duration-500",
                    isActive ? "text-white" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="delivery-nav-pill"
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
