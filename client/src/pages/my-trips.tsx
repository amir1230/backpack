import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, MapPin, DollarSign, Calendar, Star, Users, ExternalLink, Camera } from "lucide-react";
import { RealPlaceLinks } from "@/components/RealPlaceLinks";
import { useTranslation } from 'react-i18next';

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

interface SavedTrip {
  id: number;
  title: string;
  destinations: any; // JSONB object with structured destination data
  description: string;
  budget: string;
  duration: string;
  travelStyle: string; // This is stored as a string in the database
  createdAt: string;
}

interface TripFormData {
  destination: string;
  dailyBudget: number;
  travelStyle: string[];
  interests: string[];
  duration: string;
}

const travelStyles = [
  "Adventure", "Cultural", "Budget Backpacking", "Luxury", "Nature & Wildlife",
  "Food & Culinary", "Historical", "Beach & Coastal", "Urban Exploration"
];

const interests = [
  "History & Culture", "Adventure Sports", "Nature & Wildlife", "Food & Cuisine",
  "Art & Museums", "Music & Nightlife", "Photography", "Local Markets",
  "Spiritual & Wellness", "Architecture", "Festivals & Events", "Beaches"
];

export default function MyTripsScreen() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("generate");
  const [formData, setFormData] = useState<TripFormData>({
    destination: "",
    dailyBudget: 50,
    travelStyle: [],
    interests: [],
    duration: ""
  });
  const [suggestions, setSuggestions] = useState<TripSuggestion[]>([]);

  // Fetch saved trips
  const { data: savedTrips, isLoading: tripsLoading } = useQuery({
    queryKey: ['/api/my-trips/guest'],
    enabled: activeTab === "saved"
  });

  // Generate trip suggestions mutation
  const generateTripMutation = useMutation({
    mutationFn: async (data: TripFormData) => {
      const response = await apiRequest('/api/get-suggestions', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: (data) => {
      setSuggestions(data.suggestions || []);
      setActiveTab("suggestions");
      toast({
        title: "Trip Suggestions Generated!",
        description: `Found ${data.suggestions?.length || 0} amazing suggestions for your trip.`,
      });
    },
    onError: (error) => {
      console.error('Generate trip error:', error);
      toast({
        title: "Generation Error",
        description: "Failed to generate trip suggestions. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Save trip mutation using the new endpoint
  const saveTrip = useMutation({
    mutationFn: async (suggestion: TripSuggestion) => {
      const tripData = {
        destination: `${suggestion.destination}, ${suggestion.country}`,
        description: suggestion.description,
        duration: suggestion.duration,
        estimatedBudget: suggestion.estimatedBudget,
        travelStyle: suggestion.travelStyle,
        highlights: suggestion.highlights,
        bestTimeToVisit: suggestion.bestTimeToVisit
      };
      
      const response = await apiRequest('/api/my-trips/guest/save', {
        method: 'POST',
        body: JSON.stringify(tripData)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/my-trips/guest'] });
      toast({
        title: t("messages.tripSaved"),
        description: "הטיול שלך נשמר בטיולים שלי.",
      });
    },
    onError: (error) => {
      console.error('Save trip error:', error);
      toast({
        title: t("messages.errorSavingTrip"),
        description: "נכשל בשמירת הטיול. אנא נסה שנית.",
        variant: "destructive"
      });
    }
  });

  const handleGenerateTrip = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.destination || !formData.duration || formData.travelStyle.length === 0) {
      toast({
        title: "מידע חסר",
        description: "אנא מלא יעד, משך זמן ובחר לפחות סגנון נסיעה אחד.",
        variant: "destructive"
      });
      return;
    }
    
    generateTripMutation.mutate(formData);
  };

  const handleStyleChange = (style: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      travelStyle: checked 
        ? [...prev.travelStyle, style]
        : prev.travelStyle.filter(s => s !== style)
    }));
  };

  const handleInterestChange = (interest: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      interests: checked 
        ? [...prev.interests, interest]
        : prev.interests.filter(i => i !== interest)
    }));
  };

  return (
    <div className="container mx-auto py-8 px-4" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{t("myTrips.title")}</h1>
          <p className="text-muted-foreground mt-2">תכנן, גלה ונהל את ההרפתקאות הדרום אמריקאיות שלך</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="generate">{t("myTrips.generateTrip")}</TabsTrigger>
            <TabsTrigger value="suggestions">{t("myTrips.suggestions")}</TabsTrigger>
            <TabsTrigger value="saved">{t("myTrips.title")}</TabsTrigger>
          </TabsList>

          {/* Tab 1: Trip Generation Form */}
          <TabsContent value="generate" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>תכנן את ההרפתקה הבאה שלך</CardTitle>
                <CardDescription>
                  ספר לנו על הטיול של החלומות שלך ואנחנו ניצור בשבילך הצעות מותאמות אישית
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleGenerateTrip} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="destination">{t("myTrips.destination")}</Label>
                      <Input
                        id="destination"
                        placeholder="למשל: פרו, קולומביה, ארגנטינה"
                        value={formData.destination}
                        onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration">{t("common.duration")}</Label>
                      <Select value={formData.duration} onValueChange={(value) => setFormData(prev => ({ ...prev, duration: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="בחר משך זמן" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-3 days">1-3 ימים</SelectItem>
                          <SelectItem value="4-7 days">4-7 ימים</SelectItem>
                          <SelectItem value="1-2 weeks">1-2 שבועות</SelectItem>
                          <SelectItem value="2-3 weeks">2-3 שבועות</SelectItem>
                          <SelectItem value="1 month">חודש אחד</SelectItem>
                          <SelectItem value="2+ months">2+ חודשים</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dailyBudget">{t("forms.dailyBudget")} (USD)</Label>
                      <Input
                        id="dailyBudget"
                        type="number"
                        min="10"
                        max="500"
                        value={formData.dailyBudget}
                        onChange={(e) => setFormData(prev => ({ ...prev, dailyBudget: parseInt(e.target.value) || 50 }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>סגנון נסיעה (בחר כל הרלוונטיים)</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {travelStyles.map((style) => (
                        <div key={style} className="flex items-center space-x-2">
                          <Checkbox
                            id={style}
                            checked={formData.travelStyle.includes(style)}
                            onCheckedChange={(checked) => handleStyleChange(style, !!checked)}
                          />
                          <Label htmlFor={style} className="text-sm">{t(`tripBuilder.styles.${style.toLowerCase()}`) || style}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>תחומי עניין (אופציונלי)</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {interests.map((interest) => (
                        <div key={interest} className="flex items-center space-x-2">
                          <Checkbox
                            id={interest}
                            checked={formData.interests.includes(interest)}
                            onCheckedChange={(checked) => handleInterestChange(interest, !!checked)}
                          />
                          <Label htmlFor={interest} className="text-sm">{interest}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button type="submit" disabled={generateTripMutation.isPending} className="w-full">
                    {generateTripMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                        {t("tripBuilder.generating")}
                      </>
                    ) : (
                      t("tripBuilder.generateTrip")
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Trip Suggestions */}
          <TabsContent value="suggestions" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">{t("myTrips.suggestions")}</h2>
              {suggestions.length > 0 && (
                <Badge variant="secondary">{suggestions.length} הצעות</Badge>
              )}
            </div>

            {suggestions.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <MapPin className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{t("myTrips.noSuggestions")}</h3>
                  <p className="text-muted-foreground text-center">
                    {t("myTrips.noSuggestionsDesc")}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {suggestions.map((suggestion, index) => (
                  <Card key={index} className="h-fit">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{suggestion.destination}</CardTitle>
                          <CardDescription>{suggestion.country}</CardDescription>
                        </div>
                        <Badge variant="outline">{suggestion.duration}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm">{suggestion.description}</p>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span>${suggestion.estimatedBudget.low}-${suggestion.estimatedBudget.high}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span className="text-xs">{suggestion.bestTimeToVisit}</span>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">{t("myTrips.highlights")}</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {suggestion.highlights.slice(0, 3).map((highlight, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {highlight}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">סגנון נסיעה</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {suggestion.travelStyle.map((style, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {style}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Real Places Links Component */}
                      <RealPlaceLinks suggestion={suggestion} />

                      <Button 
                        onClick={() => saveTrip.mutate(suggestion)}
                        disabled={saveTrip.isPending}
                        className="w-full"
                        size="sm"
                      >
                        {saveTrip.isPending ? (
                          <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                        ) : (
                          <Star className="w-4 h-4 ml-2" />
                        )}
                        {t("myTrips.saveTrip")}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Tab 3: Saved Trips */}
          <TabsContent value="saved" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">{t("myTrips.savedTrips")}</h2>
              {savedTrips && (
                <Badge variant="secondary">{savedTrips.length} טיולים שמורים</Badge>
              )}
            </div>

            {tripsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : !savedTrips || savedTrips.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{t("myTrips.noSavedTrips")}</h3>
                  <p className="text-muted-foreground text-center">
                    {t("myTrips.noSavedTripsDesc")}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedTrips.map((trip: SavedTrip) => (
                  <Card key={trip.id} className="h-fit">
                    <CardHeader>
                      <CardTitle className="text-lg">{trip.title || trip.destinations}</CardTitle>
                      <CardDescription>
                        {t("myTrips.savedOn")} {formatDateHe(trip.createdAt)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm">{trip.description}</p>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span>${trip.budget}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span>{trip.duration}</span>
                        </div>
                      </div>

                      {trip.destinations && (
                        <div>
                          <Label className="text-sm font-medium">Destination</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              <MapPin className="w-3 h-3 mr-1" />
                              {Array.isArray(trip.destinations) 
                                ? trip.destinations.join(', ') 
                                : typeof trip.destinations === 'string'
                                  ? trip.destinations
                                  : 'Unknown destination'}
                            </Badge>
                          </div>
                        </div>
                      )}

                      {trip.travelStyle && (
                        <div>
                          <Label className="text-sm font-medium">Travel Style</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {trip.travelStyle.split(', ').map((style, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {style.trim()}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}