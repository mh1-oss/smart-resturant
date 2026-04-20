"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  QrCode, 
  Trash2, 
  RefreshCcw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  X,
  Download,
  LayoutGrid,
  Hash,
  Activity,
  Printer,
  ChevronRight,
  Loader2,
  Truck,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createTable, deleteTable } from "@/app/actions/table";
import { QRCodeSVG } from "qrcode.react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function TablesManagementClient({ initialTables }: { initialTables: any[] }) {
  const [tables, setTables] = useState(initialTables);
  const [newTableNum, setNewTableNum] = useState("");
  const [loading, setLoading] = useState(false);
  const [qrTable, setQrTable] = useState<any>(null);
  const [origin, setOrigin] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [confirmDeleteTableId, setConfirmDeleteTableId] = useState<number | null>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
    setIsMounted(true);
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (qrTable || confirmDeleteTableId) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [qrTable, confirmDeleteTableId]);

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableNum) return;
    setLoading(true);
    
    const result = await createTable(parseInt(newTableNum));
    if (result.success) {
      setNewTableNum("");
      window.location.reload(); 
    } else {
      alert(result.error);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirmDeleteTableId) return;
    const id = confirmDeleteTableId;
    setConfirmDeleteTableId(null);
    
    const previousTables = [...tables];
    setTables(prev => prev.filter(t => t.id !== id));

    const result = await deleteTable(id);
    if (!result.success) {
      setTables(previousTables);
      alert(result.error || "فشل في حذف الطاولة");
    }
  };

  return (
    <div className="space-y-12 pb-32" dir="rtl">
      {/* 1. Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="premium-card border-none p-8 text-white overflow-hidden relative group" style={{ backgroundColor: 'var(--brand-primary)' }}>
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">إحصائيات الصالة</p>
            <h4 className="text-4xl font-black">{tables.length}</h4>
            <p className="text-sm font-bold text-white/60 mt-1">إجمالي الطاولات المسجلة</p>
          </div>
          <LayoutGrid className="absolute -left-4 -bottom-4 h-28 w-28 text-white/5 rotate-12 transition-transform group-hover:scale-110 group-hover:rotate-6 duration-700" />
        </div>
        
        <div className="premium-card p-6 border-slate-100 flex items-center justify-between gap-5 bg-white group">
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">الحالة الحالية</p>
            <h4 className="text-xl font-black text-slate-900">نظام نشط</h4>
            <p className="text-xs font-bold text-slate-400">تزامن فوري مع الطلبات</p>
          </div>
          <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 transition-transform group-hover:rotate-12 duration-500">
            <Activity size={28} />
          </div>
        </div>

        <div className="premium-card p-6 border-slate-100 flex items-center justify-between gap-5 bg-white group">
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">رموز الاستجابة</p>
            <h4 className="text-xl font-black text-slate-900">إنشاء تلقائي</h4>
            <p className="text-xs font-bold text-slate-400">تحميل مباشر بنقرة واحدة</p>
          </div>
          <div className="h-14 w-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 transition-transform group-hover:-rotate-12 duration-500">
            <QrCode size={28} />
          </div>
        </div>
      </div>

      {/* 2. Management Tools Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Add Table Section */}
        <div className="lg:col-span-8 flex flex-col gap-6 text-right">
          <div className="flex items-center justify-end gap-4">
            <h3 className="text-xl font-black text-slate-900">إضافة طاولة جديدة</h3>
            <div className="h-2 w-10 rounded-full" style={{ backgroundColor: 'var(--brand-primary)' }}></div>
          </div>
          
          <form onSubmit={handleAddTable} className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto h-16 px-10 rounded-3xl text-white font-black hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-900/20 disabled:opacity-50 active:scale-95 order-2 sm:order-1"
              style={{ backgroundColor: 'var(--brand-primary)' }}
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <Plus className="h-5 w-5" />}
              <span>إضافة للطاقة الاستيعابية</span>
            </button>
            <div className="relative flex-1 w-full order-1 sm:order-2">
              <Hash className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
              <input
                type="number"
                value={newTableNum}
                onChange={(e) => setNewTableNum(e.target.value)}
                className="w-full h-16 pr-14 pl-6 rounded-3xl bg-slate-50 border-none font-black text-slate-700 outline-none ring-2 ring-transparent transition-all text-right text-lg focus:ring-[var(--brand-primary)]"
                placeholder="أدخل رقم الطاولة..."
                min="1"
                required
              />
            </div>
          </form>
        </div>

        {/* Quick Actions / Delivery Link */}
        <div className="lg:col-span-4 flex flex-col gap-6 text-right">
          <div className="flex items-center justify-end gap-4">
            <h3 className="text-xl font-black text-slate-900">روابط سريعة</h3>
            <div className="h-2 w-10 rounded-full bg-orange-500"></div>
          </div>
          
          <div className="premium-card p-6 border-slate-100 bg-white shadow-sm overflow-hidden group">
            <div className="flex items-center justify-end gap-4 mb-4">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">منيو الطلبات الخارجية</p>
                <h4 className="text-sm font-black text-right" style={{ color: 'var(--brand-primary)' }}>رابط التوصيل</h4>
              </div>
              <div className="h-12 w-12 rounded-2xl text-white flex items-center justify-center font-black text-lg transition-transform group-hover:scale-110 duration-500 shadow-sm shadow-orange-500/10" style={{ backgroundColor: 'var(--brand-primary)' }}>
                <Truck size={24} />
              </div>
            </div>
            <a 
              href={`${origin}/menu/delivery`} 
              target="_blank"
              className="w-full h-12 px-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between hover:bg-white hover:border-slate-200 transition-all group/link"
            >
              <ExternalLink className="h-4 w-4 text-slate-300 group-hover/link:text-slate-900 transition-all" />
              <span className="text-xs font-bold text-slate-400 truncate max-w-[150px] group-hover/link:text-slate-900 font-mono">
                {origin ? `${origin}/menu/delivery` : "جاري تحميل الرابط..."}
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* 3. Tables Grid Section */}
      <div className="space-y-8">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-4">
            <h3 className="text-2xl font-black" style={{ color: 'var(--brand-primary)' }}>توزيع الصالة</h3>
            <div className="h-2 w-10 rounded-full bg-emerald-500"></div>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 bg-emerald-50 px-4 py-2 rounded-full ring-1 ring-emerald-100">
             <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
             مزامنة حية
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tables.map((table, idx) => (
            <motion.div 
              key={table.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="premium-card group relative border-slate-100 p-8 transition-all hover:shadow-2xl hover:shadow-slate-200/60 active:scale-[0.98] overflow-hidden bg-white"
            >
              {/* Top accent line */}
              <div className="absolute top-0 inset-x-0 h-1.5 origin-right scale-x-0 group-hover:scale-x-100 transition-transform duration-500" style={{ backgroundColor: 'var(--brand-primary)' }} />
              
              <div className="mb-10 flex items-start justify-between relative z-10">
                <div className="flex h-20 w-20 items-center justify-center rounded-[2.5rem] bg-slate-50 text-slate-900 ring-4 ring-white shadow-inner transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-slate-100 group-hover:text-[var(--brand-primary)]">
                  <span className="text-4xl font-black">{table.table_number}</span>
                </div>
                
                <div className={cn(
                  "flex items-center gap-1.5 rounded-full px-4 py-2 text-[9px] font-black uppercase tracking-widest transition-colors",
                  table.status === "Available" 
                    ? "bg-emerald-50 text-emerald-600" 
                    : "bg-amber-50 text-amber-600"
                )}>
                  {table.status === "Available" ? <CheckCircle2 size={12} /> : <RefreshCcw size={12} className="animate-spin" />}
                  <span>{table.status === "Available" ? "متاحة" : "مشغولة"}</span>
                </div>
              </div>

              <div className="relative z-10 text-right">
                  <h3 className="text-lg font-black mb-1" style={{ color: 'var(--brand-primary)' }}>طاولة رقم {table.table_number}</h3>
                  <p className="text-xs font-bold text-slate-400 flex items-center justify-end gap-1.5">
                      جاهز للمسح والطلب المعاصر
                      <QrCode size={14} className="text-slate-300" />
                  </p>
              </div>

              <div className="mt-10 grid grid-cols-2 gap-4 relative z-10">
                <button 
                  onClick={() => setQrTable(table)}
                  className="flex h-14 items-center justify-center gap-3 rounded-2xl bg-white border-2 border-slate-100 text-slate-900 text-sm font-black transition-all active:scale-95 group/qr hover:border-[var(--brand-primary)]"
                >
                  <QrCode size={18} className="transition-transform group-hover/qr:scale-110" />
                  QR كود
                </button>
                <button 
                  onClick={() => setConfirmDeleteTableId(table.id)}
                  className="flex h-14 items-center justify-center gap-3 rounded-2xl bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 transition-all active:scale-95 group/del"
                >
                  <Trash2 size={18} className="transition-transform group-hover/del:scale-110" />
                  حذف
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modern High-End Dialogs */}
      <AnimatePresence>
        {/* QR Modal */}
        {isMounted && qrTable && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 no-print">
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                onClick={() => setQrTable(null)} 
                className="fixed inset-0 backdrop-blur-md" 
                style={{ backgroundColor: 'color-mix(in srgb, var(--brand-primary), transparent 10%)' }}
            />
            
            <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 30 }} 
                animate={{ scale: 1, opacity: 1, y: 0 }} 
                exit={{ scale: 0.9, opacity: 0, y: 30 }} 
                className="relative z-10 w-full max-w-sm bg-white rounded-[4rem] p-12 shadow-[0_32px_120px_-20px_rgba(0,0,0,0.5)] flex flex-col items-center overflow-hidden"
            >
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-slate-50 rounded-full -mr-20 -mt-20 opacity-50" />
                
                <button 
                onClick={() => setQrTable(null)}
                className="absolute left-8 top-10 h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
                >
                <X size={24} />
                </button>
                
                <div className="text-center mb-10 w-full">
                    <div className="h-16 w-16 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl" style={{ backgroundColor: 'var(--brand-primary)' }}>
                        <QrCode size={32} />
                    </div>
                    <h2 className="text-4xl font-black leading-none" style={{ color: 'var(--brand-primary)' }}>طاولة {qrTable.table_number}</h2>
                    <p className="text-xs font-bold text-slate-400 mt-4 tracking-wider uppercase">امسح الرمز لتصفح المنيو</p>
                </div>

                <div className="p-8 bg-white rounded-[3.5rem] shadow-inner border-[12px] border-slate-50 mb-10 group relative">
                    <QRCodeSVG 
                        value={`${origin}/menu/${qrTable.table_number}`} 
                        size={200}
                        level="H"
                        includeMargin={false}
                    />
                </div>

                <div className="w-full space-y-4">
                    <button 
                    onClick={() => window.print()}
                    className="w-full h-18 text-white rounded-3xl font-black text-lg shadow-2xl flex items-center justify-center gap-4 hover:opacity-90 transition-all active:scale-95"
                    style={{ backgroundColor: 'var(--brand-primary)' }}
                    >
                        <Printer className="h-6 w-6" />
                        طباعة الكرت
                    </button>
                    <a 
                        href={`${origin}/menu/${qrTable.table_number}`} 
                        target="_blank"
                        className="flex items-center justify-center h-16 w-full rounded-2xl bg-slate-50 text-slate-500 font-bold text-sm hover:text-slate-900 hover:bg-slate-100 transition-all gap-2"
                    >
                        معاينة المنيو سريعة
                        <ExternalLink size={16} />
                    </a>
                </div>
            </motion.div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {confirmDeleteTableId && (
            <div className="fixed inset-0 z-[500] flex items-center justify-center p-6">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setConfirmDeleteTableId(null)} className="fixed inset-0 backdrop-blur-md" style={{ backgroundColor: 'color-mix(in srgb, var(--brand-primary), transparent 20%)' }} />
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-sm bg-white rounded-[3rem] p-10 text-center relative z-10 border border-slate-100 shadow-2xl">
                    <div className="mx-auto w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
                        <AlertCircle className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-black mb-2" style={{ color: 'var(--brand-primary)' }}>تأكيد الحذف</h2>
                    <p className="text-slate-400 font-bold mb-10 leading-relaxed text-sm">سيتم إزالة الطاولة وكود الـ QR بشكل نهائي. هل ترغب بالمتابعة؟</p>
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => setConfirmDeleteTableId(null)} className="h-16 rounded-2xl font-black text-slate-500 bg-slate-50 hover:bg-slate-100 transition-all active:scale-95 leading-none">
                            إلغاء
                        </button>
                        <button onClick={handleDelete} className="h-16 rounded-2xl font-black text-white bg-rose-600 hover:bg-rose-700 shadow-xl shadow-rose-600/20 active:scale-95 transition-all leading-none">
                            حذف
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* Professional Print Template */}
      {isMounted && qrTable && createPortal(
        <div className="hidden print:flex fixed inset-0 bg-white items-center justify-center p-0 m-0 z-[1000]">
          <div className="flex flex-col items-center justify-center text-center p-16 border-[16px] border-slate-900 rounded-[80px] w-[600px] aspect-[1/1.5] bg-white relative">
            {/* Header branding */}
            <div className="mb-12 flex flex-col items-center">
                <div className="h-28 w-28 text-white rounded-[36px] flex items-center justify-center text-5xl font-black mb-6 shadow-2xl" style={{ backgroundColor: 'var(--brand-primary)' }}>
                    S
                </div>
                <h1 className="text-5xl font-black text-slate-900 tracking-tight">SMART MENU</h1>
                <div className="h-1.5 w-24 bg-amber-400 mt-4 rounded-full" />
            </div>
            
            <div className="text-center mb-12">
                <h2 className="text-2xl font-black text-slate-900 mb-2">أهلاً بك - تفضل بالطلب</h2>
                <p className="text-slate-400 font-bold text-lg">امسح الرمز أدناه لتصفح قائمة الطعام</p>
            </div>
            
            <div className="p-10 bg-white rounded-[4rem] shadow-2xl border-4 border-slate-100 mb-12 relative">
              <QRCodeSVG 
                value={`${origin}/menu/${qrTable.table_number}`} 
                size={340}
                level="H"
                includeMargin={false}
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-3xl shadow-xl">
                 <div className="h-12 w-12 rounded-2xl" style={{ backgroundColor: 'var(--brand-primary)' }} />
              </div>
            </div>
            
            <div className="mt-auto w-full">
              <div className="flex items-center justify-between gap-6 px-10 py-8 rounded-[3rem] text-white shadow-2xl" style={{ backgroundColor: 'var(--brand-primary)' }}>
                <div className="text-right">
                    <p className="text-sm font-black opacity-50 uppercase tracking-widest mb-1">رقم الطاولة</p>
                    <p className="text-6xl font-black leading-none">{qrTable.table_number}</p>
                </div>
                <div className="h-16 w-px bg-white/20" />
                <div className="text-left flex flex-col items-end">
                    <LayoutGrid size={32} className="text-amber-400 mb-2" />
                    <p className="text-[10px] font-black opacity-40 text-right">SCAN TO ORDER<br/>DELICIOUS FOOD</p>
                </div>
              </div>
              <p className="mt-8 text-xs font-black text-slate-300 uppercase tracking-[0.4em]">WWW.SMART-RESTAURANT.COM</p>
            </div>
          </div>
        </div>,
        document.body
      )}

      <style jsx global>{`
        @media print {
          body {
            visibility: hidden;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          .print\:flex {
            visibility: visible;
            display: flex !important;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            justify-content: center;
            align-items: center;
          }
        }
      `}</style>
    </div>
  );
}
