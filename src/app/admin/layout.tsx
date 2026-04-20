import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  UtensilsCrossed,
  LogOut,
} from "lucide-react";
import NavItem from "./NavItem"; 
import AdminHeaderActions from "./AdminHeaderActions";
import { SidebarUserCard } from "./SidebarUserCard";
import MobileNav from "./MobileNav";
import StaffBottomNav from "./StaffBottomNav";
import { getSettings } from "@/app/actions/settings";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const role = (session.user as any).role;
  const settings = await getSettings();

  const allNavItems = [
    { href: "/admin/dashboard", label: "لوحة القيادة", iconName: "LayoutGrid", roles: ["Admin"] },
    { href: "/admin/cashier", label: "شاشة الكاشير", iconName: "Wallet", roles: ["Admin", "Cashier"] },
    { href: "/admin/kitchen", label: "شاشة المطبخ", iconName: "Flame", roles: ["Admin", "Chef"] },
    { href: "/admin/waiter", label: "شاشة النادل", iconName: "Hand", roles: ["Admin", "Waiter"] },
    { href: "/admin/delivery", label: "شاشة الديليفري", iconName: "Truck", roles: ["Admin", "DeliveryDriver"] },
    { href: "/admin/menu", label: "إدارة القائمة", iconName: "BookOpenText", roles: ["Admin"] },
    { href: "/admin/offers", label: "إدارة العروض", iconName: "Star", roles: ["Admin"] },
    { href: "/admin/tables", label: "إدارة الطاولات", iconName: "Grid3X3", roles: ["Admin"] },
    { href: "/admin/staff", label: "إدارة الموظفين", iconName: "UserCog", roles: ["Admin"] },
    { href: "/admin/archive", label: "الأرشيف", iconName: "History", roles: ["Admin"] },
    { href: "/admin/settings", label: "الإعدادات", iconName: "Settings", roles: ["Admin"] },
  ];

  const navItems = allNavItems.filter(item => item.roles.includes(role));

  const signOutAction = async () => {
    "use server";
    await signOut();
  };

  return (
    <div className="flex h-screen overflow-hidden font-sans" style={{ backgroundColor: 'var(--theme-bg)' }}>
      {/* Sidebar - Desktop Only */}
      <aside className="hidden h-screen w-[320px] flex-col border-l border-slate-200/60 bg-white p-6 lg:flex shrink-0">
        <div className="mb-8 flex items-center gap-4 px-2 shrink-0">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg shadow-slate-900/20" style={{ backgroundColor: 'var(--brand-primary)' }}>
            <UtensilsCrossed className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 leading-tight">{settings.restaurantName}</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">الإصدار الذكي 2.0</p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1.5 overflow-y-auto pr-1 pl-3 custom-scrollbar">
          {navItems.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </nav>

        <SidebarUserCard 
          user={session.user as any} 
          signOutAction={signOutAction} 
        />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Fixed Header */}
        <header className="flex h-20 items-center justify-between px-4 lg:px-8 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200/50 z-50 shrink-0">
          <div className="flex items-center gap-2 lg:gap-3">
            <MobileNav 
                navItems={navItems} 
                restaurantName={settings.restaurantName}
                user={session.user}
                signOutAction={signOutAction}
            />
            <AdminHeaderActions />
          </div>
          <div className="flex flex-col items-end">
            <h2 className="text-sm lg:text-lg font-black text-slate-900 leading-tight">مرحباً بك</h2>
            <p className="text-[10px] lg:text-xs font-bold text-slate-400">
                {new Date().toLocaleDateString('ar-SA', { weekday: 'short', day: 'numeric', month: 'short' })}
            </p>
          </div>
        </header>

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar" style={{ backgroundColor: 'var(--theme-bg)' }}>
          <div className="px-4 lg:px-8 pb-32 lg:pb-10 pt-6">
            <div className="max-w-7xl mx-auto">
                {children}
            </div>
          </div>
        </div>

        {/* Mobile Bottom Nav */}
        <StaffBottomNav role={role} />
      </main>
    </div>
  );
}

