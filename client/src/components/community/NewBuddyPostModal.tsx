import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { useToast } from '../../hooks/use-toast';
import { apiRequest } from '../../lib/queryClient';
import { 
  CalendarIcon, 
  MapPin, 
  Users, 
  DollarSign, 
  X,
  Plus,
  Loader2
} from 'lucide-react';
import { format, addDays } from 'date-fns';

interface NewBuddyPostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SOUTH_AMERICAN_COUNTRIES = [
  'Peru', 'Colombia', 'Bolivia', 'Chile', 'Argentina', 
  'Brazil', 'Ecuador', 'Venezuela', 'Uruguay', 'Paraguay',
  'Guyana', 'Suriname', 'French Guiana'
];

const TRAVEL_STYLES = [
  'backpacking', 'luxury', 'mid-range', 'adventure', 'cultural',
  'relaxed', 'party', 'solo-friendly', 'family', 'photography',
  'nature', 'city', 'beach', 'mountains', 'spiritual'
];

const ACTIVITIES = [
  'hiking', 'trekking', 'climbing', 'surfing', 'diving', 'snorkeling',
  'wildlife watching', 'photography', 'cooking classes', 'language exchange',
  'volunteering', 'festivals', 'nightlife', 'museums', 'architecture',
  'shopping', 'food tours', 'cycling', 'kayaking', 'camping'
];

export function NewBuddyPostModal({ open, onOpenChange }: NewBuddyPostModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    destination: '',
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    groupSize: 2,
    budget: 'mid' as 'low' | 'mid' | 'high',
    travelStyles: [] as string[],
    activities: [] as string[],
    requirements: '',
    contactMethod: '',
    displayName: ''
  });

  const [guestData, setGuestData] = useState({
    displayName: '',
    contactMethod: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createPostMutation = useMutation({
    mutationFn: async (postData: any) => {
      return apiRequest('/api/travel-buddy-posts', {
        method: 'POST',
        body: JSON.stringify(postData)
      });
    },
    onSuccess: () => {
      toast({
        title: "Post created successfully!",
        description: "Your travel buddy post is now live. You'll start receiving responses soon.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/travel-buddy-posts'] });
      onOpenChange(false);
      resetForm();
    },
    onError: (error) => {
      console.error('Failed to create post:', error);
      toast({
        title: "Failed to create post",
        description: "Please check your connection and try again",
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      destination: '',
      startDate: undefined,
      endDate: undefined,
      groupSize: 2,
      budget: 'mid',
      travelStyles: [],
      activities: [],
      requirements: '',
      contactMethod: '',
      displayName: ''
    });
    setGuestData({
      displayName: '',
      contactMethod: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim() || !formData.description.trim() || !formData.destination.trim()) {
      toast({
        title: "Missing required fields",
        description: "Please fill in title, description, and destination",
        variant: "destructive"
      });
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      toast({
        title: "Missing dates",
        description: "Please select both start and end dates",
        variant: "destructive"
      });
      return;
    }

    if (formData.startDate >= formData.endDate) {
      toast({
        title: "Invalid dates",
        description: "End date must be after start date",
        variant: "destructive"
      });
      return;
    }

    // Guest mode validation
    if (!guestData.displayName.trim() || !guestData.contactMethod.trim()) {
      toast({
        title: "Contact information required",
        description: "Please provide your name and contact method so people can reach you",
        variant: "destructive"
      });
      return;
    }

    // Prepare submission data
    const postData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      destination: formData.destination.trim(),
      start_date: formData.startDate.toISOString(),
      end_date: formData.endDate.toISOString(),
      group_size: formData.groupSize,
      budget: formData.budget,
      travel_style: formData.travelStyles,
      activities: formData.activities,
      requirements: formData.requirements.trim() || null,
      contact_info: {
        display_name: guestData.displayName.trim(),
        contact_method: guestData.contactMethod.trim()
      },
      author_name: guestData.displayName.trim() // For guest mode
    };

    createPostMutation.mutate(postData);
  };

  const addTravelStyle = (style: string) => {
    if (!formData.travelStyles.includes(style)) {
      setFormData({
        ...formData,
        travelStyles: [...formData.travelStyles, style]
      });
    }
  };

  const removeTravelStyle = (style: string) => {
    setFormData({
      ...formData,
      travelStyles: formData.travelStyles.filter(s => s !== style)
    });
  };

  const addActivity = (activity: string) => {
    if (!formData.activities.includes(activity)) {
      setFormData({
        ...formData,
        activities: [...formData.activities, activity]
      });
    }
  };

  const removeActivity = (activity: string) => {
    setFormData({
      ...formData,
      activities: formData.activities.filter(a => a !== activity)
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Find Your Travel Buddy</DialogTitle>
          <DialogDescription>
            Create a post to connect with fellow travelers planning similar adventures
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Trip Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Looking for hiking buddies in Patagonia!"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="destination">Destination *</Label>
              <Select 
                value={formData.destination} 
                onValueChange={(value) => setFormData({ ...formData, destination: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a South American destination" />
                </SelectTrigger>
                <SelectContent>
                  {SOUTH_AMERICAN_COUNTRIES.map(country => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe your trip plans, what you're looking for in travel companions, and any important details..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                required
              />
            </div>
          </div>

          {/* Dates and Group Size */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Start Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate ? format(formData.startDate, 'PPP') : 'Pick start date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => setFormData({ ...formData, startDate: date })}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>End Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.endDate ? format(formData.endDate, 'PPP') : 'Pick end date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.endDate}
                    onSelect={(date) => setFormData({ ...formData, endDate: date })}
                    disabled={(date) => 
                      date < (formData.startDate || new Date()) || 
                      date < addDays(new Date(), 1)
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="groupSize">Group Size</Label>
              <Select 
                value={formData.groupSize.toString()} 
                onValueChange={(value) => setFormData({ ...formData, groupSize: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(size => (
                    <SelectItem key={size} value={size.toString()}>{size} people</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Budget */}
          <div>
            <Label>Budget Range</Label>
            <Select 
              value={formData.budget} 
              onValueChange={(value: 'low' | 'mid' | 'high') => setFormData({ ...formData, budget: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">💰 Budget (Under $50/day)</SelectItem>
                <SelectItem value="mid">💰💰 Mid-range ($50-150/day)</SelectItem>
                <SelectItem value="high">💰💰💰 Luxury ($150+/day)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Travel Styles */}
          <div>
            <Label>Travel Style</Label>
            <Select onValueChange={addTravelStyle}>
              <SelectTrigger>
                <SelectValue placeholder="Add travel styles..." />
              </SelectTrigger>
              <SelectContent>
                {TRAVEL_STYLES.filter(style => !formData.travelStyles.includes(style)).map(style => (
                  <SelectItem key={style} value={style}>{style}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formData.travelStyles.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.travelStyles.map(style => (
                  <Badge key={style} variant="secondary" className="gap-1">
                    {style}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => removeTravelStyle(style)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Activities */}
          <div>
            <Label>Planned Activities</Label>
            <Select onValueChange={addActivity}>
              <SelectTrigger>
                <SelectValue placeholder="Add activities..." />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITIES.filter(activity => !formData.activities.includes(activity)).map(activity => (
                  <SelectItem key={activity} value={activity}>{activity}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formData.activities.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.activities.map(activity => (
                  <Badge key={activity} variant="outline" className="gap-1">
                    {activity}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => removeActivity(activity)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Requirements */}
          <div>
            <Label htmlFor="requirements">Special Requirements (Optional)</Label>
            <Textarea
              id="requirements"
              placeholder="e.g., Age range 25-35, non-smokers preferred, experience with hiking required..."
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              rows={2}
            />
          </div>

          {/* Contact Information (Guest Mode) */}
          <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900">Contact Information</h3>
            <p className="text-sm text-blue-700">
              How should interested travelers contact you?
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="displayName">Your Name *</Label>
                <Input
                  id="displayName"
                  placeholder="e.g., Sarah"
                  value={guestData.displayName}
                  onChange={(e) => setGuestData({ ...guestData, displayName: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="contactMethod">Contact Method *</Label>
                <Input
                  id="contactMethod"
                  placeholder="e.g., sarah@email.com or @sarahtravel"
                  value={guestData.contactMethod}
                  onChange={(e) => setGuestData({ ...guestData, contactMethod: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={createPostMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={createPostMutation.isPending}
            >
              {createPostMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Post...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Post
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}