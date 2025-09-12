import dayjs from 'dayjs';
import 'dayjs/locale/he.js';
import 'dayjs/locale/en.js';
import localeData from 'dayjs/plugin/localeData.js';
import weekday from 'dayjs/plugin/weekday.js';
import relativeTime from 'dayjs/plugin/relativeTime.js';

// Initialize Day.js plugins
dayjs.extend(localeData);
dayjs.extend(weekday);
dayjs.extend(relativeTime);

export class DateLocalizationService {
  static setLocale(locale: string) {
    if (locale === 'he') {
      dayjs.locale('he');
    } else {
      dayjs.locale('en');
    }
  }

  static formatDate(date: string | Date, format: string = 'YYYY-MM-DD'): string {
    return dayjs(date).format(format);
  }

  static formatDateLocalized(date: string | Date, locale: string = 'en'): string {
    const currentLocale = dayjs.locale();
    this.setLocale(locale);
    const formatted = dayjs(date).format('LL'); // Localized format
    dayjs.locale(currentLocale); // Restore previous locale
    return formatted;
  }

  static formatDateTimeLocalized(date: string | Date, locale: string = 'en'): string {
    const currentLocale = dayjs.locale();
    this.setLocale(locale);
    const formatted = dayjs(date).format('LLL'); // Localized date and time
    dayjs.locale(currentLocale);
    return formatted;
  }

  static getRelativeTime(date: string | Date, locale: string = 'en'): string {
    const currentLocale = dayjs.locale();
    this.setLocale(locale);
    const relative = dayjs(date).fromNow();
    dayjs.locale(currentLocale);
    return relative;
  }

  static getWeekdayNames(locale: string = 'en'): string[] {
    const currentLocale = dayjs.locale();
    this.setLocale(locale);
    const weekdays = dayjs.weekdays();
    dayjs.locale(currentLocale);
    return weekdays;
  }

  static getMonthNames(locale: string = 'en'): string[] {
    const currentLocale = dayjs.locale();
    this.setLocale(locale);
    const months = dayjs.months();
    dayjs.locale(currentLocale);
    return months;
  }

  static formatTimeRange(startTime: string, endTime: string, locale: string = 'en'): string {
    const start = dayjs(startTime);
    const end = dayjs(endTime);
    
    if (locale === 'he') {
      return `${start.format('HH:mm')} - ${end.format('HH:mm')}`;
    } else {
      return `${start.format('h:mm A')} - ${end.format('h:mm A')}`;
    }
  }
}

export class NumberLocalizationService {
  static formatCurrency(amount: number, currency: string = 'USD', locale: string = 'en'): string {
    const localeCode = locale === 'he' ? 'he-IL' : 'en-US';
    
    return new Intl.NumberFormat(localeCode, {
      style: 'currency',
      currency: currency === 'ILS' || locale === 'he' ? 'ILS' : currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  static formatNumber(number: number, locale: string = 'en'): string {
    const localeCode = locale === 'he' ? 'he-IL' : 'en-US';
    return new Intl.NumberFormat(localeCode).format(number);
  }

  static formatRating(rating: number, locale: string = 'en'): string {
    const localeCode = locale === 'he' ? 'he-IL' : 'en-US';
    return new Intl.NumberFormat(localeCode, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(rating);
  }

  static formatPercentage(value: number, locale: string = 'en'): string {
    const localeCode = locale === 'he' ? 'he-IL' : 'en-US';
    return new Intl.NumberFormat(localeCode, {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(value / 100);
  }
}

// React hooks for easy access
import { useTranslation } from 'react-i18next';

export function useDateLocalization() {
  const { i18n } = useTranslation();
  
  return {
    formatDate: (date: string | Date, format?: string) => 
      DateLocalizationService.formatDate(date, format),
    formatDateLocalized: (date: string | Date) => 
      DateLocalizationService.formatDateLocalized(date, i18n.language),
    formatDateTimeLocalized: (date: string | Date) => 
      DateLocalizationService.formatDateTimeLocalized(date, i18n.language),
    getRelativeTime: (date: string | Date) => 
      DateLocalizationService.getRelativeTime(date, i18n.language),
    formatTimeRange: (start: string, end: string) =>
      DateLocalizationService.formatTimeRange(start, end, i18n.language),
  };
}

export function useNumberLocalization() {
  const { i18n } = useTranslation();
  
  return {
    formatCurrency: (amount: number, currency?: string) => 
      NumberLocalizationService.formatCurrency(amount, currency, i18n.language),
    formatNumber: (number: number) => 
      NumberLocalizationService.formatNumber(number, i18n.language),
    formatRating: (rating: number) => 
      NumberLocalizationService.formatRating(rating, i18n.language),
    formatPercentage: (value: number) => 
      NumberLocalizationService.formatPercentage(value, i18n.language),
  };
}