import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getClosedSessions } from "@/app/actions/order";
import ArchiveClient from "./ArchiveClient";
import { getSettings } from "@/app/actions/settings";

export const dynamic = "force-dynamic";

export default async function ArchivePage() {
  const session = await auth();
  if ((session?.user as any)?.role !== "Admin") {
    redirect("/");
  }

  const closedSessions = await getClosedSessions();
  const settings = await getSettings();
  const currency = settings.currency;

  return <ArchiveClient initialSessions={closedSessions} currency={currency} />;
}
