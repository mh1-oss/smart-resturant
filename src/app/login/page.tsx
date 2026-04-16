"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { UtensilsCrossed, Lock, User, AlertCircle } from "lucide-react";

export default function LoginPage() {
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
        setError("خطأ في اسم المستخدم أو كلمة المرور");
      } else {
        router.push("/admin/dashboard");
      }
    } catch (err) {
      setError("حدث خطأ ما، يرجى المحاولة مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-[480px] space-y-8">
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] bg-slate-900 text-white shadow-2xl shadow-slate-900/20">
            <UtensilsCrossed className="h-10 w-10" />
          </div>
          <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-900">تسجيل الدخول</h1>
          <p className="mt-2 text-slate-500 font-medium">نظام الإدارة الذكي للمطعم</p>
        </div>

        <div className="surface-card p-8 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 mr-1">اسم المستخدم</label>
              <div className="relative">
                <User className="absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="field pr-12"
                  placeholder="admin"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 mr-1">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="field pr-12"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-600 animate-shake">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="premium-button w-full h-16 text-lg"
            >
              {loading ? "جاري التحقق..." : "دخول للنظام"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm font-medium text-slate-400">
          &copy; {new Date().getFullYear()} جميع الحقوق محفوظة لشركة النخبة
        </p>
      </div>
    </div>
  );
}
