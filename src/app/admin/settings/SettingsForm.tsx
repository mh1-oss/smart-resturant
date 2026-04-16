"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, CheckCircle2 } from "lucide-react";
import { updateSettings } from "@/app/actions/settings";

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
      router.refresh(); // Force client refetch of the page data
      setTimeout(() => setSuccess(false), 3000);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-black text-slate-700">اسم المطعم</label>
          <input 
            name="restaurantName"
            defaultValue={initialSettings.restaurantName}
            className="w-full h-14 rounded-2xl border-slate-200 bg-slate-50 px-5 font-bold outline-none focus:ring-2 focus:ring-slate-900/5 transition-all"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-black text-slate-700">العملة (مثلاً: IQD, $, EGP)</label>
          <input 
            name="currency"
            defaultValue={initialSettings.currency}
            className="w-full h-14 rounded-2xl border-slate-200 bg-slate-50 px-5 font-bold outline-none focus:ring-2 focus:ring-slate-900/5 transition-all"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-black text-slate-700">نسبة الضريبة (%)</label>
          <input 
            name="taxRate"
            type="number"
            defaultValue={initialSettings.taxRate}
            className="w-full h-14 rounded-2xl border-slate-200 bg-slate-50 px-5 font-bold outline-none focus:ring-2 focus:ring-slate-900/5 transition-all"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-black text-slate-700">عنوان المطعم</label>
          <input 
            name="address"
            defaultValue={initialSettings.address}
            className="w-full h-14 rounded-2xl border-slate-200 bg-slate-50 px-5 font-bold outline-none focus:ring-2 focus:ring-slate-900/5 transition-all"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-black text-slate-700">رقم الهاتف</label>
          <input 
            name="restaurantPhone"
            defaultValue={initialSettings.restaurantPhone}
            className="w-full h-14 rounded-2xl border-slate-200 bg-slate-50 px-5 font-bold outline-none focus:ring-2 focus:ring-slate-900/5 transition-all"
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-black text-slate-700">نص تذييل الوصل (Footer)</label>
          <textarea 
            name="receiptFooter"
            defaultValue={initialSettings.receiptFooter}
            className="w-full h-24 rounded-2xl border-slate-200 bg-slate-50 p-5 font-bold outline-none focus:ring-2 focus:ring-slate-900/5 transition-all resize-none"
            required
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-8 border-t border-slate-100">
        {success && (
          <div className="flex items-center gap-2 text-emerald-600 animate-in fade-in slide-in-from-right-2">
            <CheckCircle2 size={20} />
            <span className="font-bold">تم حفظ الإعدادات بنجاح</span>
          </div>
        )}
        <div className="flex-1" />
        <button 
          type="submit" 
          className="premium-button h-16 bg-slate-900 text-white hover:bg-black px-12 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? <Loader2 className="animate-spin h-6 w-6" /> : (
            <>
              <Save className="ml-2 h-5 w-5" />
              حفظ التغييرات
            </>
          )}
        </button>
      </div>
    </form>
  );
}
