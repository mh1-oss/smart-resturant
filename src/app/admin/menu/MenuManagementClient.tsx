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
  Settings,
  MessageSquare,
  Sparkles, 
  Zap, 
  ArrowRight,
  Maximize2,
  Layers
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
  const [variants, setVariants] = useState<any[]>([]);
  const [addons, setAddons] = useState<any[]>([]);
  const [showVariants, setShowVariants] = useState(false);
  const [showAddons, setShowAddons] = useState(false);
  const [showNotes, setShowNotes] = useState(true);

  // Reset states when opening/editing
  const openItemDrawer = (item?: any) => {
    if (item) {
        setEditingItem(item);
        setVariants(item.variants || []);
        setAddons(item.addons || []);
        setShowVariants(item.show_variants);
        setShowAddons(item.show_addons);
        setShowNotes(item.show_notes);
    } else {
        setEditingItem(null);
        setVariants([]);
        setAddons([]);
        setShowVariants(false);
        setShowAddons(false);
        setShowNotes(true);
    }
    setIsItemDrawerOpen(true);
  };

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

  const toggleItemStatus = async (id: number, currentStatus: boolean) => {
    try {
      const result = await updateMenuItem(id, { is_available: !currentStatus });
      if (result.success) {
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      category_id: editingItem ? editingItem.category_id : activeTab,
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: parseFloat(formData.get("price") as string) || (editingItem?.price ? Number(editingItem.price) : 0),
      cost_price: parseFloat(formData.get("cost_price") as string) || (editingItem?.cost_price ? Number(editingItem.cost_price) : 0),
      image_url: (formData.get("image_url") as string) || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80",
      show_variants: showVariants,
      show_addons: showAddons,
      show_notes: showNotes,
      variants: showVariants 
        ? variants.filter(v => v.name.trim() !== "").map(v => ({ name: v.name, price: Number(v.price) || 0, cost_price: Number(v.cost_price) || 0 })) 
        : [],
      addons: showAddons 
        ? addons.filter(a => a.name.trim() !== "").map(a => ({ name: a.name, price: Number(a.price) || 0, cost_price: Number(a.cost_price) || 0 })) 
        : []
    };

    try {
        let result = editingItem ? await updateMenuItem(editingItem.id, data) : await createMenuItem(data);
        if (result.success) {
            window.location.reload();
        } else {
            alert(result.error || "خطأ غير متوقع أثناء الحفظ");
        }
    } catch (err) {
        console.error(err);
        alert("حدث خطأ في الاتصال بالخادم");
    } finally {
        setLoading(false);
    }
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
          
          <div className="flex items-center gap-4">
             <div className="hidden sm:flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                <div className="text-right px-4 border-l border-slate-200">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">الأقسام</p>
                    <p className="text-lg font-bold text-slate-900">{categories.length}</p>
                </div>
                <div className="text-right px-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">إجمالي الأطباق</p>
                    <p className="text-lg font-bold text-slate-900">
                        {categories.reduce((acc, cat) => acc + cat.menuItems.length, 0)}
                    </p>
                </div>
             </div>
             <motion.button 
               whileHover={{ scale: 1.02 }}
               whileTap={{ scale: 0.98 }}
               onClick={() => setIsCatDrawerOpen(true)}
               className="h-14 px-6 rounded-2xl text-white font-bold flex items-center gap-2 transition-all shadow-md"
               style={{ backgroundColor: 'var(--brand-primary)' }}
             >
               <Plus size={20} />
               <span className="text-xs uppercase tracking-wide">قسم جديد</span>
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
                                "relative h-12 px-6 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-3",
                                activeTab === cat.id
                                    ? "text-white shadow-lg shadow-slate-200"
                                    : "bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200/50"
                            )}
                            style={activeTab === cat.id ? { backgroundColor: 'var(--brand-primary)' } : {}}
                        >
                            <span className="whitespace-nowrap">{cat.name}</span>
                            <div className={cn(
                                "h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-bold",
                                activeTab === cat.id ? "bg-white/20 text-white" : "bg-slate-200 text-slate-500"
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
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-9 relative group">
                <div className="relative bg-slate-50 border border-slate-100 rounded-2xl h-14 flex items-center px-6 gap-3 transition-all focus-within:bg-white focus-within:border-slate-300">
                    <Search className="h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="ابحث في القائمة..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 bg-transparent border-none text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:ring-0 outline-none"
                    />
                </div>
            </div>
            <div className="md:col-span-3">
                <motion.button 
                    whileHover={{ scale: 1.02 }}
                    disabled={!activeTab}
                    onClick={() => openItemDrawer()}
                    className="w-full bg-slate-900 text-white h-14 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-slate-900/10"
                >
                    <Plus size={18} />
                    إضافة وجبة
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
                        <div className="relative overflow-hidden bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col">
                            {/* Card Media */}
                            <div className="relative h-40 overflow-hidden bg-slate-50 m-2 rounded-xl border border-slate-100/50">
                                {item.image_url ? (
                                    <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-slate-300">
                                        <ImageIcon size={24} />
                                    </div>
                                )}
                                
                                <div className="absolute top-2 right-2 flex gap-1">
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); toggleItemStatus(item.id, item.is_available); }}
                                      className={cn("h-7 px-3 rounded-lg text-[9px] font-bold border transition-all shadow-sm", item.is_available ? "bg-emerald-500 text-white border-emerald-600" : "bg-white text-rose-500 border-rose-100")}
                                    >
                                        {item.is_available ? "نشط" : "متوقف"}
                                    </button>
                                </div>
                            </div>

                            {/* Card Content */}
                            <div className="p-4 flex-1 flex flex-col">
                                <div className="flex justify-between items-start gap-2 mb-2">
                                    <h3 className="text-base font-bold text-slate-900 line-clamp-1">{item.name}</h3>
                                    <span className="text-sm font-bold text-slate-900">{formatCurrency(item.price, currency)}</span>
                                </div>
                                
                                <p className="text-[11px] font-medium text-slate-400 line-clamp-2 leading-relaxed mb-6">
                                    {item.description || "لا يوجد وصف لهذا الطبق."}
                                </p>

                                <div className="mt-auto space-y-3">
                                    <div className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg border border-slate-100">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">الربح المتوقع</span>
                                        <span className="text-[11px] font-bold text-emerald-600">
                                            {formatCurrency((item.price - (item.cost_price || 0)), currency)}
                                        </span>
                                    </div>

                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => openItemDrawer(item)}
                                            className="flex-1 h-10 bg-slate-900 text-white rounded-xl text-[10px] font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-sm"
                                        >
                                            <Edit3 size={14} />
                                            <span>تعديل</span>
                                        </button>
                                        <button 
                                            onClick={() => setConfirmDeleteItemId(item.id)}
                                            className="h-10 w-10 flex items-center justify-center rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 transition-all border border-rose-100"
                                        >
                                            <Trash2 size={16} />
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
                    className="fixed inset-0 z-[9998] bg-slate-900/40 backdrop-blur-md"
                />
            )}

            {/* UI/UX Pro Max: Full Page Immersive Experience */}
            {isItemDrawerOpen && (
                    <motion.div
                        key="full-page-item-editor"
                        initial={{ opacity: 0, y: 30, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 30, scale: 0.98 }}
                        className="fixed inset-0 z-[10000] bg-slate-50 flex flex-col overflow-hidden"
                    >
                        {/* Immersive Header */}
                        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 shrink-0">
                            <div className="flex items-center gap-6">
                                <button 
                                    onClick={() => setIsItemDrawerOpen(false)}
                                    className="h-12 w-12 rounded-2xl flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-slate-100 transition-all border border-slate-100"
                                >
                                    <X size={20} />
                                </button>
                                <div className="h-10 w-px bg-slate-100" />
                                <div>
                                    <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest block mb-0.5">لوحة التحكم / المنيو</span>
                                    <h2 className="text-xl font-black text-slate-900 leading-tight">
                                        {editingItem ? `تعديل: ${editingItem.name}` : "إضافة صنف جديد للقائمة"}
                                    </h2>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <span className="text-xs font-bold text-slate-400 hidden sm:inline">هل انتهيت من الصياغة؟</span>
                                <button 
                                    form="item-main-form"
                                    type="submit"
                                    disabled={loading}
                                    className="h-12 px-8 rounded-2xl bg-slate-900 text-white text-sm font-bold shadow-xl shadow-slate-900/10 active:scale-95 transition-all flex items-center gap-2"
                                >
                                    {loading ? <Loader2 className="animate-spin h-4 w-4" /> : (editingItem ? "حفظ التغييرات" : "إضافة الوجبة الآن")}
                                </button>
                            </div>
                        </header>

                        {/* Editor Canvas */}
                        <main className="flex-1 overflow-y-auto custom-scrollbar bg-[#f8fafc]">
                            <form id="item-main-form" onSubmit={handleSaveItem} className="max-w-7xl mx-auto px-6 py-12">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                    
                                    {/* Left Column: Core Identity */}
                                    <div className="lg:col-span-7 space-y-10">
                                        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm space-y-10">
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                                        <Edit3 size={16} />
                                                    </div>
                                                    <h3 className="text-lg font-bold text-slate-900">المعلومات الأساسية</h3>
                                                </div>
                                                
                                                <div className="space-y-6">
                                                    <div className="space-y-2">
                                                        <label className="text-[11px] font-bold text-slate-400 uppercase px-2">اسم الصنف</label>
                                                        <input name="name" defaultValue={editingItem?.name} placeholder="أدخل اسماً جذاباً..." className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 h-16 text-lg font-bold text-slate-900 focus:bg-white focus:border-indigo-200 transition-all outline-none" required />
                                                    </div>
                                                    
                                                    <div className="space-y-2">
                                                        <label className="text-[11px] font-bold text-slate-400 uppercase px-2">وصف المذاق</label>
                                                        <textarea name="description" defaultValue={editingItem?.description} placeholder="صف نكهة الطبق، المكونات، وطريقة الطهي..." className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 text-base font-medium text-slate-600 focus:bg-white focus:border-indigo-200 transition-all outline-none h-40 resize-none leading-relaxed" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-6 pt-10 border-t border-slate-50">
                                                <div className="space-y-2">
                                                    <label className="text-[11px] font-bold text-slate-400 uppercase px-2">
                                                        سعر البيع ({currency}) 
                                                        {showVariants && <span className="mr-2 text-[9px] text-rose-500 font-black tracking-tighter bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">مقفل بسبب الأحجام</span>}
                                                    </label>
                                                    <div className="relative group">
                                                        <div className={cn("absolute right-6 top-1/2 -translate-y-1/2 font-bold transition-colors", showVariants ? "text-slate-300" : "text-emerald-500")}>$</div>
                                                        <input 
                                                            name="price" 
                                                            type="number" 
                                                            step="0.01" 
                                                            defaultValue={editingItem?.price} 
                                                            placeholder="0.00" 
                                                            disabled={showVariants}
                                                            className={cn(
                                                                "w-full rounded-2xl pr-14 pl-6 h-16 text-xl font-extrabold transition-all outline-none border",
                                                                showVariants 
                                                                    ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed" 
                                                                    : "bg-slate-50 border-slate-100 text-slate-900 focus:bg-white focus:border-emerald-200"
                                                            )} 
                                                            required={!showVariants} 
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[11px] font-bold text-slate-400 uppercase px-2">
                                                        تكلفة المواد
                                                        {showVariants && <span className="mr-2 text-[9px] text-slate-400 font-black tracking-tighter bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">تلقائي</span>}
                                                    </label>
                                                    <div className="relative group">
                                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 font-bold">$</div>
                                                        <input 
                                                            name="cost_price" 
                                                            type="number" 
                                                            step="0.01" 
                                                            defaultValue={editingItem?.cost_price} 
                                                            placeholder="0.00" 
                                                            disabled={showVariants}
                                                            className={cn(
                                                                "w-full rounded-2xl pr-14 pl-6 h-16 text-xl font-extrabold transition-all outline-none border",
                                                                showVariants 
                                                                    ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed" 
                                                                    : "bg-slate-50 border-slate-100 text-slate-500 focus:bg-white focus:border-slate-300"
                                                            )} 
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Pro Max Customization Control Center */}
                                        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm space-y-10">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                                        <Settings size={16} />
                                                    </div>
                                                    <h3 className="text-lg font-bold text-slate-900">مركز التحكم بالخيارات</h3>
                                                </div>
                                                
                                                <div className="flex bg-slate-100/50 p-1.5 rounded-[1.5rem] border border-slate-200/50 gap-2">
                                                    <button 
                                                        type="button" 
                                                        onClick={() => setShowVariants(!showVariants)} 
                                                        className={cn(
                                                            "px-5 py-3 rounded-2xl text-[11px] font-black transition-all flex items-center gap-2.5", 
                                                            showVariants 
                                                                ? "bg-white text-indigo-600 shadow-lg shadow-indigo-100 border border-indigo-100" 
                                                                : "text-slate-400 hover:bg-white/50 hover:text-slate-600"
                                                        )}
                                                    >
                                                        <Maximize2 size={14} className={cn(showVariants ? "text-indigo-500" : "text-slate-300")} />
                                                        أحجام
                                                    </button>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => setShowAddons(!showAddons)} 
                                                        className={cn(
                                                            "px-5 py-3 rounded-2xl text-[11px] font-black transition-all flex items-center gap-2.5", 
                                                            showAddons 
                                                                ? "bg-white text-amber-600 shadow-lg shadow-amber-100 border border-amber-100" 
                                                                : "text-slate-400 hover:bg-white/50 hover:text-slate-600"
                                                        )}
                                                    >
                                                        <Layers size={14} className={cn(showAddons ? "text-amber-500" : "text-slate-300")} />
                                                        إضافات
                                                    </button>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => setShowNotes(!showNotes)} 
                                                        className={cn(
                                                            "px-5 py-3 rounded-2xl text-[11px] font-black transition-all flex items-center gap-2.5", 
                                                            showNotes 
                                                                ? "bg-white text-emerald-600 shadow-lg shadow-emerald-100 border border-emerald-100" 
                                                                : "text-slate-400 hover:bg-white/50 hover:text-slate-600"
                                                        )}
                                                    >
                                                        <MessageSquare size={14} className={cn(showNotes ? "text-emerald-500" : "text-slate-300")} />
                                                        ملاحظات
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                <AnimatePresence>
                                                    {showVariants && (
                                                        <motion.div 
                                                            key="variants-section"
                                                            initial={{ opacity: 0, y: 10 }} 
                                                            animate={{ opacity: 1, y: 0 }} 
                                                            exit={{ opacity: 0, y: 10 }} 
                                                            className="p-8 bg-indigo-50/30 rounded-[2.5rem] border border-indigo-100/50 space-y-6"
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <h4 className="text-sm font-bold text-indigo-900">خيارات الأحجام المتوفرة</h4>
                                                                <button type="button" onClick={() => setVariants([...variants, { name: "", price: 0 }])} className="h-10 px-5 rounded-xl bg-white text-indigo-600 font-bold text-xs flex items-center gap-2 border border-indigo-100 shadow-sm hover:bg-indigo-600 hover:text-white transition-all">
                                                                    <Plus size={16} /> إضافة حجم
                                                                </button>
                                                            </div>
                                                            <div className="space-y-3">
                                                                {variants.map((v, i) => (
                                                                    <div key={i} className="flex gap-3 items-center group bg-white/50 p-2 rounded-2xl border border-indigo-100/30">
                                                                        <input placeholder="الاسم (مثلاً: كبير)" value={v.name} onChange={(e) => {
                                                                            const newV = [...variants];
                                                                            newV[i].name = e.target.value;
                                                                            setVariants(newV);
                                                                        }} className="flex-1 bg-white border border-slate-100 rounded-xl px-4 h-12 text-sm font-bold text-slate-700 focus:border-indigo-400 transition-all outline-none" />
                                                                        
                                                                        <div className="flex gap-2 shrink-0">
                                                                            <div className="relative w-28">
                                                                                <input type="number" step="0.01" placeholder="بيع" value={v.price} onChange={(e) => {
                                                                                    const newV = [...variants];
                                                                                    newV[i].price = e.target.value;
                                                                                    setVariants(newV);
                                                                                }} className="w-full bg-white border border-slate-100 rounded-xl px-4 pl-8 h-12 text-xs font-black text-indigo-600 focus:border-indigo-400 transition-all outline-none" />
                                                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-300 font-bold">بيع</span>
                                                                            </div>
                                                                            
                                                                            <div className="relative w-28">
                                                                                <input type="number" step="0.01" placeholder="تكلفة" value={v.cost_price || ""} onChange={(e) => {
                                                                                    const newV = [...variants];
                                                                                    newV[i].cost_price = e.target.value;
                                                                                    setVariants(newV);
                                                                                }} className="w-full bg-white border border-slate-100 rounded-xl px-4 pl-8 h-12 text-xs font-bold text-slate-400 focus:border-slate-300 transition-all outline-none" />
                                                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-200 font-bold">تكلفة</span>
                                                                            </div>
                                                                        </div>

                                                                        <button type="button" onClick={() => setVariants(variants.filter((_, idx) => idx !== i))} className="h-10 w-10 flex items-center justify-center rounded-xl text-slate-300 hover:bg-rose-50 hover:text-rose-500 transition-all">
                                                                            <Trash2 size={16} />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </motion.div>
                                                    )}

                                                    {showAddons && (
                                                        <motion.div 
                                                            key="addons-section"
                                                            initial={{ opacity: 0, y: 10 }} 
                                                            animate={{ opacity: 1, y: 0 }} 
                                                            exit={{ opacity: 0, y: 10 }} 
                                                            className="p-8 bg-amber-50/30 rounded-[2.5rem] border border-amber-100/50 space-y-6"
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <h4 className="text-sm font-bold text-amber-900">الإضافات الاختيارية (Toppings)</h4>
                                                                <button type="button" onClick={() => setAddons([...addons, { name: "", price: 0 }])} className="h-10 px-5 rounded-xl bg-white text-amber-600 font-bold text-xs flex items-center gap-2 border border-amber-100 shadow-sm hover:bg-amber-600 hover:text-white transition-all">
                                                                    <Plus size={16} /> إضافة خيار
                                                                </button>
                                                            </div>
                                                            <div className="space-y-3">
                                                                {addons.map((a, i) => (
                                                                    <div key={i} className="flex gap-3 items-center group bg-white/50 p-2 rounded-2xl border border-amber-100/30">
                                                                        <input placeholder="إضافة..." value={a.name} onChange={(e) => {
                                                                            const newA = [...addons];
                                                                            newA[i].name = e.target.value;
                                                                            setAddons(newA);
                                                                        }} className="flex-1 bg-white border border-slate-100 rounded-xl px-4 h-12 text-sm font-bold text-slate-700 focus:border-amber-400 transition-all outline-none" />
                                                                        
                                                                        <div className="flex gap-2 shrink-0">
                                                                            <div className="relative w-28">
                                                                                <input type="number" step="0.01" placeholder="سعر" value={a.price} onChange={(e) => {
                                                                                    const newA = [...addons];
                                                                                    newA[i].price = e.target.value;
                                                                                    setAddons(newA);
                                                                                }} className="w-full bg-white border border-slate-100 rounded-xl px-4 pl-8 h-12 text-xs font-black text-amber-600 focus:border-amber-400 transition-all outline-none" />
                                                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-300 font-bold">بيع</span>
                                                                            </div>
                                                                            <div className="relative w-28">
                                                                                <input type="number" step="0.01" placeholder="تكلفة" value={a.cost_price || ""} onChange={(e) => {
                                                                                    const newA = [...addons];
                                                                                    newA[i].cost_price = e.target.value;
                                                                                    setAddons(newA);
                                                                                }} className="w-full bg-white border border-slate-100 rounded-xl px-4 pl-8 h-12 text-xs font-bold text-slate-400 focus:border-slate-300 transition-all outline-none" />
                                                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-200 font-bold">تكلفة</span>
                                                                            </div>
                                                                        </div>

                                                                        <button type="button" onClick={() => setAddons(addons.filter((_, idx) => idx !== i))} className="h-10 w-10 flex items-center justify-center rounded-xl text-slate-300 hover:bg-rose-50 hover:text-rose-500 transition-all">
                                                                            <Trash2 size={16} />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </motion.div>
                                                    )}

                                                    {showNotes && (
                                                        <motion.div 
                                                            key="notes-section"
                                                            initial={{ opacity: 0, y: 10 }} 
                                                            animate={{ opacity: 1, y: 0 }} 
                                                            exit={{ opacity: 0, y: 10 }} 
                                                            className="p-8 bg-emerald-50/30 rounded-[2.5rem] border border-emerald-100/50"
                                                        >
                                                            <div className="flex items-center gap-4 mb-4">
                                                                <div className="h-10 w-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-white">
                                                                    <MessageSquare size={18} />
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-sm font-bold text-emerald-900">ملاحظات التحضير</h4>
                                                                    <p className="text-[10px] font-bold text-emerald-600/60 uppercase">مفعل للزبائن</p>
                                                                </div>
                                                            </div>
                                                            <p className="text-xs font-medium text-emerald-800/70 leading-relaxed max-w-sm">
                                                                سيتمكن الزبائن من إضافة تعليمات خاصة عند طلب هذه الوجبة (مثل: ترحيب خاص بطفل، تقليل الصوص، بدون فلفل).
                                                            </p>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column: Visual Identity & Preview */}
                                    <div className="lg:col-span-5 space-y-10">
                                        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm">
                                            <div className="flex items-center gap-3 mb-8">
                                                <div className="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                                    <ImageIcon size={16} />
                                                </div>
                                                <h3 className="text-lg font-bold text-slate-900">الجاذبية البصرية</h3>
                                            </div>

                                            <div className="space-y-6">
                                                <div className="relative group">
                                                    <div className="aspect-square w-full rounded-[2.5rem] overflow-hidden bg-slate-50 border-4 border-slate-100 shadow-inner group-hover:border-indigo-100 transition-all flex items-center justify-center">
                                                        {(editingItem?.image_url) ? (
                                                            <img src={editingItem.image_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                        ) : (
                                                            <div className="text-center space-y-4">
                                                                <div className="h-20 w-20 rounded-[2rem] bg-white shadow-xl flex items-center justify-center mx-auto text-slate-200">
                                                                    <ImageIcon size={32} />
                                                                </div>
                                                                <p className="text-xs font-bold text-slate-400">لم يتم اختيار صورة بعد</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-[11px] font-bold text-slate-400 uppercase px-2">رابط الصورة (URL)</label>
                                                    <input name="image_url" defaultValue={editingItem?.image_url} placeholder="أدخل رابط صورة عالية الدقة..." className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 h-16 text-xs font-mono font-medium focus:bg-white focus:border-indigo-200 transition-all outline-none" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Quick Summary Card */}
                                        <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden">
                                            <div className="relative z-10 space-y-8">
                                                <div className="flex items-center justify-between">
                                                    <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center">
                                                        <TrendingUp size={18} className="text-emerald-400" />
                                                    </div>
                                                    <div className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase">تحليل الأرباح</div>
                                                </div>
                                                
                                                <div className="space-y-1">
                                                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">هامش الربح لكل طلب</p>
                                                    <h4 className="text-4xl font-black">{formatCurrency((editingItem?.price || 0) - (editingItem?.cost_price || 0), currency)}</h4>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">حالة الظهور</p>
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                                            <span className="text-xs font-bold">مباشر على المنيو</span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">القسم</p>
                                                        <span className="text-xs font-bold">{activeCategory?.name}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Decorative Elements */}
                                            <div className="absolute -bottom-10 -right-10 h-40 w-40 bg-indigo-600 rounded-full blur-[80px] opacity-20" />
                                            <div className="absolute top-10 right-10 h-4 underline w-px bg-white/10 rotate-45" />
                                        </div>
                                    </div>

                                </div>
                            </form>
                        </main>
                    </motion.div>
                )}
            
            {/* Same premium feel for other modals (Cat Add, Delete, Rename) */}
            {(confirmDeleteCatId || confirmDeleteItemId) && (
                <div key="delete-confirmation-modal" className="fixed inset-0 z-[10001] flex items-center justify-center p-6">
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
                <div key="edit-category-modal" className="fixed inset-0 z-[10002] flex items-center justify-center p-6">
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
                <div key="add-category-modal" className="fixed inset-0 z-[10003] flex items-center justify-center p-6">
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
      </div>
    </div>
  );
}
