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
    <div className="relative">
      <div className="space-y-8 print:hidden">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="surface-card p-8 border-slate-100 bg-slate-900 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Wallet className="h-24 w-24" />
            </div>
            <p className="text-sm font-bold text-white/60 mb-1">إجمالي مبيعات اليوم</p>
            <h3 className="text-4xl font-black">{formatCurrency(stats.revenue, settings.currency)}</h3>
          </div>
          <div className="surface-card p-8 border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <ShoppingBag className="h-24 w-24 text-blue-600" />
            </div>
            <p className="text-sm font-bold text-slate-400 mb-1">عدد الطلبات المكتملة اليوم</p>
            <h3 className="text-4xl font-black text-slate-900">{stats.orderCount}</h3>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-900">طلبات الفاتورة النشطة</h2>
              <button 
                  onClick={refreshData}
                  disabled={isRefreshing}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-600 hover:text-slate-900 hover:border-slate-900 transition-all shadow-sm"
              >
                  <RefreshCcw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
                  {isRefreshing ? "جاري التحديث..." : "تحديث الطلبات"}
              </button>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sessions.filter(s => s.status === "BillRequested" || s.status === "ReceiptReady").map((session) => (
              <div 
                key={session.id} 
                className={cn(
                  "surface-card flex flex-col p-8 border-slate-100 transition-all duration-500",
                  session.status === "BillRequested" ? "ring-2 ring-amber-400 shadow-xl shadow-amber-400/10" : "shadow-lg border-emerald-100 bg-emerald-50/10"
                )}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-xl font-black">
                      {session.table.table_number}
                      </div>
                      <div>
                          <p className="text-xs font-bold text-slate-400">طاولة</p>
                          <p className="font-black text-slate-900">{session.table.table_number}</p>
                      </div>
                  </div>
                  <div className={cn(
                    "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider animate-pulse",
                    session.status === "BillRequested" ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"
                  )}>
                    {session.status === "BillRequested" ? "بانتظار الوصل" : "الوصل جاهز"}
                  </div>
                </div>

                <div className="flex-1 space-y-3 mb-8">
                  {session.orders.map((order: any) => 
                    order.items.map((item: any) => (
                      <div key={item.id} className="flex justify-between text-sm font-bold text-slate-600 bg-white/50 p-2 rounded-lg">
                        <span>{item.menuItem.name} x{item.quantity}</span>
                        <span>{formatCurrency(Number(item.price_at_time) * item.quantity, settings.currency)}</span>
                      </div>
                    ))
                  )}
                  <div className="pt-4 mt-4 border-t-2 border-dashed border-slate-200 flex flex-col gap-2">
                    <div className="flex justify-between items-center text-sm font-bold text-slate-500">
                      <span>المجموع الفرعي</span>
                      <span>{formatCurrency(calculateTotal(session), settings.currency)}</span>
                    </div>
                    {Number(settings.taxRate) > 0 && (
                        <div className="flex justify-between items-center text-sm font-bold text-slate-500">
                          <span>الضريبة ({settings.taxRate}%)</span>
                          <span>{formatCurrency(calculateTotal(session) * (Number(settings.taxRate) / 100), settings.currency)}</span>
                        </div>
                    )}
                    <div className="flex justify-between items-center text-xl font-black text-slate-900 border-t border-slate-100 pt-2">
                      <span>الإجمالي النهائي</span>
                      <span>{formatCurrency(calculateTotal(session) * (1 + Number(settings.taxRate) / 100), settings.currency)}</span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 pt-6 print:hidden">
                  {session.status === "BillRequested" ? (
                    <button 
                      onClick={() => handlePrintReceipt(session.id)}
                      disabled={loadingId !== null}
                      className="premium-button h-14 bg-slate-900 text-white hover:bg-black w-full text-lg"
                    >
                      {loadingId === session.id ? <Loader2 className="animate-spin h-6 w-6" /> : <Printer className="ml-2 h-6 w-6" />}
                      طباعة الوصل
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button 
                          onClick={() => handlePrintReceipt(session.id)}
                          disabled={loadingId !== null}
                          className="premium-button h-14 bg-slate-200 text-slate-700 hover:bg-slate-300 w-16 flex-shrink-0"
                          title="إعادة الطباعة"
                      >
                          {loadingId === session.id && printingId === session.id ? <Loader2 className="animate-spin h-6 w-6" /> : <Printer className="h-6 w-6" />}
                      </button>
                      <button 
                          onClick={() => handleMarkPaid(session.id)}
                          disabled={loadingId !== null}
                          className="premium-button h-14 flex-1 bg-emerald-600 text-white hover:bg-emerald-700 text-lg shadow-lg shadow-emerald-200"
                      >
                          {loadingId === session.id && printingId !== session.id ? <Loader2 className="animate-spin h-6 w-6" /> : <CheckCircle2 className="ml-2 h-6 w-6" />}
                          تأكيد الدفع
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {sessions.filter(s => s.status === "BillRequested" || s.status === "ReceiptReady").length === 0 && (
              <div className="col-span-full py-24 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[32px]">
                <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <Clock className="h-10 w-10 text-slate-300" />
                </div>
                <p className="text-2xl font-black text-slate-400">لا توجد طلبات فاتورة حالياً</p>
                <p className="text-slate-400 font-bold mt-2">سيتم تحديث القائمة تلقائياً عند طلب طاولة للحساب</p>
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
