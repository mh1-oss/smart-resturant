"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSettings() {
  const settings = await prisma.setting.findMany();
  // Transform to a simple object
  const settingsObj = settings.reduce((acc: any, curr: any) => ({ ...acc, [curr.key]: curr.value }), {} as any);
  
  // Default values
  return {
    restaurantName: settingsObj.restaurantName || "مطعم النخبة",
    currency: settingsObj.currency || "IQD",
    taxRate: settingsObj.taxRate || "0",
    address: settingsObj.address || "بغداد، العراق",
    restaurantPhone: settingsObj.restaurantPhone || "07xxxxxxxx",
    receiptFooter: settingsObj.receiptFooter || "شكراً لزيارتكم، نأمل رؤيتكم قريباً!",
    ...settingsObj
  };
}

export async function updateSettings(data: Record<string, string>) {
  try {
    // We update settings sequentially to ensure database consistency
    for (const [key, value] of Object.entries(data)) {
      await prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value }
      });
    }
    
    revalidatePath("/admin/settings");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Settings update error:", error);
    return { success: false, error: "فشل في حفظ الإعدادات" };
  }
}
