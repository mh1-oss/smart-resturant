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
  Loader2
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
    <div className="space-y-10 pb-24">
      {/* Header & Add Form */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 px-1">
        <div className="space-y-6 flex-1">
          <div>
            <h2 className="text-3xl font-black text-slate-900 leading-tight">إدارة الطاولات</h2>
            <p className="font-bold text-slate-400 text-sm mt-1">تنظيم توزيع الصالة وإدارة أكواد QR</p>
          </div>
          
          <form onSubmit={handleAddTable} className="flex items-center gap-4 w-full max-w-xl">
            <div className="relative flex-1">
              <Hash className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="number"
                value={newTableNum}
                onChange={(e) => setNewTableNum(e.target.value)}
                className="pro-input h-14 w-full pr-12 pl-4 text-base"
                placeholder="رقم الطاولة الجديدة..."
                required
              />
            </div>
            <button 
              disabled={loading}
              className="pro-button h-14 px-8 shadow-xl shadow-slate-900/10 whitespace-nowrap"
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <Plus className="h-5 w-5" />}
              إضافة الطاولة
            </button>
          </form>
        </div>

        <div className="flex items-center gap-3">
            <div className="premium-card !p-4 flex items-center gap-4 border-slate-100 bg-white/50 backdrop-blur-sm">
                <div className="h-10 w-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center">
                    <Activity size={20} />
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">إجمالي الطاولات</p>
                    <p className="text-lg font-black text-slate-900">{tables.length}</p>
                </div>
            </div>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tables.map((table, idx) => (
          <motion.div 
            key={table.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="premium-card group relative border-slate-100/60 p-8 transition-all hover:shadow-2xl hover:shadow-slate-200/50 active:scale-[0.98] overflow-hidden"
          >
            {/* Background Pattern */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-100 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="mb-8 flex items-start justify-between relative z-10">
              <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-slate-50 text-slate-900 ring-4 ring-white shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                <span className="text-3xl font-black">{table.table_number}</span>
              </div>
              
              <div className={cn(
                "flex items-center gap-2 rounded-2xl px-4 py-2 text-[10px] font-black uppercase tracking-widest ring-1",
                table.status === "Available" 
                  ? "bg-emerald-50 text-emerald-600 ring-emerald-100" 
                  : "bg-amber-50 text-amber-600 ring-amber-100"
              )}>
                {table.status === "Available" ? <CheckCircle2 size={12} /> : <RefreshCcw size={12} className="animate-spin" />}
                {table.status === "Available" ? "شاغرة" : "مشغولة"}
              </div>
            </div>

            <div className="relative z-10">
                <h3 className="text-xl font-black text-slate-900 mb-1">طاولة {table.table_number}</h3>
                <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                    <QrCode size={14} className="text-slate-300" />
                    جاهز للمسح والطلب
                </p>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-4 relative z-10">
              <button 
                onClick={() => setQrTable(table)}
                className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-slate-900 text-white text-sm font-black transition-all shadow-lg shadow-slate-900/10 active:scale-95"
              >
                <QrCode size={18} />
                QR كود
              </button>
              <button 
                onClick={() => setConfirmDeleteTableId(table.id)}
                className="flex h-14 items-center justify-center gap-2 rounded-2xl border-2 border-slate-100 bg-white text-slate-400 hover:text-rose-600 hover:border-rose-100 transition-all active:scale-95"
              >
                <Trash2 size={18} />
                حذف
              </button>
            </div>
          </motion.div>
        ))}
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
                className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl" 
            />
            
            <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 30 }} 
                animate={{ scale: 1, opacity: 1, y: 0 }} 
                exit={{ scale: 0.9, opacity: 0, y: 30 }} 
                className="relative z-10 w-full max-w-md bg-white rounded-[3.5rem] p-12 shadow-2xl flex flex-col items-center overflow-hidden"
            >
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-slate-50 rounded-full -mr-20 -mt-20 opacity-50" />
                
                <button 
                onClick={() => setQrTable(null)}
                className="absolute left-8 top-10 h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
                >
                <X size={24} />
                </button>
                
                <div className="text-center mb-10">
                    <div className="h-16 w-16 bg-slate-900 text-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-900/20">
                        <QrCode size={32} />
                    </div>
                    <h2 className="text-[2.5rem] font-black text-slate-900 leading-none">طاولة {qrTable.table_number}</h2>
                    <p className="text-sm font-bold text-slate-400 mt-3">امسح الرمز لبدء تجربة الطعام</p>
                </div>

                <div className="p-8 bg-white rounded-[3rem] shadow-2xl border-[12px] border-slate-50 mb-10 group relative">
                    <QRCodeSVG 
                        value={`${origin}/menu/${qrTable.table_number}`} 
                        size={200}
                        level="H"
                        includeMargin={false}
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/40 backdrop-blur-sm rounded-[2rem]">
                        <div className="h-12 w-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center">
                            <RefreshCcw size={20} />
                        </div>
                    </div>
                </div>

                <div className="w-full space-y-4">
                    <button 
                    onClick={() => window.print()}
                    className="pro-button w-full h-18 text-lg shadow-2xl shadow-slate-900/20"
                    >
                        <Printer className="h-6 w-6" />
                        طباعة كرت الطاولة
                    </button>
                    <a 
                        href={`${origin}/menu/${qrTable.table_number}`} 
                        target="_blank"
                        className="flex items-center justify-center h-16 w-full rounded-2xl bg-slate-50 text-slate-500 font-black text-sm hover:text-slate-900 hover:bg-slate-100 transition-all"
                    >
                        <ExternalLink size={16} className="ml-2" />
                        فتح معاينة المباشرة
                    </a>
                </div>
            </motion.div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {confirmDeleteTableId && (
            <div className="fixed inset-0 z-[500] flex items-center justify-center p-6">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setConfirmDeleteTableId(null)} className="fixed inset-0 bg-slate-900/80 backdrop-blur-md" />
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-sm premium-card p-10 text-center relative z-10 border border-rose-100">
                    <div className="mx-auto w-24 h-24 bg-rose-50 text-rose-500 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-xl shadow-rose-500/10">
                        <AlertCircle className="w-12 h-12" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-3">حذف الطاولة</h2>
                    <p className="text-slate-400 font-bold mb-10 leading-relaxed text-sm">هل أنت متأكد من حذف هذه الطاولة؟ لن يتمكن الزبائن من مسح الكود الخاص بها مرة أخرى.</p>
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => setConfirmDeleteTableId(null)} className="h-16 rounded-[1.5rem] font-black text-slate-500 bg-slate-50 hover:bg-slate-100 transition-all active:scale-95">
                            إلغاء
                        </button>
                        <button onClick={handleDelete} className="h-16 rounded-[1.5rem] font-black text-white bg-rose-600 hover:bg-rose-700 shadow-xl shadow-rose-600/20 active:scale-95 transition-all">
                            تأكيد الحذف
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
                <div className="h-28 w-28 bg-slate-900 text-white rounded-[36px] flex items-center justify-center text-5xl font-black mb-6 shadow-2xl">
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
                 <div className="h-12 w-12 bg-slate-900 rounded-2xl" />
              </div>
            </div>
            
            <div className="mt-auto w-full">
              <div className="flex items-center justify-between gap-6 px-10 py-8 rounded-[3rem] bg-slate-900 text-white shadow-2xl">
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
