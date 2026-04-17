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
  Table as TableIcon,
  Truck,
  User,
  XCircle,
  AlertTriangle
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { cn, formatCurrency } from "@/lib/utils";
import { deleteSession } from "@/app/actions/order";
import { clearAllFinancialData } from "@/app/actions/financials";
import { motion, AnimatePresence } from "framer-motion";

export default function ArchiveClient({ initialSessions, currency }: { initialSessions: any[], currency: string }) {
  const [sessions, setSessions] = useState(initialSessions);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState<number | null>(null);
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const filteredSessions = sessions.filter(s => 
    s.table?.table_number.toString().includes(search) ||
    s.id.toString().includes(search) ||
    s.orders.some((o: any) => o.customer_name?.toLowerCase().includes(search.toLowerCase()))
  );

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا السجل بشكل نهائي؟ لا يمكن التراجع عن هذه العملية.")) return;
    
    setLoading(id);
    const result = await deleteSession(id);
    if (result.success) {
      setSessions(prev => prev.filter(s => s.id !== id));
      if (selectedSession?.id === id) setSelectedSession(null);
    } else {
      alert(result.error);
    }
    setLoading(null);
  };

  const calculateTotal = (orders: any[]) => {
    return orders.reduce((sum, order) => {
      return sum + order.items.reduce((itemSum: number, item: any) => {
        return itemSum + (Number(item.price_at_time) * item.quantity);
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
    <div className="space-y-12 pb-24">
      {/* Header with Glass Morphism Search */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div>
           <h1 className="text-4xl font-black text-slate-900 leading-tight">سجل الأرشيف</h1>
           <p className="font-bold text-slate-400 mt-2">إدارة ومراجعة كافة الطلبات السابقة والجلسات</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
           <div className="relative group flex-1 min-w-[300px]">
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-900 transition-colors">
                 <Search size={20} />
              </div>
              <input 
                type="text"
                placeholder="ابحث برقم طاولة، سجل، أو اسم عميل..."
                className="w-full h-16 pr-12 pl-6 bg-white border-2 border-slate-100 rounded-3xl outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all font-bold text-slate-700 shadow-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>
           
           <button 
             onClick={() => setShowResetModal(true)}
             className="h-16 px-8 rounded-3xl bg-rose-50 text-rose-600 border-2 border-rose-100 hover:bg-rose-100 transition-all font-black text-sm flex items-center gap-3 shrink-0"
           >
             <AlertTriangle size={18} />
             تصفير الأرشيف
           </button>
        </div>
      </div>

      {/* Modern Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredSessions.map((session) => {
          const total = calculateTotal(session.orders);
          const hasDelivery = session.orders.some((o: any) => o.type === "Delivery");
          const drivers = Array.from(new Set(session.orders.map((o: any) => o.driver?.name).filter(Boolean)));

          return (
            <motion.div 
              key={session.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="premium-card p-0 overflow-hidden group hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500"
            >
              {/* Card Header */}
              <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-lg">
                       {session.table?.table_number || "خ"}
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">SESSION #{session.id}</p>
                       <p className="text-sm font-bold text-slate-900">{session.table ? `طاولة ${session.table.table_number}` : "طلب خارجي"}</p>
                    </div>
                 </div>
                 <button 
                   onClick={() => handleDelete(session.id)}
                   disabled={loading === session.id}
                   className="h-10 w-10 rounded-xl flex items-center justify-center text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-all"
                 >
                   <Trash2 size={18} />
                 </button>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-5">
                 <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                    <div className="flex items-center gap-2">
                       <Calendar size={14} className="text-slate-400" />
                       {format(new Date(session.created_at), 'd MMMM yyyy', { locale: ar })}
                    </div>
                    <div className="flex items-center gap-2">
                       <Clock size={14} className="text-slate-400" />
                       {format(new Date(session.created_at), 'hh:mm a')}
                    </div>
                 </div>

                 {/* Driver Tag if delivery */}
                 {hasDelivery && (
                   <div className="bg-emerald-50 text-emerald-700 p-3 rounded-2xl border border-emerald-100 flex items-center gap-3">
                      <Truck size={16} />
                      <div className="flex-1">
                         <p className="text-[10px] font-black uppercase tracking-tighter opacity-70">سائق التوصيل</p>
                         <p className="text-xs font-black">{drivers.length > 0 ? drivers.join(", ") : "بانتظار سائق"}</p>
                      </div>
                   </div>
                 )}

                 <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">عدد الطلبات</p>
                       <p className="text-lg font-black text-slate-700">{session.orders.length}</p>
                    </div>
                    <div className="text-left">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">المبلغ الكلي</p>
                       <p className="text-xl font-black text-blue-600">{formatCurrency(total, currency)}</p>
                    </div>
                 </div>
              </div>

              {/* Card Action */}
              <button 
                onClick={() => setSelectedSession(session)}
                className="w-full h-14 bg-white hover:bg-slate-900 hover:text-white transition-all font-black text-xs flex items-center justify-center gap-2 border-t border-slate-50 group/btn"
              >
                 عرض التفاصيل الكاملة
                 <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Detail Drawer (Modern Side Drawer style) */}
      <AnimatePresence>
        {selectedSession && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSession(null)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100]"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="fixed inset-y-0 right-0 z-[101] w-full max-w-[500px] bg-white shadow-2xl overflow-hidden flex flex-col"
            >
               <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-5">
                     <div className="h-16 w-16 rounded-[2rem] bg-slate-900 text-white flex items-center justify-center text-3xl font-black">
                        {selectedSession.table?.table_number || "خ"}
                     </div>
                     <div>
                        <h3 className="text-2xl font-black text-slate-900 mb-1">تفاصيل السجل</h3>
                        <p className="font-bold text-slate-400 text-sm">الجلسة رقم #{selectedSession.id}</p>
                     </div>
                  </div>
                  <button onClick={() => setSelectedSession(null)} className="h-12 w-12 rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-900 flex items-center justify-center">
                     <XCircle size={24} />
                  </button>
               </div>

               <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-10">
                  {selectedSession.orders.map((order: any, idx: number) => (
                    <div key={order.id} className="space-y-6">
                       <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <h4 className="font-black text-slate-900">طلب #{idx + 1} ({order.type})</h4>
                          <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1 rounded-lg">
                             {format(new Date(order.created_at), 'hh:mm a')}
                          </span>
                       </div>
                       
                       {order.driver && (
                         <div className="flex items-center gap-3 text-emerald-600 bg-emerald-50 p-4 rounded-2xl">
                            <Truck size={18} />
                            <span className="text-sm font-black">تم التوصيل بواسطة: {order.driver.name}</span>
                         </div>
                       )}

                       <div className="space-y-3">
                          {order.items.map((i: any) => (
                            <div key={i.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                               <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-xl bg-white flex items-center justify-center text-xs font-black shadow-sm">
                                     {i.quantity}
                                  </div>
                                  <span className="font-bold text-slate-700">{i.item_name || i.menuItem?.name}</span>
                               </div>
                               <span className="font-black text-slate-900">{formatCurrency(Number(i.price_at_time) * i.quantity, currency)}</span>
                            </div>
                          ))}
                       </div>
                    </div>
                  ))}
               </div>

               <div className="p-8 bg-slate-50 border-t border-slate-100">
                  <div className="flex justify-between items-center mb-8">
                     <span className="text-slate-500 font-bold">المجموع الكلي:</span>
                     <span className="text-4xl font-black text-blue-600">{formatCurrency(calculateTotal(selectedSession.orders), currency)}</span>
                  </div>
                  <button 
                    onClick={() => setSelectedSession(null)}
                    className="w-full h-16 bg-slate-900 text-white rounded-[1.5rem] font-black text-lg hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-900/10"
                  >
                     تمت المراجعة
                  </button>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-xl"
          >
             <motion.div
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               className="bg-white rounded-[3rem] p-10 max-w-lg w-full text-center shadow-2xl"
             >
                <div className="h-24 w-24 bg-rose-50 text-rose-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                   <AlertTriangle size={48} />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-4">تصفير السجل المالي؟</h3>
                <p className="text-slate-500 font-bold leading-relaxed mb-10">هذا الإجراء سيقوم بحذف كافة سجلات المبيعات والأرشيف بشكل نهائي ولا يمكن استعادتها أبداً. هل أنت متأكد؟</p>
                <div className="flex gap-4">
                   <button 
                     onClick={() => setShowResetModal(false)}
                     className="flex-1 h-16 rounded-2xl bg-slate-100 text-slate-600 font-black hover:bg-slate-200 transition-all"
                   >
                      إلغاء
                   </button>
                   <button 
                     onClick={handleHardReset}
                     disabled={isResetting}
                     className="flex-1 h-16 rounded-2xl bg-rose-600 text-white font-black hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/20"
                   >
                      {isResetting ? "جاري المسح..." : "نعم، احذف الكل"}
                   </button>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
