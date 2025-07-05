import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import BudgetEstimator from "@/components/budget-estimator";
import { 
  Bot, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Mountain, 
  Camera, 
  Utensils, 
  GlassWater,
  Loader2,
  Sparkles,
  Clock,
  Users,
  CheckCircle,
  Heart,
  Music,
  Waves,
  TreePine,
  Building,
  Plane,
  Car,
  Ship,
  AlertCircle,
  Info,
  ChevronRight,
  Star,
  Share2,
  Download,
  ArrowLeft,
  ArrowRight
} from "lucide-react";

const tripFormSchema = z.object({
  destination: z.string().min(1, "Destination is required"),
  duration: z.string().min(1, "Duration is required"),
  budget: z.number().min(100, "Budget must be at least $100"),
  travelStyle: z.array(z.string()).min(1, "Select at least one travel style"),
  description: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  groupSize: z.number().min(1).max(20).optional(),
  accommodationType: z.string().optional(),
  transportPreference: z.string().optional(),
});

type TripFormData = z.infer<typeof tripFormSchema>;

const DESTINATIONS = [
  { 
    id: "peru", 
    name: "Peru", 
    flag: "🇵🇪",
    highlights: ["Machu Picchu", "Amazon Rainforest", "Cusco"],
    bestMonths: ["May", "June", "July", "August", "September"]
  },
  { 
    id: "colombia", 
    name: "Colombia", 
    flag: "🇨🇴",
    highlights: ["Cartagena", "Coffee Region", "Lost City"],
    bestMonths: ["December", "January", "February", "March"]
  },
  { 
    id: "bolivia", 
    name: "Bolivia", 
    flag: "🇧🇴",
    highlights: ["Salar de Uyuni", "La Paz", "Lake Titicaca"],
    bestMonths: ["May", "June", "July", "August", "September"]
  },
  { 
    id: "chile", 
    name: "Chile", 
    flag: "🇨🇱",
    highlights: ["Atacama Desert", "Patagonia", "Easter Island"],
    bestMonths: ["November", "December", "January", "February", "March"]
  },
  { 
    id: "argentina", 
    name: "Argentina", 
    flag: "🇦🇷",
    highlights: ["Buenos Aires", "Patagonia", "Mendoza"],
    bestMonths: ["October", "November", "December", "January", "February", "March"]
  },
  { 
    id: "brazil", 
    name: "Brazil", 
    flag: "🇧🇷",
    highlights: ["Rio de Janeiro", "Amazon", "Salvador"],
    bestMonths: ["April", "May", "June", "July", "August", "September"]
  },
  { 
    id: "ecuador", 
    name: "Ecuador", 
    flag: "🇪🇨",
    highlights: ["Galápagos Islands", "Quito", "Amazon Basin"],
    bestMonths: ["June", "July", "August", "September"]
  },
  { 
    id: "uruguay", 
    name: "Uruguay", 
    flag: "🇺🇾",
    highlights: ["Montevideo", "Punta del Este", "Colonia"],
    bestMonths: ["November", "December", "January", "February", "March"]
  }
];

const DURATIONS = [
  { value: "1-week", label: "1 week", days: 7 },
  { value: "2-weeks", label: "2 weeks", days: 14 },
  { value: "3-weeks", label: "3 weeks", days: 21 },
  { value: "1-month", label: "1 month", days: 30 },
  { value: "2-months", label: "2 months", days: 60 },
  { value: "3-months", label: "3+ months", days: 90 },
];

const TRAVEL_STYLES = [
  { id: 'adventure', icon: Mountain, label: 'Adventure', description: 'Hiking, climbing, extreme sports', color: 'bg-green-100 text-green-800' },
  { id: 'culture', icon: Camera, label: 'Culture', description: 'Museums, historical sites, local traditions', color: 'bg-purple-100 text-purple-800' },
  { id: 'food', icon: Utensils, label: 'Food & Drink', description: 'Local cuisine, cooking classes, food tours', color: 'bg-orange-100 text-orange-800' },
  { id: 'nightlife', icon: GlassWater, label: 'Nightlife', description: 'Bars, clubs, social events', color: 'bg-pink-100 text-pink-800' },
  { id: 'nature', icon: TreePine, label: 'Nature', description: 'National parks, wildlife, landscapes', color: 'bg-green-100 text-green-700' },
  { id: 'beach', icon: Waves, label: 'Beach & Coast', description: 'Beaches, water sports, coastal cities', color: 'bg-blue-100 text-blue-800' },
  { id: 'urban', icon: Building, label: 'Urban Explorer', description: 'Cities, architecture, modern attractions', color: 'bg-gray-100 text-gray-800' },
  { id: 'wellness', icon: Heart, label: 'Wellness', description: 'Spas, yoga, meditation, health retreats', color: 'bg-red-100 text-red-800' }
];

const ACCOMMODATION_TYPES = [
  { value: "hostel", label: "Hostels", icon: Users },
  { value: "budget-hotel", label: "Budget Hotels", icon: Building },
  { value: "mid-range", label: "Mid-range Hotels", icon: Star },
  { value: "luxury", label: "Luxury Hotels", icon: Sparkles },
  { value: "airbnb", label: "Airbnb/Rentals", icon: Heart },
];

const TRANSPORT_PREFERENCES = [
  { value: "budget", label: "Budget (Bus, Local Transport)", icon: Car },
  { value: "mixed", label: "Mixed (Bus + Flights)", icon: Plane },
  { value: "comfort", label: "Comfort (Flights, Private)", icon: Star },
];

export default function TripBuilder() {
  const [currentStep, setCurrentStep] = useState(1);
  const [budget, setBudget] = useState([2500]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [currentDestination, setCurrentDestination] = useState("");
  const [currentDuration, setCurrentDuration] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [groupSize, setGroupSize] = useState(1);
  const [accommodationType, setAccommodationType] = useState("");
  const [transportPreference, setTransportPreference] = useState("");
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const totalSteps = 4;

  const form = useForm<TripFormData>({
    resolver: zodResolver(tripFormSchema),
    defaultValues: {
      destination: "",
      duration: "",
      budget: 2500,
      travelStyle: [],
      description: "",
      startDate: undefined,
      endDate: undefined,
      groupSize: 1,
      accommodationType: "",
      transportPreference: "",
    },
  });

  const generateTripMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/ai/generate-trip", data);
    },
    onSuccess: async (response) => {
      const suggestion = await response.json();
      setAiSuggestion(suggestion);
      setIsGenerating(false);
      toast({
        title: "Trip Generated!",
        description: "Your personalized itinerary is ready.",
      });
    },
    onError: (error) => {
      setIsGenerating(false);
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Generation Failed",
        description: "Could not generate trip. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createTripMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/trips", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trips/user"] });
      toast({
        title: "Trip Created!",
        description: "Your trip has been saved successfully.",
      });
      setAiSuggestion(null);
      form.reset();
      setSelectedStyles([]);
      setBudget([2500]);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Save Failed",
        description: "Could not save trip. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Helper functions
  const toggleStyle = (style: string) => {
    const newStyles = selectedStyles.includes(style) 
      ? selectedStyles.filter(s => s !== style)
      : [...selectedStyles, style];
    setSelectedStyles(newStyles);
    form.setValue('travelStyle', newStyles);
  };

  const validateCurrentStep = () => {
    const errors: string[] = [];
    
    switch (currentStep) {
      case 1:
        if (!currentDestination) errors.push("Please select a destination");
        if (!currentDuration) errors.push("Please select trip duration");
        break;
      case 2:
        if (selectedStyles.length === 0) errors.push("Please select at least one travel style");
        break;
      case 3:
        if (!accommodationType) errors.push("Please select accommodation type");
        if (!transportPreference) errors.push("Please select transport preference");
        break;
      case 4:
        // Budget validation is handled by the budget estimator
        break;
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const nextStep = () => {
    if (validateCurrentStep() && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getSelectedDestination = () => {
    return DESTINATIONS.find(d => d.name === currentDestination);
  };

  const handleGenerateTrip = () => {
    const values = form.getValues();
    if (!values.destination || !values.duration || selectedStyles.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in destination, duration, and select at least one travel style.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    generateTripMutation.mutate({
      destination: values.destination,
      duration: values.duration,
      budget: budget[0],
      travelStyle: selectedStyles,
      interests: selectedStyles,
    });
  };

  const handleSaveTrip = () => {
    if (!aiSuggestion) return;

    const tripData = {
      title: aiSuggestion.title,
      description: aiSuggestion.description,
      destinations: aiSuggestion.destinations,
      budget: aiSuggestion.totalEstimatedCost.toString(),
      travelStyle: selectedStyles.join(', '),
      isPublic: true,
    };

    createTripMutation.mutate(tripData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent mb-4">
            AI Trip Builder
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Create your perfect South American adventure with our intelligent trip planning assistant
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4 mb-4">
            {Array.from({ length: totalSteps }, (_, i) => {
              const stepNumber = i + 1;
              const isActive = stepNumber === currentStep;
              const isCompleted = stepNumber < currentStep;
              
              return (
                <div key={stepNumber} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : isActive
                        ? 'bg-primary text-white ring-4 ring-orange-200'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {isCompleted ? <CheckCircle className="w-5 h-5" /> : stepNumber}
                  </div>
                  {stepNumber < totalSteps && (
                    <div className={`w-12 h-1 mx-2 rounded-full ${
                      stepNumber < currentStep ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Step {currentStep} of {totalSteps}: {
                currentStep === 1 ? 'Destination & Duration' :
                currentStep === 2 ? 'Travel Preferences' :
                currentStep === 3 ? 'Accommodation & Transport' :
                'Budget Planning'
              }
            </p>
            <Progress value={(currentStep / totalSteps) * 100} className="w-64 mx-auto mt-2" />
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Step-by-Step Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-blue-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center text-xl">
                  <Sparkles className="w-6 h-6 mr-2" />
                  {currentStep === 1 && 'Choose Your Destination'}
                  {currentStep === 2 && 'Select Your Travel Style'}
                  {currentStep === 3 && 'Accommodation & Transport'}
                  {currentStep === 4 && 'Budget Planning'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                {/* Validation Errors */}
                {validationErrors.length > 0 && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                      <span className="font-medium text-red-800">Please complete the following:</span>
                    </div>
                    <ul className="text-sm text-red-700 space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Step 1: Destination & Duration */}
                {currentStep === 1 && (
                  <div className="space-y-8">
                    {/* Destination Selection */}
                    <div>
                      <Label className="text-lg font-semibold text-slate-700 mb-4 block">
                        Where would you like to explore?
                      </Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {DESTINATIONS.map((dest) => (
                          <Button
                            key={dest.id}
                            type="button"
                            variant={currentDestination === dest.name ? "default" : "outline"}
                            onClick={() => {
                              setCurrentDestination(dest.name);
                              form.setValue('destination', dest.name);
                            }}
                            className="h-auto p-4 justify-start"
                          >
                            <div className="text-left w-full">
                              <div className="flex items-center mb-2">
                                <span className="text-2xl mr-3">{dest.flag}</span>
                                <span className="font-semibold text-lg">{dest.name}</span>
                              </div>
                              <div className="text-sm opacity-80 mb-2">
                                Highlights: {dest.highlights.slice(0, 2).join(', ')}
                              </div>
                              <div className="text-xs opacity-60">
                                Best time: {dest.bestMonths.slice(0, 3).join(', ')}
                              </div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Duration Selection */}
                    <div>
                      <Label className="text-lg font-semibold text-slate-700 mb-4 block">
                        How long is your trip?
                      </Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {DURATIONS.map((duration) => (
                          <Button
                            key={duration.value}
                            type="button"
                            variant={currentDuration === duration.value ? "default" : "outline"}
                            onClick={() => {
                              setCurrentDuration(duration.value);
                              form.setValue('duration', duration.value);
                            }}
                            className="h-auto p-4"
                          >
                            <div className="text-center">
                              <Clock className="w-6 h-6 mx-auto mb-2" />
                              <div className="font-semibold">{duration.label}</div>
                              <div className="text-xs opacity-70">{duration.days} days</div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Date Selection */}
                    <div>
                      <Label className="text-lg font-semibold text-slate-700 mb-4 block">
                        When are you planning to travel? (Optional)
                      </Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-slate-600 mb-2 block">Start Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-start text-left">
                                <Calendar className="mr-2 h-4 w-4" />
                                {startDate ? format(startDate, "PPP") : "Pick a date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <CalendarComponent
                                mode="single"
                                selected={startDate}
                                onSelect={setStartDate}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-slate-600 mb-2 block">End Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-start text-left">
                                <Calendar className="mr-2 h-4 w-4" />
                                {endDate ? format(endDate, "PPP") : "Pick a date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <CalendarComponent
                                mode="single"
                                selected={endDate}
                                onSelect={setEndDate}
                                disabled={(date) => startDate ? date < startDate : false}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Travel Style */}
                {currentStep === 2 && (
                  <div className="space-y-8">
                    <div>
                      <Label className="text-lg font-semibold text-slate-700 mb-4 block">
                        What kind of experiences are you looking for?
                      </Label>
                      <p className="text-gray-600 mb-6">Select all that interest you</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {TRAVEL_STYLES.map((style) => (
                          <Button
                            key={style.id}
                            type="button"
                            variant={selectedStyles.includes(style.id) ? "default" : "outline"}
                            onClick={() => toggleStyle(style.id)}
                            className="h-auto p-4 justify-start relative"
                          >
                            <div className="text-left w-full">
                              <div className="flex items-center mb-2">
                                <style.icon className="w-6 h-6 mr-3" />
                                <span className="font-semibold">{style.label}</span>
                                {selectedStyles.includes(style.id) && (
                                  <CheckCircle className="w-5 h-5 ml-auto text-green-600" />
                                )}
                              </div>
                              <p className="text-sm opacity-80">{style.description}</p>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Group Size */}
                    <div>
                      <Label className="text-lg font-semibold text-slate-700 mb-4 block">
                        How many people are traveling?
                      </Label>
                      <div className="flex items-center space-x-4">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => setGroupSize(Math.max(1, groupSize - 1))}
                          disabled={groupSize <= 1}
                        >
                          -
                        </Button>
                        <div className="flex items-center space-x-2">
                          <Users className="w-5 h-5 text-gray-600" />
                          <span className="text-xl font-semibold w-8 text-center">{groupSize}</span>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => setGroupSize(Math.min(20, groupSize + 1))}
                          disabled={groupSize >= 20}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Accommodation & Transport */}
                {currentStep === 3 && (
                  <div className="space-y-8">
                    {/* Accommodation */}
                    <div>
                      <Label className="text-lg font-semibold text-slate-700 mb-4 block">
                        What type of accommodation do you prefer?
                      </Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {ACCOMMODATION_TYPES.map((acc) => (
                          <Button
                            key={acc.value}
                            type="button"
                            variant={accommodationType === acc.value ? "default" : "outline"}
                            onClick={() => setAccommodationType(acc.value)}
                            className="h-auto p-4 justify-start"
                          >
                            <acc.icon className="w-6 h-6 mr-3" />
                            <span className="font-semibold">{acc.label}</span>
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Transport */}
                    <div>
                      <Label className="text-lg font-semibold text-slate-700 mb-4 block">
                        How would you like to get around?
                      </Label>
                      <div className="space-y-3">
                        {TRANSPORT_PREFERENCES.map((transport) => (
                          <Button
                            key={transport.value}
                            type="button"
                            variant={transportPreference === transport.value ? "default" : "outline"}
                            onClick={() => setTransportPreference(transport.value)}
                            className="w-full h-auto p-4 justify-start"
                          >
                            <transport.icon className="w-6 h-6 mr-3" />
                            <span className="font-semibold">{transport.label}</span>
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Additional Notes */}
                    <div>
                      <Label className="text-lg font-semibold text-slate-700 mb-4 block">
                        Any additional preferences or requirements?
                      </Label>
                      <Textarea
                        placeholder="e.g., dietary restrictions, accessibility needs, specific interests..."
                        {...form.register('description')}
                        className="min-h-[100px]"
                      />
                    </div>
                  </div>
                )}

                {/* Step 4: Budget Planning */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div>
                      <Label className="text-lg font-semibold text-slate-700 mb-4 block">
                        Set your budget and get cost estimates
                      </Label>
                      <p className="text-gray-600 mb-6">
                        Our AI will use your budget to recommend the best options for your trip
                      </p>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="flex items-center"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  {currentStep < totalSteps ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="flex items-center bg-primary hover:bg-orange-600"
                    >
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleGenerateTrip}
                      disabled={isGenerating}
                      className="bg-success hover:bg-green-700 flex items-center"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Generating Trip...
                        </>
                      ) : (
                        <>
                          <Bot className="w-5 h-5 mr-2" />
                          Generate My Trip
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trip Summary */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Info className="w-5 h-5 mr-2 text-blue-600" />
                  Trip Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Destination:</span>
                    <span className="font-medium">
                      {currentDestination || "Not selected"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Duration:</span>
                    <span className="font-medium">
                      {currentDuration ? DURATIONS.find(d => d.value === currentDuration)?.label : "Not selected"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Travel styles:</span>
                    <span className="font-medium">
                      {selectedStyles.length || "0"} selected
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Group size:</span>
                    <span className="font-medium">{groupSize} people</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Budget:</span>
                    <span className="font-medium">${budget[0].toLocaleString()}</span>
                  </div>
                </div>

                {currentDestination && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">
                      {getSelectedDestination()?.flag} {currentDestination} Highlights
                    </h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      {getSelectedDestination()?.highlights.map((highlight, index) => (
                        <li key={index}>• {highlight}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Budget Estimator - Step 4 */}
            {currentStep === 4 && (
              <BudgetEstimator
                budget={budget}
                onBudgetChange={(value) => {
                  setBudget(value);
                  form.setValue('budget', value[0]);
                }}
                destination={currentDestination}
                duration={currentDuration}
                travelStyle={selectedStyles}
                className="shadow-lg"
              />
            )}

            {/* AI Generated Itinerary */}
            {aiSuggestion && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Bot className="w-5 h-5 mr-2 text-green-600" />
                      Your AI Trip
                    </span>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
                      <TabsTrigger value="tips">Tips</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="overview" className="space-y-4">
                      <div>
                        <h3 className="font-bold text-lg text-slate-700 mb-2">{aiSuggestion.title}</h3>
                        <p className="text-gray-600 text-sm mb-4">{aiSuggestion.description}</p>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="bg-green-50 p-3 rounded-lg">
                            <DollarSign className="w-4 h-4 text-green-600 mb-1" />
                            <div className="font-medium text-green-800">${aiSuggestion.totalEstimatedCost}</div>
                            <div className="text-green-600 text-xs">Total Budget</div>
                          </div>
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <MapPin className="w-4 h-4 text-blue-600 mb-1" />
                            <div className="font-medium text-blue-800">{aiSuggestion.destinations?.length || 0}</div>
                            <div className="text-blue-600 text-xs">Destinations</div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="itinerary" className="space-y-3">
                      {aiSuggestion.destinations?.map((dest: any, index: number) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-medium text-slate-700">{dest.name}</h5>
                            <Badge variant="secondary" className="text-xs">
                              {dest.days} days
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            Budget: ${dest.estimatedCost}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {dest.activities?.slice(0, 3).map((activity: string, i: number) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {activity}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </TabsContent>
                    
                    <TabsContent value="tips" className="space-y-2">
                      {aiSuggestion.recommendations?.map((rec: string, index: number) => (
                        <div key={index} className="flex items-start text-sm">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-600">{rec}</span>
                        </div>
                      ))}
                    </TabsContent>
                  </Tabs>

                  <div className="flex gap-2 mt-6">
                    <Button 
                      onClick={handleSaveTrip}
                      disabled={createTripMutation.isPending}
                      className="flex-1 bg-success hover:bg-green-700"
                      size="sm"
                    >
                      {createTripMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Save Trip
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setAiSuggestion(null)}
                      size="sm"
                    >
                      New Trip
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Generate Loading State */}
            {isGenerating && (
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">Creating Your Trip</h3>
                    <p className="text-gray-600 text-sm">Our AI is analyzing your preferences and crafting the perfect itinerary...</p>
                    <div className="mt-4 space-y-2 text-xs text-gray-500">
                      <div>✓ Analyzing destinations</div>
                      <div>✓ Calculating budgets</div>
                      <div>✓ Finding activities</div>
                      <div className="animate-pulse">⏳ Creating itinerary...</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Help Card */}
            {!aiSuggestion && !isGenerating && (
              <Card className="shadow-lg bg-gradient-to-br from-orange-50 to-blue-50">
                <CardContent className="p-6">
                  <div className="text-center">
                    <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">Need Help?</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Complete all steps to generate your personalized trip itinerary with AI-powered recommendations.
                    </p>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>• Choose from 8 South American countries</div>
                      <div>• Select multiple travel styles</div>
                      <div>• Set your perfect budget</div>
                      <div>• Get instant AI recommendations</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
