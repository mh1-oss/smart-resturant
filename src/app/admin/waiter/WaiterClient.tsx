"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  PanelTop, 
  CreditCard, 
  XCircle, 
  Clock,
  ChevronRight,
  Info,
  Utensils,
  BellRing,
  Trash2,
  CheckCircle2,
  Star
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { 
  closeSession, 
  claimTask, 
  serveOrder, 
  markCleaned,
  getWaiterUpdates
} from "@/app/actions/order";
import { playNotificationSound } from "@/lib/audio";

export default function WaiterClient({ 
  userId,
  initialTables, 
  initialReadyOrders,
  initialBillTasks,
  initialCleanTasks
}: { 
  userId: string | undefined,
  initialTables: any[],
  initialReadyOrders: any[],
  initialBillTasks: any[],
  initialCleanTasks: any[]
}) {
  const [tables, setTables] = useState(initialTables);
  const [readyOrders, setReadyOrders] = useState(initialReadyOrders);
  const [billTasks, setBillTasks] = useState(initialBillTasks);
  const [cleanTasks, setCleanTasks] = useState(initialCleanTasks);
  const [selectedTable, setSelectedTable] = useState<any>(null);

  // Poll for updates (simplified for now, ideally real-time)
  useEffect(() => {
    const interval = setInterval(async () => {
        try {
            const result = await getWaiterUpdates();
            if (result.success) {
                // Play sound if any task count increases
                if (
                    result.readyOrders.length > readyOrders.length ||
                    result.billTasks.length > billTasks.length ||
                    result.cleanTasks.length > cleanTasks.length
                ) {
                    playNotificationSound();
                }

                if (result.tables) setTables(result.tables);
                if (result.readyOrders) setReadyOrders(result.readyOrders);
                if (result.billTasks) setBillTasks(result.billTasks);
                if (result.cleanTasks) setCleanTasks(result.cleanTasks);
            }
        } catch (error) {
            console.error("Waiter polling failed:", error);
        }
    }, 10000);

    return () => clearInterval(interval);
  }, [readyOrders.length, billTasks.length, cleanTasks.length]);
  const handleClaim = async (type: 'Serve' | 'Bill' | 'Clean', id: number) => {
    if (!userId) return;
    const result = await claimTask(type, id, userId);
    if (result.success) {
        if (type === 'Serve') {
            setReadyOrders(prev => prev.map(o => o.id === id ? { ...o, waiter_id: userId } : o));
        } else if (type === 'Bill') {
            setBillTasks(prev => prev.map(s => s.id === id ? { ...s, bill_waiter_id: userId } : s));
        } else if (type === 'Clean') {
            setCleanTasks(prev => prev.map(s => s.id === id ? { ...s, cleaning_waiter_id: userId } : s));
        }
    }
  };

  const handleServe = async (orderId: number) => {
    const result = await serveOrder(orderId);
    if (result.success) {
        setReadyOrders(prev => prev.filter(o => o.id !== orderId));
    }
  };

  const handleClean = async (sessionId: number) => {
    const result = await markCleaned(sessionId);
    if (result.success) {
        setCleanTasks(prev => prev.filter(s => s.id !== sessionId));
        // Reset table status locally if needed or just wait for poll
    }
  };

  return (
    <div className="space-y-16 pb-24">
      {/* Duty List / Tasks */}
      <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {/* Serve Food */}
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b-2 border-slate-100 pb-4">
                <h3 className="flex items-center gap-3 text-xl font-black text-slate-900">
                    <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-rose-50 text-rose-500 shadow-sm shadow-rose-500/10">
                        <Utensils size={20} />
                    </div>
                    توصيل الطعام
                </h3>
                <span className="bg-rose-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg shadow-rose-500/20 animate-pulse">
                    {readyOrders.length}
                </span>
            </div>
            <div className="space-y-4">
                {readyOrders.map(order => (
                    <div key={order.id} className="premium-card p-6 border-slate-100 group animate-scale-in">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-3">
                                <span className={cn(
                                    "h-12 w-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-lg transition-transform group-hover:scale-110",
                                    order.waiter_id === userId ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-slate-900 text-white shadow-slate-900/20"
                                )}>
                                    {order.session.table.table_number}
                                </span>
                                <div>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-wider">طاولة</p>
                                    <p className="text-[10px] font-bold text-slate-300">طلب رقم {order.id}</p>
                                </div>
                            </div>
                            <div className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-6 font-bold text-slate-600 text-sm leading-relaxed">
                            {order.items.map((i: any) => (
                                <span key={i.id} className="inline-block bg-white px-2 py-0.5 rounded-lg border border-slate-100 ml-1 mb-1">
                                    {i.quantity}x {i.item_name || i.menuItem?.name || "صنف غير معروف"}
                                </span>
                            ))}
                        </div>
                        {order.waiter_id === userId ? (
                             <button 
                               onClick={() => handleServe(order.id)}
                               className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20"
                             >
                                <CheckCircle2 size={18} />
                                تم التوصيل
                             </button>
                        ) : order.waiter_id ? (
                            <div className="w-full h-14 rounded-2xl bg-slate-50 border border-slate-100 text-slate-400 text-xs font-black flex items-center justify-center opacity-60">
                                <Users size={16} className="ml-2" />
                                قيد الاستلام من زميل
                            </div>
                        ) : (
                            <button 
                                onClick={() => handleClaim('Serve', order.id)}
                                className="w-full h-14 pro-button text-sm"
                            >
                                <Users size={18} />
                                استلام المهمة
                            </button>
                        )}
                    </div>
                ))}
                {readyOrders.length === 0 && (
                    <div className="text-center py-12 px-6 bg-slate-50/50 border-2 border-dashed border-slate-100 rounded-[2.5rem]">
                        <p className="text-sm font-black text-slate-300">كل شيء تم توصيله!</p>
                    </div>
                )}
            </div>
        </div>

        {/* Deliver Bills */}
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b-2 border-slate-100 pb-4">
                <h3 className="flex items-center gap-3 text-xl font-black text-slate-900">
                    <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-blue-50 text-blue-500 shadow-sm shadow-blue-500/10">
                        <CreditCard size={20} />
                    </div>
                    توصيل الفاتورة
                </h3>
                <span className="bg-blue-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg shadow-blue-500/20 animate-pulse">
                    {billTasks.length}
                </span>
            </div>
            <div className="space-y-4">
                {billTasks.map(session => (
                    <div key={session.id} className="premium-card p-6 border-slate-100 group animate-scale-in">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-blue-600/20">
                                    {session.table.table_number}
                                </div>
                                <h4 className="text-sm font-black text-slate-900">طلب الحساب</h4>
                            </div>
                        </div>
                        {session.bill_waiter_id === userId ? (
                             <div className="w-full h-14 rounded-2xl bg-blue-50 border border-blue-100 text-blue-700 text-xs font-black flex items-center justify-center text-center p-4">
                                <Clock size={16} className="ml-2 animate-spin" />
                                بانتظار تأكيد الدفع من الكاشير
                             </div>
                        ) : session.bill_waiter_id ? (
                            <div className="w-full h-14 rounded-2xl bg-slate-50 border border-slate-100 text-slate-400 text-xs font-black flex items-center justify-center opacity-60">
                                <Users size={16} className="ml-2" />
                                قيد الاستلام من زميل
                            </div>
                        ) : (
                            <button 
                                onClick={() => handleClaim('Bill', session.id)}
                                className="w-full h-14 pro-button text-sm"
                            >
                                <Users size={18} />
                                استلام المهمة
                            </button>
                        )}
                    </div>
                ))}
                {billTasks.length === 0 && (
                    <div className="text-center py-12 px-6 bg-slate-50/50 border-2 border-dashed border-slate-100 rounded-[2.5rem]">
                        <p className="text-sm font-black text-slate-300">لا فواتير حالية</p>
                    </div>
                )}
            </div>
        </div>

        {/* Clean Tables */}
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b-2 border-slate-100 pb-4">
                <h3 className="flex items-center gap-3 text-xl font-black text-slate-900">
                    <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-amber-50 text-amber-500 shadow-sm shadow-amber-500/10">
                        <Trash2 size={20} />
                    </div>
                    تنظيف الطاولات
                </h3>
                <span className="bg-amber-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg shadow-amber-500/20 animate-pulse">
                    {cleanTasks.length}
                </span>
            </div>
            <div className="space-y-4">
                {cleanTasks.map(session => (
                    <div key={session.id} className="premium-card p-6 border-slate-100 group animate-scale-in">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-amber-500/20">
                                    {session.table.table_number}
                                </div>
                                <h4 className="text-sm font-black text-slate-900">بحاجة للتنظيف</h4>
                            </div>
                        </div>
                        {session.cleaning_waiter_id === userId ? (
                             <button 
                               onClick={() => handleClean(session.id)}
                               className="w-full h-14 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-600/20"
                             >
                                <CheckCircle2 size={18} />
                                تم التنظيف
                             </button>
                        ) : session.cleaning_waiter_id ? (
                            <div className="w-full h-14 rounded-2xl bg-slate-50 border border-slate-100 text-slate-400 text-xs font-black flex items-center justify-center opacity-60">
                                <Users size={16} className="ml-2" />
                                قيد التنظيف من زميل
                            </div>
                        ) : (
                            <button 
                                onClick={() => handleClaim('Clean', session.id)}
                                className="w-full h-14 pro-button text-sm"
                            >
                                <Users size={18} />
                                استلام المهمة
                            </button>
                        )}
                    </div>
                ))}
                {cleanTasks.length === 0 && (
                    <div className="text-center py-12 px-6 bg-slate-50/50 border-2 border-dashed border-slate-100 rounded-[2.5rem]">
                        <p className="text-sm font-black text-slate-300">جميع المحطات نظيفة</p>
                    </div>
                )}
            </div>
        </div>
      </div>

      <div className="bg-slate-900/5 h-px w-full" />

      {/* Tables Overview Grid */}
      <div className="space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <h2 className="text-3xl font-black text-slate-900 leading-tight">حالة الطاولات</h2>
                <p className="font-bold text-slate-400 text-sm mt-1">نظرة عامة على تشغيل الصالة بالكامل</p>
            </div>
            <div className="flex gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-900" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">مشغولة</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">طلب فاتورة</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-200" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">متوفرة</span>
                </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {tables.map((table) => {
              const activeSession = table.sessions[0];
              const isOccupied = !!activeSession;
              const isBillRequested = activeSession?.status === "BillRequested" || activeSession?.status === "ReceiptReady";

              return (
                <button
                  key={table.id}
                  onClick={() => setSelectedTable(table)}
                  className={cn(
                    "premium-card flex flex-col items-center justify-center p-8 group transition-all duration-300",
                    isOccupied 
                      ? isBillRequested
                        ? "bg-amber-500 border-amber-400 ring-4 ring-amber-500/20 shadow-xl shadow-amber-500/40"
                        : "bg-slate-900 border-slate-800 ring-4 ring-slate-900/10 shadow-xl shadow-slate-900/30" 
                      : "bg-white border-2 border-dashed border-slate-200 hover:border-slate-900 hover:bg-slate-50 shadow-sm"
                  )}
                >
                  <div className={cn(
                    "h-16 w-16 rounded-[2rem] flex items-center justify-center text-3xl font-black mb-4 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6",
                    isOccupied ? "bg-white/10 text-white" : "bg-slate-100 text-slate-900"
                  )}>
                    {table.table_number}
                  </div>
                  <div className="flex flex-col items-center gap-1">
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest",
                        isOccupied ? "text-white" : "text-slate-400"
                      )}>
                        {isOccupied ? (isBillRequested ? "طلب حساب" : "مشغولة") : "متوفرة"}
                      </span>
                      {isOccupied && (
                          <span className="text-[10px] text-white/50 font-bold">من {new Date(activeSession.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</span>
                      )}
                  </div>
                </button>
              );
            })}
          </div>
      </div>

      {/* Table Detail Sidebar - Full Responsive Drawer */}
      <AnimatePresence>
        {selectedTable && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTable(null)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100]"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-[101] w-full max-w-[480px] bg-white shadow-2xl overflow-hidden flex flex-col"
            >
                {/* Drawer Header */}
                <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <div className="h-16 w-16 rounded-[2rem] bg-slate-900 text-white flex items-center justify-center text-3xl font-black shadow-xl">
                            {selectedTable.table_number}
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 leading-tight">تفاصيل الطاولة</h2>
                            <p className="font-bold text-slate-400 text-sm">إدارة الطلبات والحالة</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setSelectedTable(null)}
                        className="h-14 w-14 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-900 transition-colors"
                    >
                        <XCircle size={24} />
                    </button>
                </div>

                {/* Drawer Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {selectedTable.sessions[0] ? (
                        <div className="space-y-10">
                            <div className="glass-morphism p-8 rounded-[3rem] text-center">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2">الحالة الراهنة</p>
                                <div className={cn(
                                    "inline-flex px-6 py-2 rounded-full text-sm font-black uppercase tracking-widest text-white shadow-lg",
                                    selectedTable.sessions[0].status === "BillRequested" ? "bg-amber-500" : "bg-slate-900"
                                )}>
                                    {selectedTable.sessions[0].status}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-black text-slate-900 text-lg">سجل الطلبات النشط</h4>
                                    <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1 rounded-lg">
                                        {selectedTable.sessions[0].orders.length} طلبات
                                    </span>
                                </div>
                                <div className="space-y-4">
                                    {selectedTable.sessions[0].orders.map((order: any) => (
                                        <div key={order.id} className="premium-card p-6 border-slate-100 bg-slate-50/30">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <span className="text-[10px] font-black text-slate-400 block mb-1">طلب #{order.id}</span>
                                                    <div className="flex items-center gap-2">
                                                        <Clock size={12} className="text-slate-400" />
                                                        <span className="text-xs font-bold text-slate-500">
                                                            {new Date(order.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className={cn(
                                                    "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm",
                                                    order.status === "Served" ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600 animate-pulse"
                                                )}>
                                                    {order.status === "Served" ? "تم التوصيل" : "قيد التحضير"}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {order.items.map((i: any) => (
                                                    <span key={i.id} className="bg-white border border-slate-100 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700">
                                                        {i.quantity}x {i.item_name || i.menuItem?.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center py-20">
                            <Star className="h-20 w-20 text-slate-100 mb-6" />
                            <h3 className="text-xl font-black text-slate-300">طاولة جاهزة لاستقبال الزبائن</h3>
                            <p className="text-sm font-bold text-slate-400 mt-2 max-w-[200px]">لا توجد جلسة نشطة حالياً لهذه الطاولة</p>
                        </div>
                    )}
                </div>

                {/* Drawer Footer */}
                {selectedTable.sessions[0] && (
                    <div className="p-8 bg-slate-50 border-t border-slate-100">
                        <div className="flex gap-4">
                            <button 
                              onClick={() => setSelectedTable(null)}
                              className="flex-1 h-16 rounded-[1.5rem] bg-white border-2 border-slate-200 font-black text-slate-600 hover:bg-slate-100 transition-all active:scale-95"
                            >
                                إغلاق
                            </button>
                            <button 
                              className="flex-2 px-8 h-16 rounded-[1.5rem] pro-button text-sm"
                              onClick={() => {/* potential additional action */}}
                            >
                                إجراءات إضافية
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
