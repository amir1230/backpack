// Internationalization formatters using Intl API
import { useTranslation } from 'react-i18next';

// Date formatting
export function useIntlDateFormatter() {
  const { i18n } = useTranslation();
  
  const formatDate = (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => {
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options
    };
    
    return new Intl.DateTimeFormat(i18n.language, defaultOptions).format(dateObj);
  };
  
  const formatShortDate = (date: Date | string | number) => {
    return formatDate(date, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const formatRelativeTime = (date: Date | string | number) => {
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
    
    const rtf = new Intl.RelativeTimeFormat(i18n.language, { numeric: 'auto' });
    
    if (diffInSeconds < 60) {
      return rtf.format(-diffInSeconds, 'second');
    } else if (diffInSeconds < 3600) {
      return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
    } else if (diffInSeconds < 86400) {
      return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
    } else if (diffInSeconds < 2592000) {
      return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
    } else if (diffInSeconds < 31536000) {
      return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
    } else {
      return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
    }
  };
  
  return {
    formatDate,
    formatShortDate,
    formatRelativeTime
  };
}

// Number formatting
export function useIntlNumberFormatter() {
  const { i18n } = useTranslation();
  
  const formatNumber = (value: number, options?: Intl.NumberFormatOptions) => {
    return new Intl.NumberFormat(i18n.language, options).format(value);
  };
  
  const formatCurrency = (value: number, currency: string = 'USD') => {
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value);
  };
  
  const formatPercent = (value: number) => {
    return new Intl.NumberFormat(i18n.language, {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 1
    }).format(value / 100);
  };
  
  const formatDecimal = (value: number, minimumFractionDigits: number = 1, maximumFractionDigits: number = 2) => {
    return new Intl.NumberFormat(i18n.language, {
      minimumFractionDigits,
      maximumFractionDigits
    }).format(value);
  };
  
  const formatCompact = (value: number) => {
    return new Intl.NumberFormat(i18n.language, {
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);
  };
  
  return {
    formatNumber,
    formatCurrency,
    formatPercent,
    formatDecimal,
    formatCompact
  };
}

// List formatting (for arrays of strings)
export function useIntlListFormatter() {
  const { i18n } = useTranslation();
  
  const formatList = (items: string[], type: 'conjunction' | 'disjunction' = 'conjunction') => {
    if (!items || items.length === 0) return '';
    if (items.length === 1) return items[0];
    
    const listFormatter = new Intl.ListFormat(i18n.language, { 
      style: 'long', 
      type: type 
    });
    return listFormatter.format(items);
  };
  
  const formatShortList = (items: string[], type: 'conjunction' | 'disjunction' = 'conjunction') => {
    if (!items || items.length === 0) return '';
    if (items.length === 1) return items[0];
    
    const listFormatter = new Intl.ListFormat(i18n.language, { 
      style: 'short', 
      type: type 
    });
    return listFormatter.format(items);
  };
  
  return {
    formatList,
    formatShortList
  };
}

// Combined hook for all formatters
export function useIntlFormatters() {
  const dateFormatter = useIntlDateFormatter();
  const numberFormatter = useIntlNumberFormatter();
  const listFormatter = useIntlListFormatter();
  
  return {
    ...dateFormatter,
    ...numberFormatter,
    ...listFormatter
  };
}