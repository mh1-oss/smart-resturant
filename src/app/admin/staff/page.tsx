import { prisma } from "@/lib/prisma";
import StaffClient from "./StaffClient";
import { UserPlus } from "lucide-react";

export default async function StaffManagementPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      username: true,
      name: true,
      role: true,
      createdAt: true,
    }
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">إدارة الموظفين</h1>
          <p className="font-bold text-slate-500">إضافة وتعديل صلاحيات فريق العمل</p>
        </div>
      </div>

      <StaffClient initialUsers={users} />
    </div>
  );
}
