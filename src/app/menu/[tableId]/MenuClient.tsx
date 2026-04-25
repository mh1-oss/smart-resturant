"use client";

import { useState, useMemo, useEffect, startTransition } from "react";
import { useCart } from "@/context/CartContext";
import { Search, Plus, ShoppingBag } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function MenuClient({
  initialCategories,
  tableId,
  currency,
  taxRate
}: {
  initialCategories: any[];
  tableId: string;
  currency: string;
  taxRate: string;
}) {
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const { addToCart } = useCart();
  
  // Quick View State
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedVariants, setSelectedVariants] = useState<any[]>([]);
  const [selectedAddOns, setSelectedAddOns] = useState<any[]>([]);
  const [itemNotes, setItemNotes] = useState("");

  useEffect(() => {
    if (tableId && tableId !== 'delivery') {
      import('@/app/actions/order').then((mod) => {
        mod.ensureActiveSession(parseInt(tableId)).catch(console.error);
      });
    }
  }, [tableId]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (selectedItem) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedItem]);

  const filteredItems = useMemo(() => {
    let items: any[] = [];
    if (activeCategory === null) {
      items = initialCategories.flatMap(cat => cat.menuItems);
    } else {
      items = initialCategories.find(cat => cat.id === activeCategory)?.menuItems || [];
    }
    
    // Search filter
    if (search.trim()) {
      const s = search.toLowerCase();
      items = items.filter(item => 
        item.name.toLowerCase().includes(s) ||
        item.description?.toLowerCase().includes(s)
      );
    }
    
    // Alphabetical Sorting
    return [...items].sort((a, b) => a.name.localeCompare(b.name, 'ar'));
  }, [initialCategories, activeCategory, search]);

  const handleOpenItem = (item: any) => {
    setSelectedItem(item);
    // Auto-select lowest price variant if available
    if (item.show_variants && item.variants?.length > 0) {
      const lowestVariant = [...item.variants].sort((a, b) => Number(a.price) - Number(b.price))[0];
      setSelectedVariants([lowestVariant]);
    } else {
      setSelectedVariants([]);
    }
    setSelectedAddOns([]);
    setItemNotes("");
  };

  const handleAddToCartWithSelections = () => {
    addToCart(selectedItem, selectedVariants, selectedAddOns, itemNotes);
    setSelectedItem(null);
  };

  const calculateCurrentPrice = () => {
    if (!selectedItem) return 0;
    
    // Addons are always additive
    const addonsTotal = selectedAddOns.reduce((sum, i) => sum + Number(i.price), 0);
    
    // Variant (size) price replaces the base price if selected
    const basePrice = selectedVariants.length > 0 
      ? Number(selectedVariants[0].price) 
      : Number(selectedItem.price);
      
    return basePrice + addonsTotal;
  };

  return (
    <div>
      {/* Search & Categories Bar */}
      <div className="sticky top-[80px] z-30 w-full bg-white/95 backdrop-blur-xl border-b border-white/50 shadow-sm transition-all duration-300">
        <div className="mx-auto max-w-3xl px-6 py-5 space-y-5">
          <div className="relative group">
            <Search className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-[var(--brand-primary)] transition-colors" />
            <input
              id="menu-search"
              name="search"
              type="text"
              placeholder="ابحث عن وجبتك المفضلة..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border-none bg-slate-50/50 px-12 py-3.5 text-sm font-black outline-none ring-1 ring-slate-200/50 focus:ring-slate-900/10 focus:bg-white transition-all shadow-inner text-right placeholder:text-slate-300"
            />
          </div>

          <div className="no-scrollbar flex items-center gap-7 overflow-x-auto pb-1 scroll-smooth">
            <button
              onClick={() => startTransition(() => setActiveCategory(null))}
              className={cn(
                "relative whitespace-nowrap pb-2 text-[13px] font-black tracking-wide transition-all duration-300",
                activeCategory === null
                  ? "text-slate-900 scale-105"
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              الكل
              {activeCategory === null && (
                <motion.div 
                   layoutId="category-underline"
                   className="absolute bottom-0 inset-x-0 h-1 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.1)]"
                   style={{ backgroundColor: 'var(--brand-primary)' }}
                   transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
            </button>

            {initialCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => startTransition(() => setActiveCategory(category.id))}
                className={cn(
                  "relative whitespace-nowrap pb-2 text-[13px] font-black tracking-wide transition-all duration-300",
                  activeCategory === category.id
                    ? "text-slate-900 scale-105"
                    : "text-slate-400 hover:text-slate-600"
                )}
              >
                {category.name}
                {activeCategory === category.id && (
                  <motion.div 
                    layoutId="category-underline"
                    className="absolute bottom-0 inset-x-0 h-1 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.1)]"
                    style={{ backgroundColor: 'var(--brand-primary)' }}
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="mx-auto max-w-3xl px-6 mt-8 min-h-[80vh]">
        <AnimatePresence mode="wait">
          {filteredItems.length > 0 ? (
            <motion.div
              key={activeCategory ?? 'all'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="grid gap-4 pb-32"
            >
              {filteredItems.map((item: any) => (
                <div
                  key={item.id}
                  onClick={() => handleOpenItem(item)}
                  className="group relative flex overflow-hidden rounded-[32px] border border-slate-100 bg-white p-3 shadow-sm transition-all hover:shadow-xl hover:shadow-slate-200/40 cursor-pointer active:scale-98"
                >
                  <div className="relative h-28 w-28 overflow-hidden rounded-[24px] bg-slate-100 flex-shrink-0">
                    <img
                      src={item.image_url || "/placeholder-menu.jpg"}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e: any) => {
                        e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80";
                      }}
                    />
                  </div>

                  <div className="flex flex-1 flex-col justify-between py-1 pr-4 pl-2 text-right">
                    <div>
                      <h3 className="text-lg font-black text-slate-900 leading-tight">
                        {item.name}
                      </h3>
                      <p className="mt-0.5 line-clamp-2 text-[11px] font-bold text-slate-400">
                        {item.description}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {item.show_variants && item.variants?.length > 0 && (
                          <span className="px-2 py-0.5 rounded-lg bg-indigo-50 text-[9px] font-black text-indigo-500 border border-indigo-100 uppercase tracking-tighter">
                            أحجام متعددة
                          </span>
                        )}
                        {item.show_addons && item.addons?.length > 0 && (
                          <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-[9px] font-black text-emerald-500 border border-emerald-100 uppercase tracking-tighter">
                            إضافات اختيارية
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-col items-start gap-0">
                        {item.discountPercentage && (
                          <span className="text-[10px] font-bold text-slate-300 line-through">
                            {formatCurrency(item.originalPrice, currency)}
                          </span>
                        )}
                        <span className="text-lg font-black text-slate-900">
                          {item.show_variants && item.variants?.length > 0 
                            ? formatCurrency(Math.min(Number(item.price), ...item.variants.map((v:any) => Number(v.price))), currency)
                            : formatCurrency(item.price, currency)
                          }
                        </span>
                      </div>

                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-lg transition-all"
                        style={{ backgroundColor: 'var(--brand-primary)' }}
                      >
                        <Plus className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                <ShoppingBag className="h-10 w-10 text-slate-200" />
              </div>
              <h3 className="text-xl font-black text-slate-900">لا توجد وجبات حالياً</h3>
              <p className="text-slate-400 font-bold mt-2">جرب البحث بشكل آخر</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Item Quick View Modal */}
      <AnimatePresence>
        {selectedItem && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-[101] max-w-lg mx-auto bg-white rounded-t-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="relative h-64 overflow-hidden shrink-0">
                <img 
                  src={selectedItem.image_url || "/placeholder-menu.jpg"} 
                  className="w-full h-full object-cover"
                />
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-6 left-6 h-12 w-12 rounded-full bg-white/20 backdrop-blur-xl border border-white/20 text-white flex items-center justify-center"
                >
                  <Plus className="rotate-45" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar text-right">
                <h2 className="text-2xl font-black text-slate-900">{selectedItem.name}</h2>
                <p className="text-sm font-bold text-slate-400 mt-2 leading-relaxed">{selectedItem.description}</p>

                {/* Variants Section */}
                {selectedItem.show_variants && selectedItem.variants?.length > 0 && (
                  <div className="mt-8 space-y-4">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">اختر الحجم</h4>
                    <div className="grid grid-cols-2 gap-3">
                        {selectedItem.variants.map((v: any) => {
                          return (
                            <button
                              key={v.id}
                              onClick={() => setSelectedVariants([v])}
                              className={cn(
                                "p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-1",
                                selectedVariants.some(sv => sv.id === v.id) 
                                  ? "bg-slate-900 border-slate-900 text-white shadow-xl" 
                                  : "bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100"
                              )}
                            >
                              <span className="text-xs font-black">{v.name}</span>
                              <span className="text-[10px] opacity-70">
                                {formatCurrency(v.price, currency)}
                              </span>
                            </button>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Add-ons Section */}
                {selectedItem.show_addons && selectedItem.addons?.length > 0 && (
                  <div className="mt-8 space-y-4">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">إضافات اختيارية</h4>
                    <div className="space-y-3">
                      {selectedItem.addons.map((a: any) => (
                        <button
                          key={a.id}
                          onClick={() => {
                            if (selectedAddOns.some(sa => sa.id === a.id)) {
                              setSelectedAddOns(selectedAddOns.filter(x => x.id !== a.id));
                            } else {
                              setSelectedAddOns([...selectedAddOns, a]);
                            }
                          }}
                          className={cn(
                            "w-full p-5 rounded-[1.5rem] border-2 transition-all flex items-center justify-between",
                            selectedAddOns.some(sa => sa.id === a.id)
                              ? "bg-emerald-50 border-emerald-500 text-emerald-900 shadow-sm"
                              : "bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100"
                          )}
                        >
                          <span className="text-xs font-black">+{formatCurrency(a.price, currency)}</span>
                          <span className="text-sm font-bold">{a.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes Section */}
                {selectedItem.show_notes && (
                  <div className="mt-8 space-y-4">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">ملاحظات خاصة</h4>
                    <textarea 
                      placeholder="هل تود إضافة أو إزالة شيء معين؟"
                      value={itemNotes}
                      onChange={(e) => setItemNotes(e.target.value)}
                      className="w-full h-32 bg-slate-50 border-none rounded-3xl p-5 text-sm font-bold text-slate-900 focus:ring-1 focus:ring-slate-900 outline-none resize-none"
                    />
                  </div>
                )}
              </div>

              <div className="p-8 bg-white border-t border-slate-50 shrink-0">
                <button 
                  onClick={handleAddToCartWithSelections}
                  className="w-full h-18 rounded-[1.8rem] text-white font-black text-lg flex items-center justify-between px-8 shadow-2xl transition-all active:scale-95"
                  style={{ backgroundColor: 'var(--brand-primary)' }}
                >
                  <span className="text-xl">{formatCurrency(calculateCurrentPrice(), currency)}</span>
                  <div className="flex items-center gap-3">
                    <span>إضافة إلى السلة</span>
                    <Plus size={20} />
                  </div>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
