/**
 * Centralized currency conversion utilities
 * Provides consistent currency conversion across the application
 */

// Currency conversion rates
export const CURRENCY_RATES = {
  USD_TO_ILS: 3.7, // Average conversion rate USD to Israeli Shekel
  ILS_TO_USD: 1 / 3.7,
} as const;

// Currency symbols
export const CURRENCY_SYMBOLS = {
  USD: '$',
  ILS: '₪',
} as const;

export type SupportedCurrency = 'USD' | 'ILS';

/**
 * Format currency based on language/locale
 * @param amount - Amount in USD
 * @param language - Current language ('en' or 'he')
 * @param options - Additional formatting options
 */
export function formatCurrency(
  amount: number,
  language: 'en' | 'he',
  options?: {
    showSymbol?: boolean;
    decimals?: number;
  }
): string {
  const { showSymbol = true, decimals = 0 } = options || {};
  
  const isHebrew = language === 'he';
  const currency = isHebrew ? 'ILS' : 'USD';
  const convertedAmount = isHebrew ? amount * CURRENCY_RATES.USD_TO_ILS : amount;
  const roundedAmount = decimals > 0 
    ? convertedAmount.toFixed(decimals)
    : Math.round(convertedAmount);
  
  const formattedNumber = typeof roundedAmount === 'number'
    ? roundedAmount.toLocaleString(isHebrew ? 'he-IL' : 'en-US')
    : parseFloat(roundedAmount as string).toLocaleString(isHebrew ? 'he-IL' : 'en-US');
  
  if (!showSymbol) {
    return formattedNumber;
  }
  
  const symbol = CURRENCY_SYMBOLS[currency];
  return `${symbol}${formattedNumber}`;
}

/**
 * Format currency range based on language/locale
 * @param min - Minimum amount in USD
 * @param max - Maximum amount in USD
 * @param language - Current language ('en' or 'he')
 */
export function formatCurrencyRange(
  min: number | string | undefined,
  max: number | string | undefined,
  language: 'en' | 'he'
): string {
  if (!min || !max) return 'N/A';
  
  const minVal = typeof min === 'string' ? parseFloat(min) : min;
  const maxVal = typeof max === 'string' ? parseFloat(max) : max;
  
  if (isNaN(minVal) || isNaN(maxVal)) return 'N/A';
  
  const minFormatted = formatCurrency(minVal, language);
  const maxFormatted = formatCurrency(maxVal, language);
  
  // In Hebrew, show max - min (reverse order)
  return language === 'he'
    ? `${maxFormatted} - ${minFormatted}`
    : `${minFormatted} - ${maxFormatted}`;
}

/**
 * Convert USD to ILS
 * @param amountUSD - Amount in USD
 */
export function convertUSDtoILS(amountUSD: number): number {
  return Math.round(amountUSD * CURRENCY_RATES.USD_TO_ILS);
}

/**
 * Convert ILS to USD
 * @param amountILS - Amount in ILS
 */
export function convertILStoUSD(amountILS: number): number {
  return Math.round(amountILS * CURRENCY_RATES.ILS_TO_USD);
}

/**
 * Get currency symbol for language
 * @param language - Current language ('en' or 'he')
 */
export function getCurrencySymbol(language: 'en' | 'he'): string {
  return language === 'he' ? CURRENCY_SYMBOLS.ILS : CURRENCY_SYMBOLS.USD;
}

/**
 * Get currency code for language
 * @param language - Current language ('en' or 'he')
 */
export function getCurrencyCode(language: 'en' | 'he'): SupportedCurrency {
  return language === 'he' ? 'ILS' : 'USD';
}

