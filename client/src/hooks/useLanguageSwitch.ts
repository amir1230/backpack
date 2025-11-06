import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

/**
 * Hook for managing language switching with query invalidation and RTL support
 */
export function useLanguageSwitch() {
  const { i18n } = useTranslation();
  const queryClient = useQueryClient();

  // Set RTL direction on document when language changes
  useEffect(() => {
    // Normalize language to handle cases like 'en-US', 'he-IL'
    const normalizedLang = i18n.language.startsWith('he') ? 'he' : 'en';
    const isRTL = normalizedLang === 'he';
    
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = normalizedLang;
    
    // Update document title if page has specific title
    if (document.title && !document.title.includes('GlobeMate')) {
      // Let individual pages handle title updates
    }
  }, [i18n.language]);

  const switchLanguage = async (newLanguage: 'en' | 'he') => {
    // Normalize current language to compare properly
    const currentLang = i18n.language.startsWith('he') ? 'he' : 'en';
    if (newLanguage === currentLang) return;

    // Change language
    await i18n.changeLanguage(newLanguage);
    
    // Explicitly save to localStorage to ensure persistence
    localStorage.setItem('i18nextLng', newLanguage);

    // Invalidate all queries that depend on locale/language
    queryClient.invalidateQueries({
      predicate: (query) => {
        const key = query.queryKey;
        if (!Array.isArray(key)) return false;
        
        // Invalidate queries with locale-dependent data
        return key.some((segment) => 
          typeof segment === 'string' && (
            segment.includes('locale') ||
            segment.includes('localized') ||
            segment.includes('destinations') ||
            segment.includes('attractions') ||
            segment.includes('restaurants') ||
            segment.includes('accommodations') ||
            segment.includes('places') ||
            segment.includes('community')
          )
        );
      }
    });

    console.log(`Language switched to ${newLanguage}, queries invalidated`);
  };

  // Normalize language for return values
  const normalizedLang = i18n.language.startsWith('he') ? 'he' : 'en';
  
  return {
    currentLanguage: normalizedLang as 'en' | 'he',
    switchLanguage,
    isRTL: normalizedLang === 'he'
  };
}

/**
 * Hook for getting localized formatting utilities
 */
export function useLocalizedFormatting() {
  const { i18n } = useTranslation();
  
  // Normalize language for Intl API - needs locale codes like 'en-US', 'he-IL'
  const getIntlLocale = (lang: string): string => {
    if (lang.startsWith('he')) return 'he-IL';
    if (lang.startsWith('en')) return 'en-US';
    return 'en-US'; // fallback
  };
  
  // Get normalized language code for currency logic
  const normalizedLang = i18n.language.startsWith('he') ? 'he' : 'en';
  const intlLocale = getIntlLocale(i18n.language);
  
  const formatDate = (date: Date | string, options?: Intl.DateTimeFormatOptions) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(intlLocale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options
    }).format(dateObj);
  };

  const formatNumber = (number: number, options?: Intl.NumberFormatOptions) => {
    return new Intl.NumberFormat(intlLocale, options).format(number);
  };

  const formatCurrency = (amount: number, inputCurrency?: string) => {
    // Use centralized currency logic: English = USD, Hebrew = ILS with conversion
    const isHebrew = normalizedLang === 'he';
    const currency = isHebrew ? 'ILS' : 'USD';
    const convertedAmount = isHebrew ? amount * 3.7 : amount;
    
    return new Intl.NumberFormat(intlLocale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(convertedAmount);
  };

  const formatPercent = (value: number) => {
    return new Intl.NumberFormat(intlLocale, {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 1
    }).format(value / 100);
  };

  return {
    formatDate,
    formatNumber,
    formatCurrency,
    formatPercent,
    locale: intlLocale
  };
}