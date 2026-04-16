import { getSettings } from "@/app/actions/settings";
import SettingsForm from "./SettingsForm";

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-slate-900">إعدادات النظام</h1>
        <p className="font-bold text-slate-500">تخصيص هوية المطعم ومعايير الخدمة</p>
      </div>

      <div className="surface-card p-10 border-slate-100">
        <SettingsForm initialSettings={settings} />
      </div>
    </div>
  );
}
