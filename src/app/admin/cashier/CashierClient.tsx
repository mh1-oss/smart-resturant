"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { 
  Wallet, 
  Printer, 
  CheckCircle2, 
  Clock, 
  RefreshCcw,
  ShoppingBag,
  Loader2
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { printReceipt, markPaid } from "@/app/actions/order";
import { getCashierStats } from "@/app/actions/financials";
import ReceiptTemplate from "@/components/ReceiptTemplate";
import { playNotificationSound } from "@/lib/audio";

export default function CashierClient({ 
  initialSessions, 
  initialStats, 
  settings,
  fetchSessionsAction
}: { 
  initialSessions: any[], 
  initialStats: any,
  settings: any,
  fetchSessionsAction: () => Promise<any[]>
}) {
  const [sessions, setSessions] = useState(initialSessions);
  const [stats, setStats] = useState(initialStats);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [printingId, setPrintingId] = useState<number | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      console.log("Polling for new data...");
      const [newSessions, statsResult] = await Promise.all([
        fetchSessionsAction(),
        getCashierStats()
      ]);
      if (newSessions.length > sessions.length) {
          playNotificationSound();
      } else {
          // Also play if someone just requested a bill (status changed to BillRequested)
          const newBillRequested = newSessions.some((ns: any) => 
            ns.status === 'BillRequested' && 
            !sessions.find(s => s.id === ns.id && s.status === 'BillRequested')
          );
          if (newBillRequested) playNotificationSound();
      }
      setSessions(newSessions);
      if (statsResult.success) {
        setStats(statsResult.stats);
      }
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchSessionsAction]);

  useEffect(() => {
    const interval = setInterval(refreshData, 10000);
    return () => clearInterval(interval);
  }, [refreshData]);

  const calculateTotal = (session: any) => {
    return session.orders.reduce((sum: number, o: any) => 
      sum + o.items.reduce((itemSum: number, i: any) => itemSum + (Number(i.price_at_time) * i.quantity), 0)
    , 0);
  };

  const handlePrintReceipt = async (sessionId: number) => {
    setLoadingId(sessionId);
    try {
        const result = await printReceipt(sessionId);
        if (result.success) {
            setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, status: 'ReceiptReady' } : s));
            setPrintingId(sessionId);
            setTimeout(() => {
                window.print();
                setPrintingId(null);
            }, 100);
        } else {
            alert(result.error);
        }
    } catch (err) {
        alert("فشل في استدعاء عملية الطباعة");
    } finally {
        setLoadingId(null);
    }
  };

  const handleMarkPaid = async (sessionId: number) => {
    setLoadingId(sessionId);
    try {
        const result = await markPaid(sessionId);
        if (result.success) {
            setSessions(prev => prev.filter(s => s.id !== sessionId));
            alert("تم تأكيد الدفع بنجاح. الطاولة الآن جاهزة للتنظيف.");
            refreshData();
        } else {
            alert(result.error || "حدث خطأ في تأكيد الدفع");
        }
    } catch (err) {
        alert("فشل في معالجة طلب الدفع - تأكد من اتصال الإنترنيت");
    } finally {
        setLoadingId(null);
    }
  };

  return (
    <div className="relative pb-24">
      <div className="space-y-12 print:hidden">
        {/* Financial Summary */}
        <div className="grid gap-8 grid-cols-1 md:grid-cols-2">
          <div className="premium-card p-10 text-white relative overflow-hidden group animate-scale-in" style={{ backgroundColor: 'var(--brand-primary)' }}>
            <div className="absolute -top-10 -right-10 opacity-10 group-hover:scale-125 transition-transform duration-700">
              <Wallet className="h-48 w-48 rotate-12" />
            </div>
            <div className="relative z-10">
                <p className="text-xs font-black text-white/50 uppercase tracking-[0.2em] mb-3">إيرادات اليوم</p>
                <div className="flex items-end gap-3">
                    <h3 className="text-5xl font-black tracking-tighter">{formatCurrency(stats.revenue, settings.currency)}</h3>
                    <div className="mb-2 px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-[10px] font-black">+12%</div>
                </div>
            </div>
          </div>
          <div className="premium-card p-10 bg-white border-slate-100 relative overflow-hidden group animate-scale-in" style={{ animationDelay: "100ms" }}>
            <div className="absolute -top-10 -right-10 opacity-5 group-hover:scale-125 transition-transform duration-700">
              <ShoppingBag className="h-48 w-48 text-indigo-600 -rotate-12" />
            </div>
            <div className="relative z-10">
                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3">الطلبات المكتملة</p>
                <div className="flex items-end gap-3">
                    <h3 className="text-5xl font-black text-slate-900 tracking-tighter">{stats.orderCount}</h3>
                    <p className="mb-2 text-slate-400 font-bold text-sm">طلب مسجل</p>
                </div>
            </div>
          </div>
        </div>

        {/* Active Billing Section */}
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                  <h2 className="text-3xl font-black text-slate-900 leading-tight">طلبات الفاتورة</h2>
                  <p className="font-bold text-slate-400 text-sm mt-1">إصدار الوصولات وتأكيد استلام المبالغ</p>
              </div>
              <button 
                  onClick={refreshData}
                  disabled={isRefreshing}
                  className="pro-input flex items-center justify-center gap-3 px-8 py-3 h-14 bg-white hover:bg-slate-50 transition-all font-black text-slate-600 disabled:opacity-50"
              >
                  <RefreshCcw className={cn("h-5 w-5", isRefreshing && "animate-spin text-emerald-500")} />
                  {isRefreshing ? "جاري التحديث..." : "تحديث القائمة"}
              </button>
          </div>
          
          <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            {sessions.filter(s => s.status === "BillRequested" || s.status === "ReceiptReady").map((session) => (
              <div 
                key={session.id} 
                className={cn(
                  "premium-card flex flex-col p-8 group animate-scale-in",
                  session.status === "BillRequested" ? "ring-4 ring-amber-500/20 border-amber-100" : "border-emerald-100 bg-emerald-50/10"
                )}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-5">
                      <div className="h-16 w-16 rounded-[2rem] text-white flex items-center justify-center text-3xl font-black shadow-xl shadow-slate-900/20 group-hover:scale-110 transition-transform" style={{ backgroundColor: 'var(--brand-primary)' }}>
                        {session.table.table_number}
                      </div>
                      <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">طاولة</p>
                          <p className="text-lg font-black text-slate-900 leading-none">رقم {session.table.table_number}</p>
                      </div>
                  </div>
                  <div className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm",
                    session.status === "BillRequested" ? "bg-amber-500 text-white animate-pulse" : "bg-emerald-600 text-white"
                  )}>
                    {session.status === "BillRequested" ? "بانتظار الوصل" : "الوصل جاهز"}
                  </div>
                </div>

                {/* Items Summary */}
                <div className="flex-1 space-y-3 mb-8">
                  <div className="max-h-[240px] overflow-y-auto pr-1 space-y-2 custom-scrollbar">
                    {session.orders.map((order: any) => 
                        order.items.map((item: any) => (
                        <div key={item.id} className="flex justify-between items-center text-sm font-bold text-slate-600 bg-white border border-slate-50 p-3 rounded-xl shadow-sm">
                            <span className="flex items-center gap-2">
                                <span className="h-6 w-6 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black">{item.quantity}</span>
                                <span className="truncate max-w-[120px]">{item.item_name || item.menuItem?.name}</span>
                            </span>
                            <span className="text-slate-900">{formatCurrency(Number(item.price_at_time) * item.quantity, settings.currency)}</span>
                        </div>
                        ))
                    )}
                  </div>

                  {/* Totals Section */}
                  <div className="pt-6 mt-6 border-t-2 border-dashed border-slate-200">
                    <div className="space-y-2 text-sm font-bold text-slate-400">
                        <div className="flex justify-between">
                            <span>المجموع الفرعي</span>
                            <span>{formatCurrency(calculateTotal(session), settings.currency)}</span>
                        </div>
                        {Number(settings.taxRate) > 0 && (
                            <div className="flex justify-between">
                                <span>الضريبة ({settings.taxRate}%)</span>
                                <span>{formatCurrency(calculateTotal(session) * (Number(settings.taxRate) / 100), settings.currency)}</span>
                            </div>
                        )}
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                        <span className="text-base font-black text-slate-900">الإجمالي النهائي</span>
                        <span className="text-2xl font-black text-slate-900">{formatCurrency(calculateTotal(session) * (1 + Number(settings.taxRate) / 100), settings.currency)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid gap-3 pt-4">
                  {session.status === "BillRequested" ? (
                    <button 
                      onClick={() => handlePrintReceipt(session.id)}
                      disabled={loadingId !== null}
                      className="w-full h-16 pro-button text-lg group"
                    >
                      {loadingId === session.id ? <Loader2 className="animate-spin h-6 w-6" /> : <Printer className="ml-2 h-6 w-6 transition-transform group-hover:scale-110" />}
                      إصدار الفاتورة
                    </button>
                  ) : (
                    <div className="flex gap-3">
                      <button 
                          onClick={() => handlePrintReceipt(session.id)}
                          disabled={loadingId !== null}
                          className="h-16 w-20 rounded-[1.5rem] bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all flex items-center justify-center border-2 border-slate-200 shadow-sm"
                          title="إعادة الطباعة"
                      >
                          {loadingId === session.id && printingId === session.id ? <Loader2 className="animate-spin h-6 w-6" /> : <Printer className="h-6 w-6" />}
                      </button>
                      <button 
                          onClick={() => handleMarkPaid(session.id)}
                          disabled={loadingId !== null}
                          className="flex-1 h-16 rounded-[1.5rem] bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg flex items-center justify-center gap-3 transition-all shadow-xl shadow-emerald-600/20 active:scale-95 group"
                      >
                          {loadingId === session.id && printingId !== session.id ? <Loader2 className="animate-spin h-6 w-6" /> : <CheckCircle2 className="h-6 w-6 transition-transform group-hover:scale-110" />}
                          تأكيد الدفع
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {sessions.filter(s => s.status === "BillRequested" || s.status === "ReceiptReady").length === 0 && (
              <div className="col-span-full py-24 text-center bg-white/40 border-2 border-dashed border-slate-200 rounded-[3rem] animate-fade-in-up">
                <div className="h-24 w-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <Clock className="h-12 w-12 text-slate-200" />
                </div>
                <h3 className="text-2xl font-black text-slate-300">لا يوجد عمليات دفع معلقة</h3>
                <p className="text-sm font-bold text-slate-400 mt-3 max-w-[300px] mx-auto leading-relaxed">ستظهر هنا الطاولات التي تطلب الحساب تلقائياً للمباشرة بإصدار وصولاتها</p>
              </div>
            )}
          </div>
        </div>

        
        <style jsx global>{`
          @media print {
              @page {
                  margin: 0;
                  size: auto;
              }
              body > *:not(.print-receipt-container) {
                  display: none !important;
              }
              .print-receipt-container { 
                display: flex !important;
                justify-content: flex-start;
                padding-right: 4mm;
                align-items: flex-start;
                width: 100%;
                margin: 0;
                padding-top: 0;
                padding-bottom: 0;
                background: white;
            }
          }
        `}</style>
      </div>

      {/* Hidden Receipt Template Container for Printing (Portaled to Body) */}
      {isMounted && createPortal(
        <div className="print-receipt-container hidden">
            {printingId && (
            <div className="bg-white">
                <ReceiptTemplate 
                session={sessions.find((s: any) => s.id === printingId)} 
                settings={settings}
                />
            </div>
            )}
        </div>,
        document.body
      )}
    </div>
  );
}
