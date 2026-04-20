"use client";

import { useState } from "react";
import { User, Phone, Lock, Save, Loader2, CheckCircle2 } from "lucide-react";
import { updateUserProfile, changePassword } from "@/app/actions/user";
import { cn } from "@/lib/utils";

export default function ProfilePage({ user }: { user: any }) {
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [profileMessage, setProfileMessage] = useState({ type: "", text: "" });
    const [passwordMessage, setPasswordMessage] = useState({ type: "", text: "" });

    const [profileData, setProfileData] = useState({
        name: user.name || "",
        phone: user.phone || ""
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdatingProfile(true);
        setProfileMessage({ type: "", text: "" });

        const result = await updateUserProfile(profileData);
        if (result.success) {
            setProfileMessage({ type: "success", text: "تم تحديث البيانات بنجاح" });
        } else {
            setProfileMessage({ type: "error", text: result.error || "فشل تحديث البيانات" });
        }
        setIsUpdatingProfile(false);
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordMessage({ type: "error", text: "كلمات السر الجديدة غير متطابقة" });
            return;
        }

        setIsChangingPassword(true);
        setPasswordMessage({ type: "", text: "" });

        const result = await changePassword({
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword
        });

        if (result.success) {
            setPasswordMessage({ type: "success", text: "تم تغيير كلمة السر بنجاح" });
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } else {
            setPasswordMessage({ type: "error", text: result.error || "فشل تغيير كلمة السر" });
        }
        setIsChangingPassword(false);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-24 px-4 pt-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black text-slate-900">الملف الشخصي</h1>
                <p className="text-slate-500 font-bold">أهلاً {user.name}، يمكنك إدارة بيانات حسابك من هنا</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Profile Section */}
                <div className="premium-card p-10 space-y-8 h-fit">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <User size={24} />
                        </div>
                        <h2 className="text-xl font-black text-slate-900">البيانات الشخصية</h2>
                    </div>

                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">الاسم الكامل</label>
                            <div className="relative">
                                <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                                <input 
                                    className="premium-input pr-12 h-14"
                                    value={profileData.name}
                                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                                    placeholder="أدخل اسمك الكامل"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">رقم الهاتف</label>
                            <div className="relative">
                                <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                                <input 
                                    className="premium-input pr-12 h-14"
                                    value={profileData.phone}
                                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                                    placeholder="07XXXXXXXX"
                                />
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium px-1">سيتمكن الزبائن من رؤية هذا الرقم عند استلامك للطلبات</p>
                        </div>

                        {profileMessage.text && (
                            <div className={cn(
                                "p-4 rounded-xl text-sm font-bold flex items-center gap-2",
                                profileMessage.type === "success" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                            )}>
                                {profileMessage.type === "success" ? <CheckCircle2 size={16} /> : null}
                                {profileMessage.text}
                            </div>
                        )}

                        <button 
                            type="submit"
                            disabled={isUpdatingProfile}
                            className="w-full h-14 rounded-2xl text-white font-black transition-all flex items-center justify-center gap-2 active:scale-95 disabled:grayscale shadow-xl shadow-indigo-600/20"
                            style={{ backgroundColor: 'var(--brand-primary)' }}
                        >
                            {isUpdatingProfile ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                            حفظ التعديلات
                        </button>
                    </form>
                </div>

                {/* Password Section */}
                <div className="premium-card p-10 space-y-8 h-fit">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                            <Lock size={24} />
                        </div>
                        <h2 className="text-xl font-black text-slate-900">الأمان وكلمة السر</h2>
                    </div>

                    <form onSubmit={handlePasswordChange} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">كلمة السر الحالية</label>
                            <input 
                                type="password"
                                className="premium-input h-14"
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">كلمة السر الجديدة</label>
                            <input 
                                type="password"
                                className="premium-input h-14"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">تأكيد كلمة السر</label>
                            <input 
                                type="password"
                                className="premium-input h-14"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        {passwordMessage.text && (
                            <div className={cn(
                                "p-4 rounded-xl text-sm font-bold flex items-center gap-2",
                                passwordMessage.type === "success" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                            )}>
                                {passwordMessage.type === "success" ? <CheckCircle2 size={16} /> : null}
                                {passwordMessage.text}
                            </div>
                        )}

                        <button 
                            type="submit"
                            disabled={isChangingPassword}
                            className="w-full h-14 rounded-2xl text-white font-black transition-all flex items-center justify-center gap-2 active:scale-95 disabled:grayscale shadow-xl shadow-rose-600/20"
                            style={{ backgroundColor: 'var(--brand-primary)' }}
                        >
                            {isChangingPassword ? <Loader2 className="animate-spin" /> : <Lock size={20} />}
                            تغيير كلمة السر
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
