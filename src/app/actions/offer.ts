"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createOffer(data: {
  title: string
  description?: string
  image_url?: string
  discount_percentage?: number
  menuItemIds: number[]
}) {
  try {
    await (prisma as any).offer.create({
      data: {
        title: data.title,
        description: data.description,
        image_url: data.image_url,
        discount_percentage: data.discount_percentage,
        menuItems: {
          connect: data.menuItemIds.map(id => ({ id }))
        }
      }
    })
    revalidatePath("/admin/offers")
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Create offer failed:", error)
    return { success: false, error: "فشل في إنشاء العرض" }
  }
}

export async function toggleOfferStatus(id: number, isActive: boolean) {
  try {
    await (prisma as any).offer.update({
      where: { id },
      data: { is_active: isActive }
    })
    revalidatePath("/admin/offers")
    return { success: true }
  } catch (error) {
    return { success: false, error: "فشل في تحديث حالة العرض" }
  }
}

export async function deleteOffer(id: number) {
  try {
    await (prisma as any).offer.delete({
      where: { id }
    })
    revalidatePath("/admin/offers")
    return { success: true }
  } catch (error: any) {
    if (error.code === 'P2003') {
        return { success: false, error: "لا يمكن حذف العرض لأنه مرتبط بوجبات نشطة" };
    }
    return { success: false, error: "فشل في حذف العرض" }
  }
}

export async function getActiveOffers() {
  try {
    const offers = await (prisma as any).offer.findMany({
      where: { is_active: true },
      include: {
        menuItems: true
      }
    })
    return { success: true, offers }
  } catch (error) {
    return { success: false, error: "فشل في جلب العروض" }
  }
}
