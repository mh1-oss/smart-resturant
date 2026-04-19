"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { Search, Plus, X, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency, cn } from "@/lib/utils";

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

  const filteredItems = (() => {
    let items: any[] = [];
    if (activeCategory === null) {
      items = initialCategories.flatMap(cat => cat.menuItems);
    } else {
      items = initialCategories.find(cat => cat.id === activeCategory)?.menuItems || [];
    }
    if (search.trim()) {
      items = items.filter(item => 
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase())
      );
    }
    return items;
  })();

  return (
    <div className="pb-32">
      {/* Search & Categories Bar */}
      <div className="sticky top-[72px] z-30 w-full bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="mx-auto max-w-3xl px-6 py-4 space-y-4">
          <div className="relative">
            <Search className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ابحث عن وجبتك..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border-none bg-slate-100/50 px-12 py-3 text-sm font-bold outline-none ring-1 ring-slate-200/30 focus:ring-slate-900/10 transition-all text-right"
            />
          </div>

          <div className="no-scrollbar flex items-center gap-6 overflow-x-auto">
            <button
              onClick={() => setActiveCategory(null)}
              className={cn(
                "whitespace-nowrap pb-2 text-sm font-black transition-all border-b-2",
                activeCategory === null
                  ? "text-slate-900 border-slate-900"
                  : "text-slate-400 border-transparent hover:text-slate-600"
              )}
            >
              الكل
            </button>

            {initialCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={cn(
                  "whitespace-nowrap pb-2 text-sm font-black transition-all border-b-2",
                  activeCategory === category.id
                    ? "text-slate-900 border-slate-900"
                    : "text-slate-400 border-transparent hover:text-slate-600"
                )}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="mx-auto max-w-3xl px-6 mt-8">
        <div className="grid gap-4">
          {filteredItems.length > 0 ? (
              filteredItems.map((item: any) => (
                <div
                  key={item.id}
                  className="group relative flex overflow-hidden rounded-[32px] border border-slate-100 bg-white p-3 shadow-sm transition-all hover:shadow-xl hover:shadow-slate-200/40"
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
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-col items-start gap-0">
                        {item.discountPercentage && (
                          <span className="text-[10px] font-bold text-slate-300 line-through">
                            {formatCurrency(item.originalPrice, currency)}
                          </span>
                        )}
                        <span className="text-lg font-black text-slate-900">
                          {formatCurrency(item.price, currency)}
                        </span>
                      </div>

                      <button
                        onClick={() => addToCart(item)}
                        className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg active:scale-95 transition-all"
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                <ShoppingBag className="h-10 w-10 text-slate-200" />
              </div>
              <h3 className="text-xl font-black text-slate-900">لا توجد وجبات حالياً</h3>
              <p className="text-slate-400 font-bold mt-2">جرب البحث بشكل آخر</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
