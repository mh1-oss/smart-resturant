"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Category Actions
export async function createCategory(name: string) {
  try {
    const category = await prisma.category.create({
      data: { name }
    });
    revalidatePath("/admin/menu");
    return { success: true, category };
  } catch (error) {
    return { success: false, error: "فشل في إنشاء التصنيف" };
  }
}

export async function updateCategory(id: number, name: string) {
  try {
    await prisma.category.update({
      where: { id },
      data: { name }
    });
    revalidatePath("/admin/menu");
    return { success: true };
  } catch (error) {
    return { success: false, error: "فشل في تحديث التصنيف" };
  }
}

export async function deleteCategory(id: number) {
  try {
    await prisma.category.delete({
      where: { id }
    });
    revalidatePath("/admin/menu");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "فشل في حذف التصنيف" };
  }
}

// MenuItem Actions
export async function createMenuItem(data: {
  category_id: number;
  name: string;
  description: string;
  price: number;
  cost_price: number;
  image_url: string;
}) {
  try {
    await (prisma as any).menuItem.create({
      data: {
        category_id: data.category_id,
        name: data.name,
        description: data.description,
        price: data.price,
        cost_price: data.cost_price,
        image_url: data.image_url,
      }
    });
    revalidatePath("/admin/menu");
    revalidatePath("/menu");
    return { success: true };
  } catch (error) {
    return { success: false, error: "فشل في إضافة الوجبة" };
  }
}

export async function updateMenuItem(id: number, data: any) {
  try {
    await (prisma as any).menuItem.update({
      where: { id },
      data
    });
    revalidatePath("/admin/menu");
    return { success: true };
  } catch (error) {
    return { success: false, error: "فشل في تحديث الوجبة" };
  }
}

export async function deleteMenuItem(id: number) {
  try {
    await prisma.menuItem.delete({
      where: { id }
    });
    revalidatePath("/admin/menu");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "فشل في حذف الوجبة" };
  }
}
