import { prisma } from "@/lib/prisma";
import TablesManagementClient from "./TablesManagementClient";

export default async function AdminTablesPage() {
  const tables = await prisma.table.findMany({
    orderBy: { table_number: "asc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900">إدارة الطاولات</h1>
        <p className="font-bold text-slate-500">مراقبة الطاولات وتوليد رموز الـ QR للطلب</p>
      </div>

      <TablesManagementClient initialTables={tables} />
    </div>
  );
}
