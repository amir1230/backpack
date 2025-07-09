import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

    const prompt = `You are TripWise – a smart, friendly, and social travel planner built for Gen Z and solo travelers.  
Your mission is to help travelers discover personalized, exciting, and budget-conscious trips across South America.

Using the following preferences:
- Travel Style: ${travelStylesStr}
- Budget: ${budgetStr}
- Duration: ${durationStr}
- Interests: ${interestsStr}
- Preferred Countries: ${countriesStr}

Provide 3 trip suggestions in a JSON format.  
Each suggestion should feel exciting and tailored, not generic.

For each suggestion, include:
- destination (city or region name)
- country
- description: 2–3 sentence overview (inspiring and clear)
- bestTimeToVisit: e.g., "April to June"
- estimatedBudget: {low, high} in USD
- highlights: 3–5 key attractions or activities
- travelStyle: relevant styles (e.g., adventure, culture, relax)
- duration: how long to stay (e.g., "7–10 days")

Make sure the suggestions are diverse — different vibes, locations and experiences. Speak like a local travel buddy, not a formal guide.

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
          content: "You are TripWise, a smart and friendly travel planner for Gen Z and solo travelers exploring South America. Provide exciting, personalized trip suggestions in JSON format. Be authentic, inspiring, and speak like a travel buddy, not a formal guide."
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
    if (Array.isArray(suggestions)) {
      return suggestions;
    } else if (Array.isArray(result)) {
      return result;
    } else {
      throw new Error('Invalid response format from OpenAI');
    }
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
    const prompt = `Create a detailed ${duration}-day itinerary for ${destination} with a budget of $${budget}. 
    
Preferences: ${preferences.join(', ')}

Include daily activities, estimated costs, and practical tips. Focus on authentic local experiences and budget-friendly options.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a local South American travel guide. Create detailed day-by-day itineraries in JSON format: [{day, location, activities: [], estimatedCost, tips: []}]"
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

    const prompt = `Analyze this travel budget and provide optimization suggestions:

Total Budget: $${totalBudget}
Total Spent: $${totalSpent}

Expense Breakdown:
${Object.entries(expenseBreakdown).map(([category, amount]) => `${category}: $${amount}`).join('\n')}

Recent Expenses:
${expenses.slice(-10).map(e => `${e.category}: $${e.amount} - ${e.description}`).join('\n')}

Provide budget optimization recommendations for South American travel, focusing on practical savings opportunities.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a budget travel expert for South America. Analyze spending patterns and provide practical optimization suggestions in JSON format: [{category, currentSpending, recommendedBudget, tips: [], potentialSavings}]"
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

    const prompt = `Based on these community reviews for ${destination}, generate 5-7 personalized travel recommendations:

${reviewSummary}

Focus on practical tips, hidden gems, and advice that addresses common concerns mentioned in the reviews.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a local travel expert. Generate practical travel recommendations based on community feedback. Respond with a JSON object containing an array of recommendation strings."
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

// Chat assistant for travel questions with conversational guidance
export async function chatAssistant(
  message: string,
  context?: {
    userTrips?: any[];
    currentLocation?: string;
    travelPreferences?: any;
  }
): Promise<string> {
  try {
    const contextInfo = context ? `
Current context:
- User trips: ${context.userTrips?.length || 0} trips planned
- Current location: ${context.currentLocation || 'Not specified'}
- Travel style: ${context.travelPreferences?.style || 'Not specified'}
` : '';

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are TripWise – a smart travel assistant that helps build trip plans for young, independent travelers.

When a user gives you incomplete input (like "I want to go to Peru"), respond in a friendly, helpful way to collect missing info.

Ask questions like:
- What's your travel budget per day?
- How long is your trip?
- What do you enjoy most when you travel? (e.g., nature, parties, local food, hiking, yoga)
- Do you prefer to travel solo or with others?
- Are there any countries you definitely want (or don't want) to visit?

Make it short and warm. Use emojis if needed.
Once you have all info – trigger the itinerary or suggestion generator.

Focus on South American travel experiences. Be conversational, helpful, and guide users step-by-step through trip planning.${contextInfo}`
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    return response.choices[0].message.content || 'I apologize, but I couldn\'t process your request. Please try again.';
  } catch (error) {
    console.error('Error in chat assistant:', error);
    throw new Error('Failed to get response from travel assistant');
  }
}