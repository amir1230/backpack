import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from './ui/button.js';
import { Globe } from 'lucide-react';
import { useEffect } from 'react';
import { invalidateLocalizedQueries } from '../lib/localizedData.js';

export function LanguageToggle() {
  const { i18n, t } = useTranslation();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Normalize language to handle cases like 'en-US', 'he-IL'
    const normalizedLang = i18n.language.startsWith('he') ? 'he' : 'en';
    
    // Set HTML dir attribute based on language
    document.documentElement.dir = normalizedLang === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = normalizedLang;
    
    // Update page titles to be localized
    if (document.title.includes('GlobeMate')) {
      const baseName = 'GlobeMate';
      document.title = normalizedLang === 'he' ? `${baseName} - מתכנן הטיולים` : `${baseName} - Travel Planner`;
    }
  }, [i18n.language]);

  const toggleLanguage = async () => {
    // Normalize current language - handle cases like 'en-US', 'en-GB', etc.
    const currentLang = i18n.language.startsWith('he') ? 'he' : 'en';
    const newLang = currentLang === 'en' ? 'he' : 'en';
    
    console.log(`Toggling language from ${currentLang} to ${newLang}`);
    
    await i18n.changeLanguage(newLang);
    
    // Explicitly save to localStorage to ensure persistence
    localStorage.setItem('i18nextLng', newLang);
    
    // Update document attributes immediately
    document.documentElement.dir = newLang === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
    
    // Enhanced query invalidation to cover all locale-dependent queries
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
    
    // Also use the existing function for backwards compatibility
    invalidateLocalizedQueries(queryClient);
    
    console.log(`Language switched to ${newLang}, queries invalidated`);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center gap-2 min-w-[70px]"
      data-testid="language-toggle"
    >
      <Globe className="w-4 h-4" />
      <span className="text-sm font-medium">
        {i18n.language.startsWith('he') ? 'EN' : 'עב'}
      </span>
    </Button>
  );
}