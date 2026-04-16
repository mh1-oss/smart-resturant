"use client";

import { useState } from "react";
import { 
  UserPlus, 
  Trash2, 
  ShieldCheck, 
  UserCircle,
  X,
  Loader2,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createStaff, deleteStaff, updateStaffRole } from "@/app/actions/staff";

export default function StaffClient({ initialUsers }: { initialUsers: any[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await createStaff(formData);

    if (result.success) {
      window.location.reload(); // Simple refresh for now
    } else {
      setError(result.error || "فشل في إنشاء الحساب");
      setLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الموظف؟")) return;
    const result = await deleteStaff(userId);
    if (result.success) {
      setUsers(users.filter(u => u.id !== userId));
    } else {
      alert(result.error || "فشل في حذف الموظف");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-start mb-6">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="premium-button h-14 bg-slate-900 text-white hover:bg-black"
        >
          <UserPlus className="ml-2 h-5 w-5" />
          إضافة موظف جديد
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <div key={user.id} className="surface-card flex flex-col p-8 border-slate-100 group hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-6">
              <div className="h-16 w-16 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-900">
                <UserCircle size={40} />
              </div>
              <div className={cn(
                "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest",
                user.role === "Admin" ? "bg-rose-50 text-rose-600" :
                user.role === "Chef" ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"
              )}>
                {user.role}
              </div>
            </div>

            <div className="flex-1 mb-8">
              <h3 className="text-xl font-black text-slate-900">{user.name || "بدون اسم"}</h3>
              <p className="text-sm font-bold text-slate-400 mt-1">@{user.username}</p>
            </div>

            <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span>عضو منذ {new Date(user.createdAt).toLocaleDateString('ar-SA')}</span>
              </div>
              <button 
                onClick={() => handleDelete(user.id)}
                className="h-10 w-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors"
                disabled={user.username === "admin"}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6">
          <div className="w-full max-w-lg surface-card p-10 relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute left-6 top-8 h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200"
            >
              <X className="h-5 w-5 text-slate-500" />
            </button>

            <h2 className="text-2xl font-black text-slate-900 mb-8 border-r-4 border-slate-900 pr-4">إضافة موظف جديد</h2>

            <form onSubmit={handleCreate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700">الاسم الكامل</label>
                <input 
                  name="name" 
                  type="text" 
                  placeholder="مثال: أحمد علي"
                  className="w-full h-14 rounded-2xl border-slate-200 bg-slate-50 px-5 font-bold outline-none focus:ring-2 focus:ring-slate-900/5 transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700">اسم المستخدم</label>
                <input 
                  name="username" 
                  type="text" 
                  placeholder="الاسم المستخدم لتسجيل الدخول"
                  className="w-full h-14 rounded-2xl border-slate-200 bg-slate-50 px-5 font-bold outline-none focus:ring-2 focus:ring-slate-900/5 transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700">كلمة المرور</label>
                <input 
                  name="password" 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full h-14 rounded-2xl border-slate-200 bg-slate-50 px-5 font-bold outline-none focus:ring-2 focus:ring-slate-900/5 transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700">الرتبة الوظيفية</label>
                <select 
                  name="role"
                  className="w-full h-14 rounded-2xl border-slate-200 bg-slate-50 px-5 font-bold outline-none focus:ring-2 focus:ring-slate-900/5 transition-all appearance-none"
                  required
                >
                  <option value="Waiter">ويتر (نادل)</option>
                  <option value="Chef">شيف (طباخ)</option>
                  <option value="Cashier">كاشير</option>
                  <option value="Admin">أدمن (مدير)</option>
                </select>
              </div>

              {error && <p className="text-sm font-bold text-rose-500">{error}</p>}

              <button 
                type="submit" 
                className="premium-button w-full h-16 bg-slate-900 text-white hover:bg-black mt-4 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin h-6 w-6" /> : "إنشاء الحساب الآن"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
