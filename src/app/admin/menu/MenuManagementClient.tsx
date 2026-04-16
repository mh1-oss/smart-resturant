"use client";

import { useState } from "react";
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  PlusCircle,
  Shapes,
  LayoutList,
  ChevronRight,
  Eye,
  EyeOff,
  X,
  Loader2
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { createCategory, deleteCategory, updateCategory, createMenuItem, deleteMenuItem } from "@/app/actions/menu";

export default function MenuManagementClient({ initialCategories, currency }: { initialCategories: any[], currency: string }) {
  const [categories, setCategories] = useState(initialCategories);
  const [activeTab, setActiveTab] = useState(initialCategories[0]?.id || null);
  const [search, setSearch] = useState("");
  
  // Modal States
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isEditItemModalOpen, setIsEditItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  // Custom Dialog States to replace prompt/confirm
  const [editingCatId, setEditingCatId] = useState<number | null>(null);
  const [editingCatName, setEditingCatName] = useState("");
  const [confirmDeleteCatId, setConfirmDeleteCatId] = useState<number | null>(null);
  const [confirmDeleteItemId, setConfirmDeleteItemId] = useState<number | null>(null);
  
  const [loading, setLoading] = useState(false);

  const activeCategory = categories.find(c => c.id === activeTab);
  const filteredItems = activeCategory?.menuItems.filter((item: any) => 
    item.name.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const handleAddCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    
    const result = await createCategory(name);
    if (result.success) {
      window.location.reload();
    }
    setLoading(false);
  };

  const handleAddItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const data = {
      category_id: activeTab,
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: parseFloat(formData.get("price") as string),
      cost_price: parseFloat(formData.get("cost_price") as string) || 0,
      image_url: formData.get("image_url") as string || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80",
    };

    const result = await createMenuItem(data);
    if (result.success) {
      window.location.reload();
    }
    setLoading(false);
  };

  const handleUpdateItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingItem) return;
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: parseFloat(formData.get("price") as string),
      cost_price: parseFloat(formData.get("cost_price") as string) || 0,
      image_url: formData.get("image_url") as string,
    };

    const result = await (await import("@/app/actions/menu")).updateMenuItem(editingItem.id, data);
    if (result.success) {
      window.location.reload();
    }
    setLoading(false);
  };

  const openDeleteMenuItem = (id: number) => {
    setConfirmDeleteItemId(id);
  };

  const submitDeleteMenuItem = async () => {
    if (!confirmDeleteItemId) return;
    const id = confirmDeleteItemId;
    setConfirmDeleteItemId(null);
    
    // Optimistic / Local update
    const previousCategories = [...categories];
    setCategories(prev => prev.map(cat => ({
        ...cat,
        menuItems: cat.menuItems.filter((item: any) => item.id !== id)
    })));

    const result = await deleteMenuItem(id);
    if (!result.success) {
        setCategories(previousCategories);
        alert(result.error || "فشل في حذف الوجبة");
    }
  };

  const openEditCategory = (id: number, currentName: string) => {
    setEditingCatId(id);
    setEditingCatName(currentName);
  };

  const submitEditCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingCatId || !editingCatName) return;
    setLoading(true);
    const id = editingCatId;
    const newName = editingCatName;

    // Optimistic update
    const previousCategories = [...categories];
    setCategories(prev => prev.map(cat => cat.id === id ? { ...cat, name: newName } : cat));
    
    setEditingCatId(null);
    setLoading(false);

    const result = await updateCategory(id, newName);
    if (!result.success) {
        setCategories(previousCategories);
        alert(result.error);
    }
  };

  const openDeleteCategory = (id: number) => {
    setConfirmDeleteCatId(id);
  };

  const submitDeleteCategory = async () => {
    if (!confirmDeleteCatId) return;
    const id = confirmDeleteCatId;
    setConfirmDeleteCatId(null);
    
    const previousCategories = [...categories];
    setCategories(prev => prev.filter(cat => cat.id !== id));
    if (activeTab === id) setActiveTab(null);

    const result = await deleteCategory(id);
    if (!result.success) {
        setCategories(previousCategories);
        if (activeTab === null) setActiveTab(id);
        alert(result.error || "فشل في حذف التصنيف");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 text-clip">
          {categories.map((cat) => (
            <div key={cat.id} className="relative group/cat">
                <button
                onClick={() => setActiveTab(cat.id)}
                className={cn(
                    "rounded-2xl px-5 py-3 text-sm font-black transition-all duration-300 flex items-center gap-2",
                    activeTab === cat.id
                    ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10"
                    : "bg-white text-slate-500 hover:bg-slate-100 border border-slate-200/60"
                )}
                >
                <Shapes className="h-4 w-4" />
                {cat.name}
                <span className="bg-slate-400/20 px-2 py-0.5 rounded-lg text-[10px] ml-1">
                    {cat.menuItems.length}
                </span>
                </button>
                {activeTab === cat.id && (
                    <div className="absolute -top-2 -left-2 flex gap-1 opacity-0 group-hover/cat:opacity-100 transition-opacity">
                        <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditCategory(cat.id, cat.name);
                            }}
                            className="h-6 w-6 flex items-center justify-center rounded-full text-white bg-blue-500 hover:bg-blue-600 shadow-sm transition-colors"
                            title="تعديل الاسم"
                        >
                            <Edit3 size={10} />
                        </button>
                        <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              openDeleteCategory(cat.id);
                            }}
                            className="h-6 w-6 flex items-center justify-center rounded-full text-white bg-rose-500 hover:bg-rose-600 shadow-sm transition-colors"
                            title="حذف التصنيف"
                        >
                            <Trash2 size={10} />
                        </button>
                    </div>
                )}
            </div>
          ))}
          <button 
            onClick={() => setIsCatModalOpen(true)}
            className="rounded-2xl border-2 border-dashed border-slate-200 px-5 py-3 text-sm font-black text-slate-400 hover:border-slate-900 hover:text-slate-900 transition-all"
          >
            <Plus className="h-4 w-4 inline ml-2" />
            إضافة تصنيف
          </button>
        </div>

        {/* Search & Action */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ابحث في هذا التصنيف..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 w-[240px] rounded-2xl border border-slate-200 bg-white pr-10 pl-4 text-sm font-bold outline-none focus:ring-2 focus:ring-slate-900/5 transition-all"
            />
          </div>
          <button 
            onClick={() => setIsItemModalOpen(true)}
            disabled={!activeTab}
            className="flex h-12 shrink-0 whitespace-nowrap items-center gap-2 rounded-2xl bg-slate-900 px-6 text-sm font-black text-white shadow-lg shadow-slate-900/10 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
          >
            <PlusCircle className="h-5 w-5" />
            إضافة وجبة جديدة
          </button>
        </div>
      </div>

      {/* Items Table/List */}
      <div className="surface-card !p-0 overflow-hidden border-slate-200/60">
        <table className="w-full text-right">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-5 text-sm font-black text-slate-400">الوجبة</th>
              <th className="px-6 py-5 text-sm font-black text-slate-400 text-center">التكلفة</th>
              <th className="px-6 py-5 text-sm font-black text-slate-400 text-center">السعر</th>
              <th className="px-6 py-5 text-sm font-black text-slate-400 text-center">الحالة</th>
              <th className="px-6 py-5 text-sm font-black text-slate-400">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredItems.map((item: any) => (
              <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200/60 font-sans flex items-center justify-center text-[10px] text-slate-400">
                      {item.image_url ? (
                           <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                      ) : "IMG"}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900">{item.name}</h4>
                      <p className="max-w-[300px] truncate text-xs font-bold text-slate-400">{item.description}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex justify-center">
                    <span className="rounded-xl bg-slate-50 px-3 py-1.5 text-sm font-black text-slate-400 border border-slate-100">
                      {formatCurrency(item.cost_price || 0, currency)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex justify-center">
                    <span className="rounded-xl bg-amber-50 px-3 py-1.5 text-sm font-black text-amber-600 ring-1 ring-amber-100">
                      {formatCurrency(item.price, currency)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5 text-center">
                  <button className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-600 ring-1 ring-emerald-100">
                    <Eye className="h-3.5 w-3.5" />
                    متاح
                  </button>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2 transition-opacity">
                    <button 
                      onClick={() => {
                        setEditingItem(item);
                        setIsEditItemModalOpen(true);
                      }}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-900 transition-all shadow-sm"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                      <button 
                        onClick={() => openDeleteMenuItem(item.id)}
                        title="حذف"
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-rose-300 hover:text-rose-600 transition-all shadow-sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredItems.length === 0 && (
              <tr>
                <td colSpan={4} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-3 text-slate-300">
                    <LayoutList className="h-16 w-16 opacity-20" />
                    <p className="text-sm font-black">لا يوجد وجبات حالياً في هذا التصنيف</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Category Modal */}
      {isCatModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6">
          <div className="w-full max-w-md surface-card p-10 relative animate-in zoom-in-95">
            <button onClick={() => setIsCatModalOpen(false)} className="absolute left-6 top-8 text-slate-400"><X /></button>
            <h2 className="text-xl font-black mb-8">إضافة تصنيف جديد</h2>
            <form onSubmit={handleAddCategory} className="space-y-6">
                <input name="name" placeholder="اسم التصنيف (مثلاً: المشويات)" className="w-full h-14 rounded-2xl border-slate-200 bg-slate-50 px-5 font-bold outline-none" required />
                <button type="submit" disabled={loading} className="premium-button w-full h-16 bg-slate-900 text-white">
                    {loading ? <Loader2 className="animate-spin" /> : "إضافة التصنيف"}
                </button>
            </form>
          </div>
        </div>
      )}

      {/* Item Modal */}
      {isItemModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6">
          <div className="w-full max-w-lg surface-card p-10 relative animate-in zoom-in-95">
            <button onClick={() => setIsItemModalOpen(false)} className="absolute left-6 top-8 text-slate-400"><X /></button>
            <h2 className="text-xl font-black mb-8">إضافة وجبة لـ {activeCategory?.name}</h2>
            <form onSubmit={handleAddItem} className="space-y-4">
                <input name="name" placeholder="اسم الوجبة" className="w-full h-14 rounded-2xl border-slate-200 bg-slate-50 px-5 font-bold outline-none" required />
                <textarea name="description" placeholder="الوصف" className="w-full h-24 rounded-2xl border-slate-200 bg-slate-50 p-5 font-bold outline-none resize-none" required />
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 mr-2">سعر البيع</label>
                        <input name="price" type="number" step="0.01" placeholder="مثلاً: 12.50" className="w-full h-14 rounded-2xl border-slate-200 bg-slate-50 px-5 font-bold outline-none" required />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 mr-2">سعر التكلفة</label>
                        <input name="cost_price" type="number" step="0.01" placeholder="مثلاً: 8.00" className="w-full h-14 rounded-2xl border-slate-200 bg-slate-50 px-5 font-bold outline-none" required />
                    </div>
                </div>
                <input name="image_url" placeholder="رابط الصورة (اختياري)" className="w-full h-14 rounded-2xl border-slate-200 bg-slate-50 px-5 font-bold outline-none" />
                <button type="submit" disabled={loading} className="premium-button w-full h-16 bg-slate-900 text-white">
                    {loading ? <Loader2 className="animate-spin" /> : "إضافة الوجبة"}
                </button>
            </form>
          </div>
        </div>
      )}
      {/* Edit Item Modal */}
      {isEditItemModalOpen && editingItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6">
          <div className="w-full max-w-lg surface-card p-10 relative animate-in zoom-in-95">
            <button onClick={() => setIsEditItemModalOpen(false)} className="absolute left-6 top-8 text-slate-400"><X /></button>
            <h2 className="text-xl font-black mb-8">تعديل وجبة: {editingItem.name}</h2>
            <form onSubmit={handleUpdateItem} className="space-y-4">
                <input name="name" defaultValue={editingItem.name} placeholder="اسم الوجبة" className="w-full h-14 rounded-2xl border-slate-200 bg-slate-50 px-5 font-bold outline-none" required />
                <textarea name="description" defaultValue={editingItem.description} placeholder="الوصف" className="w-full h-24 rounded-2xl border-slate-200 bg-slate-50 p-5 font-bold outline-none resize-none" required />
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 mr-2">سعر البيع</label>
                        <input name="price" type="number" step="0.01" defaultValue={editingItem.price} placeholder="مثلاً: 12.50" className="w-full h-14 rounded-2xl border-slate-200 bg-slate-50 px-5 font-bold outline-none" required />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 mr-2">سعر التكلفة</label>
                        <input name="cost_price" type="number" step="0.01" defaultValue={editingItem.cost_price} placeholder="مثلاً: 8.00" className="w-full h-14 rounded-2xl border-slate-200 bg-slate-50 px-5 font-bold outline-none" required />
                    </div>
                </div>
                <input name="image_url" defaultValue={editingItem.image_url} placeholder="رابط الصورة (اختياري)" className="w-full h-14 rounded-2xl border-slate-200 bg-slate-50 px-5 font-bold outline-none" />
                <button type="submit" disabled={loading} className="premium-button w-full h-16 bg-slate-900 text-white">
                    {loading ? <Loader2 className="animate-spin" /> : "حفظ التعديلات"}
                </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {editingCatId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6">
          <div className="w-full max-w-sm surface-card p-8 relative animate-in zoom-in-95">
            <button onClick={() => setEditingCatId(null)} className="absolute left-6 top-8 text-slate-400"><X /></button>
            <h2 className="text-xl font-black mb-6">تعديل التصنيف</h2>
            <form onSubmit={submitEditCategory} className="space-y-4">
                <input 
                    value={editingCatName}
                    onChange={(e) => setEditingCatName(e.target.value)}
                    placeholder="اسم التصنيف" 
                    className="w-full h-14 rounded-2xl border-slate-200 bg-slate-50 px-5 font-bold outline-none" 
                    required 
                    autoFocus
                />
                <button type="submit" disabled={loading} className="premium-button w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold">
                    {loading ? <Loader2 className="animate-spin relative top-1 m-auto" /> : "حفظ التغييرات"}
                </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Item Confirm Modal */}
      {confirmDeleteItemId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6">
          <div className="w-full max-w-sm surface-card p-8 text-center animate-in zoom-in-95">
            <div className="mx-auto w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black mb-2">تأكيد الحذف</h2>
            <p className="text-slate-500 mb-8 font-medium">هل أنت متأكد من حذف هذه الوجبة نهائياً؟ سيتم إزالتها أيضاً من سجلات الطلبات السابقة.</p>
            <div className="flex gap-3">
                <button onClick={() => setConfirmDeleteItemId(null)} className="flex-1 h-12 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                    إلغاء
                </button>
                <button onClick={submitDeleteMenuItem} className="flex-1 h-12 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors">
                    حذف الوجبة
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Category Confirm Modal */}
      {confirmDeleteCatId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6">
          <div className="w-full max-w-sm surface-card p-8 text-center animate-in zoom-in-95 border border-rose-100">
            <div className="mx-auto w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black mb-2 text-rose-600">تحذير بالغ الأهمية</h2>
            <p className="text-slate-500 mb-8 font-medium">سيؤدي هذا إلى <strong className="text-rose-500 font-black">حذف التصنيف وجميع الوجبات</strong> بداخله نهائياً شاملة السجلات السابقة. هل أنت متأكد من استكمال هذه العملية؟</p>
            <div className="flex gap-3">
                <button onClick={() => setConfirmDeleteCatId(null)} className="flex-1 h-12 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                    إلغاء
                </button>
                <button onClick={submitDeleteCategory} className="flex-1 h-12 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors">
                    نعم، احذف الكل
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
