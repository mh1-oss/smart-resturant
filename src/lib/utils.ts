import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string, currencyCode: string = "IQD") {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  
  // Use en-US to ensure numbers remain as 0-9, and correctly format with commas.
  // Then strictly append the currency text the user provided in settings.
  return `${value.toLocaleString("en-US", { maximumFractionDigits: 2 })} ${currencyCode}`;
}
