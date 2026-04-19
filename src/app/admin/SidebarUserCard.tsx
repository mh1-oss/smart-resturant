"use client";

import Link from "next/link";
import { LogOut, ChevronRight } from "lucide-react";

interface SidebarUserCardProps {
  user: {
    name?: string | null;
    role: string;
  };
  signOutAction: () => Promise<void>;
}

export function SidebarUserCard({ user, signOutAction }: SidebarUserCardProps) {
  return (
    <Link 
      href="/admin/profile" 
      className="mt-auto premium-card !rounded-3xl border-slate-200 shrink-0 p-5 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 hover:scale-[1.02] transition-all duration-500 ease-out group"
    >
      <div className="flex items-center gap-3 mb-4 px-1">
        <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-900 font-black text-lg group-hover:bg-slate-900 group-hover:text-white transition-all duration-500 shadow-sm">
          {user?.name?.[0] || "A"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-slate-900 truncate group-hover:text-slate-950 transition-colors">{user?.name}</p>
          <p className="text-xs font-bold text-slate-400 capitalize truncate group-hover:text-slate-500 transition-colors">
            {user?.role === "Admin" ? "المدير العام" : user?.role}
          </p>
        </div>
        <ChevronRight size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-500" />
      </div>
      
      <form 
        action={async () => {
          await signOutAction();
        }} 
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-50 px-4 py-4 text-sm font-bold text-slate-600 transition-all duration-300 hover:bg-rose-50 hover:text-rose-600 group/btn shadow-sm active:scale-95"
        >
          <LogOut className="h-4 w-4 transition-transform group-hover/btn:-translate-x-1" />
          <span>تسجيل الخروج</span>
        </button>
      </form>
    </Link>
  );
}
