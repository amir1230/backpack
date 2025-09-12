import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { WeatherWidget } from "@/components/WeatherWidget";
import { Search, MapPin, Calendar, Thermometer, Info } from 'lucide-react';
import { SOUTH_AMERICAN_COUNTRIES } from "@/lib/constants";

const getSouthAmericanDestinations = (t: any) => [
  { name: 'Lima', country: 'Peru', description: t('weather.destinations.lima_desc') },
  { name: 'Cusco', country: 'Peru', description: t('weather.destinations.cusco_desc') },
  { name: 'Bogota', country: 'Colombia', description: t('weather.destinations.bogota_desc') },
  { name: 'Cartagena', country: 'Colombia', description: t('weather.destinations.cartagena_desc') },
  { name: 'Buenos Aires', country: 'Argentina', description: t('weather.destinations.buenos_aires_desc') },
  { name: 'Mendoza', country: 'Argentina', description: t('weather.destinations.mendoza_desc') },
  { name: 'Rio de Janeiro', country: 'Brazil', description: t('weather.destinations.rio_desc') },
  { name: 'Sao Paulo', country: 'Brazil', description: t('weather.destinations.sao_paulo_desc') },
  { name: 'Santiago', country: 'Chile', description: t('weather.destinations.santiago_desc') },
  { name: 'Valparaiso', country: 'Chile', description: t('weather.destinations.valparaiso_desc') },
  { name: 'La Paz', country: 'Bolivia', description: t('weather.destinations.la_paz_desc') },
  { name: 'Uyuni', country: 'Bolivia', description: t('weather.destinations.uyuni_desc') },
  { name: 'Quito', country: 'Ecuador', description: t('weather.destinations.quito_desc') },
  { name: 'Montevideo', country: 'Uruguay', description: t('weather.destinations.montevideo_desc') },
  { name: 'Asuncion', country: 'Paraguay', description: t('weather.destinations.asuncion_desc') }
];

const getTravelSeasons = (t: any) => [
  {
    season: t('weather.seasons.dry_season'),
    description: t('weather.seasons.dry_season_desc'),
    destinations: ['Cusco', 'Quito', 'La Paz', 'Uyuni'],
    color: 'bg-yellow-100 text-yellow-800'
  },
  {
    season: t('weather.seasons.summer_season'),
    description: t('weather.seasons.summer_season_desc'),
    destinations: ['Rio de Janeiro', 'Buenos Aires', 'Santiago', 'Montevideo'],
    color: 'bg-orange-100 text-orange-800'
  },
  {
    season: t('weather.seasons.year_round'),
    description: t('weather.seasons.year_round_desc'),
    destinations: ['Lima', 'Bogota', 'Cartagena', 'Quito'],
    color: 'bg-green-100 text-green-800'
  }
];

export default function WeatherPage() {
  const { t } = useTranslation();
  const [selectedDestination, setSelectedDestination] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [customDestination, setCustomDestination] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  
  const SOUTH_AMERICAN_DESTINATIONS = getSouthAmericanDestinations(t);
  const TRAVEL_SEASONS = getTravelSeasons(t);

  const handleDestinationSelect = (destination: string) => {
    const dest = SOUTH_AMERICAN_DESTINATIONS.find(d => d.name === destination);
    if (dest) {
      setSelectedDestination(destination);
      setSelectedCountry(dest.country);
      setShowCustom(false);
    }
  };

  const handleCustomSearch = () => {
    if (customDestination.trim()) {
      setSelectedDestination(customDestination.trim());
      setSelectedCountry('Peru'); // Default country
      setShowCustom(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">{t('weather.page_title')}</h1>
          <p className="text-xl text-gray-600">
            {t('weather.page_subtitle')}
          </p>
        </div>

        {/* Destination Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              {t('weather.choose_destination')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Quick Select Popular Destinations */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-700">{t('weather.popular_destinations')}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {SOUTH_AMERICAN_DESTINATIONS.slice(0, 10).map((dest) => (
                  <Button
                    key={dest.name}
                    variant={selectedDestination === dest.name ? "default" : "outline"}
                    className="h-auto p-3 flex flex-col items-center gap-1"
                    onClick={() => handleDestinationSelect(dest.name)}
                  >
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm font-medium">{dest.name}</span>
                    <span className="text-xs text-gray-500">{dest.country}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Search */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-700">{t('weather.search_custom_destination')}</h3>
              <div className="flex gap-2">
                <Input
                  placeholder={t('weather.search_placeholder')}
                  value={customDestination}
                  onChange={(e) => setCustomDestination(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCustomSearch()}
                />
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder={t('weather.select_country')} />
                  </SelectTrigger>
                  <SelectContent>
                    {SOUTH_AMERICAN_COUNTRIES.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleCustomSearch}>
                  <Search className="w-4 h-4 mr-2" />
                  {t('common.search')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weather Widget */}
        {selectedDestination && (
          <WeatherWidget
            destination={selectedDestination}
            country={selectedCountry}
            showRecommendations={true}
          />
        )}

        {/* Travel Seasons Guide */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {t('weather.travel_seasons_title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TRAVEL_SEASONS.map((season, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge className={season.color}>{season.season}</Badge>
                  </div>
                  <p className="text-sm text-gray-600">{season.description}</p>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">{t('weather.best_destinations')}:</h4>
                    <div className="flex flex-wrap gap-1">
                      {season.destinations.map((dest, i) => (
                        <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {dest}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Climate Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Thermometer className="w-5 h-5" />
              {t('weather.climate_zones_title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800">{t('weather.climate_zones.coastal_desert')}</h4>
                <p className="text-sm text-blue-700">Lima, Ica</p>
                <p className="text-xs text-blue-600">{t('weather.climate_zones.coastal_desert_desc')}</p>
              </div>
              <div className="space-y-2 p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800">{t('weather.climate_zones.tropical')}</h4>
                <p className="text-sm text-green-700">Amazon, Cartagena</p>
                <p className="text-xs text-green-600">{t('weather.climate_zones.tropical_desc')}</p>
              </div>
              <div className="space-y-2 p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-800">{t('weather.climate_zones.highland')}</h4>
                <p className="text-sm text-purple-700">Cusco, Quito, La Paz</p>
                <p className="text-xs text-purple-600">{t('weather.climate_zones.highland_desc')}</p>
              </div>
              <div className="space-y-2 p-4 bg-orange-50 rounded-lg">
                <h4 className="font-semibold text-orange-800">{t('weather.climate_zones.temperate')}</h4>
                <p className="text-sm text-orange-700">Buenos Aires, Santiago</p>
                <p className="text-xs text-orange-600">{t('weather.climate_zones.temperate_desc')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Travel Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              {t('weather.travel_tips_title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold">{t('weather.tips.altitude_considerations')}</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• {t('weather.tips.cusco_altitude')}</li>
                  <li>• {t('weather.tips.la_paz_altitude')}</li>
                  <li>• {t('weather.tips.quito_altitude')}</li>
                  <li>• {t('weather.tips.uyuni_altitude')}</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold">{t('weather.tips.seasonal_variations')}</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• {t('weather.tips.southern_hemisphere')}</li>
                  <li>• {t('weather.tips.equatorial_regions')}</li>
                  <li>• {t('weather.tips.patagonia')}</li>
                  <li>• {t('weather.tips.amazon')}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}