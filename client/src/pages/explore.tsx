import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase, fetchPhotosForEntities, type LocationPhoto } from "../../../src/lib/supabaseClient.js";
import { MapPin, Star, Phone, Globe, Clock, DollarSign, Users, Camera, CloudSun, Eye } from "lucide-react";
import DestinationWeather from "@/components/DestinationWeather";
import { BestTimeInfo } from "@/components/BestTimeInfo";
import { resolveCityCountry, type BaseEntity, type DestinationMini } from "@/utils/locationResolve";

// Updated types to match Supabase schema
interface Destination {
  id: number;
  locationId: string;
  name: string;
  city?: string;
  state?: string;
  country: string;
  addressString?: string;
  latitude?: string;
  longitude?: string;
  lat?: number;
  lon?: number;
  address?: string;
  photoCount?: number;
  webUrl?: string;
  website?: string;
  rating?: string;
  priceLevel?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

interface Accommodation {
  id: number;
  locationId: string;
  name: string;
  rating?: string;
  numReviews?: number;
  priceLevel?: string;
  category?: string;
  city?: string;
  country: string;
  addressString?: string;
  address?: string;
  lat?: number;
  lon?: number;
  webUrl?: string;
  website?: string;
  tags?: string[];
  amenities?: string[];
  createdAt: string;
  updatedAt: string;
}

interface Attraction {
  id: number;
  locationId: string;
  name: string;
  rating?: string;
  numReviews?: number;
  category?: string;
  city?: string;
  country: string;
  addressString?: string;
  address?: string;
  lat?: number;
  lon?: number;
  webUrl?: string;
  website?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

interface Restaurant {
  id: number;
  locationId: string;
  name: string;
  rating?: string;
  numReviews?: number;
  priceLevel?: string;
  category?: string;
  cuisine?: string[];
  city?: string;
  country: string;
  addressString?: string;
  address?: string;
  lat?: number;
  lon?: number;
  webUrl?: string;
  website?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

// Photo state management
interface PhotoState {
  destinations: Map<string, LocationPhoto>;
  accommodations: Map<string, LocationPhoto>;
  attractions: Map<string, LocationPhoto>;
  restaurants: Map<string, LocationPhoto>;
}

// Detail modal state
interface DetailModalState {
  isOpen: boolean;
  type: 'destination' | 'accommodation' | 'attraction' | 'restaurant' | null;
  item: any;
  photos: LocationPhoto[];
}

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [weatherFilter, setWeatherFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("destinations");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [photos, setPhotos] = useState<PhotoState>({
    destinations: new Map(),
    accommodations: new Map(),
    attractions: new Map(),
    restaurants: new Map()
  });
  const [detailModal, setDetailModal] = useState<DetailModalState>({
    isOpen: false,
    type: null,
    item: null,
    photos: []
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const ITEMS_PER_PAGE = 20;
  const isDev = process.env.NODE_ENV !== 'production';
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [photoCache, setPhotoCache] = useState<Map<string, LocationPhoto>>(new Map());
  const [destinationsMini, setDestinationsMini] = useState<DestinationMini[]>([]);

  // Fetch destinations mini for location resolution (cached)
  const { data: destinationsMiniData = [] } = useQuery({
    queryKey: ['destinations-mini'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('destinations')
        .select('id, name, country, latitude, longitude')
        .order('name');
      
      if (error) {
        console.error('Destinations mini query error:', error);
        return [];
      }
      
      return (data || []).map(d => ({
        id: d.id.toString(),
        name: d.name,
        country: d.country,
        lat: d.latitude ? parseFloat(d.latitude) : null,
        lon: d.longitude ? parseFloat(d.longitude) : null
      })) as DestinationMini[];
    },
    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  });

  // Update destinations mini state when data changes
  useEffect(() => {
    setDestinationsMini(destinationsMiniData);
  }, [destinationsMiniData]);

  // Fetch destinations from Supabase
  const { data: destinations = [], isLoading: destinationsLoading } = useQuery({
    queryKey: ['supabase-destinations', currentPage, searchQuery, selectedCountry],
    queryFn: async () => {
      const pageStart = currentPage * ITEMS_PER_PAGE;
      const pageEnd = pageStart + ITEMS_PER_PAGE - 1;
      
      const selectFields = 'id, locationId, name, country, city, addressString, latitude, longitude, lat, lon, address, photoCount, webUrl, website, rating, priceLevel, tags, createdAt, updatedAt';
      
      let query = supabase
        .from('destinations')
        .select(selectFields, { count: 'exact', head: false })
        .order('updated_at', { ascending: false })
        .range(pageStart, pageEnd);
      
      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }
      if (selectedCountry !== 'all') {
        query = query.eq('country', selectedCountry);
      }
      
      const { data, error, count } = await query;
      if (error) {
        console.error('Destinations query error:', error);
        throw error;
      }
      
      setTotalCount(count || 0);
      setDebugInfo((prev: any) => ({ ...prev, destinations: { count, rows: data?.length || 0 } }));
      return data as Destination[];
    }
  });

  // Fetch accommodations from Supabase
  const { data: accommodations = [], isLoading: accommodationsLoading } = useQuery({
    queryKey: ['supabase-accommodations', currentPage, searchQuery],
    queryFn: async () => {
      const pageStart = currentPage * ITEMS_PER_PAGE;
      const pageEnd = pageStart + ITEMS_PER_PAGE - 1;
      
      const selectFields = 'id, locationId, name, country, city, addressString, address, lat, lon, rating, numReviews, priceLevel, category, webUrl, website, tags, amenities, createdAt, updatedAt';
      
      let query = supabase
        .from('accommodations')
        .select(selectFields, { count: 'exact', head: false })
        .order('updated_at', { ascending: false })
        .range(pageStart, pageEnd);
      
      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }
      
      const { data, error, count } = await query;
      if (error) {
        console.error('Accommodations query error:', error);
        throw error;
      }
      
      setTotalCount(count || 0);
      setDebugInfo((prev: any) => ({ ...prev, accommodations: { count, rows: data?.length || 0 } }));
      return data as Accommodation[];
    },
    enabled: activeTab === 'accommodations'
  });

  // Fetch attractions from Supabase
  const { data: attractions = [], isLoading: attractionsLoading } = useQuery({
    queryKey: ['supabase-attractions', currentPage, searchQuery],
    queryFn: async () => {
      const pageStart = currentPage * ITEMS_PER_PAGE;
      const pageEnd = pageStart + ITEMS_PER_PAGE - 1;
      
      const selectFields = 'id, locationId, name, country, city, addressString, address, lat, lon, rating, numReviews, category, webUrl, website, tags, createdAt, updatedAt';
      
      let query = supabase
        .from('attractions')
        .select(selectFields, { count: 'exact', head: false })
        .order('updated_at', { ascending: false })
        .range(pageStart, pageEnd);
      
      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }
      
      const { data, error, count } = await query;
      if (error) {
        console.error('Attractions query error:', error);
        throw error;
      }
      
      setTotalCount(count || 0);
      setDebugInfo((prev: any) => ({ ...prev, attractions: { count, rows: data?.length || 0 } }));
      return data as Attraction[];
    },
    enabled: activeTab === 'attractions'
  });

  // Fetch restaurants from Supabase
  const { data: restaurants = [], isLoading: restaurantsLoading } = useQuery({
    queryKey: ['supabase-restaurants', currentPage, searchQuery],
    queryFn: async () => {
      const pageStart = currentPage * ITEMS_PER_PAGE;
      const pageEnd = pageStart + ITEMS_PER_PAGE - 1;
      
      const selectFields = 'id, locationId, name, country, city, addressString, address, lat, lon, rating, numReviews, priceLevel, category, cuisine, webUrl, website, tags, createdAt, updatedAt';
      
      let query = supabase
        .from('restaurants')
        .select(selectFields, { count: 'exact', head: false })
        .order('updated_at', { ascending: false })
        .range(pageStart, pageEnd);
      
      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }
      
      const { data, error, count } = await query;
      if (error) {
        console.error('Restaurants query error:', error);
        throw error;
      }
      
      setTotalCount(count || 0);
      setDebugInfo((prev: any) => ({ ...prev, restaurants: { count, rows: data?.length || 0 } }));
      return data as Restaurant[];
    },
    enabled: activeTab === 'restaurants'
  });

  // Load photos for current tab items (efficient batch loading)
  useEffect(() => {
    const loadPhotosForCurrentTab = async () => {
      let items: any[] = [];
      let entityType: LocationPhoto['entity_type'] | null = null;
      
      switch (activeTab) {
        case 'destinations':
          items = destinations;
          entityType = 'destination';
          break;
        case 'accommodations':
          items = accommodations;
          entityType = 'accommodation';
          break;
        case 'attractions':
          items = attractions;
          entityType = 'attraction';
          break;
        case 'restaurants':
          items = restaurants;
          entityType = 'restaurant';
          break;
      }
      
      if (items.length > 0 && entityType) {
        const cacheKey = `${entityType}-${currentPage}`;
        
        // Check if we already have photos for this page cached
        const existingPhotos = photos[activeTab as keyof PhotoState];
        const hasAllPhotos = items.every(item => existingPhotos.has(item.id.toString()));
        
        if (hasAllPhotos) {
          return; // All photos already loaded
        }
        
        try {
          // Batch fetch photos for all items on current page
          const entityIds = items.map(item => item.id);
          
          const { data: photosData, error } = await supabase
            .from('location_photos')
            .select('entity_id, entity_type, url, thumbnail_url, inserted_at, source, license, attribution, width, height')
            .eq('entity_type', entityType)
            .in('entity_id', entityIds)
            .order('inserted_at', { ascending: false });
          
          if (error) {
            console.error('Photos fetch error:', error);
            return;
          }
          
          // Create photo map with preferred photo per entity
          const photoMap = new Map<string, LocationPhoto>();
          const entityPhotoGroups = new Map<string, LocationPhoto[]>();
          
          // Group photos by entity_id
          photosData?.forEach(photo => {
            const entityId = photo.entity_id.toString();
            if (!entityPhotoGroups.has(entityId)) {
              entityPhotoGroups.set(entityId, []);
            }
            entityPhotoGroups.get(entityId)!.push(photo as LocationPhoto);
          });
          
          // Select preferred photo for each entity (thumbnail_url ?? url)
          entityPhotoGroups.forEach((photos, entityId) => {
            const preferredPhoto = photos.find(p => p.thumbnail_url) || photos[0];
            if (preferredPhoto) {
              photoMap.set(entityId, preferredPhoto);
            }
          });
          
          setDebugInfo((prev: any) => ({
            ...prev,
            photos: {
              [`${entityType}_loaded`]: photoMap.size,
              [`${entityType}_entities`]: entityIds.length,
              [`${entityType}_total_photos`]: photosData?.length || 0
            }
          }));
          
          setPhotos(prev => ({
            ...prev,
            [activeTab]: photoMap
          }));
          
        } catch (error) {
          console.error('Error loading photos:', error);
        }
      }
    };
    
    loadPhotosForCurrentTab();
  }, [activeTab, destinations, accommodations, attractions, restaurants, currentPage]);

  const countries = [...new Set(destinations.map((dest: Destination) => dest.country))];

  const renderStars = (rating: string | number | undefined) => {
    const numRating = typeof rating === 'string' ? parseFloat(rating) : (rating || 0);
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(numRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const handleSearch = () => {
    setCurrentPage(0); // Reset to first page
    setSearchQuery(searchQuery.trim());
    queryClient.invalidateQueries({ queryKey: [`supabase-${activeTab}`] });
  };
  
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCountry('all');
    setCurrentPage(0);
    queryClient.invalidateQueries({ queryKey: [`supabase-${activeTab}`] });
  };
  
  const runSupabaseHealth = async () => {
    try {
      const { runSupabaseHealthCheck } = await import('../../../src/health/supabaseCheck.js');
      console.log('=== Running Supabase Health Check ===');
      await runSupabaseHealthCheck();
    } catch (err) {
      console.error('Health check failed:', err);
    }
  };

  const openDetailModal = async (type: DetailModalState['type'], item: any) => {
    // Fetch all photos for this specific item
    const { data: itemPhotos } = await supabase
      .from('location_photos')
      .select('*')
      .eq('entity_type', type)
      .eq('entity_id', item.id)
      .order('inserted_at', { ascending: false })
      .limit(6);
    
    setDetailModal({
      isOpen: true,
      type,
      item,
      photos: itemPhotos || []
    });
  };

  const closeDetailModal = () => {
    setDetailModal({ isOpen: false, type: null, item: null, photos: [] });
  };

  // Helper function to resolve city/country for non-destination entities
  const getCityCountryForEntity = (entity: BaseEntity): { city?: string; country?: string } => {
    const entityWithCoords = {
      ...entity,
      lat: entity.lat ?? (entity.latitude ? parseFloat(entity.latitude) : null),
      lon: entity.lon ?? (entity.longitude ? parseFloat(entity.longitude) : null),
      address: entity.address ?? entity.addressString
    };
    
    return resolveCityCountry(entityWithCoords, { destinations: destinationsMini });
  };
  
  // Helper function to format location subtitle
  const formatLocationSubtitle = (entity: any, isDestination: boolean = false): string => {
    if (isDestination) {
      // For destinations, show only country
      return entity.country || '';
    } else {
      // For other entities, resolve city/country
      const { city, country } = getCityCountryForEntity(entity);
      const parts = [];
      if (city) parts.push(city);
      if (country) parts.push(country);
      return parts.join(', ');
    }
  };

  const renderPhoto = (entityId: string, alt: string) => {
    const tabPhotos = photos[activeTab as keyof PhotoState];
    const photo = tabPhotos.get(entityId.toString());
    
    if (photo) {
      const imageUrl = photo.thumbnail_url || photo.url;
      return (
        <img
          src={imageUrl}
          alt={`${alt} photo`}
          className="w-full object-cover rounded-md mb-4"
          style={{ height: '150px' }}
          onError={(e) => {
            // Fallback to placeholder if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.nextElementSibling?.classList.remove('hidden');
          }}
        />
      );
    }
    
    return (
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-md mb-4 flex items-center justify-center" style={{ height: '150px' }}>
        <Camera className="w-8 h-8 text-gray-400" />
      </div>
    );
  };

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    setCurrentPage(0);
  };

  const nextPage = () => {
    if ((currentPage + 1) * ITEMS_PER_PAGE < totalCount) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
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
              onClick={handleSearch}
              variant="outline"
            >
              Search
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

          <div className="text-sm text-muted-foreground flex items-center gap-2">
            {totalCount > 0 && (
              <span>
                Showing {currentPage * ITEMS_PER_PAGE + 1} to {Math.min((currentPage + 1) * ITEMS_PER_PAGE, totalCount)} of {totalCount} items
              </span>
            )}
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="destinations">Destinations</TabsTrigger>
          <TabsTrigger value="accommodations">Accommodations (Hotels)</TabsTrigger>
          <TabsTrigger value="attractions">Attractions</TabsTrigger>
          <TabsTrigger value="restaurants">Restaurants</TabsTrigger>
        </TabsList>

        <TabsContent value="destinations" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinationsLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : destinations.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No destinations found matching your criteria.</p>
              </div>
            ) : (
              destinations.map((destination: Destination) => {
                const locationSubtitle = formatLocationSubtitle(destination, true);
                return (
                  <Card key={destination.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => openDetailModal('destination', destination)}>
                    <CardContent className="p-4">
                      {renderPhoto(destination.id.toString(), destination.name)}
                      
                      <CardTitle className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span className="text-lg">{destination.name}</span>
                      </CardTitle>
                      
                      <div className="space-y-2">
                        {locationSubtitle && (
                          <p className="text-sm text-muted-foreground">
                            {locationSubtitle}
                          </p>
                        )}
                        
                        {destination.addressString && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {destination.addressString}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2">
                            {destination.photoCount && destination.photoCount > 0 && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Camera className="w-3 h-3" />
                                {destination.photoCount}
                              </div>
                            )}
                          </div>
                          <Button size="sm" variant="outline" className="text-xs">
                            <Eye className="w-3 h-3 mr-1" />
                            More Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
          
          {/* Pagination */}
          {totalCount > ITEMS_PER_PAGE && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <Button 
                onClick={prevPage} 
                disabled={currentPage === 0}
                variant="outline"
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage + 1} of {Math.ceil(totalCount / ITEMS_PER_PAGE)}
              </span>
              <Button 
                onClick={nextPage} 
                disabled={(currentPage + 1) * ITEMS_PER_PAGE >= totalCount}
                variant="outline"
              >
                Next
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="accommodations" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accommodationsLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : accommodations.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No accommodations found matching your criteria.</p>
              </div>
            ) : (
              accommodations.map((accommodation: Accommodation) => {
                const locationSubtitle = formatLocationSubtitle(accommodation);
                return (
                  <Card key={accommodation.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => openDetailModal('accommodation', accommodation)}>
                    <CardContent className="p-4">
                      {renderPhoto(accommodation.id.toString(), accommodation.name)}
                      
                      <CardTitle className="text-lg mb-2">{accommodation.name}</CardTitle>
                      
                      {locationSubtitle && (
                        <p className="text-sm text-muted-foreground mb-3">{locationSubtitle}</p>
                      )}
                      
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex">{renderStars(accommodation.rating)}</div>
                        {accommodation.numReviews && (
                          <span className="text-sm text-muted-foreground">
                            ({accommodation.numReviews} reviews)
                          </span>
                        )}
                        {accommodation.priceLevel && (
                          <Badge variant="outline">{accommodation.priceLevel}</Badge>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        {accommodation.category && (
                          <Badge variant="secondary" className="text-xs">
                            {accommodation.category}
                          </Badge>
                        )}
                        
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2">
                            {accommodation.amenities && accommodation.amenities.length > 0 && (
                              <div className="text-xs text-muted-foreground">
                                {accommodation.amenities.slice(0, 2).join(", ")}
                                {accommodation.amenities.length > 2 && " ..."}
                              </div>
                            )}
                          </div>
                          <Button size="sm" variant="outline" className="text-xs">
                            <Eye className="w-3 h-3 mr-1" />
                            More Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
          
          {totalCount > ITEMS_PER_PAGE && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <Button onClick={prevPage} disabled={currentPage === 0} variant="outline">Previous</Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage + 1} of {Math.ceil(totalCount / ITEMS_PER_PAGE)}
              </span>
              <Button onClick={nextPage} disabled={(currentPage + 1) * ITEMS_PER_PAGE >= totalCount} variant="outline">Next</Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="attractions" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {attractionsLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : attractions.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No attractions found matching your criteria.</p>
              </div>
            ) : (
              attractions.map((attraction: Attraction) => {
                const locationSubtitle = formatLocationSubtitle(attraction);
                return (
                  <Card key={attraction.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => openDetailModal('attraction', attraction)}>
                    <CardContent className="p-4">
                      {renderPhoto(attraction.id.toString(), attraction.name)}
                      
                      <CardTitle className="text-lg mb-2">{attraction.name}</CardTitle>
                      
                      {locationSubtitle && (
                        <p className="text-sm text-muted-foreground mb-3">{locationSubtitle}</p>
                      )}
                      
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex">{renderStars(attraction.rating)}</div>
                        {attraction.numReviews && (
                          <span className="text-sm text-muted-foreground">
                            ({attraction.numReviews} reviews)
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        {attraction.category && (
                          <Badge variant="secondary" className="text-xs">
                            {attraction.category}
                          </Badge>
                        )}
                        
                        <div className="flex items-center justify-end pt-2">
                          <Button size="sm" variant="outline" className="text-xs">
                            <Eye className="w-3 h-3 mr-1" />
                            More Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
          
          {totalCount > ITEMS_PER_PAGE && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <Button onClick={prevPage} disabled={currentPage === 0} variant="outline">Previous</Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage + 1} of {Math.ceil(totalCount / ITEMS_PER_PAGE)}
              </span>
              <Button onClick={nextPage} disabled={(currentPage + 1) * ITEMS_PER_PAGE >= totalCount} variant="outline">Next</Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="restaurants" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurantsLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : restaurants.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No restaurants found matching your criteria.</p>
              </div>
            ) : (
              restaurants.map((restaurant: Restaurant) => {
                const locationSubtitle = formatLocationSubtitle(restaurant);
                return (
                  <Card key={restaurant.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => openDetailModal('restaurant', restaurant)}>
                    <CardContent className="p-4">
                      {renderPhoto(restaurant.id.toString(), restaurant.name)}
                      
                      <CardTitle className="text-lg mb-2">{restaurant.name}</CardTitle>
                      
                      {locationSubtitle && (
                        <p className="text-sm text-muted-foreground mb-3">{locationSubtitle}</p>
                      )}
                      
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex">{renderStars(restaurant.rating)}</div>
                        {restaurant.numReviews && (
                          <span className="text-sm text-muted-foreground">
                            ({restaurant.numReviews} reviews)
                          </span>
                        )}
                        {restaurant.priceLevel && (
                          <Badge variant="outline">{restaurant.priceLevel}</Badge>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1">
                          {restaurant.cuisine?.slice(0, 3).map((cuisineType, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {cuisineType}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-end pt-2">
                          <Button size="sm" variant="outline" className="text-xs">
                            <Eye className="w-3 h-3 mr-1" />
                            More Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
          
          {totalCount > ITEMS_PER_PAGE && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <Button onClick={prevPage} disabled={currentPage === 0} variant="outline">Previous</Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage + 1} of {Math.ceil(totalCount / ITEMS_PER_PAGE)}
              </span>
              <Button onClick={nextPage} disabled={(currentPage + 1) * ITEMS_PER_PAGE >= totalCount} variant="outline">Next</Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Detail Modal */}
      <Dialog open={detailModal.isOpen} onOpenChange={closeDetailModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {detailModal.item && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  {detailModal.item.name}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Photos Gallery */}
                {detailModal.photos.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {detailModal.photos.map((photo, idx) => (
                      <div key={photo.entity_id || idx} className="relative group">
                        <img
                          src={photo.thumbnail_url || photo.url}
                          alt={`${detailModal.item.name} ${idx + 1}`}
                          className="w-full h-32 object-cover rounded-lg cursor-pointer transition-transform group-hover:scale-105"
                          onClick={() => window.open(photo.url, '_blank')}
                        />
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Details */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Location Details</h3>
                    
                    <div className="space-y-2 text-sm">
                      {detailModal.item.city && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{detailModal.item.city}, {detailModal.item.country}</span>
                        </div>
                      )}
                      
                      {detailModal.item.addressString && (
                        <div className="text-muted-foreground">
                          {detailModal.item.addressString}
                        </div>
                      )}
                      
                      {detailModal.item.webUrl && (
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          <a 
                            href={detailModal.item.webUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Visit Website
                          </a>
                        </div>
                      )}
                      
                      {detailModal.item.latitude && detailModal.item.longitude && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <a
                            href={`https://www.google.com/maps?q=${detailModal.item.latitude},${detailModal.item.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View on Maps
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Additional Info</h3>
                    
                    <div className="space-y-3 text-sm">
                      {detailModal.item.rating && (
                        <div className="flex items-center gap-2">
                          <div className="flex">{renderStars(detailModal.item.rating)}</div>
                          <span className="text-muted-foreground">
                            {parseFloat(detailModal.item.rating).toFixed(1)} stars
                          </span>
                          {detailModal.item.numReviews && (
                            <span className="text-muted-foreground">
                              ({detailModal.item.numReviews} reviews)
                            </span>
                          )}
                        </div>
                      )}
                      
                      {detailModal.item.priceLevel && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          <Badge variant="outline">{detailModal.item.priceLevel}</Badge>
                        </div>
                      )}
                      
                      {detailModal.item.category && (
                        <div>
                          <Badge variant="secondary">{detailModal.item.category}</Badge>
                        </div>
                      )}
                      
                      {detailModal.item.cuisine && detailModal.item.cuisine.length > 0 && (
                        <div className="space-y-1">
                          <span className="font-medium">Cuisine:</span>
                          <div className="flex flex-wrap gap-1">
                            {detailModal.item.cuisine.map((cuisineType: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {cuisineType}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {detailModal.item.amenities && detailModal.item.amenities.length > 0 && (
                        <div className="space-y-1">
                          <span className="font-medium">Amenities:</span>
                          <div className="flex flex-wrap gap-1">
                            {detailModal.item.amenities.map((amenity: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {amenity}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="text-xs text-muted-foreground pt-2">
                        Last updated: {new Date(detailModal.item.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}