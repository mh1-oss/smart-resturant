"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

export async function createStaff(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;
  const role = formData.get("role") as Role;

  if (!username || !password || !role) {
    return { success: false, error: "جميع الحقول مطلوبة" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        name,
        role,
      },
    });

    revalidatePath("/admin/staff");
    return { success: true };
  } catch (error: any) {
    if (error.code === "P2002") {
      return { success: false, error: "اسم المستخدم موجود مسبقاً" };
    }
    return { success: false, error: "فشل في إنشاء الحساب" };
  }
}

export async function deleteStaff(userId: string) {
  try {
    await prisma.user.delete({
      where: { id: userId },
    });
    revalidatePath("/admin/staff");
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2003') {
        return { success: false, error: "لا يمكن حذف الموظف لوجود مصاريف أو طلبيات مسجلة باسمه" };
    }
    return { success: false, error: "فشل في حذف الحساب" };
  }
}

export async function updateStaffRole(userId: string, role: Role) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role },
    });
    revalidatePath("/admin/staff");
    return { success: true };
  } catch (error) {
    return { success: false, error: "فشل في تحديث الرتبة" };
  }
}
