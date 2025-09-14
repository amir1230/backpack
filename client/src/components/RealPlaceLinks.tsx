import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, ExternalLink, Building2, Camera } from "lucide-react";
import { useTranslation } from "react-i18next";

interface RealPlace {
  title: string;
  link?: string;
  source?: "Google" | "GetYourGuide" | "TripAdvisor";
  placeId?: string;
  rating?: number;
  address?: string;
  photoUrl?: string;
}

interface TripSuggestion {
  destination: string;
  country: string;
  description: string;
  bestTimeToVisit: string;
  estimatedBudget: {
    low: number;
    high: number;
  };
  highlights: string[];
  travelStyle: string[];
  duration: string;
  realPlaces?: RealPlace[];
}

interface RealPlaceLinksProps {
  suggestion: TripSuggestion;
}

export function RealPlaceLinks({ suggestion }: RealPlaceLinksProps) {
  const { t } = useTranslation();
  // If no real places, don't render anything
  if (!suggestion.realPlaces || suggestion.realPlaces.length === 0) {
    return null;
  }

  // Group real places by highlights they match
  const groupedPlaces = suggestion.highlights.reduce((acc, highlight) => {
    const matchingPlaces = suggestion.realPlaces?.filter(place => 
      place.title.toLowerCase().includes(highlight.toLowerCase()) ||
      highlight.toLowerCase().includes(place.title.toLowerCase()) ||
      // Check if place title contains key words from highlight
      highlight.split(' ').some(word => 
        word.length > 3 && place.title.toLowerCase().includes(word.toLowerCase())
      )
    ) || [];

    if (matchingPlaces.length > 0) {
      acc[highlight] = matchingPlaces;
    }
    return acc;
  }, {} as Record<string, RealPlace[]>);

  // If no matches found, show first few places under general section
  const hasGroupedPlaces = Object.keys(groupedPlaces).length > 0;
  if (!hasGroupedPlaces && suggestion.realPlaces.length > 0) {
    groupedPlaces[t('places.recommended_places')] = suggestion.realPlaces.slice(0, 6);
  }

  const getSourceIcon = (source?: string) => {
    switch (source) {
      case "Google":
        return "🗺️";
      case "GetYourGuide":
        return "🎫";
      case "TripAdvisor":
        return "🧳";
      default:
        return "📍";
    }
  };

  const getSourceColor = (source?: string) => {
    switch (source) {
      case "Google":
        return "bg-blue-100 text-blue-800";
      case "GetYourGuide":
        return "bg-green-100 text-green-800";
      case "TripAdvisor":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Building2 className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold">{t('places.booking_recommendations_for_your_trip')}</h3>
      </div>

      {Object.entries(groupedPlaces).map(([highlight, places]) => (
        <div key={highlight} className="space-y-3">
          <h4 className="font-medium text-gray-900 border-r-4 border-blue-500 pr-3">
            {highlight}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {places.slice(0, 4).map((place, idx) => (
              <Card key={idx} className="hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <h5 className="font-medium text-sm leading-tight">{place.title}</h5>
                        {place.photoUrl && (
                          <img 
                            src={place.photoUrl} 
                            alt={place.title}
                            className="w-12 h-12 rounded object-cover ml-2 flex-shrink-0"
                          />
                        )}
                      </div>
                      
                      {place.rating && (
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-gray-600">{place.rating}</span>
                        </div>
                      )}
                      
                      {place.address && (
                        <div className="flex items-start gap-1 mt-1">
                          <MapPin className="w-3 h-3 text-gray-500 mt-0.5 flex-shrink-0" />
                          <span className="text-xs text-gray-600 leading-tight">{place.address}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${getSourceColor(place.source)}`}
                    >
                      {getSourceIcon(place.source)} {place.source || t('places.unknown_source')}
                    </Badge>
                    
                    {place.link && (
                      <a 
                        href={place.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                      >
                        {t('places.view_on_maps')} <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {places.length > 4 && (
            <p className="text-xs text-gray-500 text-center">
              {t('places.and_more_places', { count: places.length - 4 })}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}