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
    <div className="pb-32">
      {/* Sticky Header Section: Unified Piece */}
      <div className="sticky top-[80px] z-30 w-full bg-white/80 backdrop-blur-xl -mt-px">
        <div className="mx-auto max-w-3xl px-6 py-2 space-y-4">
          {/* Subtle Search Bar - Integrated look */}
          <div className="relative group">
            <Search className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ابحث عن وجبتك..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border-none bg-slate-100/50 px-12 py-3 text-sm font-bold shadow-none outline-none ring-1 ring-slate-200/30 placeholder:text-slate-400 focus:bg-slate-100 focus:ring-slate-900/10 transition-all"
            />
          </div>

          {/* Categories Navigation - Tidier and more organized */}
          <div className="no-scrollbar flex items-center gap-3 overflow-x-auto pb-4">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(null)}
              className={cn(
                "whitespace-nowrap px-1 py-1 text-sm font-black transition-all relative",
                activeCategory === null
                  ? "text-slate-900"
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              الكل
              {activeCategory === null && (
                <motion.div layoutId="activeCat" className="absolute -bottom-1 inset-x-0 h-1 rounded-full bg-slate-900" />
              )}
            </motion.button>

            {initialCategories.map((category) => (
              <motion.button
                key={category.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCategory(category.id)}
                className={cn(
                  "whitespace-nowrap px-1 py-1 text-sm font-black transition-all relative",
                  activeCategory === category.id
                    ? "text-slate-900"
                    : "text-slate-400 hover:text-slate-600"
                )}
              >
                {category.name}
                {activeCategory === category.id && (
                  <motion.div layoutId="activeCat" className="absolute -bottom-1 inset-x-0 h-1 rounded-full bg-slate-900" />
                )}
              </motion.button>
            ))}
          </div>
        </div>
        {/* Fine separator line to keep it clean */}
        <div className="h-px w-full bg-slate-100" />
      </div>

      {/* Menu Items Grid - Wrapped in max-width container */}
      <div className="mx-auto max-w-3xl px-6 mt-8">
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
    </div>
  );
}
