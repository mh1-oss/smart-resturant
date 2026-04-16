"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function addExpense(description: string, amount: number) {
  try {
    const session = await auth()
    if (!session || !session.user) return { success: false, error: "غير مصرح لك" }

    await (prisma as any).expense.create({
      data: {
        description,
        amount,
        user_id: session.user.id!
      }
    })

    revalidatePath("/admin/dashboard")
    return { success: true }
  } catch (error) {
    return { success: false, error: "فشل في إضافة السعر" }
  }
}

export async function getExpenses() {
  try {
    const expenses = await (prisma as any).expense.findMany({
      orderBy: { date: 'desc' },
      take: 20,
      include: {
        user: { select: { name: true } }
      }
    })
    return { 
        success: true, 
        expenses: (expenses as any[]).map((e: any) => ({
            ...e,
            amount: Number(e.amount)
        }))
    }
  } catch (error) {
    return { success: false, error: "فشل في جلب المصاريف" }
  }
}

export async function deleteExpense(id: number) {
  try {
    await (prisma as any).expense.delete({ where: { id } })
    revalidatePath("/admin/dashboard")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: "فشل في حذف المصروف" }
  }
}
