import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  insertTripSchema,
  insertReviewSchema,
  insertExpenseSchema,
  insertChatMessageSchema,
  insertConnectionSchema,
} from "@shared/schema";
import {
  generateTravelSuggestions,
  generateItinerary,
  analyzeBudget,
  generateRecommendations,
  chatAssistant
} from "./openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Trip routes
  app.get('/api/trips', async (req, res) => {
    try {
      const trips = await storage.getPublicTrips();
      res.json(trips);
    } catch (error) {
      console.error("Error fetching trips:", error);
      res.status(500).json({ message: "Failed to fetch trips" });
    }
  });

  app.get('/api/trips/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const trips = await storage.getUserTrips(userId);
      res.json(trips);
    } catch (error) {
      console.error("Error fetching user trips:", error);
      res.status(500).json({ message: "Failed to fetch user trips" });
    }
  });

  app.post('/api/trips', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tripData = insertTripSchema.parse({ ...req.body, userId });
      const trip = await storage.createTrip(tripData);
      res.status(201).json(trip);
    } catch (error) {
      console.error("Error creating trip:", error);
      res.status(400).json({ message: "Failed to create trip" });
    }
  });

  app.get('/api/trips/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const trip = await storage.getTripById(id);
      if (!trip) {
        return res.status(404).json({ message: "Trip not found" });
      }
      res.json(trip);
    } catch (error) {
      console.error("Error fetching trip:", error);
      res.status(500).json({ message: "Failed to fetch trip" });
    }
  });

  // Review routes
  app.get('/api/reviews', async (req, res) => {
    try {
      const { destination } = req.query;
      if (destination) {
        const reviews = await storage.getReviewsByDestination(destination as string);
        res.json(reviews);
      } else {
        const reviews = await storage.getRecentReviews();
        res.json(reviews);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post('/api/reviews', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reviewData = insertReviewSchema.parse({ ...req.body, userId });
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(400).json({ message: "Failed to create review" });
    }
  });

  // Expense routes
  app.get('/api/expenses/trip/:tripId', isAuthenticated, async (req, res) => {
    try {
      const tripId = parseInt(req.params.tripId);
      const expenses = await storage.getTripExpenses(tripId);
      res.json(expenses);
    } catch (error) {
      console.error("Error fetching trip expenses:", error);
      res.status(500).json({ message: "Failed to fetch trip expenses" });
    }
  });

  app.get('/api/expenses/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const expenses = await storage.getUserExpenses(userId);
      res.json(expenses);
    } catch (error) {
      console.error("Error fetching user expenses:", error);
      res.status(500).json({ message: "Failed to fetch user expenses" });
    }
  });

  app.post('/api/expenses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const expenseData = insertExpenseSchema.parse({ ...req.body, userId });
      const expense = await storage.createExpense(expenseData);
      res.status(201).json(expense);
    } catch (error) {
      console.error("Error creating expense:", error);
      res.status(400).json({ message: "Failed to create expense" });
    }
  });

  // Chat routes
  app.get('/api/chat/rooms', async (req, res) => {
    try {
      const rooms = await storage.getChatRooms();
      res.json(rooms);
    } catch (error) {
      console.error("Error fetching chat rooms:", error);
      res.status(500).json({ message: "Failed to fetch chat rooms" });
    }
  });

  app.get('/api/chat/messages/:roomId', async (req, res) => {
    try {
      const roomId = parseInt(req.params.roomId);
      const messages = await storage.getChatMessages(roomId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  // Connection routes
  app.get('/api/connections', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const connections = await storage.getUserConnections(userId);
      res.json(connections);
    } catch (error) {
      console.error("Error fetching connections:", error);
      res.status(500).json({ message: "Failed to fetch connections" });
    }
  });

  app.post('/api/connections', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const connectionData = insertConnectionSchema.parse({ ...req.body, requesterId: userId });
      const connection = await storage.createConnection(connectionData);
      res.status(201).json(connection);
    } catch (error) {
      console.error("Error creating connection:", error);
      res.status(400).json({ message: "Failed to create connection" });
    }
  });

  app.patch('/api/connections/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const connection = await storage.updateConnectionStatus(id, status);
      res.json(connection);
    } catch (error) {
      console.error("Error updating connection:", error);
      res.status(400).json({ message: "Failed to update connection" });
    }
  });

  // AI-powered trip generation
  app.post('/api/ai/generate-trip', isAuthenticated, async (req: any, res) => {
    try {
      const { destination, duration, budget, travelStyle, interests } = req.body;
      
      const suggestions = await generateTravelSuggestions({
        travelStyle,
        budget,
        duration,
        interests: interests || [],
        preferredCountries: destination ? [destination] : []
      });

      if (suggestions.length > 0) {
        const trip = suggestions[0];
        const response = {
          title: `${trip.destination} Adventure`,
          description: trip.description,
          destinations: [
            {
              name: trip.destination,
              days: duration === "1-2 weeks" ? 10 : 21,
              activities: trip.highlights,
              estimatedCost: trip.estimatedBudget.low
            }
          ],
          totalEstimatedCost: trip.estimatedBudget.high,
          recommendations: trip.highlights
        };
        res.json(response);
      } else {
        throw new Error("No suggestions generated");
      }
    } catch (error) {
      console.error("Error generating trip:", error);
      res.status(500).json({ message: "Failed to generate trip with AI" });
    }
  });

  // AI-powered travel suggestions
  app.post('/api/ai/travel-suggestions', isAuthenticated, async (req, res) => {
    try {
      const { travelStyle, budget, duration, interests, preferredCountries } = req.body;
      const suggestions = await generateTravelSuggestions({
        travelStyle,
        budget,
        duration,
        interests,
        preferredCountries
      });
      res.json(suggestions);
    } catch (error) {
      console.error("Error generating travel suggestions:", error);
      res.status(500).json({ message: "Failed to generate travel suggestions" });
    }
  });

  // AI-powered itinerary generation
  app.post('/api/ai/itinerary', isAuthenticated, async (req, res) => {
    try {
      const { destination, duration, budget, preferences } = req.body;
      const itinerary = await generateItinerary(destination, duration, budget, preferences);
      res.json(itinerary);
    } catch (error) {
      console.error("Error generating itinerary:", error);
      res.status(500).json({ message: "Failed to generate itinerary" });
    }
  });

  // AI-powered budget analysis
  app.post('/api/ai/budget-analysis', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { tripId, totalBudget } = req.body;
      
      let expenses;
      if (tripId) {
        expenses = await storage.getTripExpenses(tripId);
      } else {
        expenses = await storage.getUserExpenses(userId);
      }

      // Transform expenses to match the expected format
      const transformedExpenses = expenses.map(expense => ({
        category: expense.category,
        amount: parseFloat(expense.amount),
        description: expense.description,
        location: expense.location || undefined
      }));

      const analysis = await analyzeBudget(transformedExpenses, totalBudget);
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing budget:", error);
      res.status(500).json({ message: "Failed to analyze budget" });
    }
  });

  // AI-powered recommendations
  app.post('/api/ai/recommendations', async (req, res) => {
    try {
      const { destination } = req.body;
      const reviews = await storage.getReviewsByDestination(destination);
      // Transform reviews to match the expected format
      const transformedReviews = reviews.map(review => ({
        rating: review.rating,
        comment: review.comment,
        tags: Array.isArray(review.tags) ? review.tags : []
      }));
      const recommendations = await generateRecommendations(destination, transformedReviews);
      res.json(recommendations);
    } catch (error) {
      console.error("Error generating recommendations:", error);
      res.status(500).json({ message: "Failed to generate recommendations" });
    }
  });

  // AI chat assistant
  app.post('/api/ai/chat', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { message } = req.body;
      
      // Get user context
      const userTrips = await storage.getUserTrips(userId);
      const context = {
        userTrips,
        currentLocation: req.body.currentLocation,
        travelPreferences: req.body.travelPreferences
      };

      const response = await chatAssistant(message, context);
      res.json({ response });
    } catch (error) {
      console.error("Error in chat assistant:", error);
      res.status(500).json({ message: "Failed to get chat response" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket setup for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket connection');

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'chat_message') {
          // Store message in database
          const messageData = insertChatMessageSchema.parse({
            roomId: message.roomId,
            userId: message.userId,
            message: message.text,
          });
          
          const newMessage = await storage.createChatMessage(messageData);
          
          // Broadcast to all connected clients
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'chat_message',
                data: newMessage
              }));
            }
          });
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });

  return httpServer;
}
