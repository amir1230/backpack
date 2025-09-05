import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { MapPin, Star, Phone, Globe, Clock, DollarSign, Users, Camera, CloudSun } from "lucide-react";
import DestinationWeather from "@/components/DestinationWeather";
import { BestTimeInfo } from "@/components/BestTimeInfo";

interface Destination {
  id: number;
  locationId: string;
  name: string;
  country: string;
  description: string;
  latitude: number;
  longitude: number;
  bestTimeToVisit: string;
  averageTemperature: number;
  attractions: string[];
  activities: string[];
  tags: string[];
}

interface LocationItem {
  id: number;
  locationId: string;
  name: string;
  description: string;
  address: string;
  rating: number;
  numReviews: number;
  priceLevel?: string;
  phone?: string;
  website?: string;
  openingHours?: string[];
}

interface ApiResponse<T> {
  success: boolean;
  count: number;
  destinations?: T[];
  accommodations?: T[];
  attractions?: T[];
  restaurants?: T[];
}

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [weatherFilter, setWeatherFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("destinations");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch destinations
  const { data: destinationsResponse, isLoading: destinationsLoading } = useQuery<ApiResponse<Destination>>({
    queryKey: ['/api/destinations'],
  });
  const destinations = (destinationsResponse?.destinations || []) as Destination[];

  // Fetch accommodations
  const { data: accommodationsResponse, isLoading: accommodationsLoading } = useQuery<ApiResponse<LocationItem>>({
    queryKey: ['/api/accommodations'],
  });
  const accommodations = (accommodationsResponse?.accommodations || []) as LocationItem[];

  // Fetch attractions
  const { data: attractionsResponse, isLoading: attractionsLoading } = useQuery<ApiResponse<LocationItem>>({
    queryKey: ['/api/attractions'],
  });
  const attractions = (attractionsResponse?.attractions || []) as LocationItem[];

  // Fetch restaurants
  const { data: restaurantsResponse, isLoading: restaurantsLoading } = useQuery<ApiResponse<LocationItem>>({
    queryKey: ['/api/ta-restaurants'],
  });
  const restaurants = (restaurantsResponse?.restaurants || []) as LocationItem[];

  // Seed database mutation
  const seedDataMutation = useMutation({
    mutationFn: () => apiRequest('/api/data/seed', { method: 'POST' }),
    onSuccess: () => {
      toast({
        title: "Database Updated",
        description: "South American travel data has been loaded successfully.",
      });
      // Refresh all data
      queryClient.invalidateQueries({ queryKey: ['/api/destinations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/accommodations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/attractions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ta-restaurants'] });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "Could not load travel data. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Local search mutation for all data types
  const localSearchMutation = useMutation({
    mutationFn: async ({ query, type }: { query: string; type: string }) => {
      const endpoints = {
        destinations: '/api/destinations/search',
        accommodations: '/api/accommodations/search', 
        attractions: '/api/attractions/search',
        restaurants: '/api/ta-restaurants/search'
      };
      
      const endpoint = endpoints[type as keyof typeof endpoints] || endpoints.destinations;
      return apiRequest(`${endpoint}?q=${encodeURIComponent(query)}`);
    },
    onSuccess: (data: any) => {
      toast({
        title: "Search Complete",
        description: `Found results in your database.`,
      });
      // Refresh the current tab data
      queryClient.invalidateQueries({ queryKey: [`/api/${activeTab === 'destinations' ? 'destinations' : activeTab === 'accommodations' ? 'accommodations' : activeTab === 'attractions' ? 'attractions' : 'ta-restaurants'}`] });
    },
    onError: () => {
      toast({
        title: "Search Failed",
        description: "Could not search local data. Please try again.",
        variant: "destructive",
      });
    },
  });

  const filteredDestinations = destinations.filter((dest: Destination) => {
    const matchesSearch = dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dest.country.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCountry = selectedCountry === "all" || dest.country === selectedCountry;
    return matchesSearch && matchesCountry;
  });

  const countries = [...new Set(destinations.map((dest: Destination) => dest.country))];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const handleLocalSearch = () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search Required",
        description: "Please enter a search term to find places.",
        variant: "destructive",
      });
      return;
    }
    
    localSearchMutation.mutate({
      query: searchQuery,
      type: activeTab
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Explore South America</h1>
        <p className="text-muted-foreground mb-6">
          Discover amazing destinations across South America with real-time weather conditions and travel timing recommendations to help plan your perfect trip.
        </p>

        {/* Search and Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex flex-1 gap-2">
            <Input
              placeholder="Search destinations, places..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={handleLocalSearch}
              disabled={localSearchMutation.isPending}
              variant="outline"
            >
              {localSearchMutation.isPending ? "Searching..." : "Search Database"}
            </Button>
          </div>
          
          <Select value={selectedCountry} onValueChange={setSelectedCountry}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {countries.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={weatherFilter} onValueChange={setWeatherFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Weather" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Weather</SelectItem>
              <SelectItem value="sunny">☀️ Sunny</SelectItem>
              <SelectItem value="mild">🌤️ Mild</SelectItem>
              <SelectItem value="cool">☁️ Cool</SelectItem>
              <SelectItem value="best-time">✨ Best Time</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            onClick={() => seedDataMutation.mutate()}
            disabled={seedDataMutation.isPending}
            variant="secondary"
          >
            {seedDataMutation.isPending ? "Loading..." : "Load Sample Data"}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="destinations">Destinations</TabsTrigger>
          <TabsTrigger value="accommodations">Hotels</TabsTrigger>
          <TabsTrigger value="attractions">Attractions</TabsTrigger>
          <TabsTrigger value="restaurants">Restaurants</TabsTrigger>
        </TabsList>

        <TabsContent value="destinations" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinationsLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : filteredDestinations.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No destinations found. Try adjusting your search or load sample data.</p>
              </div>
            ) : (
              filteredDestinations.map((destination: Destination) => (
                <Card key={destination.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      {destination.name}, {destination.country}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {destination.description}
                    </p>

                    {/* Weather Integration */}
                    <div className="mb-4">
                      <DestinationWeather 
                        destination={destination.name}
                        country={destination.country}
                        compact={true}
                      />
                    </div>
                    
                    <div className="space-y-3">
                      {/* Best Time to Travel Information */}
                      <div className="border-t pt-3">
                        <BestTimeInfo 
                          destination={destination.name}
                          country={destination.country}
                          compact={true}
                        />
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {destination.tags?.slice(0, 4).map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium mb-1">Top Attractions:</p>
                        <p className="text-xs text-muted-foreground">
                          {destination.attractions?.slice(0, 3).join(", ")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="accommodations" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accommodationsLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              accommodations.map((hotel: LocationItem) => (
                <Card key={hotel.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{hotel.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <div className="flex">{renderStars(hotel.rating)}</div>
                      <span className="text-sm text-muted-foreground">
                        ({hotel.numReviews} reviews)
                      </span>
                      {hotel.priceLevel && (
                        <Badge variant="outline">{hotel.priceLevel}</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {hotel.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4" />
                        {hotel.address}
                      </div>
                      
                      {hotel.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4" />
                          {hotel.phone}
                        </div>
                      )}
                      
                      {hotel.website && (
                        <div className="flex items-center gap-2 text-sm">
                          <Globe className="w-4 h-4" />
                          <a 
                            href={hotel.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Visit Website
                          </a>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="attractions" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {attractionsLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              attractions.map((attraction: LocationItem) => (
                <Card key={attraction.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{attraction.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <div className="flex">{renderStars(attraction.rating)}</div>
                      <span className="text-sm text-muted-foreground">
                        ({attraction.numReviews} reviews)
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {attraction.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4" />
                        {attraction.address}
                      </div>
                      
                      {attraction.openingHours && attraction.openingHours.length > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4" />
                          {attraction.openingHours[0]}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="restaurants" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurantsLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              restaurants.map((restaurant: LocationItem) => (
                <Card key={restaurant.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{restaurant.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <div className="flex">{renderStars(restaurant.rating)}</div>
                      <span className="text-sm text-muted-foreground">
                        ({restaurant.numReviews} reviews)
                      </span>
                      {restaurant.priceLevel && (
                        <Badge variant="outline">{restaurant.priceLevel}</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {restaurant.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4" />
                        {restaurant.address}
                      </div>
                      
                      {restaurant.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4" />
                          {restaurant.phone}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

    </div>
  );
}