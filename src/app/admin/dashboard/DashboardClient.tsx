"use client";

import { useState } from "react";
import { 
  TrendingUp, 
  Wallet, 
  TrendingDown, 
  Plus, 
  Trash2,
  PieChart,
  BarChart3
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { addExpense, deleteExpense } from "@/app/actions/expense";

export default function DashboardClient({ 
  stats, 
  chartData, 
  initialExpenses,
  currency 
}: { 
  stats: any, 
  chartData: any[], 
  initialExpenses: any[],
  currency: string 
}) {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [activePeriod, setActivePeriod] = useState<"today" | "weekly" | "monthly" | "allTime">("today");
  const [isAdding, setIsAdding] = useState(false);
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");

  const currentStats = stats[activePeriod] || stats.today;

  const periods = [
    { id: "today", label: "اليوم" },
    { id: "weekly", label: "هذا الأسبوع" },
    { id: "monthly", label: "هذا الشهر" },
    { id: "allTime", label: "الكل" },
  ];

  // Rest of handlers...
  const handleAddExpense = async (e: React.FormEvent) => {
    // ... no changes needed to handler itself
    e.preventDefault();
    if (!desc || !amount) return;

    setIsAdding(true);
    const result = await addExpense(desc, parseFloat(amount));
    if (result.success) {
      setExpenses([
        { id: Math.random(), description: desc, amount: parseFloat(amount), date: new Date(), user: { name: "أنت" } },
        ...expenses
      ]);
      setDesc("");
      setAmount("");
    } else {
      alert(result.error);
    }
    setIsAdding(false);
  };

  const handleDeleteExpense = async (id: number) => {
    if (!confirm("هل تريد حذف هذا المصروف؟")) return;
    const result = await deleteExpense(id);
    if (result.success) {
      setExpenses(expenses.filter(e => e.id !== id));
    }
  };

  // Find max revenue for chart scaling
  const maxRevenue = Math.max(...chartData.map(d => d.revenue), 100);

  return (
    <div className="space-y-10">
      {/* Period Selector Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            {periods.map((p) => (
                <button
                    key={p.id}
                    onClick={() => setActivePeriod(p.id as any)}
                    className={cn(
                        "px-6 py-2.5 rounded-xl text-sm font-black transition-all",
                        activePeriod === p.id 
                            ? "bg-white text-slate-900 shadow-sm border border-slate-200" 
                            : "text-slate-400 hover:text-slate-600"
                    )}
                >
                    {p.label}
                </button>
            ))}
        </div>
        
        <div className="hidden lg:flex items-center gap-3 bg-slate-50 border border-slate-100 px-6 py-3 rounded-2xl">
            <TrendingUp size={18} className="text-emerald-500" />
            <span className="text-xs font-black text-slate-900">إجمالي العمليات المنفذة:</span>
            <span className="text-lg font-black text-slate-900">{currentStats.orderCount}</span>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="surface-card p-8 border-slate-100 bg-slate-900 text-white shadow-xl shadow-slate-200">
          <p className="text-sm font-bold text-white/60 mb-1">إجمالي المبيعات</p>
          <h3 className="text-3xl font-black">{formatCurrency(currentStats.revenue, currency)}</h3>
          <div className="mt-4 flex items-center gap-1.5 text-emerald-400 text-xs font-bold bg-white/5 w-fit px-2 py-1 rounded-lg">
            <PieChart size={14} />
            <span>{currentStats.orderCount} طلب مكتمل</span>
          </div>
        </div>
        
        <div className="surface-card p-8 border-slate-100">
          <p className="text-sm font-bold text-slate-400 mb-1">إجمالي التكلفة</p>
          <h3 className="text-3xl font-black text-slate-900">{formatCurrency(currentStats.cost, currency)}</h3>
          <div className="mt-4 text-slate-400 text-xs font-bold">تكلفة المواد الأولية</div>
        </div>

        <div className="surface-card p-8 border-slate-100">
          <p className="text-sm font-bold text-slate-400 mb-1">المصاريف</p>
          <h3 className="text-3xl font-black text-rose-600">{formatCurrency(currentStats.expenses, currency)}</h3>
          <div className="mt-4 text-rose-500 text-xs font-bold flex items-center gap-1">
             <TrendingDown size={14} />
             رواتب، إيجار، أخرى
          </div>
        </div>

        <div className="surface-card p-8 border-slate-100 bg-emerald-50 border-emerald-100">
          <p className="text-sm font-bold text-emerald-600/70 mb-1">صافي الربح</p>
          <h3 className="text-3xl font-black text-emerald-700">{formatCurrency(currentStats.profit, currency)}</h3>
          <div className="mt-4 text-emerald-600 text-xs font-bold">بعد خصم التكاليف والمصاريف</div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 surface-card p-8 border-slate-100">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-black text-slate-900">حركة المبيعات</h3>
              <p className="text-xs font-bold text-slate-400">آخر 7 أيام</p>
            </div>
            <BarChart3 className="text-slate-200" size={24} />
          </div>

          <div className="flex items-end justify-between h-64 gap-3 lg:gap-6 px-2">
            {chartData.map((day, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-3 group relative h-full justify-end">
                {/* Tooltip / Label */}
                <div className={cn(
                    "bg-slate-900 text-white px-2 py-1 rounded text-[10px] font-black transition-all mb-1",
                    day.revenue > 0 ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}>
                   {formatCurrency(day.revenue, currency)}
                </div>
                
                <div 
                  className="w-full bg-gradient-to-t from-slate-900 to-slate-400 rounded-t-xl transition-all duration-700 ease-out shadow-sm group-hover:from-emerald-600 group-hover:to-emerald-400"
                  style={{ height: `${(day.revenue / maxRevenue) * 90}%`, minHeight: day.revenue > 0 ? '8px' : '4px' }}
                />
                
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                  {day.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Expense Management */}
        <div className="surface-card p-8 border-slate-100">
          <h3 className="text-xl font-black text-slate-900 mb-6">إدارة المصاريف</h3>
          
          <form onSubmit={handleAddExpense} className="space-y-4 mb-8">
             <div className="space-y-4">
               <input 
                 type="text" 
                 placeholder="وصف المصروف..."
                 value={desc}
                 onChange={(e) => setDesc(e.target.value)}
                 className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold focus:bg-white focus:ring-2 focus:ring-slate-900/5 transition-all outline-none"
               />
               <input 
                 type="number" 
                 placeholder="المبلغ..."
                 value={amount}
                 onChange={(e) => setAmount(e.target.value)}
                 className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold focus:bg-white focus:ring-2 focus:ring-slate-900/5 transition-all outline-none"
               />
             </div>
             <button 
               type="submit"
               disabled={isAdding}
               className="w-full premium-button h-12 bg-slate-900 text-white hover:bg-black text-xs"
             >
               <Plus size={16} className="ml-2" />
               {isAdding ? "جاري الإضافة..." : "إضافة مصروف جديد"}
             </button>
          </form>

          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {expenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 group">
                <div>
                  <p className="text-sm font-black text-slate-900">{expense.description}</p>
                  <p className="text-[10px] font-bold text-slate-400">
                    {new Date(expense.date).toLocaleDateString('ar-SA')} • {expense.user.name}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-black text-rose-600">{formatCurrency(expense.amount, currency)}</span>
                  <button 
                    onClick={() => handleDeleteExpense(expense.id)}
                    className="p-2 text-slate-300 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            {expenses.length === 0 && (
              <p className="text-center text-xs font-bold text-slate-400 py-10">لا يوجد مصاريف مسجلة</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
