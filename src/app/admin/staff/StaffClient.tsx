"use client";

import { useState } from "react";
import { 
  UserPlus, 
  Trash2, 
  ShieldCheck, 
  UserCircle,
  X,
  Loader2,
  CheckCircle2,
  Fingerprint,
  Calendar,
  Lock,
  User,
  ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createStaff, deleteStaff, updateStaffRole } from "@/app/actions/staff";
import { motion, AnimatePresence } from "framer-motion";

export default function StaffClient({ initialUsers }: { initialUsers: any[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDeleteUserId, setConfirmDeleteUserId] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await createStaff(formData);

    if (result.success) {
      window.location.reload(); 
    } else {
      setError(result.error || "فشل في إنشاء الحساب");
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteUserId) return;
    const userId = confirmDeleteUserId;
    setConfirmDeleteUserId(null);

    const previousUsers = [...users];
    setUsers(users.filter(u => u.id !== userId));

    const result = await deleteStaff(userId);
    if (!result.success) {
      setUsers(previousUsers);
      alert(result.error || "فشل في حذف الموظف");
    }
  };

  const getRoleBadgeStyle = (role: string) => {
    switch(role) {
      case "Admin": return "bg-rose-50 text-rose-600 ring-rose-100";
      case "Chef": return "bg-amber-50 text-amber-600 ring-amber-100";
      case "Waiter": return "bg-blue-50 text-blue-600 ring-blue-100";
      case "DeliveryDriver": return "bg-emerald-50 text-emerald-600 ring-emerald-100";
      case "Cashier": return "bg-indigo-50 text-indigo-600 ring-indigo-100";
      default: return "bg-slate-50 text-slate-600 ring-slate-100";
    }
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 px-1">
        <div>
          <h2 className="text-3xl font-black text-slate-900 leading-tight">إدارة الموظفين</h2>
          <p className="font-bold text-slate-400 text-sm mt-1">إضافة وإدارة صلاحيات طاقم العمل</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="pro-button h-16 px-8 shadow-xl shadow-slate-900/10 whitespace-nowrap"
        >
          <UserPlus className="h-5 w-5" />
          إضافة موظف جديد
        </button>
      </div>

      {/* Staff Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {users.map((user, idx) => (
          <motion.div 
            key={user.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="premium-card p-8 border-slate-100/50 group hover:shadow-2xl hover:shadow-slate-200/50 transition-all relative overflow-hidden active:scale-[0.98]"
          >
            {/* Background Accent */}
            <div className={cn(
              "absolute -top-12 -left-12 h-32 w-32 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500",
              user.role === "Admin" ? "bg-rose-400" : "bg-blue-400"
            )} />

            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className="h-20 w-20 rounded-[2rem] bg-slate-50/80 backdrop-blur-sm border border-slate-100 flex items-center justify-center text-slate-300 ring-4 ring-white shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                <UserCircle size={44} className="group-hover:text-slate-900 transition-colors" />
              </div>
              <span className={cn(
                "px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest ring-1",
                getRoleBadgeStyle(user.role)
              )}>
                {user.role}
              </span>
            </div>

            <div className="space-y-1 mb-8 relative z-10">
              <h3 className="text-xl font-black text-slate-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-slate-900 group-hover:to-slate-600 transition-all">
                {user.name || "بدون اسم"}
              </h3>
              <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                <Fingerprint size={14} className="text-slate-300" />
                <span>@{user.username}</span>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-50/80 flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-50/50 pr-2 pl-4 py-2 rounded-xl border border-slate-100/50">
                <Calendar size={14} className="text-slate-300" />
                <span>منذ {new Date(user.createdAt).toLocaleDateString('ar-SA')}</span>
              </div>
              
              <button 
                onClick={() => setConfirmDeleteUserId(user.id)}
                className={cn(
                  "h-12 w-12 rounded-2xl flex items-center justify-center transition-all",
                  user.username === "admin" 
                    ? "bg-slate-50 text-slate-200 cursor-not-allowed" 
                    : "bg-rose-50 text-rose-300 hover:bg-rose-500 hover:text-white hover:shadow-lg hover:shadow-rose-500/20 active:scale-95"
                )}
                disabled={user.username === "admin"}
              >
                <Trash2 size={20} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modern Dialogs */}
      <AnimatePresence>
        {/* Add Staff Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 sm:p-10">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsModalOpen(false)} 
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }} 
              className="w-full max-w-xl bg-white rounded-[3rem] shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="h-14 w-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg">
                    <UserPlus size={28} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 leading-tight">إضافة موظف</h2>
                    <p className="text-sm font-bold text-slate-400">إنشاء حساب جديد للنظام</p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="h-12 w-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-900 transition-colors">
                  <X />
                </button>
              </div>

              <form onSubmit={handleCreate} className="p-10 space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2 flex items-center gap-2">
                      <User size={12} className="text-slate-300" />
                      الاسم الكامل
                    </label>
                    <input name="name" placeholder="أحمد علي..." className="pro-input w-full h-16 text-lg" required />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2 flex items-center gap-2">
                      <Fingerprint size={12} className="text-slate-300" />
                      اسم المستخدم
                    </label>
                    <input name="username" placeholder="user123" className="pro-input w-full h-16 text-lg font-sans" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2 flex items-center gap-2">
                      <Lock size={12} className="text-slate-300" />
                      كلمة المرور
                    </label>
                    <input name="password" type="password" placeholder="••••••••" className="pro-input w-full h-16 text-lg" required />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2 flex items-center gap-2">
                      <ShieldCheck size={12} className="text-slate-300" />
                      الرتبة الوظيفية
                    </label>
                    <div className="relative">
                      <select name="role" className="pro-input w-full h-16 text-lg appearance-none cursor-pointer" required>
                        <option value="Waiter">ويتر (نادل)</option>
                        <option value="Chef">شيف (طباخ)</option>
                        <option value="DeliveryDriver">سايق ديليفري</option>
                        <option value="Cashier">كاشير</option>
                        <option value="Admin">أدمن (مدير)</option>
                      </select>
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
                        <UserCircle size={20} />
                      </div>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-center gap-3 text-rose-600 font-bold text-sm animate-shake">
                    <ShieldAlert size={18} />
                    {error}
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={loading} 
                  className="pro-button w-full h-18 text-xl shadow-2xl shadow-slate-900/20 mt-4"
                >
                  {loading ? <Loader2 className="animate-spin h-6 w-6" /> : "إكمال إنشاء الحساب"}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Delete Confirm Modal */}
        {confirmDeleteUserId && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setConfirmDeleteUserId(null)} className="fixed inset-0 bg-slate-900/80 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-sm premium-card p-10 text-center relative z-10">
              <div className="mx-auto w-24 h-24 bg-rose-50 text-rose-500 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-xl shadow-rose-500/10">
                <Trash2 className="w-12 h-12" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-3">حذف الموظف</h2>
              <p className="text-slate-400 font-bold mb-10 leading-relaxed text-sm">سيتم سحب كافة الصلاحيات وحذف الحساب نهائياً من النظام.</p>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setConfirmDeleteUserId(null)} className="h-16 rounded-[1.5rem] font-black text-slate-500 bg-slate-50 hover:bg-slate-100 transition-all active:scale-95">
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
    </div>
  );
}
