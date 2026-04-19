"use client";

import { useState, useEffect } from "react";
import { 
  Menu, X, UtensilsCrossed, LogOut, ChevronRight, Settings,
  LayoutGrid, Wallet, Flame, Hand, Truck, BookOpenText, Star, Grid3X3, UserCog, History, HelpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";

// More stable icon mapping
const IconMap: { [key: string]: any } = {
  LayoutGrid,
  Wallet,
  Flame,
  Hand,
  Truck,
  BookOpenText,
  Star,
  Grid3X3,
  UserCog,
  History,
  Settings,
};

interface MobileNavProps {
  navItems: any[];
  restaurantName: string;
  user: any;
  signOutAction: () => Promise<void>;
}

export default function MobileNav({ navItems, restaurantName, user, signOutAction }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Handle mounting state for Portals
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close sidebar when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Lock scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  const isAdmin = user?.role === "Admin";
  const safeNavItems = navItems || [];

  const drawerContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] lg:hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
          />

          {/* Sidebar Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="absolute inset-y-0 right-0 w-[85%] max-w-[340px] bg-white shadow-2xl flex flex-col h-full overflow-hidden"
          >
            {/* Drawer Header */}
            <div className="p-6 pb-2 shrink-0 border-b border-slate-50">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-900/20">
                    <UtensilsCrossed className="h-6 w-6" />
                  </div>
                  <div>
                    <h1 className="text-sm font-black text-slate-900 leading-tight">{restaurantName}</h1>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">التطبيق الذكي</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="h-11 w-11 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-100 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Navigation Items */}
            <div className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar flex flex-col gap-2">
              {safeNavItems.length > 0 ? safeNavItems.map((item) => {
                const Icon = IconMap[item.iconName] || HelpCircle;
                const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/admin");
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between rounded-[1.25rem] px-5 py-4.5 text-base font-bold transition-all duration-300 group",
                      isActive
                        ? "bg-slate-900 text-white shadow-xl shadow-slate-900/10"
                        : "text-slate-500 hover:bg-slate-50"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <Icon className={cn("h-5 w-5", isActive ? "stroke-[2.5px]" : "stroke-[2px]")} />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className={cn("h-4 w-4 transition-transform", isActive ? "opacity-100" : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0")} />
                  </Link>
                );
              }) : (
                <div className="py-10 text-center text-slate-400 font-bold text-sm">
                   لا توجد عناصر متاحة
                </div>
              )}
            </div>

            {/* Bottom Section */}
            <div className="p-6 bg-slate-50/50 border-t border-slate-100 space-y-4 shrink-0">
              <Link 
                href="/admin/profile" 
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 active:bg-slate-50 transition-colors group"
              >
                  <div className="h-12 w-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-lg group-active:scale-95 transition-transform">
                  {user?.name?.[0] || "A"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-slate-900 truncate">{user?.name}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        {user?.role === "Admin" ? "المدير العام" : user?.role || "موظف"}
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-slate-300" />
              </Link>

              <div className="grid grid-cols-2 gap-3">
                {isAdmin && (
                  <Link
                    href="/admin/settings"
                    className={cn(
                      "flex flex-col items-center justify-center gap-2 rounded-2xl py-4 transition-all border-2 shadow-sm shadow-slate-200/50",
                      pathname === "/admin/settings" 
                        ? "bg-slate-900 border-slate-900 text-white" 
                        : "bg-white border-slate-100 text-slate-500 hover:bg-slate-50"
                    )}
                  >
                    <Settings size={20} />
                    <span className="text-[10px] font-black uppercase">الإعدادات</span>
                  </Link>
                )}
                <button 
                  onClick={() => signOutAction()}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 rounded-2xl py-4 transition-all border-2 bg-white border-slate-100 text-slate-500 hover:text-rose-600 hover:border-rose-100 shadow-sm shadow-slate-200/50",
                    !isAdmin && "col-span-2"
                  )}
                >
                  <LogOut size={20} />
                  <span className="text-[10px] font-black uppercase tracking-wider">خروج</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-900 shadow-sm active:scale-95 transition-transform"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Render drawer in body portal to avoid parent stacking/clipping issues */}
      {mounted ? createPortal(drawerContent, document.body) : null}
    </>
  );
}
