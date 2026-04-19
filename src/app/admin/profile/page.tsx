import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
    const session = await auth();
    if (!session || !session.user) {
        redirect("/admin/login");
    }

    const userId = (session.user as any).id;
    // Use raw query to bypass the outdated Prisma client types that don't know about 'phone' yet
    const rawUsers = await prisma.$queryRaw`SELECT id, name, username, phone FROM "User" WHERE id = ${userId} LIMIT 1` as any[];
    const user = rawUsers[0];

    if (!user) {
        redirect("/admin/login");
    }

    return <ProfileClient user={user} />;
}
