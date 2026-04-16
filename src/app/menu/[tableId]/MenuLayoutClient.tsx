"use client";

import { useState } from "react";
import { House, Star, CreditCard, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { requestBill } from "@/app/actions/order";

export default function MenuLayoutClient() {
  const pathname = usePathname();
  const { tableId } = useParams();
  const [showBillModal, setShowBillModal] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const navItems = [
    { href: `/menu/${tableId}`, label: "الرئيسية", icon: House },
    { href: `/menu/${tableId}/offers`, label: "العروض", icon: Star },
    { 
      href: "#", 
      label: "طلب الحساب", 
      icon: CreditCard,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        setShowBillModal(true);
      }
    },
  ];

  const handleRequestBill = async () => {
    setIsRequesting(true);
    const result = await requestBill(tableId as string);
    if (result.success) {
      setIsSuccess(true);
      setTimeout(() => {
        setShowBillModal(false);
        setIsSuccess(false);
      }, 3000);
    } else {
      alert(result.error || "حدث خطأ أثناء طلب الحساب");
    }
    setIsRequesting(false);
  };

  return (
    <>
      {/* Bottom Navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200/60 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-around px-4 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            const content = (
              <div
                className={cn(
                  "flex flex-col items-center gap-1 transition-all duration-300",
                  isActive ? "text-slate-900 scale-110" : "text-slate-400 hover:text-slate-600"
                )}
              >
                <div className={cn(
                    "p-1 rounded-xl transition-all",
                    isActive && "bg-slate-100"
                )}>
                    <Icon className="h-6 w-6" strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className="text-[10px] font-black">{item.label}</span>
              </div>
            );

            if (item.onClick) {
              return (
                <button key={item.label} onClick={item.onClick} className="outline-none">
                  {content}
                </button>
              );
            }

            return (
              <Link key={item.label} href={item.href}>
                {content}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bill Request Modal */}
      {showBillModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => !isRequesting && setShowBillModal(false)} />
          <div className="relative w-full max-w-md overflow-hidden rounded-t-[40px] sm:rounded-[40px] bg-white p-8 shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-300">
            {isSuccess ? (
              <div className="flex flex-col items-center py-10 text-center space-y-4">
                <div className="h-20 w-20 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center animate-bounce">
                  <CheckCircle2 size={48} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">تم إرسال الطلب</h3>
                  <p className="font-bold text-slate-500">النادل في طريقه إليك الآن لإحضار الحساب</p>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-8 text-center">
                  <div className="mx-auto h-20 w-20 rounded-[32px] bg-slate-50 text-slate-900 flex items-center justify-center mb-4">
                    <CreditCard size={40} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900">طلب الحساب</h2>
                  <p className="text-sm font-bold text-slate-400">هل أنت متأكد من رغبتك في طلب الحساب الآن؟</p>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setShowBillModal(false)}
                    disabled={isRequesting}
                    className="flex-1 rounded-2xl bg-slate-100 py-4 text-sm font-black text-slate-600 hover:bg-slate-200"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleRequestBill}
                    disabled={isRequesting}
                    className="flex-[2] rounded-2xl bg-slate-900 py-4 text-sm font-black text-white shadow-xl shadow-slate-900/20 hover:bg-black disabled:opacity-50"
                  >
                    {isRequesting ? "جاري الإرسال..." : "نعم، أطلب الحساب"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
