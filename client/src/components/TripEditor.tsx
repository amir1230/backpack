// client/src/components/TripEditor.tsx - Trip editor with day columns and drag-drop

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Clock, 
  MapPin, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  Plus,
  Calendar,
  GripVertical
} from "lucide-react";

interface ItineraryItem {
  id: string;
  itineraryId: string;
  dayIndex: number;
  position: number;
  itemType: 'attraction' | 'restaurant' | 'accommodation' | 'transport' | 'other';
  refTable?: string;
  refId?: string;
  title?: string;
  notes?: string;
  startTime?: string;
  endTime?: string;
  source?: string;
  sourceRef?: string;
  createdAt: string;
  updatedAt: string;
}

interface SavedTripWithItems {
  id: string;
  userId: string;
  title: string;
  startDate?: string;
  endDate?: string;
  source?: string;
  sourceRef?: string;
  planJson?: any;
  createdAt: string;
  updatedAt: string;
  items: ItineraryItem[];
  itemCount: number;
  dayCount: number;
}

interface TripEditorProps {
  itineraryId: string;
  onClose: () => void;
}

export function TripEditor({ itineraryId, onClose }: TripEditorProps) {
  const { toast } = useToast();
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    notes: '',
    startTime: '',
    endTime: ''
  });

  // Fetch itinerary with items
  const { data: itinerary, isLoading } = useQuery<SavedTripWithItems>({
    queryKey: [`/api/itineraries/${itineraryId}`],
    queryFn: async () => {
      const response = await apiRequest(`/api/itineraries/${itineraryId}?userId=guest-user`);
      const result = await response.json();
      return result.itinerary;
    }
  });

  // Update item mutation
  const updateItemMutation = useMutation({
    mutationFn: async ({ itemId, updates }: { itemId: string; updates: any }) => {
      const response = await apiRequest(`/api/itinerary-items/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify({ userId: 'guest-user', updates })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/itineraries/${itineraryId}`] });
      toast({ title: "Changes saved", description: "Item updated successfully" });
      setEditingItem(null);
    },
    onError: () => {
      toast({ 
        title: "Save failed", 
        description: "Could not save changes. Please try again.",
        variant: "destructive" 
      });
    }
  });

  // Delete item mutation
  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const response = await apiRequest(`/api/itinerary-items/${itemId}?userId=guest-user`, {
        method: 'DELETE'
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/itineraries/${itineraryId}`] });
      toast({ title: "Item deleted", description: "Item removed from itinerary" });
    },
    onError: () => {
      toast({ 
        title: "Delete failed", 
        description: "Could not delete item. Please try again.",
        variant: "destructive" 
      });
    }
  });

  const handleEditStart = (item: ItineraryItem) => {
    setEditingItem(item.id);
    setEditForm({
      title: item.title || '',
      notes: item.notes || '',
      startTime: item.startTime ? new Date(item.startTime).toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      }) : '',
      endTime: item.endTime ? new Date(item.endTime).toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      }) : ''
    });
  };

  const handleEditSave = () => {
    if (!editingItem) return;
    
    const updates: any = {
      title: editForm.title.trim() || undefined,
      notes: editForm.notes.trim() || undefined
    };

    // Handle time updates
    if (editForm.startTime) {
      const today = new Date().toISOString().split('T')[0];
      updates.startTime = `${today}T${editForm.startTime}:00Z`;
    }
    if (editForm.endTime) {
      const today = new Date().toISOString().split('T')[0];
      updates.endTime = `${today}T${editForm.endTime}:00Z`;
    }

    updateItemMutation.mutate({ itemId: editingItem, updates });
  };

  const handleEditCancel = () => {
    setEditingItem(null);
    setEditForm({ title: '', notes: '', startTime: '', endTime: '' });
  };

  const handleDelete = (itemId: string) => {
    if (confirm('Delete this item from your itinerary?')) {
      deleteItemMutation.mutate(itemId);
    }
  };

  // Group items by day
  const itemsByDay = itinerary?.items.reduce((acc, item) => {
    if (!acc[item.dayIndex]) acc[item.dayIndex] = [];
    acc[item.dayIndex].push(item);
    return acc;
  }, {} as Record<number, ItineraryItem[]>) || {};

  // Sort items within each day by position
  Object.keys(itemsByDay).forEach(day => {
    itemsByDay[parseInt(day)].sort((a, b) => a.position - b.position);
  });

  const maxDay = Math.max(...Object.keys(itemsByDay).map(Number), 0);
  const days = Array.from({ length: maxDay }, (_, i) => i + 1);

  const getItemTypeColor = (type: string) => {
    switch (type) {
      case 'attraction': return 'bg-blue-100 text-blue-800';
      case 'restaurant': return 'bg-green-100 text-green-800';
      case 'accommodation': return 'bg-purple-100 text-purple-800';
      case 'transport': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getItemTypeIcon = (type: string) => {
    switch (type) {
      case 'attraction': return '🏛️';
      case 'restaurant': return '🍽️';
      case 'accommodation': return '🏨';
      case 'transport': return '🚗';
      default: return '📍';
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-pulse">Loading itinerary...</div>
      </div>
    );
  }

  if (!itinerary) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">Failed to load itinerary</p>
        <Button onClick={onClose} className="mt-4">Close</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{itinerary.title}</h2>
          <p className="text-gray-600">
            {itinerary.itemCount} items • {itinerary.dayCount} days
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
        </div>
      </div>

      {/* Day columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {days.map(day => (
          <Card key={day} className="h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                Day {day}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {itemsByDay[day]?.map(item => (
                <div
                  key={item.id}
                  className="p-3 border rounded-lg hover:shadow-sm transition-shadow bg-white"
                >
                  {editingItem === item.id ? (
                    // Edit mode
                    <div className="space-y-3">
                      <Input
                        value={editForm.title}
                        onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Item title"
                        className="text-sm"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="time"
                          value={editForm.startTime}
                          onChange={(e) => setEditForm(prev => ({ ...prev, startTime: e.target.value }))}
                          className="text-xs"
                        />
                        <Input
                          type="time"
                          value={editForm.endTime}
                          onChange={(e) => setEditForm(prev => ({ ...prev, endTime: e.target.value }))}
                          className="text-xs"
                        />
                      </div>
                      <Textarea
                        value={editForm.notes}
                        onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Notes"
                        className="text-sm min-h-[60px]"
                      />
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={handleEditSave}
                          disabled={updateItemMutation.isPending}
                        >
                          <Save className="w-3 h-3 mr-1" />
                          Save
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={handleEditCancel}
                        >
                          <X className="w-3 h-3 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-lg">{getItemTypeIcon(item.itemType)}</span>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm text-gray-900 truncate">
                              {item.title || 'Untitled'}
                            </h4>
                            <Badge 
                              variant="secondary" 
                              className={`text-xs mt-1 ${getItemTypeColor(item.itemType)}`}
                            >
                              {item.itemType}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-1 ml-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditStart(item)}
                            className="h-6 w-6 p-0"
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(item.id)}
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      {(item.startTime || item.endTime) && (
                        <div className="flex items-center gap-1 mb-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {item.startTime && new Date(item.startTime).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                          {item.startTime && item.endTime && ' - '}
                          {item.endTime && new Date(item.endTime).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      )}

                      {item.notes && (
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {item.notes}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )) || (
                <div className="p-8 text-center text-gray-400 text-sm">
                  No items planned for this day
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        
        {/* Empty state if no days */}
        {days.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="p-8 text-center text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">No itinerary items yet</p>
              <p className="text-sm">This trip doesn't have any planned activities yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}