"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, CheckCircle2, Building2, Coins, Receipt, Phone, MapPin, Percent, Truck, Palette, Image as ImageIcon, Zap } from "lucide-react";
import { updateSettings } from "@/app/actions/settings";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function SettingsForm({ initialSettings }: { initialSettings: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Theme states for presets
  const [themePrimary, setThemePrimary] = useState(initialSettings.themePrimary || "#0f172a");
  const [themeAccent, setThemeAccent] = useState(initialSettings.themeAccent || "#f59e0b");
  const [themeBgColor, setThemeBgColor] = useState(initialSettings.themeBgColor || "#f8fafc");
  const [themeBgImage, setThemeBgImage] = useState(initialSettings.themeBgImage || "");

  const applyPreset = (primary: string, accent: string, bg: string) => {
    setThemePrimary(primary);
    setThemeAccent(accent);
    setThemeBgColor(bg);
    setThemeBgImage("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const data = {
        restaurantName: formData.get("restaurantName") as string,
        currency: formData.get("currency") as string,
        taxRate: formData.get("taxRate") as string,
        address: formData.get("address") as string,
        restaurantPhone: formData.get("restaurantPhone") as string,
        receiptFooter: formData.get("receiptFooter") as string,
        deliveryFee: formData.get("deliveryFee") as string,
        themePrimary: formData.get("themePrimary") as string,
        themeAccent: formData.get("themeAccent") as string,
        themeBgColor: formData.get("themeBgColor") as string,
        themeBgImage: formData.get("themeBgImage") as string,
    };

    const result = await updateSettings(data);
    if (result.success) {
      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    }
    setLoading(false);
  };

  const sections: {
    title: string;
    description: string;
    icon: any;
    fields: { 
      name: string; 
      label: string; 
      defaultValue: any; 
      icon: any; 
      type?: string; 
      isTextArea?: boolean; 
      isColor?: boolean;
    }[];
  }[] = [
    {
      title: "المعلومات العامة",
      description: "الهوية الأساسية للمطعم وبيانات الاتصال",
      icon: Building2,
      fields: [
        { name: "restaurantName", label: "اسم المطعم", defaultValue: initialSettings.restaurantName, icon: Building2 },
        { name: "restaurantPhone", label: "رقم الهاتف", defaultValue: initialSettings.restaurantPhone, icon: Phone },
        { name: "address", label: "عنوان المطعم", defaultValue: initialSettings.address, icon: MapPin },
      ]
    },
    {
      title: "الإعدادات المالية",
      description: "تكوين العملات والضرائب المطبقة",
      icon: Coins,
      fields: [
        { name: "currency", label: "العملة (مثلاً: IQD, $, EGP)", defaultValue: initialSettings.currency, icon: Coins },
        { name: "taxRate", label: "نسبة الضريبة (%)", defaultValue: initialSettings.taxRate, icon: Percent, type: "number" },
        { name: "deliveryFee", label: "سعر التوصيل الأساسي", defaultValue: initialSettings.deliveryFee, icon: Truck, type: "number" },
      ]
    },
    {
      title: "تخصيص الفواتير",
      description: "إدارة النصوص التي تظهر للعملاء في الوصولات",
      icon: Receipt,
      fields: [
        { name: "receiptFooter", label: "نص تذييل الوصل (Footer)", defaultValue: initialSettings.receiptFooter, icon: Receipt, isTextArea: true },
      ]
    },
    {
      title: "هوية العلامة التجارية",
      description: "تخصيص ألوان التطبيق وصورة الخلفية",
      icon: Palette,
      fields: [
        { name: "themePrimary", label: "اللون الأساسي", defaultValue: themePrimary, icon: Palette, isColor: true },
        { name: "themeAccent", label: "لون التميز (Accent)", defaultValue: themeAccent, icon: Zap, isColor: true },
        { name: "themeBgColor", label: "لون الخلفية", defaultValue: themeBgColor, icon: Palette, isColor: true },
        { name: "themeBgImage", label: "رابط صورة الخلفية (URL)", defaultValue: themeBgImage, icon: ImageIcon },
      ]
    }
  ];

  const presets = [
    { name: "برتقالي", primary: "#f59e0b", accent: "#fbbf24", bg: "#fff7ed", color: "bg-amber-500" },
    { name: "أحمر", primary: "#ef4444", accent: "#f87171", bg: "#fef2f2", color: "bg-rose-500" },
    { name: "أزرق", primary: "#3b82f6", accent: "#60a5fa", bg: "#eff6ff", color: "bg-blue-500" },
    { name: "أخضر", primary: "#10b981", accent: "#34d399", bg: "#f0fdf4", color: "bg-emerald-500" },
    { name: "أسود", primary: "#0f172a", accent: "#f59e0b", bg: "#f8fafc", color: "bg-slate-900" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-12">
      <div className="grid grid-cols-1 gap-12">
        {sections.map((section, sIdx) => (
          <motion.div 
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sIdx * 0.1 }}
            className="premium-card p-0 overflow-hidden border-slate-100"
          >
            <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center gap-6">
               <div className="h-14 w-14 rounded-2xl text-white shadow-lg flex items-center justify-center" style={{ backgroundColor: 'var(--brand-primary)' }}>
                  <section.icon size={28} />
               </div>
               <div>
                  <h3 className="text-2xl font-black text-slate-900 leading-tight">{section.title}</h3>
                  <p className="text-sm font-bold text-slate-400 mt-1">{section.description}</p>
               </div>
            </div>

            <div className="p-10">
               {section.title === "هوية العلامة التجارية" && (
                 <div className="mb-10 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 px-1">الأنماط الجاهزة (Presets)</p>
                    <div className="flex flex-wrap gap-3">
                       {presets.map((preset) => (
                         <button
                           key={preset.name}
                           type="button"
                           onClick={() => applyPreset(preset.primary, preset.accent, preset.bg)}
                           className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all active:scale-95 group"
                         >
                            <div className={cn("h-6 w-6 rounded-lg shadow-inner", preset.color)} />
                            <span className="text-sm font-black text-slate-700">{preset.name}</span>
                         </button>
                       ))}
                    </div>
                 </div>
               )}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {section.fields.map((field) => (
                    <div key={field.name} className={cn("space-y-3", field.isTextArea && "md:col-span-2")}>
                       <label className="text-xs font-black text-slate-900 uppercase tracking-widest block px-1">
                          {field.label}
                       </label>
                       <div className="relative group">
                          {field.isTextArea ? (
                             <textarea 
                                id={field.name}
                                name={field.name}
                                defaultValue={field.defaultValue}
                                className="w-full h-32 rounded-2xl bg-slate-50 border border-slate-100 p-6 font-bold text-slate-700 outline-none ring-2 ring-transparent focus:ring-[var(--brand-primary)] transition-all resize-none"
                                placeholder="..."
                                required
                             />
                          ) : field.isColor ? (
                             <div className="flex items-center gap-4">
                                <input 
                                   id={field.name}
                                   name={field.name}
                                   type="color"
                                   value={field.name === "themePrimary" ? themePrimary : field.name === "themeAccent" ? themeAccent : themeBgColor}
                                   onChange={(e) => {
                                      if (field.name === "themePrimary") setThemePrimary(e.target.value);
                                      else if (field.name === "themeAccent") setThemeAccent(e.target.value);
                                      else if (field.name === "themeBgColor") setThemeBgColor(e.target.value);
                                   }}
                                   className="h-16 w-24 rounded-2xl bg-white border border-slate-100 p-1 cursor-pointer outline-none ring-2 ring-transparent focus:ring-[var(--brand-primary)] transition-all shadow-sm"
                                />
                                <input 
                                   type="text"
                                   value={field.name === "themePrimary" ? themePrimary : field.name === "themeAccent" ? themeAccent : themeBgColor}
                                   onChange={(e) => {
                                      if (field.name === "themePrimary") setThemePrimary(e.target.value);
                                      else if (field.name === "themeAccent") setThemeAccent(e.target.value);
                                      else if (field.name === "themeBgColor") setThemeBgColor(e.target.value);
                                   }}
                                   className="flex-1 h-16 rounded-2xl bg-slate-50 px-6 font-bold text-slate-700 border border-slate-100 outline-none focus:ring-2 focus:ring-[var(--brand-primary)] transition-all"
                                   placeholder="#000000"
                                />
                             </div>
                          ) : (
                             <input 
                                id={field.name}
                                name={field.name}
                                type={field.type || "text"}
                                value={field.name === "themeBgImage" ? themeBgImage : field.defaultValue}
                                onChange={(e) => {
                                   if (field.name === "themeBgImage") setThemeBgImage(e.target.value);
                                }}
                                className="w-full h-16 rounded-2xl bg-slate-50 pr-14 pl-6 font-bold text-slate-700 border border-slate-100 outline-none ring-2 ring-transparent focus:ring-[var(--brand-primary)] transition-all"
                                placeholder="..."
                                required={!field.name.startsWith("theme")}
                             />
                          )}
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Floating Action Bar - Adjusted distance to avoid mobile bottom nav overlap */}
      <div className="sticky bottom-32 lg:bottom-8 z-30">
         <div className="premium-card p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl border-none" style={{ backgroundColor: 'var(--brand-primary)', boxShadow: '0 25px 50px -12px color-mix(in srgb, var(--brand-primary), transparent 60%)' }}>
            <div className="flex items-center gap-4">
              {success ? (
                <div className="flex items-center gap-3 text-emerald-400">
                  <div className="h-10 w-10 rounded-full bg-emerald-400/10 flex items-center justify-center">
                    <CheckCircle2 size={24} />
                  </div>
                  <span className="font-black text-lg">تم تطبيق التغييرات بنجاح</span>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-white/90">
                  <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Save size={20} />
                  </div>
                  <span className="font-medium antialiased">تأكد من مراجعة كافة الحقول قبل الحفظ</span>
                </div>
              )}
            </div>
            
            <button 
              type="submit" 
              className="w-full sm:w-auto h-16 px-12 rounded-2xl bg-white text-slate-900 font-black flex items-center justify-center gap-4 hover:bg-slate-100 transition-all active:scale-95 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin h-6 w-6" /> : (
                <>
                  <Save size={20} />
                  حفظ وتطبيق الإعدادات
                </>
              )}
            </button>
         </div>
      </div>
    </form>
  );
}
