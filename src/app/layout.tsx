import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import ClientProviders from "@/components/providers/ClientProviders";
import DynamicTheme from "@/components/DynamicTheme";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

import { getSettings } from "@/app/actions/settings";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: `${settings.restaurantName} | نظام إدارة المطعم`,
    description: `نظام إدارة متكامل لـ ${settings.restaurantName} مع طلبات QR فورية`,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <DynamicTheme />
      </head>
      <body className={`${outfit.variable} ${inter.variable} font-sans antialiased`}>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
