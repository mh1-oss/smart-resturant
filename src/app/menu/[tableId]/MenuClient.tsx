"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { Search, Plus, Minus, ShoppingBag, X, Clock, CheckCircle2, Flame, UtensilsCrossed } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency, cn } from "@/lib/utils";
import Image from "next/image";

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  originalPrice?: number;
  discountPercentage?: number | null;
}

interface Category {
  id: number;
  name: string;
  menuItems: MenuItem[];
}

export default function MenuClient({
  initialCategories,
  tableId,
  currency,
  taxRate,
  initialOrders = [],
}: {
  initialCategories: any[];
  tableId: string;
  currency: string;
  taxRate: string;
  initialOrders?: any[];
}) {
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const { cart, addToCart, updateQuantity, totalPrice, totalItems, clearCart } =
    useCart();
  const [showCartPanel, setShowCartPanel] = useState(false);
  const [showOrdersPanel, setShowOrdersPanel] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerOrders, setCustomerOrders] = useState(initialOrders);

  // Poll for new orders every 15 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const { getCustomerOrders } = await import("@/app/actions/order");
        const result = await getCustomerOrders(tableId);
        if (result.success && result.orders) {
          setCustomerOrders(result.orders);
        }
      } catch (error) {
        console.error("Failed to poll orders:", error);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [tableId]);

  // Updated filtering logic
  const filteredItems = (() => {
    let items: any[] = [];
    
    if (activeCategory === null) {
      // Show ALL items from all categories
      items = initialCategories.flatMap(cat => cat.menuItems);
    } else {
      // Show items for selected category
      items = initialCategories.find(cat => cat.id === activeCategory)?.menuItems || [];
    }

    // Apply search filter
    if (search.trim()) {
      items = items.filter(item => 
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    return items;
  })();

  const handleOrder = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);

    try {
      const { createOrder, getCustomerOrders } = await import("@/app/actions/order");
      const result = await createOrder(tableId, cart);

      if (result.success) {
        clearCart();
        setShowCartPanel(false);
        // Refresh orders immediately
        const orderResult = await getCustomerOrders(tableId);
        if (orderResult.success && orderResult.orders) {
          setCustomerOrders(orderResult.orders);
        }
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
    <div className="space-y-8 pb-32">
      {/* Sticky Top Section: Search & Categories */}
      <div className="sticky top-[81px] z-30 -mx-6 px-6 py-2 bg-[#f8fafc]/95 backdrop-blur-md border-b border-slate-200/40">
        <div className="space-y-4 py-2">
          {/* Header and Search */}
          <div className="flex items-center gap-4">
            <div className="relative group flex-1">
              <Search className="absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
              <input
                type="text"
                placeholder="ابحث عن وجبتك المفضلة..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-[24px] border-none bg-white px-14 py-4 text-base font-medium shadow-sm outline-none ring-1 ring-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute left-5 top-1/2 h-8 w-8 -translate-y-1/2 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Categories Scroll */}
          <div className="no-scrollbar -mx-2 flex gap-2 overflow-x-auto px-2 pb-1">
            {/* "All" Button */}
            <button
              onClick={() => setActiveCategory(null)}
              className={`whitespace-nowrap rounded-2xl px-5 py-3 text-xs font-black transition-all duration-300 ${
                activeCategory === null
                  ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20 scale-105"
                  : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-100"
              }`}
            >
              الكل
            </button>

            {initialCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`whitespace-nowrap rounded-2xl px-5 py-3 text-xs font-black transition-all duration-300 ${
                  activeCategory === category.id
                    ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20 scale-105"
                    : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-100"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="grid gap-6">
        {filteredItems.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item: any) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={item.id}
                className="group relative flex overflow-hidden rounded-[32px] border border-slate-100 bg-white p-3 shadow-sm transition-all hover:shadow-xl hover:shadow-slate-200/50"
              >
                <div className="relative h-28 w-28 overflow-hidden rounded-[24px] bg-slate-100 flex-shrink-0">
                  <img
                    src={item.image_url || "/placeholder-menu.jpg"}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e: any) => {
                      e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80";
                    }}
                  />
                </div>

                <div className="flex flex-1 flex-col justify-between py-1 pr-4 pl-2">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 group-hover:text-amber-600 transition-colors">
                      {search && item.name.toLowerCase().includes(search.toLowerCase()) 
                        ? item.name.split(new RegExp(`(${search})`, 'gi')).map((part: string, i: number) => 
                            part.toLowerCase() === search.toLowerCase() ? <mark key={i} className="bg-amber-200 rounded text-slate-900">{part}</mark> : part
                          )
                        : item.name}
                    </h3>
                    <p className="mt-0.5 line-clamp-2 text-xs font-bold text-slate-400">
                      {item.description}
                    </p>
                  </div>

                    <div className="flex items-center justify-between">
                    <div className="flex flex-col items-start gap-1">
                      {item.discountPercentage && (
                        <span className="text-[10px] font-bold text-slate-400 line-through leading-none">
                          {formatCurrency(item.originalPrice, currency)}
                        </span>
                      )}
                      <span className="text-lg font-black text-slate-900 leading-none">
                        {formatCurrency(item.price, currency)}
                      </span>
                    </div>

                    <button
                      onClick={() => addToCart(item)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-md active:scale-90 transition-transform"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center mb-4">
              <ShoppingBag className="h-10 w-10 text-slate-200" />
            </div>
            <h3 className="text-xl font-black text-slate-900">لا توجد وجبات حالياً</h3>
            <p className="text-slate-400 font-bold mt-2">القائمة ستكون متاحة قريباً، شكراً لصبركم.</p>
          </div>
        )}
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed inset-x-6 bottom-[108px] z-[100] flex items-center justify-between pointer-events-none">
        {/* My Orders Pill */}
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="pointer-events-auto"
        >
          <button
            onClick={() => setShowOrdersPanel(true)}
            className="relative flex h-[58px] items-center gap-3 rounded-full bg-white px-6 font-black text-slate-700 shadow-xl shadow-slate-200/50 ring-1 ring-slate-200/60 hover:bg-slate-50 transition-all active:scale-95"
          >
            <span className="text-[15px]">طلباتي</span>
            <UtensilsCrossed className="h-5 w-5 text-slate-600" />
            
            {customerOrders.some(o => ["Pending", "Preparing", "Ready"].includes(o.status)) && (
              <span className="absolute -top-1 -right-1 flex h-6 w-6">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-6 w-6 bg-rose-500 border-[3px] border-white shadow-sm"></span>
              </span>
            )}
          </button>
        </motion.div>

        {/* Floating Cart Pill */}
        <AnimatePresence>
          {totalItems > 0 && (
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              className="pointer-events-auto"
            >
              <button
                onClick={() => setShowCartPanel(true)}
                className="flex h-[58px] items-center gap-4 rounded-full bg-slate-900 pl-2 pr-6 text-white shadow-2xl shadow-slate-900/30 ring-4 ring-white transition-all active:scale-95"
              >
                <div className="flex flex-col items-end">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-0.5">
                    السلة
                  </p>
                  <p className="text-sm font-black leading-none">
                    {formatCurrency(totalPrice, currency)}
                  </p>
                </div>
                <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white/10 backdrop-blur-md">
                  <ShoppingBag className="h-5 w-5" />
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-black border-2 border-slate-900">
                    {totalItems}
                  </span>
                </div>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Cart Panel (Modal) */}
      <AnimatePresence>
        {showCartPanel && (
          <div className="fixed inset-0 z-[200]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCartPanel(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute inset-x-0 bottom-0 max-h-[90vh] rounded-t-[40px] bg-white p-8 shadow-2xl"
            >
              <div className="mb-8 flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-900">سلة طلباتك</h2>
                <button
                  onClick={() => setShowCartPanel(false)}
                  className="rounded-full bg-slate-100 p-3 text-slate-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="no-scrollbar max-h-[50vh] space-y-4 overflow-y-auto pb-4">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 rounded-3xl bg-slate-50 p-4"
                  >
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="h-16 w-16 rounded-2xl object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-black text-slate-900">{item.name}</h4>
                      <p className="text-sm font-bold text-slate-500">
                        {formatCurrency(item.price, currency)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 bg-white rounded-2xl p-1.5 shadow-sm">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="h-8 w-8 text-slate-400 hover:text-slate-900 transition-colors"
                      >
                        <Minus className="h-4 w-4 mx-auto" strokeWidth={3} />
                      </button>
                      <span className="w-4 text-center font-black text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="h-8 w-8 text-slate-400 hover:text-slate-900 transition-colors"
                      >
                        <Plus className="h-4 w-4 mx-auto" strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2 text-slate-500 font-bold text-sm">
                    <span>المجموع الفرعي</span>
                    <span>{formatCurrency(totalPrice, currency)}</span>
                  </div>
                  {Number(taxRate) > 0 && (
                    <div className="flex items-center justify-between px-2 text-slate-500 font-bold text-sm">
                      <span>الضريبة ({taxRate}%)</span>
                      <span>{formatCurrency(totalPrice * (Number(taxRate) / 100), currency)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between px-2 border-t border-slate-100 pt-4">
                    <span className="text-lg font-bold text-slate-500">
                      الإجمالي النهائي
                    </span>
                    <span className="text-3xl font-black text-slate-900">
                      {formatCurrency(totalPrice * (1 + (Number(taxRate) / 100)), currency)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleOrder}
                  disabled={isSubmitting}
                  className="premium-button w-full h-18 text-xl disabled:opacity-50"
                >
                  {isSubmitting ? "جاري إرسال الطلب..." : "تأكيد وإرسال الطلب"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Orders Status Panel (Modal) */}
      <AnimatePresence>
        {showOrdersPanel && (
          <div className="fixed inset-0 z-[200]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowOrdersPanel(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute inset-x-0 bottom-0 max-h-[90vh] rounded-t-[40px] bg-white p-8 shadow-2xl flex flex-col"
            >
              <div className="mb-8 flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                  <UtensilsCrossed className="h-6 w-6 text-slate-500" />
                  حالة الطلبات
                </h2>
                <button
                  onClick={() => setShowOrdersPanel(false)}
                  className="rounded-full bg-slate-100 p-3 text-slate-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="no-scrollbar flex-1 overflow-y-auto space-y-4 pb-4">
                {customerOrders.map((order) => (
                  <div key={order.id} className="rounded-3xl border border-slate-100 bg-white shadow-sm p-5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(order.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      
                      {/* Status Badge */}
                      <div className={cn(
                        "px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5",
                        order.status === "Pending" ? "bg-amber-100 text-amber-600" : 
                        order.status === "Preparing" ? "bg-rose-100 text-rose-600" : 
                        order.status === "Ready" ? "bg-emerald-100 text-emerald-600 border border-emerald-200" :
                        order.status === "Served" ? "bg-slate-100 text-slate-600" : "bg-red-100 text-red-600"
                      )}>
                        {order.status === "Pending" && <Clock className="h-3.5 w-3.5" />}
                        {order.status === "Preparing" && <Flame className="h-3.5 w-3.5" />}
                        {order.status === "Ready" && <CheckCircle2 className="h-4 w-4" />}
                        
                        {order.status === "Pending" ? "بانتظار التأكيد" : 
                         order.status === "Preparing" ? "قيد التحضير الطاهي" : 
                         order.status === "Ready" ? "جاهز، في الطريق إليك!" : 
                         order.status === "Served" ? "تم التقديم" : "ملغى"}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {order.items.map((item: any) => (
                        <div key={item.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-xs font-black text-slate-600">
                              {item.quantity}
                            </span>
                            <span className="font-bold text-slate-700">
                                {item.item_name || item.menuItem?.name || "صنف غير معروف"}
                            </span>
                          </div>
                          <span className="font-black text-slate-900">
                            {formatCurrency(item.price_at_time * item.quantity, currency)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                {customerOrders.length === 0 && (
                  <div className="text-center py-10 text-slate-400 font-bold">
                    لا يوجد طلبات سابقة.
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
