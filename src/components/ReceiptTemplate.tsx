"use client";

import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";

interface ReceiptProps {
  session: any;
  settings: {
    restaurantName: string;
    address: string;
    restaurantPhone: string;
    receiptFooter: string;
    currency: string;
    taxRate: string;
  };
}

export default function ReceiptTemplate({ session, settings }: ReceiptProps) {
  const calculateTotal = () => {
    return session.orders.reduce((sum: number, o: any) => 
      sum + o.items.reduce((itemSum: number, i: any) => itemSum + (Number(i.price_at_time) * i.quantity), 0)
    , 0);
  };

  const total = calculateTotal();
  const date = session.closed_at ? new Date(session.closed_at) : new Date();

  return (
    <div className="hidden print:block w-[80mm] mx-auto p-6 bg-white text-black font-sans leading-tight">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-black mb-2 uppercase">{settings.restaurantName}</h1>
        <p className="text-sm font-bold mb-1 opacity-80">{settings.address}</p>
        <p className="text-sm font-bold mb-6">هاتف: {settings.restaurantPhone}</p>
        <div className="border-b-4 border-double border-black mb-6"></div>
      </div>

      {/* Meta Info */}
      <div className="flex justify-between text-xs font-bold mb-6">
        <div className="text-right">
          <p>التاريخ: {format(date, 'yyyy/MM/dd')}</p>
          <p>الوقت: {format(date, 'hh:mm a')}</p>
        </div>
        <div className="text-left">
          <p>الطاولة: {session.table.table_number}</p>
          <p>رقم الجلسة: #{session.id}</p>
        </div>
      </div>

      <div className="border-b-2 border-black mb-6"></div>

      {/* Items Table */}
      <table className="w-full text-sm mb-8">
        <thead>
          <tr className="border-b-2 border-black text-right">
            <th className="pb-3">الصنف</th>
            <th className="pb-3 text-center">الكمية</th>
            <th className="pb-3 text-left">الإجمالي</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-dashed divide-black/20">
          {session.orders.map((order: any) => 
            order.items.map((item: any) => (
              <tr key={item.id} className="text-right">
                <td className="py-3 font-bold text-base">{item.menuItem.name}</td>
                <td className="py-3 text-center font-bold text-base">{item.quantity}</td>
                <td className="py-3 text-left font-bold text-base">
                  {formatCurrency(Number(item.price_at_time) * item.quantity, settings.currency)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Totals */}
      <div className="space-y-2 mb-8 border-t-2 border-black pt-6">
        <div className="flex justify-between text-sm font-bold">
          <span>المجموع الفرعي:</span>
          <span>{formatCurrency(total, settings.currency)}</span>
        </div>
        {Number(settings.taxRate) > 0 && (
          <div className="flex justify-between text-sm font-bold">
            <span>الضريبة ({settings.taxRate}%):</span>
            <span>{formatCurrency(total * (Number(settings.taxRate) / 100), settings.currency)}</span>
          </div>
        )}
        <div className="flex justify-between text-2xl font-black border-t-4 border-double border-black pt-3 mt-3">
          <span>الإجمالي النهائي:</span>
          <span>{formatCurrency(total * (1 + Number(settings.taxRate) / 100), settings.currency)}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-12 pb-6">
        <div className="border-t-2 border-dashed border-black mb-6 pt-6"></div>
        <p className="text-xs font-black leading-relaxed whitespace-pre-wrap">
          {settings.receiptFooter}
        </p>
      </div>
    </div>
  );
}
