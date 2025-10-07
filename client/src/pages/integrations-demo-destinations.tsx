import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Clock, Database, CheckCircle2, XCircle, Loader2, Cloud } from "lucide-react";

interface DemoDestination {
  id: string;
  name: string;
  country: string;
  lat: number;
  lon: number;
}

const DEMO_DESTINATIONS: DemoDestination[] = [
  { id: "barcelona", name: "Barcelona", country: "Spain", lat: 41.3874, lon: 2.1686 },
  { id: "tokyo", name: "Tokyo", country: "Japan", lat: 35.6762, lon: 139.6503 },
  { id: "newyork", name: "New York", country: "United States", lat: 40.7128, lon: -74.0060 },
  { id: "telaviv", name: "Tel Aviv", country: "Israel", lat: 32.0853, lon: 34.7818 },
];

export default function IntegrationsDemoDestinations() {
  const { t, i18n } = useTranslation();
  const [_, navigate] = useLocation();
  const isRTL = i18n.language === "he";

  const [selectedDestination, setSelectedDestination] = useState<DemoDestination>(DEMO_DESTINATIONS[0]);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [cacheHit, setCacheHit] = useState<boolean>(false);
  const [weatherResponseTime, setWeatherResponseTime] = useState<number | null>(null);
  const [weatherCacheHit, setWeatherCacheHit] = useState<boolean>(false);
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');

  // Fetch feature flags
  const { data: featureFlags } = useQuery<{
    googlePlaces: boolean;
    openWeather: boolean;
    geoNames: boolean;
    tripAdvisor: boolean;
    tbo: boolean;
  }>({
    queryKey: ["/api/destinations/feature-flags"],
  });

  // Fetch attractions mutation
  const attractionsMutation = useMutation({
    mutationFn: async (dest: DemoDestination) => {
      const startTime = Date.now();
      
      const response = await fetch(`/api/places/search?query=${encodeURIComponent(dest.name)}&limit=5`);
      
      const endTime = Date.now();
      setResponseTime(endTime - startTime);
      
      // Check if from cache (simplified - in real app check headers)
      setCacheHit(response.headers.get('x-cache') === 'HIT');
      
      if (!response.ok) {
        throw new Error('Failed to fetch attractions');
      }
      
      return response.json();
    },
  });

  // Fetch weather mutation
  const weatherMutation = useMutation({
    mutationFn: async ({ dest, units: u, lang }: { dest: DemoDestination; units: 'metric' | 'imperial'; lang: string }) => {
      const startTime = Date.now();
      
      const response = await fetch(
        `/api/destinations/weather?lat=${dest.lat}&lon=${dest.lon}&units=${u}&lang=${lang}`
      );
      
      const endTime = Date.now();
      setWeatherResponseTime(endTime - startTime);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch weather');
      }
      
      const data = await response.json();
      
      // Check cache hit from response meta
      setWeatherCacheHit(data.meta?.cacheHit || false);
      
      return data;
    },
  });

  const handleFetchAttractions = () => {
    attractionsMutation.mutate(selectedDestination);
  };

  const handleFetchWeather = () => {
    weatherMutation.mutate({ 
      dest: selectedDestination, 
      units, 
      lang: i18n.language 
    });
  };

  const handleOpenDestinationPage = () => {
    navigate(`/destinations/${selectedDestination.id}`);
  };

  return (
    <div className={`min-h-screen bg-gray-50 py-8 px-4 ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-3">{t("destinations.demo.title")}</h1>
          <p className="text-lg text-gray-600">{t("destinations.demo.subtitle")}</p>
        </div>

        {/* Demo Controls */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t("destinations.demo.query_label")}</CardTitle>
            <CardDescription>Select a destination to test Google Places API integration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              value={selectedDestination.id}
              onValueChange={(id: string) => {
                const dest = DEMO_DESTINATIONS.find((d) => d.id === id);
                if (dest) setSelectedDestination(dest);
              }}
            >
              <SelectTrigger data-testid="select-demo-destination">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEMO_DESTINATIONS.map((dest) => (
                  <SelectItem key={dest.id} value={dest.id}>
                    {dest.name}, {dest.country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-3">
              <Button
                onClick={handleFetchAttractions}
                disabled={attractionsMutation.isPending}
                className="flex-1"
                data-testid="button-fetch-attractions"
              >
                {attractionsMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t("destinations.demo.fetch_attractions")}
              </Button>
              <Button
                onClick={handleOpenDestinationPage}
                variant="outline"
                className="flex-1"
                data-testid="button-open-destination"
              >
                <MapPin className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                {t("destinations.demo.open_page")}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Weather Testing */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5" />
              Weather API Testing
            </CardTitle>
            <CardDescription>Test OpenWeather API with different units and languages</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Units:</span>
              <div className="flex items-center gap-1 text-xs bg-gray-100 rounded-full p-1">
                <button
                  onClick={() => setUnits('metric')}
                  className={`px-3 py-1 rounded-full transition ${
                    units === 'metric' ? 'bg-white shadow-sm' : 'text-gray-500'
                  }`}
                  data-testid="button-metric"
                >
                  °C (Metric)
                </button>
                <button
                  onClick={() => setUnits('imperial')}
                  className={`px-3 py-1 rounded-full transition ${
                    units === 'imperial' ? 'bg-white shadow-sm' : 'text-gray-500'
                  }`}
                  data-testid="button-imperial"
                >
                  °F (Imperial)
                </button>
              </div>
            </div>

            <Button
              onClick={handleFetchWeather}
              disabled={weatherMutation.isPending || !featureFlags?.openWeather}
              className="w-full"
              data-testid="button-fetch-weather"
            >
              {weatherMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Fetch Weather
            </Button>

            {weatherResponseTime !== null && (
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Latency</p>
                  <p className="text-lg font-bold text-blue-700">{weatherResponseTime}ms</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Cache Hit</p>
                  <p className="text-lg font-bold text-purple-700">{weatherCacheHit ? "Yes" : "No"}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Metrics */}
        {responseTime !== null && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">{t("destinations.demo.response_time")}</p>
                  <p className="text-2xl font-bold text-blue-700">{responseTime}ms</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">{t("destinations.demo.cache_hit")}</p>
                  <p className="text-2xl font-bold text-purple-700">{cacheHit ? "Yes" : "No"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Provider Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              {t("destinations.demo.provider")} Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className={`flex items-center justify-between p-3 rounded-lg ${featureFlags?.googlePlaces ? 'bg-green-50' : 'bg-amber-50'}`}>
                <div className="flex items-center gap-3">
                  {featureFlags?.googlePlaces ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-amber-600" />
                  )}
                  <span className="font-medium">Google Places API</span>
                </div>
                <Badge variant="outline" className={featureFlags?.googlePlaces ? "bg-green-100 text-green-700 border-green-200" : "bg-amber-100 text-amber-700 border-amber-200"}>
                  {featureFlags?.googlePlaces ? t("destinations.states.live_badge") : t("destinations.states.soon_badge")}
                </Badge>
              </div>
              
              <div className={`flex items-center justify-between p-3 rounded-lg ${featureFlags?.openWeather ? 'bg-green-50' : 'bg-amber-50'}`}>
                <div className="flex items-center gap-3">
                  {featureFlags?.openWeather ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-amber-600" />
                  )}
                  <span className="font-medium">OpenWeather API</span>
                </div>
                <Badge variant="outline" className={featureFlags?.openWeather ? "bg-green-100 text-green-700 border-green-200" : "bg-amber-100 text-amber-700 border-amber-200"}>
                  {featureFlags?.openWeather ? t("destinations.states.live_badge") : t("destinations.states.soon_badge")}
                </Badge>
              </div>
              
              <div className={`flex items-center justify-between p-3 rounded-lg ${featureFlags?.tripAdvisor ? 'bg-green-50' : 'bg-amber-50'}`}>
                <div className="flex items-center gap-3">
                  {featureFlags?.tripAdvisor ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-amber-600" />
                  )}
                  <span className="font-medium">TripAdvisor API</span>
                </div>
                <Badge variant="outline" className={featureFlags?.tripAdvisor ? "bg-green-100 text-green-700 border-green-200" : "bg-amber-100 text-amber-700 border-amber-200"}>
                  {featureFlags?.tripAdvisor ? t("destinations.states.live_badge") : t("destinations.states.soon_badge")}
                </Badge>
              </div>
              
              <div className={`flex items-center justify-between p-3 rounded-lg ${featureFlags?.tbo ? 'bg-green-50' : 'bg-amber-50'}`}>
                <div className="flex items-center gap-3">
                  {featureFlags?.tbo ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-amber-600" />
                  )}
                  <span className="font-medium">TBO Booking API</span>
                </div>
                <Badge variant="outline" className={featureFlags?.tbo ? "bg-green-100 text-green-700 border-green-200" : "bg-amber-100 text-amber-700 border-amber-200"}>
                  {featureFlags?.tbo ? t("destinations.states.live_badge") : t("destinations.states.soon_badge")}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {attractionsMutation.isSuccess && attractionsMutation.data && (
          <Card>
            <CardHeader>
              <CardTitle>API Response - Attractions</CardTitle>
              <CardDescription>
                Found {attractionsMutation.data.length} attractions in {selectedDestination.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {attractionsMutation.data.map((attraction: any) => (
                  <div
                    key={attraction.place_id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                  >
                    <h4 className="font-medium text-lg mb-1">{attraction.name}</h4>
                    <p className="text-sm text-gray-500 mb-2">{attraction.formatted_address}</p>
                    {attraction.rating && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="flex items-center gap-1">⭐ {attraction.rating}</span>
                        {attraction.user_ratings_total && (
                          <span className="text-gray-400">({attraction.user_ratings_total} reviews)</span>
                        )}
                      </div>
                    )}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {attraction.types?.slice(0, 3).map((type: string) => (
                        <Badge key={type} variant="outline" className="text-xs">
                          {type.replace(/_/g, " ")}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {attractionsMutation.isError && (
          <Card className="border-red-200 bg-red-50 mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-red-700">
                <XCircle className="h-6 w-6" />
                <div>
                  <p className="font-medium">Error fetching attractions</p>
                  <p className="text-sm">{attractionsMutation.error?.message}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Weather Results */}
        {weatherMutation.isSuccess && weatherMutation.data && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>API Response - Weather</CardTitle>
              <CardDescription>
                Weather data for {selectedDestination.name} ({units === 'metric' ? 'Celsius' : 'Fahrenheit'})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Current Weather */}
                <div className="p-4 border border-gray-200 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50">
                  <h4 className="font-medium text-lg mb-3">Current Weather</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Temperature</p>
                      <p className="text-2xl font-bold">{weatherMutation.data.current.temp}°{units === 'metric' ? 'C' : 'F'}</p>
                      <p className="text-sm text-gray-600 capitalize">{weatherMutation.data.current.description}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Feels Like</p>
                      <p className="text-xl font-semibold">{weatherMutation.data.current.feelsLike}°</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Humidity</p>
                      <p className="text-xl font-semibold">{weatherMutation.data.current.humidity}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Wind Speed</p>
                      <p className="text-xl font-semibold">{weatherMutation.data.current.windSpeed} {units === 'metric' ? 'm/s' : 'mph'}</p>
                    </div>
                  </div>
                </div>

                {/* Forecast */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-lg mb-3">5-Day Forecast</h4>
                  <div className="grid grid-cols-5 gap-2">
                    {weatherMutation.data.forecast.map((day: any, idx: number) => (
                      <div key={idx} className="text-center p-2 bg-gray-50 rounded">
                        <p className="text-xs text-gray-500 mb-1">
                          {new Date(day.dt * 1000).toLocaleDateString('en', { weekday: 'short' })}
                        </p>
                        <p className="text-sm font-medium">{day.tempMax}° / {day.tempMin}°</p>
                        {day.pop > 0 && (
                          <p className="text-xs text-blue-600 mt-1">💧 {day.pop}%</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Raw JSON */}
                <details className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <summary className="cursor-pointer font-medium">View Raw JSON</summary>
                  <pre className="mt-2 text-xs overflow-auto">
                    {JSON.stringify(weatherMutation.data, null, 2)}
                  </pre>
                </details>
              </div>
            </CardContent>
          </Card>
        )}

        {weatherMutation.isError && (
          <Card className="border-red-200 bg-red-50 mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-red-700">
                <XCircle className="h-6 w-6" />
                <div>
                  <p className="font-medium">Error fetching weather</p>
                  <p className="text-sm">{weatherMutation.error?.message}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Separator className="my-8" />

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          <p>This demo page tests the Destinations Hub integrations</p>
          <p className="mt-2">
            <Link href="/destinations" className="text-blue-600 hover:underline">
              Go to Destinations Hub →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
