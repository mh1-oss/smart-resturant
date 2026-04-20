"use client";

import { useState } from "react";
import { 
  TrendingUp, 
  Wallet, 
  TrendingDown, 
  Plus, 
  Trash2,
  PieChart,
  BarChart3,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  DollarSign,
  Receipt,
  Layout
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { addExpense, deleteExpense } from "@/app/actions/expense";
import { motion, AnimatePresence } from "framer-motion";

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
    { id: "today", label: "اليوم", icon: Activity },
    { id: "weekly", label: "الأسبوع", icon: Calendar },
    { id: "monthly", label: "الشهر", icon: PieChart },
    { id: "allTime", label: "الكل", icon: Layout },
  ];

  const handleAddExpense = async (e: React.FormEvent) => {
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
    }
    setIsAdding(false);
  };

  const handleDeleteExpense = async (id: number) => {
    const result = await deleteExpense(id);
    if (result.success) {
      setExpenses(expenses.filter(e => e.id !== id));
    }
  };

  const maxRevenue = Math.max(...chartData.map(d => d.revenue), 100);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-12"
    >
      {/* Dynamic Header Surface */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">نظرة عامة</h1>
          <p className="text-slate-400 font-bold mt-1">تتبع أداء مطعمك في الوقت الحقيقي</p>
        </div>
        
        <div className="flex items-center gap-2 p-1.5 bg-white border border-slate-200/60 rounded-2xl shadow-sm self-start md:self-auto overflow-x-auto no-scrollbar">
          {periods.map((p) => (
            <button
              key={p.id}
              onClick={() => setActivePeriod(p.id as any)}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all shrink-0",
                activePeriod === p.id 
                  ? "text-white shadow-lg shadow-slate-900/20" 
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
              )}
              style={activePeriod === p.id ? { backgroundColor: 'var(--brand-primary)' } : {}}
            >
              <p.icon size={14} />
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Hero Financial Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Revenue Card */}
        <motion.div variants={itemVariants} className="group relative overflow-hidden rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-900/20" style={{ backgroundColor: 'var(--brand-primary)' }}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/20 to-transparent rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-emerald-500/30 transition-all duration-500" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
               <div className="h-12 w-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center text-emerald-400 border border-white/5">
                 <TrendingUp size={24} />
               </div>
               <div className="flex items-center gap-1 text-[10px] font-black bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-full border border-emerald-500/10">
                  <ArrowUpRight size={12} />
                  <span>{currentStats.orderCount} طلب</span>
               </div>
            </div>
            <p className="text-sm font-bold text-white/70 mb-1">إجمالي المبيعات</p>
            <h3 className="text-4xl font-black tracking-tight">{formatCurrency(currentStats.revenue, currency)}</h3>
          </div>
        </motion.div>

        {/* Cost Card */}
        <motion.div variants={itemVariants} className="group relative overflow-hidden rounded-[2.5rem] p-8 bg-white border border-slate-200 shadow-xl shadow-slate-200/50">
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-slate-100 to-transparent rounded-full -ml-16 -mb-16 blur-2xl group-hover:bg-slate-200 transition-all duration-500" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
               <div className="h-12 w-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-200">
                 <DollarSign size={24} />
               </div>
               <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">المواد الأولية</span>
            </div>
            <p className="text-sm font-bold text-slate-400 mb-1">إجمالي التكلفة</p>
            <h3 className="text-4xl font-black text-slate-900 tracking-tight">{formatCurrency(currentStats.cost, currency)}</h3>
          </div>
        </motion.div>

        {/* Expenses Card */}
        <motion.div variants={itemVariants} className="group relative overflow-hidden rounded-[2.5rem] p-8 bg-white border border-slate-200 shadow-xl shadow-slate-200/50">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
               <div className="h-12 w-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 border border-rose-100">
                 <TrendingDown size={24} />
               </div>
               <div className="flex items-center gap-1 text-[10px] font-black bg-rose-50 text-rose-500 px-3 py-1.5 rounded-full border border-rose-100">
                  <ArrowDownRight size={12} />
                  <span>مصاريف</span>
               </div>
            </div>
            <p className="text-sm font-bold text-slate-400 mb-1">المصروفات العامة</p>
            <h3 className="text-4xl font-black text-rose-600 tracking-tight">{formatCurrency(currentStats.expenses, currency)}</h3>
          </div>
        </motion.div>

        {/* Profit Card */}
        <motion.div variants={itemVariants} className="group relative overflow-hidden rounded-[2.5rem] p-8 bg-emerald-50 border border-emerald-100 shadow-xl shadow-emerald-200/20">
          <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-200/20 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-emerald-300/30 transition-all duration-500" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
               <div className="h-12 w-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-200">
                 <Wallet size={24} />
               </div>
               <span className="text-[10px] font-black text-emerald-600 bg-emerald-200/30 px-3 py-1.5 rounded-full border border-emerald-200/20">صافي الربح</span>
            </div>
            <p className="text-sm font-bold text-emerald-600/60 mb-1">الأرباح الصافية</p>
            <h3 className="text-4xl font-black text-emerald-700 tracking-tight">{formatCurrency(currentStats.profit, currency)}</h3>
          </div>
        </motion.div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Modern Revenue Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2 premium-card !rounded-[2.5rem] p-8 border-slate-100">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-xl" style={{ backgroundColor: 'var(--brand-primary)' }}>
                <BarChart3 size={20} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">حركة المبيعات</h3>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">تحديثات أسبوعية مباشرة</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-slate-400">نظام البيانات المباشر</span>
            </div>
          </div>

          <div className="flex items-end justify-between h-72 gap-4 lg:gap-8 px-4 relative">
             {/* Dynamic background lines */}
             <div className="absolute inset-0 flex flex-col justify-between pt-10 pb-16 opacity-30 pointer-events-none">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-full border-t border-dashed border-slate-200" />
                ))}
             </div>

            {chartData.map((day, idx) => {
              const heightPercent = (day.revenue / maxRevenue) * 90;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-4 group relative h-full justify-end z-10">
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 pointer-events-none">
                    <div className="text-white px-3 py-1.5 rounded-xl text-[10px] font-black shadow-xl" style={{ backgroundColor: 'var(--brand-primary)' }}>
                       {formatCurrency(day.revenue, currency)}
                    </div>
                    <div className="w-2 h-2 rotate-45 mx-auto -mt-1" style={{ backgroundColor: 'var(--brand-primary)' }} />
                  </div>
                  
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPercent}%` }}
                    transition={{ delay: idx * 0.1, duration: 1, ease: [0.34, 1.56, 0.64, 1] }}
                    className={cn(
                        "w-full max-w-[40px] rounded-2xl transition-all duration-300 relative group-hover:shadow-2xl",
                        day.revenue === maxRevenue 
                          ? "shadow-xl shadow-slate-900/20" 
                          : "bg-gradient-to-t from-slate-200 to-slate-100 group-hover:from-emerald-600 group-hover:to-emerald-400 shadow-sm"
                    )}
                    style={day.revenue === maxRevenue ? { backgroundColor: 'var(--brand-primary)' } : {}}
                  >
                    {day.revenue > 0 && <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white/40 rounded-full" />}
                  </motion.div>
                  
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                    {day.name}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Expense Hub */}
        <motion.div variants={itemVariants} className="premium-card !rounded-[2.5rem] p-8 border-slate-100 flex flex-col h-full bg-[#fcfdfe]/50">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-12 w-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500">
               <Receipt size={24} />
            </div>
            <h3 className="text-xl font-black text-slate-900">إدارة المصاريف</h3>
          </div>
          
          <form onSubmit={handleAddExpense} className="space-y-4 mb-8 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
             <div className="space-y-3">
               <div className="relative">
                 <input 
                   type="text" 
                   placeholder="وصف المصروف..."
                   value={desc}
                   onChange={(e) => setDesc(e.target.value)}
                   className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:bg-slate-100 transition-all outline-none"
                 />
               </div>
               <div className="relative">
                 <input 
                   type="number" 
                   placeholder="المبلغ..."
                   value={amount}
                   onChange={(e) => setAmount(e.target.value)}
                   className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:bg-slate-100 transition-all outline-none"
                 />
                 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">{currency}</div>
               </div>
             </div>
             <button 
               type="submit"
               disabled={isAdding}
               className="w-full group h-14 text-white rounded-[1.25rem] font-bold text-sm shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50" style={{ backgroundColor: 'var(--brand-primary)' }}
             >
               <div className="w-6 h-6 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-white/20 transition-colors">
                 <Plus size={16} />
               </div>
               <span>{isAdding ? "جاري الإضافة..." : "تسجيل مصروف جديد"}</span>
             </button>
          </form>

          <div className="flex-1 space-y-3 min-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {expenses.map((expense) => (
                <motion.div 
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  key={expense.id} 
                  className="flex items-center justify-between p-5 rounded-3xl bg-white border border-slate-100 group shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-rose-50 group-hover:text-rose-400 transition-colors">
                      <Receipt size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">{expense.description}</p>
                      <p className="text-[10px] font-black text-slate-400">
                        {new Date(expense.date).toLocaleDateString('ar-SA')} • {expense.user.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-black text-rose-600">{formatCurrency(expense.amount, currency)}</span>
                    <button 
                      onClick={() => handleDeleteExpense(expense.id)}
                      className="p-2.5 text-slate-200 hover:text-rose-600 bg-transparent hover:bg-rose-50 rounded-xl transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {expenses.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 opacity-30 grayscale saturate-0">
                 <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <Receipt size={32} />
                 </div>
                 <p className="text-center text-xs font-black text-slate-400">لا يوجد مصاريف مسجلة لليوم</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
