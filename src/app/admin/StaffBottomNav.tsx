"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutGrid, 
  Flame, 
  Hand, 
  Wallet,
  Settings,
  Truck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function StaffBottomNav({ role }: { role: string }) {
  const pathname = usePathname();

  const allItems = [
    { href: "/admin/dashboard", label: "الرئيسية", icon: LayoutGrid, roles: ["Admin"] },
    { href: "/admin/kitchen", label: "المطبخ", icon: Flame, roles: ["Admin", "Chef"] },
    { href: "/admin/waiter", label: "النادل", icon: Hand, roles: ["Admin", "Waiter"] },
    { href: "/admin/delivery", label: "التوصيل", icon: Truck, roles: ["Admin", "DeliveryDriver"] },
    { href: "/admin/cashier", label: "الكاشير", icon: Wallet, roles: ["Admin", "Cashier"] },
  ];

  const items = allItems.filter(item => item.roles.includes(role));

  // Don't show if there's only one or zero items
  if (items.length <= 1) return null;

  return (
    <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[50] w-[90%] max-w-sm">
      <div className="glass-morphism rounded-[24px] px-2 py-2 flex items-center justify-around shadow-2xl border-white/20">
        {items.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center gap-1 p-2 min-w-[64px]"
            >
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="absolute inset-0 bg-slate-900 rounded-2xl -z-10 shadow-lg shadow-slate-900/10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon 
                className={cn(
                    "h-5 w-5 transition-colors duration-300", 
                    isActive ? "text-white" : "text-slate-400"
                )} 
              />
              <span className={cn(
                "text-[10px] font-black transition-colors duration-300",
                isActive ? "text-white" : "text-slate-400"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
