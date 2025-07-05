import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import ChatInterface from "@/components/chat-interface";
import { 
  Users, 
  Star, 
  MapPin, 
  Calendar,
  MessageCircle,
  Plus,
  Heart,
  Share2,
  Flag,
  Filter,
  Search,
  Camera,
  Tag,
  TrendingUp,
  Globe,
  UserPlus,
  Award,
  ThumbsUp,
  Eye,
  Clock,
  Navigation
} from "lucide-react";

const reviewSchema = z.object({
  destination: z.string().min(1, "Destination is required"),
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, "Comment must be at least 10 characters"),
  tags: z.array(z.string()).default([]),
  photos: z.array(z.string()).default([]),
});

const POPULAR_DESTINATIONS = [
  "Machu Picchu, Peru",
  "Cartagena, Colombia", 
  "Salar de Uyuni, Bolivia",
  "Torres del Paine, Chile",
  "Rio de Janeiro, Brazil",
  "Buenos Aires, Argentina",
  "Galápagos Islands, Ecuador",
  "Angel Falls, Venezuela"
];

const TRAVEL_TAGS = [
  "Solo Travel", "Backpacking", "Budget Travel", "Luxury", "Adventure", 
  "Cultural", "Nature", "Photography", "Food", "Nightlife", "Beach", 
  "Mountains", "History", "Wildlife", "Family Friendly"
];

type ReviewFormData = z.infer<typeof reviewSchema>;

export default function Community() {
  const [activeTab, setActiveTab] = useState("feed");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showChatInterface, setShowChatInterface] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      destination: "",
      rating: 5,
      comment: "",
      tags: [],
      photos: [],
    },
  });

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ["/api/reviews"]
  });

  const { data: connections = [], isLoading: connectionsLoading } = useQuery({
    queryKey: ["/api/connections"]
  });

  const { data: deals = [], isLoading: dealsLoading } = useQuery({
    queryKey: ["/api/deals"]
  });

  const submitReviewMutation = useMutation({
    mutationFn: async (data: ReviewFormData) => {
      return await apiRequest("/api/reviews", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reviews"] });
      setShowReviewForm(false);
      form.reset();
      toast({
        title: "Success",
        description: "Review posted successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Authentication Required",
          description: "Please log in to post reviews",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to post review",
          variant: "destructive",
        });
      }
    },
  });

  const handleSubmitReview = (data: ReviewFormData) => {
    submitReviewMutation.mutate(data);
  };

  const filteredReviews = reviews.filter((review: any) => {
    const matchesFilter = selectedFilter === "all" || review.tags?.includes(selectedFilter);
    const matchesSearch = searchQuery === "" || 
      review.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (showChatInterface) {
    return <ChatInterface onBack={() => setShowChatInterface(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-700 mb-4 flex items-center justify-center gap-3">
            <Users className="w-10 h-10 text-primary" />
            Travel Community
          </h1>
          <p className="text-lg text-gray-600">Share experiences, get advice, and connect with fellow South American travelers</p>
        </div>

        {/* Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="feed" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Feed
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Reviews
            </TabsTrigger>
            <TabsTrigger value="connections" className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Connections
            </TabsTrigger>
            <TabsTrigger value="deals" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Deals
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Chat
            </TabsTrigger>
          </TabsList>

          {/* Community Feed */}
          <TabsContent value="feed" className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Main Feed */}
              <div className="flex-1 space-y-6">
                {/* Search and Filters */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Search destinations, experiences..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Posts</SelectItem>
                          {TRAVEL_TAGS.map((tag) => (
                            <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Posts Feed */}
                <div className="space-y-6">
                  {filteredReviews.length > 0 ? (
                    filteredReviews.map((review: any) => (
                      <Card key={review.id} className="overflow-hidden">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarImage src={review.user?.profileImageUrl} />
                                <AvatarFallback>
                                  {review.user?.firstName?.[0]}{review.user?.lastName?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-semibold">
                                  {review.user?.firstName} {review.user?.lastName}
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {review.destination}
                                  <Clock className="w-3 h-3 ml-3 mr-1" />
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center">
                              {Array.from({ length: review.rating }).map((_, i) => (
                                <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                              ))}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-gray-800 leading-relaxed">{review.comment}</p>
                          
                          {review.tags && review.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {review.tags.map((tag: string, index: number) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  <Tag className="w-3 h-3 mr-1" />
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-4 border-t">
                            <div className="flex items-center space-x-4">
                              <Button variant="ghost" size="sm">
                                <ThumbsUp className="w-4 h-4 mr-2" />
                                Helpful ({review.helpfulCount || 0})
                              </Button>
                              <Button variant="ghost" size="sm">
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Comment
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Share2 className="w-4 h-4 mr-2" />
                                Share
                              </Button>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Flag className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="text-center py-8">
                        <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-600 mb-2">No Posts Found</h3>
                        <p className="text-gray-500">Be the first to share your travel experience!</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="w-full lg:w-80 space-y-6">
                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Plus className="w-5 h-5 mr-2 text-primary" />
                      Share Your Experience
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
                      <DialogTrigger asChild>
                        <Button className="w-full">
                          <Star className="w-4 h-4 mr-2" />
                          Write a Review
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                    <Button variant="outline" className="w-full" onClick={() => setShowChatInterface(true)}>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Join Chat
                    </Button>
                  </CardContent>
                </Card>

                {/* Popular Destinations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-primary" />
                      Trending Destinations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {POPULAR_DESTINATIONS.slice(0, 6).map((destination, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm">{destination}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {Math.floor(Math.random() * 50) + 10} posts
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Community Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Award className="w-5 h-5 mr-2 text-primary" />
                      Community Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Active Travelers</span>
                      <span className="font-semibold">2,847</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Reviews Posted</span>
                      <span className="font-semibold">12,634</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Countries Covered</span>
                      <span className="font-semibold">13</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Tips Shared</span>
                      <span className="font-semibold">8,921</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Destination Reviews</h2>
              <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Review
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Share Your Travel Experience</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={form.handleSubmit(handleSubmitReview)} className="space-y-6">
                    <div>
                      <Label htmlFor="destination">Destination</Label>
                      <Select onValueChange={(value) => form.setValue("destination", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select destination" />
                        </SelectTrigger>
                        <SelectContent>
                          {POPULAR_DESTINATIONS.map((destination) => (
                            <SelectItem key={destination} value={destination}>
                              {destination}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.destination && (
                        <p className="text-sm text-destructive">{form.formState.errors.destination.message}</p>
                      )}
                    </div>

                    <div>
                      <Label>Rating</Label>
                      <div className="flex items-center space-x-2 mt-2">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            type="button"
                            onClick={() => form.setValue("rating", rating)}
                            className={`p-1 ${form.watch("rating") >= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                          >
                            <Star className="w-6 h-6 fill-current" />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="comment">Your Review</Label>
                      <Textarea
                        id="comment"
                        placeholder="Share your experience, tips, and recommendations..."
                        rows={5}
                        {...form.register("comment")}
                      />
                      {form.formState.errors.comment && (
                        <p className="text-sm text-destructive">{form.formState.errors.comment.message}</p>
                      )}
                    </div>

                    <div>
                      <Label>Tags (Optional)</Label>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {TRAVEL_TAGS.slice(0, 9).map((tag) => (
                          <Button
                            key={tag}
                            type="button"
                            variant={form.watch("tags").includes(tag) ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              const currentTags = form.watch("tags");
                              if (currentTags.includes(tag)) {
                                form.setValue("tags", currentTags.filter(t => t !== tag));
                              } else {
                                form.setValue("tags", [...currentTags, tag]);
                              }
                            }}
                            className="text-xs"
                          >
                            {tag}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button type="submit" disabled={submitReviewMutation.isPending} className="flex-1">
                        {submitReviewMutation.isPending ? "Posting..." : "Post Review"}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowReviewForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review: any) => (
                <Card key={review.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center text-primary">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="font-semibold">{review.destination}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">{review.comment}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Avatar className="w-6 h-6 mr-2">
                          <AvatarImage src={review.user?.profileImageUrl} />
                          <AvatarFallback className="text-xs">
                            {review.user?.firstName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-600">
                          {review.user?.firstName}
                        </span>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Connections Tab */}
          <TabsContent value="connections" className="space-y-6">
            <div className="text-center py-8">
              <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">Connect with Fellow Travelers</h3>
              <p className="text-gray-500">Find travel buddies and build your network.</p>
            </div>
          </TabsContent>

          {/* Deals Tab */}
          <TabsContent value="deals" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dealsLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                deals.map((deal: any) => (
                  <Card key={deal.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="destructive">{deal.discount}% OFF</Badge>
                        <span className="text-sm text-gray-500">
                          {Math.ceil((new Date(deal.validUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days left
                        </span>
                      </div>
                      <CardTitle className="text-lg">{deal.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm mb-4">{deal.description}</p>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <span className="text-xs text-gray-500 line-through">
                            ${deal.originalPrice}
                          </span>
                          <span className="text-lg font-bold text-green-600 ml-2">
                            ${deal.dealPrice}
                          </span>
                        </div>
                        <div className="flex items-center">
                          {Array.from({ length: Math.floor(deal.rating) }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                          ))}
                          <span className="text-xs text-gray-500 ml-1">({deal.rating})</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{deal.provider}</span>
                        <Button size="sm">View Deal</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat" className="space-y-6">
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">Real-time Chat</h3>
              <p className="text-gray-500 mb-4">Connect with travelers in real-time.</p>
              <Button onClick={() => setShowChatInterface(true)}>
                <MessageCircle className="w-4 h-4 mr-2" />
                Open Chat
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}