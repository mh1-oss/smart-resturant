import { getSettings } from "@/app/actions/settings";
import LoginClient from "./LoginClient";

export default async function LoginPage() {
  const settings = await getSettings();
  
  return <LoginClient restaurantName={settings.restaurantName} />;
}
