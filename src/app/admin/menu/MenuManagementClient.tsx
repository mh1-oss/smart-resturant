"use client";

import { useState, useMemo } from "react";
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  PlusCircle,
  Shapes,
  X,
  Loader2,
  Image as ImageIcon,
  DollarSign,
  TrendingUp,
  Package,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
  ArrowRight
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { createCategory, deleteCategory, updateCategory, createMenuItem, deleteMenuItem, updateMenuItem } from "@/app/actions/menu";
import { motion, AnimatePresence } from "framer-motion";

export default function MenuManagementClient({ initialCategories, currency }: { initialCategories: any[], currency: string }) {
  const [categories, setCategories] = useState(initialCategories);
  const [activeTab, setActiveTab] = useState(initialCategories[0]?.id || null);
  const [search, setSearch] = useState("");
  
  // Drawer/Modal States
  const [isCatDrawerOpen, setIsCatDrawerOpen] = useState(false);
  const [isItemDrawerOpen, setIsItemDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  // Custom Confirmation States
  const [editingCatId, setEditingCatId] = useState<number | null>(null);
  const [editingCatName, setEditingCatName] = useState("");
  const [confirmDeleteCatId, setConfirmDeleteCatId] = useState<number | null>(null);
  const [confirmDeleteItemId, setConfirmDeleteItemId] = useState<number | null>(null);
  
  const [loading, setLoading] = useState(false);

  const activeCategory = categories.find(c => c.id === activeTab);
  const filteredItems = activeCategory?.menuItems.filter((item: any) => 
    item.name.toLowerCase().includes(search.toLowerCase())
  ) || [];

  // Dynamic Theme Color based on Active Category (for "Soul")
  const themeAccent = useMemo(() => {
    if (!activeCategory) return "indigo";
    const name = activeCategory.name.toLowerCase();
    if (name.includes("chicken") || name.includes("لحم")) return "rose";
    if (name.includes("sea") || name.includes("بحر")) return "cyan";
    if (name.includes("sweet") || name.includes("حلا")) return "amber";
    if (name.includes("drink") || name.includes("مشروب")) return "blue";
    if (name.includes("pasta") || name.includes("مكرون")) return "orange";
    return "indigo";
  }, [activeCategory]);

  const handleSaveItem = async (e: React.FormEvent<HTMLFormElement>) => {
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

    let result = editingItem ? await updateMenuItem(editingItem.id, data) : await createMenuItem(data);
    if (result.success) window.location.reload();
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen">
      {/* Dynamic Animated Background (The Soul) */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className={cn(
            "absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full opacity-30 blur-[120px] animate-pulse transition-colors duration-1000",
            themeAccent === "rose" ? "bg-rose-500" : 
            themeAccent === "cyan" ? "bg-cyan-500" : 
            themeAccent === "amber" ? "bg-amber-500" : 
            themeAccent === "blue" ? "bg-blue-500" : 
            themeAccent === "orange" ? "bg-orange-500" : "bg-indigo-500"
        )} />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-white/40 rounded-full blur-[80px]" />
      </div>

      <div className="space-y-12 pb-32">
        {/* Header Section with Glass Effect */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 px-2"
        >
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full backdrop-blur-md mb-2" style={{ backgroundColor: 'color-mix(in srgb, var(--brand-primary) 5%, transparent)', borderColor: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)' }}>
                <Sparkles size={14} className="text-amber-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">منصة إدارة الذكاء</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-1">
                إدارة <span className={cn(
                    "transition-colors duration-700",
                    themeAccent === "rose" ? "text-rose-600" : 
                    themeAccent === "cyan" ? "text-cyan-600" : 
                    themeAccent === "amber" ? "text-amber-600" : 
                    themeAccent === "blue" ? "text-blue-600" : 
                    themeAccent === "orange" ? "text-orange-600" : "text-indigo-600"
                )}>روائح ونكهات</span> القائمة
            </h1>
            <p className="text-slate-400 font-bold max-w-md leading-relaxed">تحكم بلمساتك الإبداعية، حوّل وجباتك إلى أعمال فنية بصرية تجذب الزبائن.</p>
          </div>
          
          <div className="flex items-center gap-6">
             <div className="hidden sm:flex items-center gap-4 bg-white/70 backdrop-blur-xl p-4 rounded-[2rem] border border-white shadow-2xl shadow-slate-900/5">
                <div className="text-right px-4 border-l border-slate-100/50">
                    <p className="text-[10px] font-black text-slate-400 uppercase">النشاط الكلي</p>
                    <p className="text-xl font-black text-slate-900">{categories.length} <span className="text-[10px] text-slate-300">أقسام</span></p>
                </div>
                <div className="text-right px-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase">تنوع القائمة</p>
                    <p className="text-xl font-black text-slate-900">
                        {categories.reduce((acc, cat) => acc + cat.menuItems.length, 0)} <span className="text-[10px] text-slate-300">أطباق</span>
                    </p>
                </div>
             </div>
             <motion.button 
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               onClick={() => setIsCatDrawerOpen(true)}
               className="text-white p-6 rounded-3xl group shadow-2xl shadow-slate-900/20 flex flex-col items-center justify-center gap-1 transition-all"
               style={{ backgroundColor: 'var(--brand-primary)' }}
             >
               <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
               <span className="text-[10px] font-black uppercase">قسم جديد</span>
             </motion.button>
          </div>
        </motion.div>

        {/* Categories Navigation - Liquid Design */}
        <div className="sticky top-0 z-40 bg-white/60 backdrop-blur-2xl py-6 -mx-4 px-4 border-b border-white shadow-xl shadow-slate-900/5 overflow-hidden">
            <div className="flex items-center gap-4 overflow-x-auto no-scrollbar max-w-full pb-2">
                {categories.map((cat, idx: number) => (
                    <div key={cat.id} className="relative group/cat shrink-0">
                        <motion.button
                            onClick={() => setActiveTab(cat.id)}
                            className={cn(
                                "relative h-18 px-8 rounded-3xl text-sm font-black transition-all duration-500 flex items-center gap-4 overflow-hidden",
                                activeTab === cat.id
                                    ? "text-white shadow-2xl ring-4 ring-slate-900/5"
                                    : "bg-white/40 text-slate-500 hover:bg-white border border-slate-200/50"
                            )}
                            style={activeTab === cat.id ? { backgroundColor: 'var(--brand-primary)' } : {}}
                        >
                            <div className={cn(
                                "h-10 w-10 rounded-2xl flex items-center justify-center transition-all duration-500",
                                activeTab === cat.id ? "bg-white/10 scale-110 rotate-12" : "bg-slate-50"
                            )}>
                                <Shapes size={18} className={activeTab === cat.id ? "text-amber-400" : "text-slate-400"} />
                            </div>
                            <span className="whitespace-nowrap">{cat.name}</span>
                            <div className={cn(
                                "h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black",
                                activeTab === cat.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400"
                            )}>
                                {cat.menuItems.length}
                            </div>
                        </motion.button>
                        
                        {/* Instant Edit/Delete Floating Controls */}
                        <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover/cat:opacity-100 transition-all duration-300 scale-75 group-hover/cat:scale-100 z-10">
                            <button 
                                onClick={(e) => { e.stopPropagation(); setEditingCatId(cat.id); setEditingCatName(cat.name); }}
                                className="h-8 w-8 flex items-center justify-center rounded-xl text-white border-2 border-white shadow-lg"
                                style={{ backgroundColor: 'var(--brand-primary)' }}
                            >
                                <Edit3 size={12} />
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); setConfirmDeleteCatId(cat.id); }}
                                className="h-8 w-8 flex items-center justify-center rounded-xl text-white bg-rose-500 border-2 border-white shadow-lg"
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Search & Add Action Panel */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center px-2">
            <div className="md:col-span-8 relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-slate-200 to-slate-100 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition-opacity" />
                <div className="relative bg-white/80 backdrop-blur-md rounded-[2.2rem] h-20 border border-white flex items-center px-8 gap-4 shadow-xl" style={{ boxShadow: '0 20px 25px -5px color-mix(in srgb, var(--brand-primary), transparent 95%)' }}>
                    <Search className="h-6 w-6 text-slate-300" />
                    <input
                        type="text"
                        placeholder="ابحث عن وجبة، نكهة، أو مكون..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 bg-transparent border-none text-lg font-bold text-slate-900 placeholder:text-slate-300 focus:ring-0 outline-none"
                    />
                    <div className="h-10 w-1px bg-slate-100 mx-2" />
                    <Zap size={20} className="text-amber-400 animate-pulse" />
                </div>
            </div>
            <div className="md:col-span-4">
                <motion.button 
                    whileHover={{ x: -10 }}
                    disabled={!activeTab}
                    onClick={() => { setEditingItem(null); setIsItemDrawerOpen(true); }}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-20 rounded-[2.2rem] text-lg font-black shadow-2xl shadow-emerald-600/20 flex items-center justify-center gap-4 transition-all"
                >
                    <PlusCircle size={24} />
                    إضافة طبق إبداعي
                </motion.button>
            </div>
        </div>

        {/* The Grid: Where the products live (Visual Cards) */}
        <div className="grid gap-10 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 px-2">
            <AnimatePresence mode="popLayout">
                {filteredItems.map((item: any, idx: number) => (
                    <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ delay: idx * 0.05, type: "spring", damping: 20, stiffness: 100 }}
                        key={item.id}
                        className="group relative"
                    >
                        {/* Floating Price Aura */}
                        <div className="absolute -top-4 -left-4 z-20 bg-white shadow-2xl rounded-3xl px-5 py-3 border border-slate-50 flex items-center gap-2 scale-90 group-hover:scale-100 transition-transform duration-500">
                             <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                             <span className="text-lg font-black text-slate-900 leading-none">{formatCurrency(item.price, currency)}</span>
                        </div>

                        <div className="relative overflow-hidden bg-white rounded-[3rem] border border-white shadow-2xl transition-all duration-700 h-full flex flex-col" style={{ boxShadow: '0 20px 25px -5px color-mix(in srgb, var(--brand-primary), transparent 95%)' }}>
                            {/* Visual Header (Image) */}
                            <div className="relative h-64 overflow-hidden rounded-[2.8rem] m-2">
                                {item.image_url ? (
                                    <img src={item.image_url} alt={item.name} className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                ) : (
                                    <div className="h-full w-full flex flex-col items-center justify-center text-white" style={{ backgroundColor: 'color-mix(in srgb, var(--brand-primary), transparent 20%)' }}>
                                        <ImageIcon size={48} strokeWidth={1} />
                                        <span className="text-[10px] font-black mt-2">لا توجد صورة</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-700" />
                                
                                {/* Quick Info Over Image */}
                                <div className="absolute bottom-6 inset-x-8">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black text-white uppercase tracking-tighter border border-white/10">
                                            {activeCategory?.name}
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-black text-white leading-tight drop-shadow-lg">{item.name}</h3>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-8 pt-4 flex-1 flex flex-col justify-between">
                                <p className="text-sm font-bold text-slate-400 line-clamp-3 leading-relaxed mb-8">
                                    {item.description || "سيمفونية من المكونات الطازجة المحضرة بعناية لتناسب ذوقك الرفيع..."}
                                </p>

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 rounded-3xl border border-slate-100/50">
                                        <div className="text-right">
                                            <p className="text-[9px] font-black text-slate-300 uppercase">تكلفة المواد</p>
                                            <p className="text-sm font-black text-slate-500">{formatCurrency(item.cost_price || 0, currency)}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[9px] font-black text-slate-300 uppercase">الهامش</p>
                                            <p className="text-sm font-black text-emerald-600">+{formatCurrency((item.price - (item.cost_price || 0)), currency)}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button 
                                            onClick={() => { setEditingItem(item); setIsItemDrawerOpen(true); }}
                                            className="flex-1 h-14 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-xl transition-all"
                                            style={{ backgroundColor: 'var(--brand-primary)' }}
                                        >
                                            <Edit3 size={16} />
                                            <span>تحديث الوجبة</span>
                                        </button>
                                        <button 
                                            onClick={() => setConfirmDeleteItemId(item.id)}
                                            className="h-14 w-14 flex items-center justify-center rounded-2xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-90"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            {filteredItems.length === 0 && (
                <div className="col-span-full py-40 text-center">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-md mx-auto"
                    >
                        <div className="h-32 w-32 bg-white rounded-[3rem] shadow-2xl flex items-center justify-center mx-auto mb-10 relative">
                             <div className="absolute inset-0 blur-2xl animate-pulse" style={{ backgroundColor: 'color-mix(in srgb, var(--brand-primary), transparent 90%)' }} />
                             <Package size={50} strokeWidth={1} className="text-slate-200 relative z-10" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-4">هذا القسم ينتظر إبداعك</h3>
                        <p className="text-slate-400 font-bold leading-relaxed">لم تقم بإضافة أي أطباق هنا بعد. ابدأ بصناعة المنيو الخاص بك الآن ليبدو رائعاً لزبائنك.</p>
                    </motion.div>
                </div>
            )}
        </div>

        {/* Premium Side Drawers (The Soul of Interaction) */}
        <AnimatePresence>
            {(isCatDrawerOpen || isItemDrawerOpen) && (
                <motion.div
                    key="drawer-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => { setIsCatDrawerOpen(false); setIsItemDrawerOpen(false); }}
                    className="fixed inset-0 z-[100] backdrop-blur-2xl"
                    style={{ backgroundColor: 'color-mix(in srgb, var(--brand-primary) 80%, transparent)' }}
                />
            )}

            {isItemDrawerOpen && (
                <motion.div
                    key="item-drawer"
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="fixed inset-y-0 right-0 z-[101] w-full max-w-2xl bg-white shadow-2xl flex flex-col h-full overflow-hidden"
                >
                    {/* Drawer Header */}
                    <div className="p-10 pb-8 flex items-center justify-between border-b border-slate-50 shrink-0">
                        <div className="flex items-center gap-6">
                            <div className="h-20 w-20 rounded-[2.5rem] flex items-center justify-center shadow-xl border border-emerald-100/50" style={{ backgroundColor: 'color-mix(in srgb, var(--brand-primary), transparent 90%)', color: 'var(--brand-primary)' }}>
                                {editingItem ? <Edit3 size={32} /> : <PlusCircle size={32} />}
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                                    {editingItem ? "تعديل الطبق" : "خلق وجبة جديدة"}
                                </h2>
                                <p className="text-sm font-bold text-slate-400 mt-1">تأكد من أن الوصف يثير شهية من يقرأه.</p>
                            </div>
                        </div>
                        <button onClick={() => setIsItemDrawerOpen(false)} className="h-16 w-16 flex items-center justify-center rounded-3xl bg-slate-50 text-slate-400 hover:text-slate-900 transition-colors">
                            <X size={28} />
                        </button>
                    </div>

                    <form onSubmit={handleSaveItem} className="flex-1 overflow-y-auto p-12 custom-scrollbar space-y-12 bg-slate-50/20">
                        <div className="space-y-10">
                            <div className="space-y-3">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">اسم الوجبة الرنان</label>
                                <input name="name" defaultValue={editingItem?.name} placeholder="مثل: باستا تروفل الملكية..." className="w-full bg-white border border-slate-100 rounded-[2rem] px-8 py-6 text-xl font-black text-slate-900 transition-all outline-none" style={{ '--tw-ring-color': 'color-mix(in srgb, var(--brand-primary) 10%, transparent)', borderColor: 'color-mix(in srgb, var(--brand-primary) 20%, transparent)' } as any} required />
                            </div>
                            
                            <div className="space-y-3">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">قصة الوجبة (الوصف)</label>
                                <textarea name="description" defaultValue={editingItem?.description} placeholder="صف نكهة الطبق، مكوناته السرية، أو طريق الطهي..." className="w-full bg-white border border-slate-100 rounded-[2.5rem] px-8 py-8 text-lg font-bold text-slate-600 transition-all outline-none h-48 resize-none leading-relaxed" style={{ '--tw-ring-color': 'color-mix(in srgb, var(--brand-primary) 10%, transparent)', borderColor: 'color-mix(in srgb, var(--brand-primary) 20%, transparent)' } as any} />
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">سعر المنيو ({currency})</label>
                                    <div className="relative group">
                                        <DollarSign className="absolute right-6 top-1/2 -translate-y-1/2 text-emerald-500 h-6 w-6" />
                                        <input name="price" type="number" step="0.01" defaultValue={editingItem?.price} placeholder="12.00" className="w-full bg-white border border-slate-100 rounded-[2rem] pr-14 pl-8 h-20 text-2xl font-black text-emerald-700 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none" required />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">تكلفة المواد</label>
                                    <div className="relative group">
                                        <TrendingUp className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 h-6 w-6" />
                                        <input name="cost_price" type="number" step="0.01" defaultValue={editingItem?.cost_price} placeholder="8.50" className="w-full bg-white border border-slate-100 rounded-[2rem] pr-14 pl-8 h-20 text-2xl font-black text-slate-500 focus:ring-4 focus:ring-slate-900/5 transition-all outline-none" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">رابط الصورة الجذابة</label>
                                <div className="flex gap-6">
                                    <input name="image_url" defaultValue={editingItem?.image_url} placeholder="أدخل رابط صورة عالية الدقة..." className="flex-1 bg-white border border-slate-100 rounded-[2rem] px-8 h-20 text-sm font-mono font-bold focus:ring-4 focus:ring-slate-900/5 border-slate-900/10 transition-all outline-none" />
                                    <div className="h-20 w-20 rounded-[2rem] border-2 border-dashed border-slate-200 flex items-center justify-center shrink-0 bg-white overflow-hidden shadow-inner transform hover:scale-105 transition-transform">
                                        {(editingItem?.image_url) ? <img src={editingItem.image_url} className="w-full h-full object-cover" /> : <ImageIcon size={24} className="text-slate-200" />}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8">
                            <button type="submit" disabled={loading} className="group w-full relative h-24 overflow-hidden rounded-[2.5rem] text-white shadow-2xl transition-all active:scale-95" style={{ backgroundColor: 'var(--brand-primary)' }}>
                                <div className="relative z-10 flex items-center justify-center gap-6 text-xl font-black">
                                    {loading ? <Loader2 className="animate-spin" /> : (editingItem ? "حفظ التغييرات العصرية" : "إطلاق الوجبة للقائمة")}
                                    <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                        <ArrowRight size={20} className="rotate-180" />
                                    </div>
                                </div>
                                <div className="absolute inset-x-0 bottom-0 h-1.5 bg-white/20" />
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}

            {/* Same premium feel for other modals (Cat Add, Delete, Rename) */}
            {/* ... simplified for execution speed ... */}
            <AnimatePresence>
                {(confirmDeleteCatId || confirmDeleteItemId) && (
                    <div key="delete-confirmation-modal" className="fixed inset-0 z-[300] flex items-center justify-center p-6">
                       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setConfirmDeleteCatId(null); setConfirmDeleteItemId(null); }} className="fixed inset-0 backdrop-blur-3xl" style={{ backgroundColor: 'color-mix(in srgb, var(--brand-primary) 90%, transparent)' }} />
                       <motion.div 
                         initial={{ scale: 0.8, opacity: 0 }} 
                         animate={{ scale: 1, opacity: 1 }} 
                         exit={{ scale: 0.8, opacity: 0 }} 
                         className="relative z-10 w-full max-w-sm bg-white rounded-[4rem] p-12 text-center border-t-8 border-rose-500"
                       >
                          <div className="mx-auto w-28 h-28 bg-rose-50 text-rose-500 rounded-[3rem] flex items-center justify-center mb-10 shadow-3xl shadow-rose-500/20">
                             <AlertCircle size={56} />
                          </div>
                          <h3 className="text-3xl font-black text-slate-900 mb-4">هل أنت واثق؟</h3>
                          <p className="text-sm font-bold text-slate-400 mb-12 leading-relaxed px-4">
                            حذف الأطباق يؤثر على تاريخ مبيعاتك وتجربة زبائنك. {confirmDeleteCatId && "تنبيه: سيتم حذف كافة الوجبات داخل هذا القسم!"}
                          </p>
                          <div className="grid grid-cols-2 gap-6 text-xs font-black">
                             <button onClick={() => { setConfirmDeleteCatId(null); setConfirmDeleteItemId(null); }} className="h-20 rounded-3xl bg-slate-50 text-slate-500 hover:bg-slate-100 transition-all">تراجع الآن</button>
                             <button 
                               onClick={confirmDeleteCatId ? async () => { await deleteCategory(confirmDeleteCatId); window.location.reload(); } : async () => { if(confirmDeleteItemId) await deleteMenuItem(confirmDeleteItemId); window.location.reload(); }} 
                               className="h-20 rounded-3xl bg-rose-600 text-white shadow-3xl shadow-rose-600/30 active:scale-95 transition-all"
                             >
                               تأكيد الحذف
                             </button>
                          </div>
                       </motion.div>
                    </div>
                )}
                
                {editingCatId && (
                    <div key="edit-category-modal" className="fixed inset-0 z-[300] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingCatId(null)} className="absolute inset-0" style={{ backgroundColor: 'color-mix(in srgb, var(--brand-primary), transparent 40%)' }} />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative z-10 w-full max-w-sm bg-white rounded-[3.5rem] p-12 shadow-3xl border border-white">
                            <h3 className="text-2xl font-black text-slate-900 mb-10 text-center">تغيير اسم القسم</h3>
                            <form onSubmit={async (e) => { e.preventDefault(); await updateCategory(editingCatId, editingCatName); window.location.reload(); }} className="space-y-6">
                                <input 
                                    value={editingCatName}
                                    onChange={(e) => setEditingCatName(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-[1.8rem] h-20 px-8 font-black text-xl text-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all outline-none text-center"
                                    autoFocus
                                />
                                <button type="submit" className="w-full text-white h-20 rounded-[1.8rem] font-black text-lg shadow-2xl active:scale-95 transition-transform" style={{ backgroundColor: 'var(--brand-primary)' }}>
                                  اعتماد التعديل
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
                
                {isCatDrawerOpen && (
                    <div key="add-category-modal" className="fixed inset-0 z-[300] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCatDrawerOpen(false)} className="fixed inset-0 backdrop-blur-2xl" style={{ backgroundColor: 'color-mix(in srgb, var(--brand-primary), transparent 20%)' }} />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative z-10 w-full max-w-sm bg-white rounded-[3.5rem] p-12 shadow-3xl border border-white">
                            <div className="h-20 w-20 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-slate-900/20" style={{ backgroundColor: 'var(--brand-primary)' }}>
                                <Shapes size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-2 text-center">إضافة قسم جديد</h3>
                            <p className="text-center text-xs font-bold text-slate-400 mb-10">نظّم وجباتك في مجموعات منطقية</p>
                            <form onSubmit={async (e) => { e.preventDefault(); const formData = new FormData(e.currentTarget); await createCategory(formData.get("name") as string); window.location.reload(); }} className="space-y-6">
                                <input 
                                    name="name"
                                    placeholder="اسم القسم (مثل: مقبلات)"
                                    className="w-full bg-slate-50 border border-slate-100 rounded-[1.8rem] h-20 px-8 font-black text-xl text-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all outline-none text-center"
                                    autoFocus
                                    required
                                />
                                <button type="submit" className="w-full text-white h-20 rounded-[1.8rem] font-black text-lg shadow-2xl active:scale-95 transition-transform" style={{ backgroundColor: 'var(--brand-primary)' }}>
                                  خلق القسم الآن
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AnimatePresence>
      </div>
    </div>
  );
}
