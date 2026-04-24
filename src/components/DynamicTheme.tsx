import { getSettings } from "@/app/actions/settings";

export default async function DynamicTheme() {
  // Fetch settings from database, with safe defaults for build time
  let settings: Record<string, string> = {};
  try {
    settings = await getSettings();
  } catch {
    // Database not reachable at build time — CSS variables will use defaults below
  }

  // Extract theme values with fallbacks to default premium theme
  const primary = settings.themePrimary || "#0f172a";
  const accent = settings.themeAccent || "#f59e0b";
  const bgColor = settings.themeBgColor || "#f8fafc";
  const bgImage = settings.themeBgImage && settings.themeBgImage.trim() !== "" 
    ? `url(${settings.themeBgImage})` 
    : "none";

  return (
    <style dangerouslySetInnerHTML={{
      __html: `
        :root {
          --brand-primary: ${primary};
          --brand-accent: ${accent};
          --theme-bg: ${bgColor};
          --theme-bg-image: ${bgImage};
        }
        
        /* Dynamic adjustments for glassmorphism and filters based on primary theme */
        .glass-morphism {
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.04);
        }
        
        .pro-button {
          box-shadow: 0 10px 20px -5px ${primary}33; /* 20% opacity primary shadow */
        }
        
        .pro-button:hover {
          box-shadow: 0 20px 25px -5px ${primary}4d; /* 30% opacity primary shadow */
        }
      `
    }} />
  );
}
