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
  show_variants?: boolean;
  show_addons?: boolean;
  show_notes?: boolean;
  variants?: { name: string; price: number; cost_price: number }[];
  addons?: { name: string; price: number; cost_price: number }[];
}) {
  try {
    await prisma.menuItem.create({
      data: {
        category_id: data.category_id,
        name: data.name,
        description: data.description,
        price: data.price,
        cost_price: data.cost_price,
        image_url: data.image_url,
        show_variants: data.show_variants ?? false,
        show_addons: data.show_addons ?? false,
        show_notes: data.show_notes ?? true,
        variants: data.variants ? {
          create: data.variants
        } : undefined,
        addons: data.addons ? {
          create: data.addons
        } : undefined,
      }
    });
    revalidatePath("/admin/menu", "layout");
    revalidatePath("/menu", "layout");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "فشل في إضافة الوجبة" };
  }
}

export async function updateMenuItem(id: number, data: {
  category_id?: number;
  name?: string;
  description?: string;
  price?: number;
  cost_price?: number;
  image_url?: string;
  show_variants?: boolean;
  show_addons?: boolean;
  show_notes?: boolean;
  variants?: { name: string; price: number; cost_price: number }[];
  addons?: { name: string; price: number; cost_price: number }[];
}) {
  try {
    // Delete existing variants and addons first to replace them
    if (data.variants) {
      await prisma.variant.deleteMany({ where: { menu_item_id: id } });
    }
    if (data.addons) {
      await prisma.addOn.deleteMany({ where: { menu_item_id: id } });
    }

    await prisma.menuItem.update({
      where: { id },
      data: {
        category_id: data.category_id,
        name: data.name,
        description: data.description,
        price: data.price,
        cost_price: data.cost_price,
        image_url: data.image_url,
        show_variants: data.show_variants,
        show_addons: data.show_addons,
        show_notes: data.show_notes,
        variants: data.variants ? {
          create: data.variants
        } : undefined,
        addons: data.addons ? {
          create: data.addons
        } : undefined,
      }
    });
    revalidatePath("/admin/menu", "layout");
    revalidatePath("/menu", "layout");
    return { success: true };
  } catch (error) {
    console.error(error);
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
