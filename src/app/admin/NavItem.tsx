"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItemProps {
  href: string;
  label: string;
  iconName: string;
}

export default function NavItem({ href, label, iconName }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href || (pathname.startsWith(href) && href !== "/admin");

  // Dynamically get the icon component
  const Icon = (Icons as any)[iconName] || Icons.HelpCircle;

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-4 rounded-2xl px-5 py-4 text-base font-bold transition-all duration-300",
        isActive
          ? "bg-slate-900 text-white shadow-[0_15px_30px_-10px_rgba(15,23,42,0.3)]"
          : "text-slate-500 hover:bg-slate-100/80 hover:text-slate-900"
      )}
    >
      <Icon className={cn("h-5 w-5", isActive ? "stroke-[2.5px]" : "stroke-[2px]")} />
      <span>{label}</span>
    </Link>
  );
}
