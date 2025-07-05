# TripWise - South American Travel Platform

## Overview

TripWise is a full-stack web application focused on South American travel planning and community building. The platform combines AI-powered trip planning, expense tracking, community features, and real-time chat functionality to help travelers explore South America effectively.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management
- **Form Handling**: React Hook Form with Zod validation
- **UI Components**: Radix UI primitives with custom styling

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for REST API
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL store
- **Real-time Communication**: WebSocket support for chat features

### Database Design
- **ORM**: Drizzle with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` for type-safe database operations
- **Key Tables**:
  - Users (mandatory for Replit Auth)
  - Sessions (mandatory for Replit Auth)
  - Trips (user travel plans)
  - Reviews (destination feedback)
  - Expenses (budget tracking)
  - Chat rooms and messages
  - User connections

## Key Components

### Authentication System
- **Provider**: Replit Auth integration
- **Session Storage**: PostgreSQL-backed sessions
- **Authorization**: Route-level protection with middleware
- **User Management**: Automatic user creation and profile management

### Trip Planning Module
- **AI-Powered Suggestions**: Bot-assisted trip recommendations
- **Destination Focus**: South American countries (Peru, Colombia, Bolivia, etc.)
- **Budget Planning**: Integrated expense tracking and budget management
- **Travel Styles**: Customizable preferences (adventure, cultural, budget, luxury)

### Community Features
- **Reviews System**: Destination reviews with ratings
- **User Connections**: Social networking between travelers
- **Real-time Chat**: WebSocket-based chat rooms
- **Content Sharing**: Trip sharing and community engagement

### Budget Tracking
- **Expense Categories**: Accommodation, transport, food, activities, etc.
- **Trip Association**: Expenses linked to specific trips
- **Visual Analytics**: Budget overview and spending insights
- **Multi-currency Support**: Designed for international travel

## Data Flow

1. **Authentication Flow**: User authenticates via Replit Auth → Session created → User profile accessed
2. **Trip Creation**: User inputs preferences → AI suggestions generated → Trip saved to database
3. **Community Interaction**: Users browse content → Leave reviews → Connect with others → Real-time chat
4. **Expense Tracking**: Users log expenses → Associated with trips → Analytics generated

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection for serverless environments
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management
- **wouter**: Lightweight routing
- **@radix-ui/***: Accessible UI primitives

### Development Tools
- **TypeScript**: Type safety across frontend and backend
- **Vite**: Fast development and build tooling
- **Tailwind CSS**: Utility-first styling
- **ESBuild**: Backend bundling for production

### Authentication & Session
- **openid-client**: OpenID Connect implementation
- **passport**: Authentication middleware
- **connect-pg-simple**: PostgreSQL session store

## Deployment Strategy

### Development
- **Server**: Node.js with tsx for TypeScript execution
- **Client**: Vite dev server with HMR
- **Database**: Configured via `DATABASE_URL` environment variable
- **Authentication**: Replit Auth with development domain support

### Production
- **Build Process**: 
  - Frontend: Vite build to `dist/public`
  - Backend: ESBuild bundle to `dist/index.js`
- **Static Assets**: Served from `dist/public`
- **Environment**: Node.js production server
- **Database**: PostgreSQL with connection pooling

### Configuration Requirements
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Session encryption key
- `REPLIT_DOMAINS`: Allowed authentication domains
- `ISSUER_URL`: OIDC issuer URL (defaults to Replit)

## AI Integration

### OpenAI Features
- **Trip Planning**: AI-powered travel suggestions for South American destinations
- **Itinerary Generation**: Detailed day-by-day trip planning with activities and costs
- **Budget Analysis**: Smart expense analysis with optimization recommendations  
- **Travel Assistant**: Interactive chat bot for travel questions and advice
- **Destination Recommendations**: Community-driven suggestions powered by AI

### API Endpoints
- `/api/ai/generate-trip` - Enhanced trip generation with real AI
- `/api/ai/travel-suggestions` - Get personalized destination recommendations
- `/api/ai/itinerary` - Generate detailed itineraries
- `/api/ai/budget-analysis` - Analyze expenses and get savings tips
- `/api/ai/recommendations` - Get destination advice based on reviews
- `/api/ai/chat` - Interactive travel assistant

### Components
- `AiChat` - Standalone AI chat component with quick prompts
- Enhanced trip builder with real OpenAI suggestions
- Budget tracker with AI-powered optimization tips

## Changelog
- July 05, 2025. Initial setup
- July 05, 2025. Added OpenAI API integration with comprehensive AI features

## User Preferences

Preferred communication style: Simple, everyday language.