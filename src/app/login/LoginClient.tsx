"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { UtensilsCrossed, Lock, User, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginClient({ restaurantName }: { restaurantName: string }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("بيانات الدخول غير صحيحة");
      } else {
        router.push("/admin/dashboard");
      }
    } catch (err) {
      setError("حدث خطأ ما، يرجى المحاولة لاحقاً");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden p-6 bg-[#fcfcfd]">
      {/* Light Mesh Background */}
      <div className="absolute top-[-20%] right-[-10%] h-[70%] w-[70%] rounded-full opacity-10 blur-[120px] -z-10 animate-pulse" style={{ background: 'var(--brand-accent)' }} />
      <div className="absolute bottom-[-10%] left-[-10%] h-[60%] w-[60%] rounded-full opacity-10 blur-[120px] -z-10" style={{ background: 'var(--brand-secondary)' }} />
      
      <div className="w-full max-w-[440px] animate-entrance">
        {/* Brand Header */}
        <div className="mb-10 text-center space-y-4">
          <div className="mx-auto w-24 h-24 relative group">
             <div className="absolute inset-0 bg-[var(--brand-primary)] opacity-10 blur-xl rounded-full group-hover:opacity-20 transition-all duration-700" />
             <div className="relative h-24 w-24 flex items-center justify-center rounded-[32px] bg-white shadow-xl border border-[var(--brand-primary)] border-opacity-10 group-hover:scale-110 transition-transform duration-500">
                <UtensilsCrossed className="h-10 w-10 text-[var(--brand-primary)]" />
             </div>
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tight" style={{ color: 'var(--brand-primary)' }}>تسجيل الدخول</h1>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">نظام الإدارة الذكي • {restaurantName}</p>
          </div>
        </div>

        {/* Login Form Card */}
        <div className="glass-morphism hover-lift rounded-[40px] p-8 md:p-10 border border-white">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider mr-1">اسم المستخدم</label>
              <div className="relative group">
                <div className="absolute right-5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 group-focus-within:text-[var(--brand-primary)] group-focus-within:bg-[#f8fafc] transition-all">
                  <User size={16} />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full h-14 bg-slate-50/50 border border-slate-100 rounded-2xl pr-16 pl-6 text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-[var(--brand-primary)] focus:ring-opacity-10 focus:border-[var(--brand-primary)] focus:border-opacity-30 transition-all placeholder:text-slate-300 shadow-sm"
                  placeholder="admin"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider mr-1">كلمة المرور</label>
              <div className="relative group">
                <div className="absolute right-5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 group-focus-within:text-[var(--brand-primary)] group-focus-within:bg-[#f8fafc] transition-all">
                  <Lock size={16} />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-14 bg-slate-50/50 border border-slate-100 rounded-2xl pr-16 pl-6 text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-[var(--brand-primary)] focus:ring-opacity-10 focus:border-[var(--brand-primary)] focus:border-opacity-30 transition-all placeholder:text-slate-300 shadow-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 rounded-2xl bg-rose-50 p-4 text-xs font-bold text-rose-500 border border-rose-100"
              >
                <AlertCircle size={16} className="shrink-0" />
                <p>{error}</p>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="relative w-full h-16 group overflow-hidden rounded-2xl shadow-xl active:scale-95 transition-all"
              style={{ background: 'var(--brand-primary)' }}
            >
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-500 shadow-inner" />
              <div className="relative flex items-center justify-center gap-3 text-white font-black text-lg group-hover:gap-5 transition-all">
                {loading ? (
                  <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>دخول للنظام</span>
                    <UtensilsCrossed size={20} className="group-hover:rotate-12 transition-transform" />
                  </>
                )}
              </div>
            </button>
          </form>
        </div>

        <div className="mt-10 flex flex-col items-center space-y-4">
           <div className="h-[2px] w-8 rounded-full" style={{ background: 'var(--brand-primary)', opacity: 0.2 }} />
           <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
             &copy; {new Date().getFullYear()} {restaurantName} للإدارة الرقمية
           </p>
        </div>
      </div>
    </div>
  );
}
