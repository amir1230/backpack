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

// Generate travel suggestions for South America based on preferences
export async function generateTravelSuggestions(
  preferences: {
    travelStyle?: string;
    budget?: number;
    duration?: string;
    interests?: string[];
    preferredCountries?: string[];
  }
): Promise<TripSuggestion[]> {
  try {
    const prompt = `You are a South American travel expert. Generate 3-5 unique travel suggestions based on these preferences:

Travel Style: ${preferences.travelStyle || 'Any'}
Budget: $${preferences.budget || 'Flexible'}
Duration: ${preferences.duration || 'Flexible'}
Interests: ${preferences.interests?.join(', ') || 'General sightseeing'}
Preferred Countries: ${preferences.preferredCountries?.join(', ') || 'Any South American country'}

Focus on authentic, lesser-known destinations alongside popular spots. Include practical budget estimates and highlight unique experiences. Respond with a JSON array of trip suggestions.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert South American travel planner. Provide detailed, practical travel suggestions in JSON format with the structure: [{destination, country, description, bestTimeToVisit, estimatedBudget: {low, high}, highlights: [], travelStyle: [], duration}]"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    });

    const result = JSON.parse(response.choices[0].message.content || '{"suggestions": []}');
    return result.suggestions || result.trips || [];
  } catch (error) {
    console.error('Error generating travel suggestions:', error);
    throw new Error('Failed to generate travel suggestions');
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

// Chat assistant for travel questions
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
          content: `You are TripWise AI, a friendly South American travel assistant. Help users with travel planning, budget advice, destination recommendations, and practical travel tips. Keep responses helpful, concise, and focused on South American travel.${contextInfo}`
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