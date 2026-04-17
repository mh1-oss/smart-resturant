"use client";

import { useState } from "react";
import { Plus, Trash2, Power, Star, X, Check, Tag, Clock, Gift, LayoutGrid } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { createOffer, toggleOfferStatus, deleteOffer } from "@/app/actions/offer";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function OffersClient({ 
  initialOffers, 
  menuItems, 
  currency 
}: { 
  initialOffers: any[], 
  menuItems: any[], 
  currency: string 
}) {
  const [offers, setOffers] = useState(initialOffers);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [discount, setDiscount] = useState("");
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      alert("يرجى اختيار صنف واحد على الأقل");
      return;
    }
    setIsSubmitting(true);

    const result = await createOffer({
      title,
      description,
      discount_percentage: discount ? parseInt(discount) : undefined,
      menuItemIds: selectedItems,
    });

    if (result.success) {
      setShowAddModal(false);
      setTitle("");
      setDescription("");
      setDiscount("");
      setSelectedItems([]);
      router.refresh();
      // For local responsiveness
      const newOffer = {
          id: Math.random(), // placeholder
          title,
          description,
          discount_percentage: discount ? parseInt(discount) : null,
          menuItems: menuItems.filter(m => selectedItems.includes(m.id)),
          is_active: true,
          created_at: new Date()
      };
      setOffers(prev => [newOffer, ...prev]);
    } else {
      alert(result.error);
    }
    setIsSubmitting(false);
  };

  const handleToggle = async (id: number, currentStatus: boolean) => {
    // Optimistic update
    setOffers(prev => prev.map(o => o.id === id ? { ...o, is_active: !currentStatus } : o));
    const result = await toggleOfferStatus(id, !currentStatus);
    if (!result.success) {
        setOffers(prev => prev.map(o => o.id === id ? { ...o, is_active: currentStatus } : o));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا العرض؟")) return;
    
    const previousOffers = [...offers];
    setOffers(prev => prev.filter(o => o.id !== id));

    const result = await deleteOffer(id);
    if (!result.success) {
        setOffers(previousOffers);
        alert(result.error || "فشل في حذف العرض");
    }
  };

  return (
    <div className="space-y-12 pb-24">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
           <h1 className="text-4xl font-black text-slate-900 leading-tight">إدارة العروض</h1>
           <p className="font-bold text-slate-400 mt-2">صمم عروضك الترويجية واجذب المزيد من العملاء</p>
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="h-16 px-10 rounded-[1.5rem] bg-slate-900 text-white font-black flex items-center gap-3 shadow-xl shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus size={20} />
          إنشاء عرض جديد
        </button>
      </div>

      {/* Offers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {offers.map((offer) => (
            <motion.div 
              key={offer.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={cn(
                "premium-card p-0 overflow-hidden flex flex-col group transition-all duration-500",
                !offer.is_active && "opacity-60 grayscale-[0.5]"
              )}
            >
              {/* Card Header with Status and Actions */}
              <div className="p-6 bg-slate-50/50 border-b border-slate-50 flex justify-between items-center">
                 <div className={cn(
                    "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2",
                    offer.is_active ? "bg-emerald-100 text-emerald-600" : "bg-slate-200 text-slate-500"
                 )}>
                    <div className={cn("h-2 w-2 rounded-full", offer.is_active ? "bg-emerald-500 animate-pulse" : "bg-slate-400")} />
                    {offer.is_active ? "عرض مفعل" : "متوقف"}
                 </div>
                 <div className="flex gap-2">
                    <button 
                      onClick={() => handleToggle(offer.id, offer.is_active)}
                      className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center transition-all active:scale-90",
                        offer.is_active ? "bg-white text-emerald-600 shadow-sm" : "bg-slate-900 text-white"
                      )}
                    >
                      <Power size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(offer.id)}
                      className="h-10 w-10 rounded-xl bg-white text-rose-600 shadow-sm hover:bg-rose-50 transition-all active:scale-90"
                    >
                      <Trash2 size={18} />
                    </button>
                 </div>
              </div>

              {/* Card Body */}
              <div className="p-8 flex-1 space-y-6">
                 <div className="relative">
                    <div className="h-14 w-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4 transition-transform group-hover:scale-110 group-hover:rotate-6">
                       <Gift size={28} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 leading-tight">{offer.title}</h3>
                    <p className="text-sm font-bold text-slate-400 mt-2 leading-relaxed">{offer.description || "لا يوجد وصف لهذا العرض"}</p>
                 </div>

                 {/* Discount Banner */}
                 {offer.discount_percentage && (
                   <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <Tag size={20} className="text-rose-600" />
                         <span className="text-sm font-black text-rose-900">نسبة الخصم</span>
                      </div>
                      <span className="text-3xl font-black text-rose-600">%{offer.discount_percentage}</span>
                   </div>
                 )}

                 {/* Items */}
                 <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                       <LayoutGrid size={12} />
                       الأصناف المشمولة
                    </p>
                    <div className="flex flex-wrap gap-2">
                       {offer.menuItems.map((item: any) => (
                         <span key={item.id} className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-black text-slate-600">
                            {item.name}
                         </span>
                       ))}
                    </div>
                 </div>
              </div>

              {/* Card Footer */}
              <div className="px-8 py-4 bg-slate-50/30 text-[10px] font-bold text-slate-300 flex items-center justify-between uppercase">
                 <div className="flex items-center gap-1">
                    <Clock size={10} />
                    أضيف منذ: {new Date(offer.created_at).toLocaleDateString('ar-SA')}
                 </div>
                 <span>PRO OFFER V1</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {offers.length === 0 && (
          <div className="col-span-full py-40 text-center bg-white/50 border-2 border-dashed border-slate-200 rounded-[3rem]">
             <Gift size={64} className="mx-auto text-slate-100 mb-6" />
             <h3 className="text-xl font-black text-slate-300">لا توجد عروض ترويجية نشطة</h3>
             <p className="text-slate-400 font-bold mt-2">ابدأ بإنشاء عرضك الأول لزيادة المبيعات</p>
          </div>
        )}
      </div>

      {/* Add Offer Drawer/Modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100]"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="fixed inset-y-0 right-0 z-[101] w-full max-w-[600px] bg-white shadow-2xl overflow-hidden flex flex-col"
            >
               <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                  <div>
                     <h2 className="text-3xl font-black text-slate-900 leading-tight">تصميم عرض جديد</h2>
                     <p className="font-bold text-slate-400 text-sm mt-1">املاً البيانات لتفعيل العرض للزبائن</p>
                  </div>
                  <button 
                    onClick={() => setShowAddModal(false)}
                    className="h-14 w-14 rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-900 flex items-center justify-center transition-all"
                  >
                     <XCircle size={28} strokeWidth={2.5} />
                  </button>
               </div>

               <form onSubmit={handleCreate} className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-10">
                  <div className="space-y-8">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                           <label className="text-xs font-black text-slate-900 uppercase tracking-widest block px-1">عنوان العرض</label>
                           <input
                             type="text"
                             required
                             value={title}
                             onChange={(e) => setTitle(e.target.value)}
                             className="w-full h-16 rounded-2xl bg-slate-50 px-6 font-bold text-slate-700 outline-none ring-2 ring-transparent focus:ring-slate-900 transition-all border border-slate-100"
                             placeholder="مثل: عرض الغداء المميز"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-black text-slate-900 uppercase tracking-widest block px-1">نسبة الخصم (%)</label>
                           <input
                             type="number"
                             value={discount}
                             onChange={(e) => setDiscount(e.target.value)}
                             className="w-full h-16 rounded-2xl bg-slate-50 px-6 font-bold text-slate-700 outline-none ring-2 ring-transparent focus:ring-slate-900 transition-all border border-slate-100"
                             placeholder="مثال: 15"
                           />
                        </div>
                     </div>

                     <div className="space-y-2">
                        <label className="text-xs font-black text-slate-900 uppercase tracking-widest block px-1">وصف العرض</label>
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="w-full h-32 rounded-[1.5rem] bg-slate-50 p-6 font-bold text-slate-700 outline-none ring-2 ring-transparent focus:ring-slate-900 transition-all border border-slate-100 resize-none"
                          placeholder="اشرح للزبائن ما يميز هذا العرض..."
                        />
                     </div>

                     <div className="space-y-4">
                        <label className="text-xs font-black text-slate-900 uppercase tracking-widest block px-1">اختر الأصناف المشمولة</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           {menuItems.map((item) => {
                             const isSelected = selectedItems.includes(item.id);
                             return (
                               <button
                                 key={item.id}
                                 type="button"
                                 onClick={() => {
                                   if (isSelected) {
                                     setSelectedItems(selectedItems.filter(id => id !== item.id));
                                   } else {
                                     setSelectedItems([...selectedItems, item.id]);
                                   }
                                 }}
                                 className={cn(
                                   "flex items-center justify-between p-4 rounded-2xl transition-all border-2 text-right",
                                   isSelected 
                                     ? "bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-900/10" 
                                     : "bg-white border-slate-100 text-slate-600 hover:border-slate-300"
                                 )}
                               >
                                 <div className="flex flex-col">
                                    <span className="text-sm font-black leading-tight">{item.name}</span>
                                    <span className={cn("text-[10px] font-bold mt-1", isSelected ? "text-white/50" : "text-slate-400")}>
                                       {formatCurrency(item.price, currency)}
                                    </span>
                                 </div>
                                 <div className={cn(
                                    "h-6 w-6 rounded-lg flex items-center justify-center transition-all",
                                    isSelected ? "bg-white/20 text-white" : "bg-slate-50 text-slate-200"
                                 )}>
                                    <Check size={14} strokeWidth={3} />
                                 </div>
                               </button>
                             );
                           })}
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center font-bold text-xs text-slate-400">
                           تم اختيار {selectedItems.length} صنف من أصل {menuItems.length}
                        </div>
                     </div>
                  </div>
               </form>

               <div className="p-10 bg-slate-50 border-t border-slate-100 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 h-16 rounded-[1.5rem] bg-white border-2 border-slate-200 font-black text-slate-600 hover:bg-slate-100 transition-all"
                  >
                     إلغاء
                  </button>
                  <button
                    type="submit"
                    onClick={handleCreate}
                    disabled={isSubmitting}
                    className="flex-[2] h-16 rounded-[1.5rem] bg-slate-900 text-white font-black shadow-xl shadow-slate-900/20 hover:bg-black transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isSubmitting ? "جاري الحفظ..." : "تأكيد وإطلاق العرض"}
                  </button>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function XCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  );
}
