"use client";

import { useState } from "react";
import { Plus, Trash2, Power, Star, X, Check, Image as ImageIcon } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { createOffer, toggleOfferStatus, deleteOffer } from "@/app/actions/offer";
import { useRouter } from "next/navigation";

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
    } else {
      alert(result.error);
    }
    setIsSubmitting(false);
  };

  const handleToggle = async (id: number, currentStatus: boolean) => {
    const result = await toggleOfferStatus(id, !currentStatus);
    if (result.success) {
      router.refresh();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا العرض؟")) return;
    
    const previousOffers = [...offers];
    setOffers(prev => prev.filter(o => o.id !== id));

    const result = await deleteOffer(id);
    if (result.success) {
      router.refresh();
    } else {
        setOffers(previousOffers);
        alert(result.error || "فشل في حذف العرض");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-slate-900/20 hover:bg-black transition-all active:scale-95"
        >
          <Plus className="h-5 w-5" />
          إضافة عرض جديد
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialOffers.map((offer) => (
          <div 
            key={offer.id} 
            className={cn(
              "surface-card border-slate-100 p-6 flex flex-col transition-all",
              !offer.is_active && "opacity-60 bg-slate-50 border-dashed"
            )}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
                <Star className="h-6 w-6" fill="currentColor" />
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleToggle(offer.id, offer.is_active)}
                  className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center transition-colors",
                    offer.is_active ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" : "bg-slate-200 text-slate-500 hover:bg-slate-300"
                  )}
                  title={offer.is_active ? "إيقاف العرض" : "تفعيل العرض"}
                >
                  <Power className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => handleDelete(offer.id)}
                  className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1">
              <h3 className="text-xl font-black text-slate-900 mb-1">{offer.title}</h3>
              {offer.description && (
                <p className="text-sm font-bold text-slate-400 mb-4">{offer.description}</p>
              )}
              
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-4">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-2">الأصناف المشمولة</p>
                <div className="flex flex-wrap gap-2">
                  {offer.menuItems.map((item: any) => (
                    <span key={item.id} className="px-3 py-1 bg-white border border-slate-100 rounded-lg text-xs font-bold text-slate-600">
                      {item.name}
                    </span>
                  ))}
                </div>
              </div>

              {offer.discount_percentage && (
                <div className="flex items-center gap-2 text-rose-600 font-black">
                  <span className="text-2xl">%{offer.discount_percentage}</span>
                  <span className="text-xs uppercase tracking-tight">خصم مباشر</span>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <span>تم الإنشاء: {new Date(offer.created_at).toLocaleDateString('ar-SA')}</span>
              <span className={cn(offer.is_active ? "text-emerald-500" : "text-slate-400")}>
                {offer.is_active ? "نشط حالياً" : "متوقف"}
              </span>
            </div>
          </div>
        ))}
        
        {initialOffers.length === 0 && (
          <div className="col-span-full py-20 text-center surface-card border-dashed border-slate-200">
            <p className="font-black text-slate-400">لا توجد عروض حالياً، ابدأ بإضافة عرضك الأول!</p>
          </div>
        )}
      </div>

      {/* Add Offer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-10">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative w-full max-w-2xl overflow-hidden rounded-[40px] bg-white p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900">إضافة عرض جديد</h2>
                <p className="text-sm font-bold text-slate-400">املاً البيانات لتفعيل العرض للزبائن</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="rounded-full bg-slate-50 p-3 text-slate-400 hover:bg-slate-100 transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="mb-2 block text-xs font-black text-slate-900 uppercase tracking-wide">عنوان العرض</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-2xl border-none bg-slate-50 px-5 py-4 text-sm font-bold outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-slate-900 transition-all"
                    placeholder="مثال: خصم نهاية الأسبوع"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-black text-slate-900 uppercase tracking-wide">نسبة الخصم (%)</label>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    className="w-full rounded-2xl border-none bg-slate-50 px-5 py-4 text-sm font-bold outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-slate-900 transition-all"
                    placeholder="مثال: 20"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-black text-slate-900 uppercase tracking-wide">وصف العرض</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full h-24 rounded-2xl border-none bg-slate-50 px-5 py-4 text-sm font-bold outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-slate-900 transition-all resize-none"
                  placeholder="اكتب تفاصيل العرض هنا..."
                />
              </div>

              <div>
                <label className="mb-3 block text-xs font-black text-slate-900 uppercase tracking-wide">اختر الأصناف المشمولة</label>
                <div className="no-scrollbar h-48 overflow-y-auto rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {menuItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        if (selectedItems.includes(item.id)) {
                          setSelectedItems(selectedItems.filter(id => id !== item.id));
                        } else {
                          setSelectedItems([...selectedItems, item.id]);
                        }
                      }}
                      className={cn(
                        "flex items-center justify-between gap-3 p-3 rounded-2xl transition-all border-2",
                        selectedItems.includes(item.id) 
                          ? "bg-white border-slate-900 text-slate-900 shadow-sm" 
                          : "bg-white border-transparent text-slate-400 hover:border-slate-200"
                      )}
                    >
                      <div className="flex flex-col items-start px-1">
                        <span className="text-xs font-black leading-tight text-right">{item.name}</span>
                        <span className="text-[10px] font-bold text-slate-400">{formatCurrency(item.price, currency)}</span>
                      </div>
                      {selectedItems.includes(item.id) ? (
                        <div className="h-5 w-5 rounded-full bg-slate-900 text-white flex items-center justify-center">
                          <Check className="h-3 w-3" strokeWidth={4} />
                        </div>
                      ) : (
                        <div className="h-5 w-5 rounded-full border border-slate-200" />
                      )}
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-[10px] font-bold text-slate-400">لقد اخترت {selectedItems.length} أصناف</p>
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 rounded-2xl bg-slate-100 py-4 text-sm font-black text-slate-600 hover:bg-slate-200 transition-all"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-[2] rounded-2xl bg-slate-900 py-4 text-sm font-black text-white shadow-xl shadow-slate-900/20 hover:bg-black transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? "جاري الحفظ..." : "تأكيد وإضافة العرض"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
