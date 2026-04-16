import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  LayoutGrid,
  BookOpenText,
  TableProperties,
  Users,
  Settings,
  LogOut,
  UtensilsCrossed,
  Bell,
  CircleUserRound,
} from "lucide-react";
import Link from "next/link";
import NavItem from "./NavItem"; 
import AdminHeaderActions from "./AdminHeaderActions";
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
    { href: "/admin/menu", label: "إدارة القائمة", iconName: "BookOpenText", roles: ["Admin"] },
    { href: "/admin/offers", label: "إدارة العروض", iconName: "Star", roles: ["Admin"] },
    { href: "/admin/tables", label: "إدارة الطاولات", iconName: "Grid3X3", roles: ["Admin"] },
    { href: "/admin/staff", label: "إدارة الموظفين", iconName: "UserCog", roles: ["Admin"] },
    { href: "/admin/archive", label: "الأرشيف", iconName: "History", roles: ["Admin"] },
    { href: "/admin/settings", label: "الإعدادات", iconName: "Settings", roles: ["Admin"] },
  ];

  const navItems = allNavItems.filter(item => item.roles.includes(role));

  // If user is not an Admin and tries to access a restricted path, redirect to their first authorized path
  // Since we are in a layout, we can check the pathname logic in a Server Component 
  // with a small trick or just pass it in children. 
  // However, for simplicity and total isolation, we redirect in the page.tsx level or middleware.
  // But let's add a small check for the root /admin access.

  return (
    <div className="flex h-screen overflow-hidden bg-[#fcfdfe]">
      {/* Sidebar */}
      <aside className="hidden h-screen w-[320px] flex-col border-l border-slate-200/60 bg-white p-6 lg:flex shrink-0">
        <div className="mb-8 flex items-center gap-4 px-2 shrink-0">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-900/20">
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

        <div className="mt-auto surface-card p-5 !rounded-3xl border-slate-200 shrink-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-900 font-black text-lg">
              {session.user?.name?.[0] || "A"}
            </div>
            <div>
              <p className="text-sm font-black text-slate-900">{session.user?.name}</p>
              <p className="text-xs font-bold text-slate-400 capitalize">
                {(session.user as any).role === "Admin" ? "المدير العام" : (session.user as any).role}
              </p>
            </div>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut();
            }}
          >
            <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-600 transition-colors hover:bg-rose-50 hover:text-rose-600">
              <LogOut className="h-4 w-4" />
              <span>تسجيل الخروج</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Fixed Header */}
        <header className="flex h-20 items-center justify-between px-8 py-4 bg-[#fcfdfe]/80 backdrop-blur-md border-b border-slate-200/50 z-20 shrink-0">
          <div className="flex items-center gap-3">
            <AdminHeaderActions />
          </div>
          <div className="flex flex-col items-end">
            <h2 className="text-lg font-black text-slate-900">مرحباً بك مجدداً</h2>
            <p className="text-xs font-bold text-slate-400">{new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </header>

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          <div className="px-8 pb-10 pt-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
