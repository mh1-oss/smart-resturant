"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminHeaderActions() {
  const [isMuted, setIsMuted] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const savedMute = localStorage.getItem("isMuted") === "true";
    setIsMuted(savedMute);
  }, []);

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    localStorage.setItem("isMuted", String(nextMute));
  };

  if (!isMounted) {
    return (
      <div className="h-12 w-12 rounded-2xl bg-white border border-slate-200" />
    );
  }

  return (
    <button
      onClick={toggleMute}
      className={cn(
        "flex h-12 w-12 items-center justify-center rounded-2xl border transition-all duration-200",
        isMuted 
          ? "bg-rose-50 border-rose-100 text-rose-500 hover:bg-rose-100" 
          : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
      )}
      title={isMuted ? "تشغيل الصوت" : "كتم الصوت"}
    >
      {isMuted ? (
        <BellOff className="h-5 w-5 animate-pulse" />
      ) : (
        <Bell className="h-5 w-5" />
      )}
    </button>
  );
}
