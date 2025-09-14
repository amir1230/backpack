import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Badge } from "@/components/ui/badge";
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  Thermometer, 
  Calendar,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface WeatherData {
  location: string;
  country: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
}

interface TravelRecommendation {
  bestMonths: string[];
  worstMonths: string[];
  activities: string[];
  packingTips: string[];
  healthWarnings: string[];
  description: string;
}

interface DestinationWeatherProps {
  destination: string;
  country: string;
  compact?: boolean;
}

export default function DestinationWeather({ destination, country, compact = true }: DestinationWeatherProps) {
  const { t, i18n } = useTranslation();
  // Fetch current weather
  const { data: weather, isLoading: weatherLoading } = useQuery({
    queryKey: [`/api/weather/${destination}`, { country }],
    enabled: !!destination,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch travel recommendations
  const { data: recommendations, isLoading: recommendationsLoading } = useQuery({
    queryKey: [`/api/weather/${destination}/recommendations`, { country }],
    enabled: !!destination,
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  const getWeatherIcon = (condition: string) => {
    const cond = condition?.toLowerCase() || '';
    if (cond.includes('rain') || cond.includes('drizzle')) {
      return <CloudRain className="w-4 h-4 text-blue-500" />;
    } else if (cond.includes('cloud')) {
      return <Cloud className="w-4 h-4 text-gray-500" />;
    } else {
      return <Sun className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getSeasonalStatus = (recommendations: TravelRecommendation | undefined) => {
    if (!recommendations) return null;
    
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const isBestTime = recommendations.bestMonths?.some((month: string) => 
      month.toLowerCase().includes(currentMonth.toLowerCase())
    );
    const isWorstTime = recommendations.worstMonths?.some((month: string) => 
      month.toLowerCase().includes(currentMonth.toLowerCase())
    );

    if (isBestTime) {
      return { status: 'excellent', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' };
    } else if (isWorstTime) {
      return { status: 'challenging', icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50' };
    } else {
      return { status: 'good', icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' };
    }
  };

  if (weatherLoading && recommendationsLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-16 bg-gray-100 rounded"></div>
      </div>
    );
  }

  if (!weather && !recommendations) {
    return null;
  }

  const seasonalInfo = getSeasonalStatus(recommendations as TravelRecommendation);
  const weatherData = weather as WeatherData;
  const recommendationData = recommendations as TravelRecommendation;

  if (compact) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-sky-50 rounded-lg p-3 space-y-2">
        {/* Current Weather */}
        {weatherData && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getWeatherIcon(weatherData.condition)}
              <div>
                <div className="flex items-center gap-1">
                  <Thermometer className="w-3 h-3 text-gray-500" />
                  <span className="text-sm font-medium">{Math.round(weatherData.temperature)}°C</span>
                </div>
                <div className={`text-xs text-gray-600 capitalize ${i18n.language === 'he' ? 'text-right' : ''}`}>
                  {i18n.language === 'he' ? t(`weather.conditions.${weatherData.condition}`, weatherData.condition) : weatherData.condition}
                </div>
              </div>
            </div>
            
            {/* Quick Travel Status */}
            {seasonalInfo && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${seasonalInfo.bg}`}>
                <seasonalInfo.icon className={`w-3 h-3 ${seasonalInfo.color}`} />
                <span className={`text-xs font-medium ${seasonalInfo.color} capitalize`}>
                  {seasonalInfo.status}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Travel Timing Info */}
        {recommendationData && (
          <div className="space-y-1">
            <div className="text-xs text-gray-600">
              <span className="font-medium">Best months:</span> {recommendationData.bestMonths?.join(', ') || 'Year-round'}
            </div>
            {recommendationData.activities && recommendationData.activities.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {recommendationData.activities.slice(0, 2).map((activity: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs py-0 px-1">
                    {activity}
                  </Badge>
                ))}
                {recommendationData.activities.length > 2 && (
                  <Badge variant="outline" className="text-xs py-0 px-1">
                    +{recommendationData.activities.length - 2} more
                  </Badge>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Full weather display (non-compact)
  return (
    <div className="bg-gradient-to-br from-blue-50 to-sky-100 rounded-lg p-4 space-y-4">
      {weather && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getWeatherIcon(weather.condition)}
            <div>
              <div className="text-lg font-semibold">{Math.round(weather.temperature)}°C</div>
              <div className={`text-sm text-gray-600 capitalize ${i18n.language === 'he' ? 'text-right' : ''}`}>
                {i18n.language === 'he' ? t(`weather.conditions.${weather.condition}`, weather.condition) : weather.condition}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className={`text-sm text-gray-600 ${i18n.language === 'he' ? 'text-right' : ''}`}>{t('weather.humidity')}</div>
            <div className="font-medium">{weather.humidity}%</div>
          </div>
        </div>
      )}

      {recommendations && (
        <div className="space-y-3">
          {seasonalInfo && (
            <div className={`flex items-center gap-2 p-2 rounded ${seasonalInfo.bg}`}>
              <seasonalInfo.icon className={`w-4 h-4 ${seasonalInfo.color}`} />
              <span className={`text-sm font-medium ${seasonalInfo.color}`}>
                {seasonalInfo.status === 'excellent' && 'Perfect time to visit!'}
                {seasonalInfo.status === 'good' && 'Good time to travel'}
                {seasonalInfo.status === 'challenging' && 'Consider weather conditions'}
              </span>
            </div>
          )}
          
          <div>
            <div className={`text-sm font-medium text-gray-700 mb-1 ${i18n.language === 'he' ? 'text-right' : ''}`}>חודשים מומלצים לטיול</div>
            <div className="text-sm text-gray-600">{recommendations.bestMonths?.join(', ') || 'Year-round'}</div>
          </div>
          
          {recommendations.activities && recommendations.activities.length > 0 && (
            <div>
              <div className={`text-sm font-medium text-gray-700 mb-2 ${i18n.language === 'he' ? 'text-right' : ''}`}>פעילויות מומלצות</div>
              <div className="flex flex-wrap gap-1">
                {recommendations.activities.map((activity, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {activity}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}