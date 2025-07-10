import OpenAI from "openai";
import { googlePlaces } from './googlePlaces';

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface RealPlace {
  title: string;
  link?: string;
  source?: "Google" | "GetYourGuide" | "TripAdvisor";
  placeId?: string;
  rating?: number;
  address?: string;
  photoUrl?: string;
}

export interface TripSuggestion {
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

export interface TripItinerary {
  day: number;
  location: string;
  activities: string[];
  estimatedCost: number;
  tips: string[];
}

export interface BudgetOptimization {
  category: string;
  currentSpending: number;
  recommendedBudget: number;
  tips: string[];
  potentialSavings: number;
}

export interface ChatContext {
  userTrips?: any[];
  currentLocation?: string;
  travelPreferences?: any;
  previousSuggestions?: TripSuggestion[];
  chatHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
}

export interface ConversationalResponse {
  type: 'question' | 'suggestions' | 'general';
  message: string;
  suggestions?: TripSuggestion[];
  missingInfo?: string[];
  nextActions?: string[];
}

// Generate personalized travel suggestions for South America based on user preferences
export async function generateTravelSuggestions(
  preferences: {
    travelStyle?: string[];
    budget?: number;
    duration?: string;
    interests?: string[];
    preferredCountries?: string[];
  }
): Promise<TripSuggestion[]> {
  try {
    // Add API key check
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }
    
    console.log('OpenAI API Key exists:', !!process.env.OPENAI_API_KEY);
    console.log('Generating suggestions with preferences:', preferences);
    
    const travelStylesStr = preferences.travelStyle?.join(', ') || 'Flexible';
    const budgetStr = preferences.budget ? `$${preferences.budget}` : 'Flexible';
    const durationStr = preferences.duration || 'Flexible';
    const interestsStr = preferences.interests?.join(', ') || 'General exploration';
    const countriesStr = preferences.preferredCountries?.join(', ') || 'Any South American country';

    const prompt = `ענה תמיד בעברית ברמה גבוהה, בצורה ברורה, מקצועית אך נגישה למטיילים.

אתה TripWise – מתכנן טיולים חכם, ידידותי וחברתי שנבנה למטיילים צעירים ונוסעים סולו.  
המשימה שלך היא לעזור למטיילים לגלות טיולים מותאמים אישית, מרגשים וחסכוניים ברחבי דרום אמריקה.

בהתבסס על ההעדפות הבאות:
- סגנון נסיעה: ${travelStylesStr}
- תקציב: ${budgetStr}
- משך זמן: ${durationStr}
- תחומי עניין: ${interestsStr}
- מדינות מועדפות: ${countriesStr}

ספק 3 הצעות טיול בפורמט JSON.  
כל הצעה צריכה להרגיש מרגשת ומותאמת אישית, לא גנרית.

עבור כל הצעה, כלול:
- destination (שם עיר או אזור בעברית)
- country (שם המדינה בעברית)
- description: סקירה של 2-3 משפטים (מעוררת השראה וברורה בעברית)
- bestTimeToVisit: למשל "אפריל עד יוני"
- estimatedBudget: {low, high} בדולר אמריקאי
- highlights: 3-5 אטרקציות או פעילויות מרכזיות בעברית
- travelStyle: סגנונות רלוונטיים בעברית (למשל הרפתקה, תרבות, הרפיה)
- duration: כמה זמן לשהות (למשל "7-10 ימים")

וודא שההצעות מגוונות - אווירות, מקומות וחוויות שונות. דבר כמו חבר מקומי לטיולים, לא מדריך פורמלי.

Return ONLY a JSON object with this exact structure:
{
  "suggestions": [
    {
      "destination": "string",
      "country": "string",
      "description": "string",
      "bestTimeToVisit": "string",
      "estimatedBudget": {"low": number, "high": number},
      "highlights": ["string", "string", "string"],
      "travelStyle": ["string", "string"],
      "duration": "string"
    }
  ]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "ענה תמיד בעברית ברמה גבוהה, בצורה ברורה, מקצועית אך נגישה למטיילים. אתה TripWise, מתכנן טיולים חכם וידידותי למטיילים צעירים ונוסעים סולו החוקרים את דרום אמריקה. ספק הצעות טיול מרגשות ומותאמות אישית בפורמט JSON. היה אותנטי, מעורר השראה ודבר כמו חבר לטיולים, לא מדריך פורמלי."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    });

    const content = response.choices[0].message.content;
    console.log('OpenAI response content:', content);
    
    if (!content) {
      throw new Error('No content received from OpenAI');
    }
    
    const result = JSON.parse(content);
    console.log('Parsed OpenAI result:', result);
    
    // Handle different response formats
    const suggestions = result.suggestions || result.trips || result;
    let baseSuggestions: TripSuggestion[];
    
    if (Array.isArray(suggestions)) {
      baseSuggestions = suggestions;
    } else if (Array.isArray(result)) {
      baseSuggestions = result;
    } else {
      throw new Error('Invalid response format from OpenAI');
    }
    
    // Enrich suggestions with real places from Google Places API
    console.log('Enriching suggestions with real places...');
    const enrichedSuggestions = await enrichSuggestionsWithRealPlaces(baseSuggestions);
    
    return enrichedSuggestions;
  } catch (error) {
    console.error('Error generating travel suggestions:', error);
    console.error('Error details:', error instanceof Error ? error.message : error);
    throw new Error(`Failed to generate travel suggestions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Generate detailed itinerary for a specific trip
export async function generateItinerary(
  destination: string,
  duration: number,
  budget: number,
  preferences: string[]
): Promise<TripItinerary[]> {
  try {
    const prompt = `ענה תמיד בעברית ברמה גבוהה, בצורה ברורה, מקצועית אך נגישה למטיילים.

צור מסלול מפורט ל-${duration} ימים ב${destination} עם תקציב של $${budget}. 
    
העדפות: ${preferences.join(', ')}

כלול פעילויות יומיות, עלויות מוערכות וטיפים מעשיים. התמקד בחוויות מקומיות אותנטיות ואפשרויות חסכוניות.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "ענה תמיד בעברית ברמה גבוהה, בצורה ברורה, מקצועית אך נגישה למטיילים. אתה מדריך טיולים מקומי בדרום אמריקה. צור מסלולי טיול מפורטים יום אחר יום בפורמט JSON: [{day, location, activities: [], estimatedCost, tips: []}]. כל התוכן צריך להיות בעברית."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.6
    });

    const result = JSON.parse(response.choices[0].message.content || '{"itinerary": []}');
    return result.itinerary || result.days || [];
  } catch (error) {
    console.error('Error generating itinerary:', error);
    throw new Error('Failed to generate itinerary');
  }
}

// Analyze expenses and provide budget optimization suggestions
export async function analyzeBudget(
  expenses: Array<{
    category: string;
    amount: number;
    description: string;
    location?: string;
  }>,
  totalBudget: number
): Promise<BudgetOptimization[]> {
  try {
    const expenseBreakdown = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    const prompt = `ענה תמיד בעברית ברמה גבוהה, בצורה ברורה, מקצועית אך נגישה למטיילים.

נתח את תקציב הנסיעה הזה וספק הצעות אופטימיזציה:

תקציב כולל: $${totalBudget}
סה"כ הוצאה: $${totalSpent}

פירוט הוצאות:
${Object.entries(expenseBreakdown).map(([category, amount]) => `${category}: $${amount}`).join('\n')}

הוצאות אחרונות:
${expenses.slice(-10).map(e => `${e.category}: $${e.amount} - ${e.description}`).join('\n')}

ספק המלצות אופטימיזציה תקציבית לנסיעות בדרום אמריקה, תוך התמקדות בהזדמנויות חיסכון מעשיות.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "ענה תמיד בעברית ברמה גבוהה, בצורה ברורה, מקצועית אך נגישה למטיילים. אתה מומחה לנסיעות חסכוניות בדרום אמריקה. נתח דפוסי הוצאות וספק הצעות אופטימיזציה מעשיות בפורמט JSON: [{category, currentSpending, recommendedBudget, tips: [], potentialSavings}]. כל התוכן צריך להיות בעברית."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.5
    });

    const result = JSON.parse(response.choices[0].message.content || '{"optimizations": []}');
    return result.optimizations || result.suggestions || [];
  } catch (error) {
    console.error('Error analyzing budget:', error);
    throw new Error('Failed to analyze budget');
  }
}

// Generate travel recommendations based on community reviews
export async function generateRecommendations(
  destination: string,
  reviews: Array<{
    rating: number;
    comment: string;
    tags?: string[];
  }>
): Promise<string[]> {
  try {
    const reviewSummary = reviews.map(r => `Rating: ${r.rating}/5 - ${r.comment}`).join('\n');

    const prompt = `ענה תמיד בעברית ברמה גבוהה, בצורה ברורה, מקצועית אך נגישה למטיילים.

בהתבסס על הביקורות הקהילתיות האלה עבור ${destination}, צור 5-7 המלצות טיול מותאמות אישית:

${reviewSummary}

התמקד בטיפים מעשיים, אוצרות נסתרים ועצות שמתייחסות לדאגות נפוצות שמוזכרות בביקורות.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "ענה תמיד בעברית ברמה גבוהה, בצורה ברורה, מקצועית אך נגישה למטיילים. אתה מומחה טיולים מקומי. צור המלצות טיול מעשיות בהתבסס על משובי קהילה. השב עם אובייקט JSON המכיל מערך של מחרוזות המלצה בעברית."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    });

    const result = JSON.parse(response.choices[0].message.content || '{"recommendations": []}');
    return result.recommendations || [];
  } catch (error) {
    console.error('Error generating recommendations:', error);
    throw new Error('Failed to generate recommendations');
  }
}

// Enhanced conversational AI that maintains chat history and generates trip suggestions
export async function conversationalTripAssistant(
  message: string,
  context: ChatContext = {}
): Promise<ConversationalResponse> {
  try {
    const { userTrips = [], travelPreferences, previousSuggestions = [], chatHistory = [] } = context;
    
    // Extract information from chat history
    const chatText = chatHistory.map(h => `${h.role}: ${h.content}`).join('\n');
    const previousDestinations = previousSuggestions.map(s => s.destination).join(', ');
    
    const contextInfo = `
Current context:
- User trips: ${userTrips.length} trips planned
- Previous suggestions: ${previousDestinations || 'None'}
- Travel style: ${travelPreferences?.style || 'Not specified'}
- Chat history length: ${chatHistory.length} messages

Previous conversation:
${chatText}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `ענה תמיד בעברית ברמה גבוהה, בצורה ברורה, מקצועית אך נגישה למטיילים.

אתה TripWise – מתכנן טיולים חכם, ידידותי וחברתי שנבנה למטיילים צעירים ונוסעים סולו.

התפקיד שלך הוא:
1. לספק הצעות טיול מותאמות אישית בהתבסס על העדפות המשתמש.
2. לשמור על המשכיות השיחה ולזכור מה נדון.
3. לייצר הצעות טיול כשיש מספיק מידע.

כאשר אתה מקבל קלט חדש, עשה את הדברים הבאים:
- בדוק אם המשתמש סיפק יעד, תחומי עניין, משך זמן, סגנון נסיעה ותקציב יומי.
- אם משהו חסר, שאל שאלות המשך בטון נינוח ומועיל.
- ברגע שיש לך את כל המידע, ציין שאתה מוכן לייצר הצעות.
- אל תחזור על יעדים מהצעות קודמות: ${previousDestinations}

אם יש לך מספיק מידע לייצר הצעות, השב עם:
"GENERATE_SUGGESTIONS" ואחריו התגובה שלך.

סגנון:
- כתב כמו חבר מקומי ידידותי והרפתקני - לא כמו סוכן נסיעות.
- היה אנרגטי, חיובי וברור.
- שאל שאלה אחת בכל פעם כדי לא להציף את המשתמש.

התמקד בחוויות נסיעה בדרום אמריקה.${contextInfo}`
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 600
    });

    const aiResponse = response.choices[0].message.content || '';
    
    // Check if AI wants to generate suggestions
    if (aiResponse.includes('GENERATE_SUGGESTIONS')) {
      return {
        type: 'suggestions',
        message: aiResponse.replace('GENERATE_SUGGESTIONS', '').trim(),
        suggestions: [],
        nextActions: ['generate', 'modify', 'save']
      };
    }
    
    return {
      type: 'question',
      message: aiResponse,
      missingInfo: []
    };
    
  } catch (error) {
    console.error('Error in conversational trip assistant:', error);
    throw new Error('Failed to get response from travel assistant');
  }
}

// Generate suggestions with conversation context
export async function generateConversationalSuggestions(
  chatHistory: Array<{role: 'user' | 'assistant'; content: string;}>,
  previousSuggestions: TripSuggestion[] = []
): Promise<TripSuggestion[]> {
  try {
    const conversationText = chatHistory.map(h => `${h.role}: ${h.content}`).join('\n');
    const previousDestinations = previousSuggestions.map(s => `${s.destination}, ${s.country}`).join('; ');
    
    const prompt = `ענה תמיד בעברית ברמה גבוהה, בצורה ברורה, מקצועית אך נגישה למטיילים.

אתה TripWise – מתכנן טיולים חכם, ידידותי וחברתי שנבנה למטיילים צעירים ונוסעים סולו.

בהתבסס על השיחה הזו, צור 3 הצעות טיול מרגשות ומותאמות אישית לדרום אמריקה:

שיחה:
${conversationText}

חשוב: אל תציע את היעדים שהוזכרו קודם: ${previousDestinations}

צור 3 הצעות טיול בפורמט JSON. כל הצעה צריכה לכלול:
- destination: עיר או אזור בעברית
- country: מדינה דרום אמריקאית בעברית
- description: 2-3 משפטים מעניינים בעברית
- bestTimeToVisit: למשל "אפריל עד יוני"
- estimatedBudget: {low, high} בדולר אמריקאי
- highlights: 3-5 מקומות או חוויות מרכזיות בעברית
- travelStyle: ["הרפתקה", "רגוע", וכו'] בעברית
- duration: כמה זמן לשהות (למשל "7-10 ימים")

וודא שההצעות מגוונות - אווירות, מקומות וחוויות שונות. דבר כמו חבר מקומי לטיולים, לא מדריך פורמלי.

Return ONLY a JSON object with this exact structure:
{
  "suggestions": [
    {
      "destination": "string",
      "country": "string", 
      "description": "string",
      "bestTimeToVisit": "string",
      "estimatedBudget": {"low": number, "high": number},
      "highlights": ["string"],
      "travelStyle": ["string"],
      "duration": "string"
    }
  ]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "ענה תמיד בעברית ברמה גבוהה, בצורה ברורה, מקצועית אך נגישה למטיילים. אתה TripWise, מתכנן טיולים חכם וידידותי למטיילים צעירים ונוסעים סולו החוקרים את דרום אמריקה. צור הצעות טיול מרגשות ומותאמות אישית בפורמט JSON. היה אותנטי, מעורר השראה ודבר כמו חבר לטיולים."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }
    
    const result = JSON.parse(content);
    const baseSuggestions = result.suggestions || [];
    
    // Enrich suggestions with real places
    if (baseSuggestions.length > 0) {
      console.log('Enriching conversational suggestions with real places...');
      const enrichedSuggestions = await enrichSuggestionsWithRealPlaces(baseSuggestions);
      return enrichedSuggestions;
    }
    
    return baseSuggestions;
    
  } catch (error) {
    console.error('Error generating conversational suggestions:', error);
    throw new Error('Failed to generate trip suggestions');
  }
}

// Legacy chat assistant for backward compatibility  
export async function chatAssistant(
  message: string,
  context?: {
    userTrips?: any[];
    currentLocation?: string;
    travelPreferences?: any;
  }
): Promise<string> {
  try {
    const chatContext: ChatContext = {
      userTrips: context?.userTrips,
      currentLocation: context?.currentLocation,
      travelPreferences: context?.travelPreferences
    };
    
    const response = await conversationalTripAssistant(message, chatContext);
    return response.message;
  } catch (error) {
    console.error('Error in chat assistant:', error);
    throw new Error('Failed to get response from travel assistant');
  }
}

// Enrich trip suggestions with real places from Google Places API
export async function enrichSuggestionsWithRealPlaces(suggestions: TripSuggestion[]): Promise<TripSuggestion[]> {
  try {
    console.log('Enriching suggestions with real places...');
    
    const enrichedSuggestions = await Promise.all(
      suggestions.map(async (suggestion) => {
        const realPlaces: RealPlace[] = [];
        
        // Search for real places for each highlight
        for (const highlight of suggestion.highlights) {
          try {
            console.log(`Searching for: ${highlight} in ${suggestion.destination}, ${suggestion.country}`);
            
            // Search for places using Google Places API
            const searchQuery = `${highlight} ${suggestion.destination} ${suggestion.country}`;
            const places = await googlePlaces.searchPlaces(searchQuery, 'tourist_attraction', `${suggestion.destination}, ${suggestion.country}`);
            
            // Get the top 2-3 most relevant places for this highlight
            const topPlaces = places.slice(0, 3);
            
            for (const place of topPlaces) {
              // Generate Google Maps link
              const googleMapsLink = `https://www.google.com/maps/place/?q=place_id:${place.place_id}`;
              
              // Get photo URL if available
              let photoUrl: string | undefined;
              if (place.photos && place.photos.length > 0) {
                photoUrl = await googlePlaces.getPhotoUrl(place.photos[0].photo_reference, 400);
              }
              
              realPlaces.push({
                title: place.name,
                link: googleMapsLink,
                source: "Google",
                placeId: place.place_id,
                rating: place.rating,
                address: place.formatted_address,
                photoUrl
              });
            }
          } catch (error) {
            console.error(`Error searching for ${highlight}:`, error);
            // Continue with other highlights even if one fails
          }
        }
        
        return {
          ...suggestion,
          realPlaces
        };
      })
    );
    
    console.log('Successfully enriched suggestions with real places');
    return enrichedSuggestions;
    
  } catch (error) {
    console.error('Error enriching suggestions with real places:', error);
    // Return original suggestions if enrichment fails
    return suggestions;
  }
}