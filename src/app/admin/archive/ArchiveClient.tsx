"use client";

import { useState } from "react";
import { 
  Calendar, 
  Search, 
  Trash2, 
  Clock, 
  ChevronRight, 
  Receipt,
  Download,
  Filter,
  ArrowUpDown,
  Table as TableIcon
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";
import { deleteSession } from "@/app/actions/order";
import { clearAllFinancialData } from "@/app/actions/financials";
import { AlertTriangle, Trash2 as TrashIcon } from "lucide-react";

export default function ArchiveClient({ initialSessions, currency }: { initialSessions: any[], currency: string }) {
  const [sessions, setSessions] = useState(initialSessions);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState<number | null>(null);
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const filteredSessions = sessions.filter(s => 
    s.table?.table_number.toString().includes(search) ||
    s.id.toString().includes(search)
  );

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا السجل بشكل نهائي؟ لا يمكن التراجع عن هذه العملية.")) return;
    
    setLoading(id);
    const result = await deleteSession(id);
    if (result.success) {
      setSessions(prev => prev.filter(s => s.id !== id));
    } else {
      alert(result.error);
    }
    setLoading(null);
  };

  const calculateTotal = (orders: any[]) => {
    return orders.reduce((sum, order) => {
      return sum + order.items.reduce((itemSum: number, item: any) => {
        return itemSum + (item.price_at_time * item.quantity);
      }, 0);
    }, 0);
  };

  const handleHardReset = async () => {
    setIsResetting(true);
    const result = await clearAllFinancialData();
    if (result.success) {
      setSessions([]);
      setShowResetModal(false);
      alert("تم تصفير كافة البيانات المالية والسجلات بنجاح.");
    } else {
      alert(result.error);
    }
    setIsResetting(false);
  };

  return (
    <div className="p-4 md:p-8 min-h-screen bg-[#fcfdfe]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">سجل الأرشيف</h1>
          <p className="text-sm font-bold text-slate-400">إدارة ومراجعة كافة الطلبات السابقة والجلسات المغلقة</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text"
              placeholder="البحث برقم الطاولة أو السجل..."
              className="pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-full md:w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowResetModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl hover:bg-rose-100 transition-all font-bold text-sm"
          >
            <TrashIcon className="w-4 h-4" />
            <span className="hidden sm:inline">تصفير السجل</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSessions.map((session) => (
          <div key={session.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden group hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300">
            {/* Session Card Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <TableIcon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-sm text-slate-500 dark:text-slate-400 block">طاولة رقم</span>
                  <span className="font-bold text-slate-900 dark:text-white">#{session.table?.table_number}</span>
                </div>
              </div>
              <button 
                onClick={() => handleDelete(session.id)}
                disabled={loading === session.id}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
              >
                {loading === session.id ? (
                  <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Session Body */}
            <div className="p-5">
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600 dark:text-slate-400">
                    {format(new Date(session.created_at), 'PPP', { locale: ar })}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600 dark:text-slate-400">
                    {format(new Date(session.created_at), 'hh:mm a')} - {session.closed_at ? format(new Date(session.closed_at), 'hh:mm a') : 'مفتوح'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Receipt className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">
                    {session.orders.length} طلبات منفصلة
                  </span>
                </div>
              </div>

              {/* Total Summary */}
              <div className="p-4 rounded-xl bg-slate-50 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">المجموع الكلي:</span>
                <span className="text-xl font-bold text-blue-600">
                  {formatCurrency(calculateTotal(session.orders), currency)}
                </span>
              </div>
            </div>

            {/* Footer Action */}
            <div className="p-4 bg-slate-50/30 border-t border-slate-100 flex justify-center">
              <button 
                onClick={() => setSelectedSession(session)}
                className="text-sm font-medium text-blue-600 flex items-center gap-2 hover:gap-3 transition-all"
              >
                عرض التفاصيل الكاملة <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Details Modal */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black text-slate-900">تفاصيل الجلسة #{selectedSession.id}</h3>
                <p className="text-sm font-bold text-slate-400">طاولة رقم {selectedSession.table?.table_number}</p>
              </div>
              <button 
                onClick={() => setSelectedSession(null)}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors"
              >
                <Trash2 className="w-5 h-5 text-slate-400 rotate-45" />
              </button>
            </div>
            
            <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-6">
                {selectedSession.orders.map((order: any, idx: number) => (
                  <div key={order.id} className="p-4 rounded-2xl bg-slate-50">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-3">طلب رقم {idx + 1}</p>
                    <div className="space-y-3">
                      {order.items.map((item: any) => (
                        <div key={item.id} className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-black">
                              {item.quantity}
                            </span>
                            <span className="font-bold text-slate-700">
                                {item.item_name || item.menuItem?.name || "صنف غير معروف"}
                            </span>
                          </div>
                          <span className="font-black text-slate-900">
                            {formatCurrency(Number(item.price_at_time) * item.quantity, currency)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-500 font-bold">المجموع الكلي:</span>
                <span className="text-3xl font-black text-blue-600">
                  {formatCurrency(calculateTotal(selectedSession.orders), currency)}
                </span>
              </div>
              <button 
                onClick={() => setSelectedSession(null)}
                className="w-full h-14 mt-6 bg-slate-900 text-white rounded-2xl font-black hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {filteredSessions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <Receipt className="w-10 h-10 text-slate-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">لا يوجد سجلات</h2>
          <p className="text-slate-500 dark:text-slate-400">لم يتم العثور على أي جلسات مغلقة في الأرشيف حالياً</p>
        </div>
      )}
    </div>
  );
}
