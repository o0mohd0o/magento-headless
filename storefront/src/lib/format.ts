import type { Money } from "./types";

// Locale comes from the store (set via NEXT_PUBLIC_LOCALE, derived from
// Magento storeConfig.locale e.g. "en_US" -> "en-US"); currency is per-Money.
const LOCALE = process.env.NEXT_PUBLIC_LOCALE || "en-US";

export function formatMoney(money?: Money | null): string {
  if (!money) return "";
  try {
    return new Intl.NumberFormat(LOCALE, {
      style: "currency",
      currency: money.currency || "USD",
    }).format(money.value);
  } catch {
    return `${money.currency ?? ""} ${money.value.toFixed(2)}`.trim();
  }
}

export function isDiscounted(
  regular?: Money | null,
  final?: Money | null,
): boolean {
  if (!regular || !final) return false;
  return final.value < regular.value;
}
