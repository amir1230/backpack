import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Star, Clock, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { apiRequest } from '@/lib/queryClient';
import { debounce } from 'lodash';

interface SearchResult {
  id: number;
  locationId: string;
  baseName: string;
  translatedName?: string;
  country?: string;
  city?: string;
  rating?: number;
  entityType: string;
  matchType: string;
}

interface LocalizedSearchProps {
  onResultSelect?: (result: SearchResult) => void;
  placeholder?: string;
  entityTypes?: string[];
  showEntityType?: boolean;
  className?: string;
}

export default function LocalizedSearch({
  onResultSelect,
  placeholder,
  entityTypes,
  showEntityType = true,
  className = '',
}: LocalizedSearchProps) {
  const { t, i18n } = useTranslation();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search query to avoid too many API calls
  const debouncedSearch = useMemo(
    () => debounce((searchQuery: string) => {
      setDebouncedQuery(searchQuery);
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  // Fetch search results
  const { data: searchData, isLoading } = useQuery({
    queryKey: ['search', 'localized', debouncedQuery, i18n.language, entityTypes],
    queryFn: () => {
      const params = new URLSearchParams({
        q: debouncedQuery,
        locale: i18n.language,
      });
      
      if (entityTypes && entityTypes.length > 0) {
        params.set('types', entityTypes.join(','));
      }
      
      return apiRequest(`/api/search/localized?${params.toString()}`);
    },
    enabled: debouncedQuery.length >= 2,
  });

  const searchResults = searchData?.data || [];

  const handleInputChange = (value: string) => {
    setQuery(value);
    setIsOpen(value.length >= 2);
  };

  const handleResultClick = (result: SearchResult) => {
    setQuery(result.translatedName || result.baseName);
    setIsOpen(false);
    onResultSelect?.(result);
  };

  const handleInputFocus = () => {
    if (query.length >= 2) {
      setIsOpen(true);
    }
  };

  const handleInputBlur = () => {
    // Delay closing to allow clicking on results
    setTimeout(() => setIsOpen(false), 200);
  };

  const getEntityTypeIcon = (entityType: string) => {
    const icons = {
      destinations: '🏛️',
      accommodations: '🏨',
      attractions: '🎢',
      restaurants: '🍽️',
    };
    return icons[entityType as keyof typeof icons] || '📍';
  };

  const getEntityTypeLabel = (entityType: string) => {
    const labels = {
      destinations: t('community.destinations'),
      accommodations: t('community.accommodations'),
      attractions: t('community.attractions'),
      restaurants: t('community.restaurants'),
    };
    return labels[entityType as keyof typeof labels] || entityType;
  };

  return (
    <div className={`relative ${className}`} dir={i18n.language === 'he' ? 'rtl' : 'ltr'}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder || t('common.search')}
          className="pl-10 pr-4"
          autoComplete="off"
        />
        {isLoading && (
          <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 animate-spin" />
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-96 overflow-y-auto shadow-lg">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                <Clock className="w-5 h-5 animate-spin mx-auto mb-2" />
                <span>{t('common.loading')}</span>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Search className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>{t('errors.unable_to_load')}</p>
                <p className="text-sm">{t('messages.try_again')}</p>
              </div>
            ) : (
              <div className="py-2">
                {searchResults.map((result: SearchResult, index: number) => (
                  <Button
                    key={`${result.entityType}-${result.id}-${index}`}
                    variant="ghost"
                    className="w-full justify-start p-4 h-auto hover:bg-gray-50"
                    onClick={() => handleResultClick(result)}
                  >
                    <div className="flex items-start gap-3 w-full text-left">
                      {/* Entity Icon */}
                      <div className="text-lg mt-0.5">
                        {getEntityTypeIcon(result.entityType)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Name */}
                        <div className="font-medium text-gray-900 truncate">
                          {result.translatedName || result.baseName}
                        </div>

                        {/* Location & Rating */}
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">
                            {result.city && result.country ? `${result.city}, ${result.country}` : result.country}
                          </span>
                          
                          {result.rating && (
                            <>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                <span>{result.rating}</span>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Entity Type & Translation Status */}
                        <div className="flex items-center gap-2 mt-2">
                          {showEntityType && (
                            <Badge variant="outline" className="text-xs">
                              {getEntityTypeLabel(result.entityType)}
                            </Badge>
                          )}
                          
                          {result.translatedName && result.translatedName !== result.baseName && (
                            <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                              Translated
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* External Link Icon */}
                      <ExternalLink className="w-4 h-4 text-gray-400 mt-1" />
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}