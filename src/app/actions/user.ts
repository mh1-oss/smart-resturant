"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function updateUserProfile(formData: { name?: string, phone?: string }) {
    const session = await auth();
    if (!session || !session.user) {
        return { success: false, error: "يجب تسجيل الدخول أولاً" };
    }

    const userId = (session.user as any).id;

    try {
        // Use raw SQL to bypass Prisma model validation for the 'phone' field
        await prisma.$executeRaw`
            UPDATE "User" 
            SET name = ${formData.name || null}, 
                phone = ${formData.phone || null} 
            WHERE id = ${userId}
        `;

        revalidatePath("/admin/profile");
        return { success: true };
    } catch (error) {
        console.error("Profile update error:", error);
        return { success: false, error: "فشل في تحديث البيانات" };
    }
}

export async function changePassword(formData: { currentPassword: string, newPassword: string }) {
    const session = await auth();
    if (!session || !session.user) {
        return { success: false, error: "يجب تسجيل الدخول أولاً" };
    }

    const userId = (session.user as any).id;

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user || !user.password) {
            return { success: false, error: "حساب غير صالح" };
        }

        const isPasswordValid = await bcrypt.compare(formData.currentPassword, user.password);
        if (!isPasswordValid) {
            return { success: false, error: "كلمة السر الحالية غير صحيحة" };
        }

        const hashedNewPassword = await bcrypt.hash(formData.newPassword, 10);

        await prisma.user.update({
            where: { id: userId },
            data: {
                password: hashedNewPassword
            }
        });

        return { success: true };
    } catch (error) {
        console.error("Password change error:", error);
        return { success: false, error: "فشل في تغيير كلمة السر" };
    }
}
