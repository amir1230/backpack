import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { MapPin, Calendar, DollarSign, Star, Trash2, BookmarkCheck, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Journey {
  id: number;
  title: string;
  description: string;
  destinations: Array<{
    name: string;
    country: string;
    nights: number;
  }>;
  totalNights: number;
  priceMin: number;
  priceMax: number;
  season: string[];
  tags: string[];
  audienceTags: string[];
  rating: number;
  popularity: number;
  heroImage: string;
}

interface SavedJourney {
  id: number;
  userId: string;
  journeyId: number;
  notes?: string;
  createdAt: string;
  journey: Journey;
}

export default function MyJourneysPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'he';
  const { toast } = useToast();

  const { data: savedJourneys = [], isLoading } = useQuery<SavedJourney[]>({
    queryKey: ['/api/saved-journeys'],
  });

  const removeMutation = useMutation({
    mutationFn: async (savedJourneyId: number) => {
      await apiRequest(`/api/saved-journeys/${savedJourneyId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-journeys'] });
      toast({
        title: isRTL ? 'המסע הוסר' : 'Journey Removed',
        description: isRTL ? 'המסע הוסר בהצלחה מהרשימה השמורה שלך' : 'Journey successfully removed from your saved list',
      });
    },
    onError: () => {
      toast({
        title: isRTL ? 'שגיאה' : 'Error',
        description: isRTL ? 'לא ניתן להסיר את המסע' : 'Failed to remove journey',
        variant: 'destructive',
      });
    },
  });

  const formatDestinationChain = (destinations: Journey['destinations']) => {
    const arrow = '←';
    const cities = destinations.map(d => translateCityName(d.name));
    return cities.join(` ${arrow} `);
  };

  const formatPrice = (min: number | string | undefined, max: number | string | undefined) => {
    if (!min || !max) return 'N/A';
    const currency = isRTL ? '₪' : '$';
    const minVal = typeof min === 'string' ? parseFloat(min) : min;
    const maxVal = typeof max === 'string' ? parseFloat(max) : max;
    const minNum = isRTL ? Math.round(minVal * 3.5) : minVal;
    const maxNum = isRTL ? Math.round(maxVal * 3.5) : maxVal;
    return isRTL 
      ? `${currency}${maxNum.toLocaleString('he-IL')} - ${currency}${minNum.toLocaleString('he-IL')}`
      : `${currency}${minNum.toLocaleString('he-IL')} - ${currency}${maxNum.toLocaleString('he-IL')}`;
  };

  const translateTag = (tag: string) => {
    const translations: Record<string, { he: string; en: string }> = {
      nature: { he: 'טבע', en: 'Nature' },
      food: { he: 'אוכל', en: 'Food' },
      culture: { he: 'תרבות', en: 'Culture' },
      nightlife: { he: 'חיי לילה', en: 'Nightlife' },
      adventure: { he: 'הרפתקאות', en: 'Adventure' },
      art: { he: 'אמנות', en: 'Art' },
      '12+': { he: '12+', en: '12+' },
      couple: { he: 'זוגות', en: 'Couple' },
      solo: { he: 'יחידים', en: 'Solo' },
      friends: { he: 'חברים', en: 'Friends' },
      family: { he: 'משפחות', en: 'Family' },
    };
    return translations[tag]?.[isRTL ? 'he' : 'en'] || tag;
  };

  const translateCityName = (cityName: string) => {
    const cityTranslations: Record<string, { he: string; en: string }> = {
      'Tokyo': { he: 'טוקיו', en: 'Tokyo' },
      'Kyoto': { he: 'קיוטו', en: 'Kyoto' },
      'Osaka': { he: 'אוסקה', en: 'Osaka' },
      'Hiroshima': { he: 'הירושימה', en: 'Hiroshima' },
      'Paris': { he: 'פריז', en: 'Paris' },
      'Amsterdam': { he: 'אמסטרדם', en: 'Amsterdam' },
      'Berlin': { he: 'ברלין', en: 'Berlin' },
      'Vienna': { he: 'וינה', en: 'Vienna' },
      'Prague': { he: 'פראג', en: 'Prague' },
      'Barcelona': { he: 'ברצלונה', en: 'Barcelona' },
      'Nice': { he: 'ניס', en: 'Nice' },
      'Rome': { he: 'רומא', en: 'Rome' },
      'Bangkok': { he: 'בנגקוק', en: 'Bangkok' },
      'Chiang Mai': { he: 'צ\'יאנג מאי', en: 'Chiang Mai' },
      'Phuket': { he: 'פוקט', en: 'Phuket' },
      'Bali': { he: 'באלי', en: 'Bali' },
      'Singapore': { he: 'סינגפור', en: 'Singapore' },
      'New York': { he: 'ניו יורק', en: 'New York' },
      'Philadelphia': { he: 'פילדלפיה', en: 'Philadelphia' },
      'Washington DC': { he: 'וושינגטון', en: 'Washington DC' },
      'Boston': { he: 'בוסטון', en: 'Boston' },
    };
    return cityTranslations[cityName]?.[isRTL ? 'he' : 'en'] || cityName;
  };

  const translateJourneyTitle = (title: string) => {
    const titleTranslations: Record<string, { he: string; en: string }> = {
      'Classic Japan Circuit': { he: 'מסע יפן הקלאסי', en: 'Classic Japan Circuit' },
      'European Highlights Tour': { he: 'סיור דגשי אירופה', en: 'European Highlights Tour' },
      'European Capital Tour': { he: 'סיור בירות אירופה', en: 'European Capital Tour' },
      'Southeast Asia Adventure': { he: 'הרפתקה בדרום מזרח אסיה', en: 'Southeast Asia Adventure' },
      'Mediterranean Dream': { he: 'חלום ים תיכוני', en: 'Mediterranean Dream' },
      'East Coast USA Explorer': { he: 'סיור החוף המזרחי של ארה"ב', en: 'East Coast USA Explorer' },
      'Japan Extended Discovery': { he: 'לחקור את יפן המורחבת', en: 'Japan Extended Discovery' },
      'Grand European Journey': { he: 'מסע אירופי גדול', en: 'Grand European Journey' },
      'Southeast Asia Multi-Country': { he: 'הרפתקה בדרום מזרח אסיה (מרובת מדינות)', en: 'Southeast Asia Multi-Country' },
    };
    return titleTranslations[title]?.[isRTL ? 'he' : 'en'] || title;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-teal-50 to-blue-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-80 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-teal-50 to-blue-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className={`mb-12 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
          <div className={`flex items-center gap-3 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg">
              <BookmarkCheck className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                {isRTL ? 'המסעות השמורים שלי' : 'My Saved Journeys'}
              </h1>
              <p className="text-gray-600 mt-1">
                {isRTL ? 'המסעות המתוכננים שלך לחקירה עתידית' : 'Your curated journeys for future exploration'}
              </p>
            </div>
          </div>
          
          {savedJourneys.length > 0 && (
            <p className="text-gray-600 mt-4" dir={isRTL ? 'rtl' : 'ltr'}>
              {isRTL 
                ? `${savedJourneys.length} מסעות שמורים` 
                : `${savedJourneys.length} saved ${savedJourneys.length === 1 ? 'journey' : 'journeys'}`}
            </p>
          )}
        </div>

        {/* Saved Journeys Grid */}
        {savedJourneys.length === 0 ? (
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookmarkCheck className="w-12 h-12 text-orange-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center" dir={isRTL ? 'rtl' : 'ltr'}>
                {isRTL ? 'אין מסעות שמורים עדיין' : 'No Saved Journeys Yet'}
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto text-center" dir={isRTL ? 'rtl' : 'ltr'}>
                {isRTL 
                  ? 'התחל לחקור מסעות מתוכננים ושמור את האהובים עליך לעיון עתידי' 
                  : 'Start exploring our curated journeys and save your favorites for future reference'}
              </p>
              <Link href="/journeys">
                <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg" data-testid="button-explore-journeys">
                  {isRTL ? 'חקור מסעות' : 'Explore Journeys'}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {savedJourneys.map((saved) => (
              <Card
                key={saved.id}
                className={`group overflow-hidden hover:shadow-2xl transition-all duration-300 border-0 bg-white shadow-lg ${isRTL ? 'border-r-4 border-r-orange-500' : 'border-l-4 border-l-orange-500'}`}
                data-testid={`card-saved-journey-${saved.id}`}
              >
                <CardContent className="p-6">
                  <div className={`flex flex-col gap-4 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                    {/* Header with title and price */}
                    <div className={`flex items-start justify-between gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className="flex-1">
                        <Link href={`/journey/${saved.journeyId}`}>
                          <h3 
                            className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-orange-500 transition-colors cursor-pointer"
                            data-testid={`text-journey-title-${saved.id}`}
                          >
                            {translateJourneyTitle(saved.journey.title)}
                          </h3>
                        </Link>
                        <div className={`flex items-center gap-2 text-gray-600 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <MapPin className="w-4 h-4 flex-shrink-0 text-orange-500" />
                          <span className="line-clamp-1">{formatDestinationChain(saved.journey.destinations)}</span>
                        </div>
                      </div>
                      <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0 shadow-lg text-base px-4 py-2 whitespace-nowrap">
                        {formatPrice(saved.journey.priceMin, saved.journey.priceMax)}
                      </Badge>
                    </div>

                    {/* Description */}
                    {saved.journey.description && (
                      <p className="text-gray-600 leading-relaxed">
                        {saved.journey.description}
                      </p>
                    )}

                    {/* Info Cards Grid */}
                    <div className={`grid grid-cols-3 gap-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className={`flex flex-col gap-2 ${isRTL ? 'items-end' : 'items-start'}`}>
                          <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <Calendar className="w-5 h-5 text-blue-600" />
                            <span className="font-semibold text-blue-800 text-sm">
                              {isRTL ? 'משך הטיול' : 'Duration'}
                            </span>
                          </div>
                          <p className="text-blue-700 font-medium">
                            {saved.journey.totalNights} {isRTL ? 'לילות' : 'nights'}
                          </p>
                        </div>
                      </div>

                      <div className="bg-orange-50 p-4 rounded-lg">
                        <div className={`flex flex-col gap-2 ${isRTL ? 'items-end' : 'items-start'}`}>
                          <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <Star className="w-5 h-5 text-orange-600 fill-orange-500" />
                            <span className="font-semibold text-orange-800 text-sm">
                              {isRTL ? 'דירוג' : 'Rating'}
                            </span>
                          </div>
                          <p className="text-orange-700 font-medium">
                            {saved.journey.rating ? Number(saved.journey.rating).toFixed(1) : '5.0'} / 5.0
                          </p>
                        </div>
                      </div>

                      <div className="bg-teal-50 p-4 rounded-lg">
                        <div className={`flex flex-col gap-2 ${isRTL ? 'items-end' : 'items-start'}`}>
                          <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <MapPin className="w-5 h-5 text-teal-600" />
                            <span className="font-semibold text-teal-800 text-sm">
                              {isRTL ? 'יעדים' : 'Destinations'}
                            </span>
                          </div>
                          <p className="text-teal-700 font-medium">
                            {saved.journey.destinations.length} {isRTL ? 'ערים' : 'cities'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Tags - Content and Audience */}
                    {((saved.journey.tags && saved.journey.tags.length > 0) || (saved.journey.audienceTags && saved.journey.audienceTags.length > 0)) && (
                      <div className="space-y-2">
                        {saved.journey.tags && saved.journey.tags.length > 0 && (
                          <div className={`flex flex-wrap gap-2 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                            {saved.journey.tags.map((tag) => (
                              <Badge key={tag} className="bg-gradient-to-r from-orange-100 to-teal-100 text-gray-800 border-0">
                                {translateTag(tag)}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {saved.journey.audienceTags && saved.journey.audienceTags.length > 0 && (
                          <div className={`flex flex-wrap gap-2 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                            {saved.journey.audienceTags.map((tag) => (
                              <Badge key={tag} variant="outline" className="border-orange-500 text-orange-600">
                                {translateTag(tag)}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className={`flex gap-3 pt-4 border-t ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Link href={`/journey/${saved.journeyId}`} className="flex-1">
                        <Button 
                          className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md"
                          data-testid={`button-view-journey-${saved.id}`}
                        >
                          <ExternalLink className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                          {isRTL ? 'צפה' : 'View'}
                        </Button>
                      </Link>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="border-red-200 hover:bg-red-50 hover:border-red-300 text-red-600"
                            data-testid={`button-remove-journey-${saved.id}`}
                          >
                            <Trash2 className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                            {isRTL ? 'מחק' : 'Remove'}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent dir={isRTL ? 'rtl' : 'ltr'}>
                          <AlertDialogHeader>
                            <AlertDialogTitle className={isRTL ? 'text-right' : 'text-left'}>
                              {isRTL ? 'האם אתה בטוח?' : 'Are you sure?'}
                            </AlertDialogTitle>
                            <AlertDialogDescription className={isRTL ? 'text-right' : 'text-left'}>
                              {isRTL 
                                ? 'פעולה זו תסיר את המסע מהרשימה השמורה שלך. אתה תמיד יכול לשמור אותו שוב מעמוד המסעות.' 
                                : 'This will remove the journey from your saved list. You can always save it again from the journeys page.'}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className={isRTL ? 'flex-row-reverse' : ''}>
                            <AlertDialogCancel data-testid="button-cancel-remove">
                              {isRTL ? 'ביטול' : 'Cancel'}
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => removeMutation.mutate(saved.id)}
                              className="bg-red-500 hover:bg-red-600"
                              data-testid="button-confirm-remove"
                            >
                              {isRTL ? 'הסר' : 'Remove'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
