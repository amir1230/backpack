import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Star, Users, Camera, MessageSquare } from "lucide-react";
import { 
  useLocalizedDestinations, 
  useLocalizedAccommodations, 
  useLocalizedAttractions, 
  useLocalizedRestaurants 
} from "../lib/localizedData.js";
import { useIntlFormatters } from "../lib/intlFormatters.js";

export default function TripAdvisorData() {
  const [activeTab, setActiveTab] = useState("destinations");

  const { formatNumber, formatDate } = useIntlFormatters();

  // Use localized data hooks
  const { data: destinations, isLoading: destinationsLoading } = useLocalizedDestinations();
  const { data: accommodations, isLoading: accommodationsLoading } = useLocalizedAccommodations();
  const { data: attractions, isLoading: attractionsLoading } = useLocalizedAttractions();
  const { data: restaurants, isLoading: restaurantsLoading } = useLocalizedRestaurants();

  const { data: recentReviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ["/api/location-reviews/recent"],
    enabled: activeTab === "reviews"
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const formatCoordinates = (lat: string, lng: string) => {
    return `${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">TripAdvisor Database Explorer</h1>
        <p className="text-gray-600">
          Browse South American travel data including destinations, accommodations, attractions, restaurants, and reviews.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto">
          <TabsList className="inline-flex w-auto min-w-full justify-evenly h-10">
            <TabsTrigger value="destinations" className="whitespace-nowrap">Destinations</TabsTrigger>
            <TabsTrigger value="accommodations" className="whitespace-nowrap">Hotels</TabsTrigger>
            <TabsTrigger value="attractions" className="whitespace-nowrap">Attractions</TabsTrigger>
            <TabsTrigger value="restaurants" className="whitespace-nowrap">Restaurants</TabsTrigger>
            <TabsTrigger value="reviews" className="whitespace-nowrap">Reviews</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="destinations" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {destinationsLoading ? (
              <p>Loading destinations...</p>
            ) : destinations?.map((destination) => (
              <Card key={destination.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    {destination.nameLocalized}
                  </CardTitle>
                  <CardDescription>{destination.country}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <strong>Location:</strong> {destination.addressString}
                    </p>
                    {destination.lat && destination.lon && (
                      <p className="text-sm text-gray-600">
                        <strong>Coordinates:</strong> {formatCoordinates(destination.lat, destination.lon)}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <Camera className="w-4 h-4" />
                      <span className="text-sm">{destination.photoCount} photos</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="accommodations" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {accommodationsLoading ? (
              <p>Loading accommodations...</p>
            ) : accommodations?.map((accommodation) => (
              <Card key={accommodation.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{accommodation.nameLocalized}</span>
                    <Badge variant="secondary">{accommodation.priceLevel}</Badge>
                  </CardTitle>
                  <CardDescription>
                    {accommodation.city}, {accommodation.country}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {renderStars(accommodation.rating || 0)}
                      <span className="text-sm font-medium">{accommodation.rating}</span>
                      <span className="text-sm text-gray-500">({accommodation.numReviews} reviews)</span>
                    </div>
                    
                    {accommodation.rankingString && (
                      <p className="text-sm text-green-600 font-medium">
                        {accommodation.rankingString}
                      </p>
                    )}
                    
                    {accommodation.amenities && accommodation.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {accommodation.amenities.slice(0, 4).map((amenity: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                        {accommodation.amenities.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{accommodation.amenities.length - 4} more
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Camera className="w-4 h-4" />
                        {accommodation.photoCount} photos
                      </div>
                      {accommodation.isBookable && (
                        <Badge variant="default" className="text-xs">Bookable</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="attractions" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {attractionsLoading ? (
              <p>Loading attractions...</p>
            ) : attractions?.map((attraction) => (
              <Card key={attraction.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>{attraction.nameLocalized}</CardTitle>
                  <CardDescription>
                    {attraction.city}, {attraction.country}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {renderStars(attraction.rating || 0)}
                      <span className="text-sm font-medium">{attraction.rating}</span>
                      <span className="text-sm text-gray-500">({attraction.numReviews} reviews)</span>
                    </div>
                    
                    {attraction.rankingString && (
                      <p className="text-sm text-green-600 font-medium">
                        {attraction.rankingString}
                      </p>
                    )}
                    
                    {attraction.attractionTypes && attraction.attractionTypes.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {attraction.attractionTypes.map((type: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Camera className="w-4 h-4" />
                      {attraction.photoCount} photos
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="restaurants" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {restaurantsLoading ? (
              <p>Loading restaurants...</p>
            ) : restaurants?.map((restaurant) => (
              <Card key={restaurant.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{restaurant.nameLocalized}</span>
                    <Badge variant="secondary">{restaurant.priceLevel}</Badge>
                  </CardTitle>
                  <CardDescription>
                    {restaurant.city}, {restaurant.country}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {renderStars(restaurant.rating || 0)}
                      <span className="text-sm font-medium">{restaurant.rating}</span>
                      <span className="text-sm text-gray-500">({restaurant.numReviews} reviews)</span>
                    </div>
                    
                    {restaurant.rankingString && (
                      <p className="text-sm text-green-600 font-medium">
                        {restaurant.rankingString}
                      </p>
                    )}
                    
                    {restaurant.cuisineLocalized && restaurant.cuisineLocalized.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {restaurant.cuisineLocalized.map((cuisine: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {cuisine}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {restaurant.dietaryRestrictions && restaurant.dietaryRestrictions.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {restaurant.dietaryRestrictions.map((restriction: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs bg-green-50 text-green-700">
                            {restriction}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Camera className="w-4 h-4" />
                      {restaurant.photoCount} photos
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <div className="space-y-4">
            {reviewsLoading ? (
              <p>Loading reviews...</p>
            ) : recentReviews?.map((review: any) => (
              <Card key={review.id}>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {renderStars(review.rating)}
                        <span className="font-medium">{review.rating}/5</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MessageSquare className="w-4 h-4" />
                        {review.locationCategory}
                      </div>
                    </div>
                    
                    {review.title && (
                      <h3 className="font-semibold text-lg">{review.title}</h3>
                    )}
                    
                    <p className="text-gray-700">{review.text}</p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        {review.user && (
                          <span>
                            {review.user.firstName} {review.user.lastName}
                          </span>
                        )}
                        {review.tripType && (
                          <Badge variant="outline" className="text-xs">
                            {review.tripType}
                          </Badge>
                        )}
                      </div>
                      <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}