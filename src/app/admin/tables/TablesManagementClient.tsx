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
  Download
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createTable, deleteTable } from "@/app/actions/table";
import { QRCodeSVG } from "qrcode.react";

export default function TablesManagementClient({ initialTables }: { initialTables: any[] }) {
  const [tables, setTables] = useState(initialTables);
  const [newTableNum, setNewTableNum] = useState("");
  const [loading, setLoading] = useState(false);
  const [qrTable, setQrTable] = useState<any>(null);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

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

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذه الطاولة؟")) return;
    
    const previousTables = [...tables];
    setTables(prev => prev.filter(t => t.id !== id));

    const result = await deleteTable(id);
    if (result.success) {
      // Success - Already updated locally
    } else {
      setTables(previousTables);
      alert(result.error || "فشل في حذف الطاولة");
    }
  };

  return (
    <div className="space-y-8">
      {/* Add Table Form */}
      <form onSubmit={handleAddTable} className="surface-card flex items-end gap-6 border-slate-200/60 p-8">
        <div className="flex-1 space-y-2">
          <label className="text-sm font-black text-slate-700 mr-1">رقم الطاولة الجديدة</label>
          <input
            type="number"
            value={newTableNum}
            onChange={(e) => setNewTableNum(e.target.value)}
            className="w-full h-14 rounded-2xl border-slate-200 bg-slate-50 px-5 font-bold outline-none"
            placeholder="مثال: 10"
            required
          />
        </div>
        <button 
          disabled={loading}
          className="premium-button h-14 px-10 text-base bg-slate-900 text-white"
        >
          <Plus className="h-5 w-5 ml-2" />
          إضافة الطاولة
        </button>
      </form>

      {/* Tables Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tables.map((table) => (
          <div key={table.id} className="surface-card group relative border-slate-200/60 p-8 transition-all hover:shadow-xl hover:shadow-slate-200/50">
            <div className="mb-6 flex items-start justify-between">
              <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-slate-100 text-slate-900 ring-1 ring-slate-200/60">
                <span className="text-2xl font-black">{table.table_number}</span>
              </div>
              <div className={cn(
                "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-wider",
                table.status === "Available" 
                  ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100" 
                  : "bg-amber-50 text-amber-600 ring-1 ring-amber-100"
              )}>
                {table.status === "Available" ? <CheckCircle2 className="h-3 w-3" /> : <RefreshCcw className="h-3 w-3 animate-spin" />}
                {table.status === "Available" ? "شاغرة" : "مشغولة"}
              </div>
            </div>

            <h3 className="text-lg font-black text-slate-900">طاولة رقم {table.table_number}</h3>
            <p className="mt-1 text-xs font-bold text-slate-400">رابط الطلب عبر الموبايل جاهز</p>

            <div className="mt-8 grid grid-cols-2 gap-3">
              <button 
                onClick={() => setQrTable(table)}
                className="flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-xs font-black text-white transition-all hover:scale-105"
              >
                <QrCode className="h-4 w-4" />
                تحميل QR
              </button>
              <button 
                onClick={() => handleDelete(table.id)}
                className="flex items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs font-black text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100"
              >
                <Trash2 className="h-4 w-4" />
                حذف
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* QR Modal */}
      {qrTable && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6">
          <div className="w-full max-w-sm surface-card p-10 relative animate-in zoom-in-95 flex flex-col items-center">
            <button 
              onClick={() => setQrTable(null)}
              className="absolute left-6 top-8 text-slate-400 hover:text-slate-900"
            >
              <X className="h-6 w-6" />
            </button>
            
            <h2 className="text-xl font-black mb-1">رمز QR للطاولة {qrTable.table_number}</h2>
            <p className="text-xs font-bold text-slate-400 mb-8">امسح الكود لفتح المنيو</p>

            <div className="p-6 bg-white rounded-3xl shadow-inner border border-slate-100 mb-8">
              <QRCodeSVG 
                value={`${origin}/menu/${qrTable.table_number}`} 
                size={220}
                level="H"
                includeMargin={false}
              />
            </div>

            <div className="w-full flex flex-col gap-3">
                <button 
                onClick={() => window.print()}
                className="premium-button w-full h-14 bg-slate-900 text-white"
                >
                    <Download className="h-5 w-5 ml-2" />
                    تحميل للطباعة
                </button>
                <a 
                    href={`${origin}/menu/${qrTable.table_number}`} 
                    target="_blank"
                    className="flex items-center justify-center h-14 font-black text-slate-400 text-sm hover:text-slate-900"
                >
                    <ExternalLink className="h-4 w-4 ml-2" />
                    فتح الرابط يدوياً
                </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
