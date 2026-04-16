"use client";

import { Star, ShoppingBasket, Tag, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { formatCurrency, cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";

export default function OffersView({ offers, currency }: { offers: any[], currency: string }) {
  const { addToCart } = useCart();

  if (offers.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-white rounded-[40px] border border-dashed border-slate-200"
      >
        <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
          <Star size={40} />
        </div>
        <p className="font-black text-slate-400">لا توجد عروض نشطة حالياً، تابعنا للمزيد!</p>
      </motion.div>
    );
  }

  const handleAddItem = (item: any, discountPercentage: number | null) => {
    const finalPrice = discountPercentage 
      ? Number(item.price) - (Number(item.price) * (discountPercentage / 100))
      : Number(item.price);
    
    addToCart({
      ...item,
      price: finalPrice
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {offers.map((offer) => (
        <motion.div 
          key={offer.id} 
          variants={itemVariants}
          whileHover={{ y: -5 }}
          className="group relative overflow-hidden bg-white rounded-[40px] p-6 shadow-xl shadow-slate-200/40 border border-slate-100 transition-all duration-300"
        >
          {/* Discount Badge */}
          {offer.discount_percentage && (
            <div className="absolute top-6 left-6 z-10 bg-rose-500 text-white px-4 py-1.5 rounded-2xl text-[10px] font-black shadow-lg shadow-rose-500/20 flex items-center gap-1 animate-pulse">
              <Tag size={12} fill="currentColor" />
              <span>%{offer.discount_percentage} خصم</span>
            </div>
          )}

          <div className="relative flex flex-col sm:flex-row gap-6">
            {/* Offer Info */}
            <div className="flex-1 space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                   <h3 className="text-2xl font-black text-slate-900 leading-tight">{offer.title}</h3>
                </div>
                {offer.description && (
                  <p className="font-bold text-slate-400 text-sm">{offer.description}</p>
                )}
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <ShoppingBasket size={14} className="text-slate-300" />
                  الأصناف داخل العرض
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {offer.menuItems.map((item: any) => {
                    const discountedPrice = offer.discount_percentage 
                        ? item.price - (item.price * (offer.discount_percentage / 100))
                        : item.price;

                    return (
                        <div 
                          key={item.id} 
                          className="flex items-center justify-between gap-3 bg-slate-50 p-4 rounded-3xl border border-slate-100 transition-colors group-hover:bg-slate-100/50"
                        >
                          <div className="flex flex-col text-right">
                            <span className="text-xs font-black text-slate-700">{item.name}</span>
                            <div className="flex items-center gap-2">
                                <span className={cn(
                                    "text-[10px] font-bold",
                                    offer.discount_percentage ? "text-slate-300 line-through" : "text-slate-400"
                                )}>
                                    {formatCurrency(item.price, currency)}
                                </span>
                                {offer.discount_percentage && (
                                    <span className="text-xs font-black text-emerald-600">
                                        {formatCurrency(discountedPrice, currency)}
                                    </span>
                                )}
                            </div>
                          </div>
                          <motion.button 
                             whileTap={{ scale: 0.8 }}
                             onClick={() => handleAddItem(item, offer.discount_percentage)}
                             className="h-10 w-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center hover:bg-black transition-colors shadow-lg shadow-slate-900/10"
                          >
                             <Plus size={18} />
                          </motion.button>
                        </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 text-right">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-full">
                      <Star size={14} className="text-amber-500" fill="currentColor" />
                      <span className="text-[10px] font-black text-amber-600 uppercase tracking-wide">متوفر لفترة محدودة</span>
                  </div>
              </div>
            </div>
          </div>

          {/* Background Decoration */}
          <div className="absolute -bottom-12 -right-12 h-64 w-64 rounded-full bg-slate-50 opacity-50 blur-3xl group-hover:bg-amber-50 group-hover:opacity-80 transition-all duration-500" />
        </motion.div>
      ))}
    </motion.div>
  );
}
