/**
 * Core Roblox economy and calculator utilities
 */

export const ROBLOX_TAX_RATE = 0.3; // 30% Roblox cut
export const SELLER_RATE = 0.7; // 70% to seller
export const DEVEX_RATE_PER_ROBUX = 0.0035; // Standard DevEx rate: $0.0035 per Robux ($105 for 30,000 / $175 for 50,000)
export const DEVEX_MIN_ROBUX = 50000;
export const DEFAULT_USD_TO_IDR = 15850;

/**
 * Calculates net received amount after 30% Roblox tax
 */
export function calculateRobloxTax(sellerAmount: number): { netReceived: number; taxDeducted: number } {
  if (sellerAmount <= 0 || isNaN(sellerAmount)) {
    return { netReceived: 0, taxDeducted: 0 };
  }
  const cleanAmount = Math.floor(sellerAmount);
  // Roblox rounds down seller payout
  const netReceived = Math.floor(cleanAmount * SELLER_RATE);
  const taxDeducted = cleanAmount - netReceived;
  return { netReceived, taxDeducted };
}

/**
 * Calculates the listing price needed to receive a target net amount
 */
export function calculateTargetPrice(desiredAmount: number): number {
  if (desiredAmount <= 0 || isNaN(desiredAmount)) {
    return 0;
  }
  const cleanDesired = Math.floor(desiredAmount);
  // Seller receives Math.floor(price * 0.7) >= cleanDesired
  return Math.ceil(cleanDesired / SELLER_RATE);
}

/**
 * Calculates DevEx cashout value in USD and IDR
 */
export function calculateDevEx(
  robuxAmount: number,
  usdToIdrRate = DEFAULT_USD_TO_IDR
): {
  eligible: boolean;
  usdAmount: number;
  idrAmount: number;
  minRequired: number;
} {
  const cleanAmount = Math.max(0, Math.floor(robuxAmount || 0));
  const eligible = cleanAmount >= DEVEX_MIN_ROBUX;
  const usdAmount = Number((cleanAmount * DEVEX_RATE_PER_ROBUX).toFixed(2));
  const idrAmount = Math.round(usdAmount * usdToIdrRate);

  return {
    eligible,
    usdAmount,
    idrAmount,
    minRequired: DEVEX_MIN_ROBUX,
  };
}

/**
 * Formats IDR currency nicely (e.g., Rp 1.585.000)
 */
export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats numbers with comma or thousand separators
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('id-ID').format(Math.floor(num));
}
