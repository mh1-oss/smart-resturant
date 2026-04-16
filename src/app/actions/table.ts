"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createTable(tableNumber: number) {
  try {
    const qrUrl = `/menu/${tableNumber}` // Simple internal URL for QR
    
    await prisma.table.create({
      data: {
        table_number: tableNumber,
        qr_code_url: qrUrl,
        status: "Available"
      }
    })

    revalidatePath("/admin/tables")
    return { success: true }
  } catch (error) {
    return { success: false, error: "فشل في إنشاء الطاولة" }
  }
}

export async function deleteTable(id: number) {
  try {
    await prisma.table.delete({ where: { id } })
    revalidatePath("/admin/tables")
    return { success: true }
  } catch (error: any) {
    if (error.code === 'P2003') {
        return { success: false, error: "لا يمكن حذف الطاولة لوجود جلسات محاسبة مسجلة عليها" };
    }
    return { success: false, error: "فشل في حذف الطاولة" }
  }
}
