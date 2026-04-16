import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();

  if (session) {
    const role = (session.user as any).role;
    if (role === "Chef") redirect("/admin/kitchen");
    if (role === "Waiter") redirect("/admin/waiter");
    redirect("/admin/dashboard");
  } else {
    redirect("/login");
  }
}
