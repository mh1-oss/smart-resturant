"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, CheckCircle2, Building2, Coins, Receipt, Phone, MapPin, Percent } from "lucide-react";
import { updateSettings } from "@/app/actions/settings";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function SettingsForm({ initialSettings }: { initialSettings: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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
      ]
    },
    {
      title: "تخصيص الفواتير",
      description: "إدارة النصوص التي تظهر للعملاء في الوصولات",
      icon: Receipt,
      fields: [
        { name: "receiptFooter", label: "نص تذييل الوصل (Footer)", defaultValue: initialSettings.receiptFooter, icon: Receipt, isTextArea: true },
      ]
    }
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
               <div className="h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-900 border border-slate-100">
                  <section.icon size={28} />
               </div>
               <div>
                  <h3 className="text-2xl font-black text-slate-900 leading-tight">{section.title}</h3>
                  <p className="text-sm font-bold text-slate-400 mt-1">{section.description}</p>
               </div>
            </div>

            <div className="p-10">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {section.fields.map((field) => (
                    <div key={field.name} className={cn("space-y-3", field.isTextArea && "md:col-span-2")}>
                       <label className="text-xs font-black text-slate-900 uppercase tracking-widest block px-1">
                          {field.label}
                       </label>
                       <div className="relative group">
                          <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors pointer-events-none">
                             {!field.isTextArea && <field.icon size={20} />}
                          </div>
                          {field.isTextArea ? (
                             <textarea 
                               name={field.name}
                               defaultValue={field.defaultValue}
                               className="w-full h-32 rounded-2xl bg-slate-50 border border-slate-100 p-6 font-bold text-slate-700 outline-none ring-2 ring-transparent focus:ring-slate-900 transition-all resize-none"
                               placeholder="..."
                               required
                             />
                          ) : (
                             <input 
                               name={field.name}
                               type={field.type || "text"}
                               defaultValue={field.defaultValue}
                               className="w-full h-16 rounded-2xl bg-slate-50 pr-14 pl-6 font-bold text-slate-700 border border-slate-100 outline-none ring-2 ring-transparent focus:ring-slate-900 transition-all"
                               placeholder="..."
                               required
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
         <div className="premium-card p-6 bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl shadow-slate-900/40 border-none">
            <div className="flex items-center gap-4">
              {success ? (
                <div className="flex items-center gap-3 text-emerald-400">
                  <div className="h-10 w-10 rounded-full bg-emerald-400/10 flex items-center justify-center">
                    <CheckCircle2 size={24} />
                  </div>
                  <span className="font-black text-lg">تم تطبيق التغييرات بنجاح</span>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-white/50">
                  <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center">
                    <Save size={20} />
                  </div>
                  <span className="font-bold">تأكد من مراجعة كافة الحقول قبل الحفظ</span>
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
