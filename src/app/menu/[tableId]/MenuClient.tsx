"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { Search, Plus, X, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency, cn } from "@/lib/utils";

export default function MenuClient({
  initialCategories,
  currency,
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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 }
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
                placeholder="ابحث عن وجبتك المفظلة..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-[24px] border-none bg-white px-14 py-4 text-base font-medium shadow-sm outline-none ring-1 ring-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 transition-all font-bold"
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
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(null)}
              className={cn(
                "whitespace-nowrap rounded-2xl px-5 py-3 text-xs font-black transition-all",
                activeCategory === null
                  ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                  : "bg-white text-slate-500 border border-slate-100"
              )}
            >
              الكل
            </motion.button>

            {initialCategories.map((category) => (
              <motion.button
                key={category.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCategory(category.id)}
                className={cn(
                  "whitespace-nowrap rounded-2xl px-5 py-3 text-xs font-black transition-all",
                  activeCategory === category.id
                    ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                    : "bg-white text-slate-500 border border-slate-100"
                )}
              >
                {category.name}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Items Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid gap-4"
      >
        {filteredItems.length > 0 ? (
            filteredItems.map((item: any) => (
              <motion.div
                variants={itemVariants}
                key={item.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
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

                    <motion.button
                      whileTap={{ scale: 0.8 }}
                      onClick={() => addToCart(item)}
                      className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg active:bg-black transition-colors"
                    >
                      <Plus className="h-5 w-5" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
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
      </motion.div>
    </div>
  );
}
