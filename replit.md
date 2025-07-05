# TripWise - South American Travel Platform

## Overview

TripWise is a comprehensive travel planning and community platform specifically designed for South American travel. The application combines trip planning, budget tracking, community features, and real-time chat functionality to create a complete travel companion for users exploring South America.

## System Architecture

The application follows a modern full-stack architecture with clear separation between frontend and backend concerns:

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Framework**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom design tokens
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: PostgreSQL-backed session store
- **Real-time Communication**: WebSocket server for chat functionality

## Key Components

### Authentication System
- **Provider**: Replit Auth integration using OpenID Connect
- **Session Storage**: PostgreSQL-backed sessions with connect-pg-simple
- **User Management**: Comprehensive user profiles with travel preferences

### Database Schema
- **Users**: Profile information, travel preferences, and authentication data
- **Trips**: Trip planning with destinations, dates, budgets, and privacy settings
- **Reviews**: Community reviews and ratings for destinations
- **Expenses**: Budget tracking with categorized expenses
- **Chat System**: Real-time messaging with chat rooms and message history
- **Connections**: Social networking features for traveler connections

### Trip Planning Features
- **Smart Trip Builder**: Interactive trip planning with destination selection
- **Budget Management**: Comprehensive expense tracking with categories
- **Public/Private Trips**: Flexible privacy controls for trip sharing

### Community Features
- **Destination Reviews**: User-generated content with ratings and comments
- **Traveler Connections**: Social networking for like-minded travelers
- **Real-time Chat**: WebSocket-powered chat rooms for instant communication

### Budget Tracking
- **Expense Categories**: Accommodation, transportation, food, activities, and more
- **Multi-trip Tracking**: Expense management across multiple trips
- **Visual Analytics**: Budget overview and spending patterns

## Data Flow

1. **Authentication Flow**: Users authenticate via Replit Auth, sessions stored in PostgreSQL
2. **Trip Creation**: Interactive form captures trip details, stored with user association
3. **Budget Tracking**: Expenses linked to trips with category-based organization
4. **Community Interaction**: Reviews and connections facilitate user engagement
5. **Real-time Communication**: WebSocket connections enable instant messaging

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection handling
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Accessible UI component primitives
- **wouter**: Lightweight React routing

### Development Tools
- **Vite**: Fast development server and build tool
- **TypeScript**: Type safety across the application
- **Tailwind CSS**: Utility-first styling framework
- **ESBuild**: Fast JavaScript bundling for production

### Authentication & Session
- **openid-client**: OpenID Connect client for Replit Auth
- **passport**: Authentication middleware
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store

## Deployment Strategy

The application is designed for deployment on Replit with the following characteristics:

1. **Development Mode**: Vite dev server with hot module replacement
2. **Production Build**: Optimized client bundle with server-side Express app
3. **Database**: PostgreSQL database with Drizzle migrations
4. **Environment Variables**: Database URL and session secrets required
5. **Static Assets**: Client build served from Express in production

The build process creates both client-side assets and a bundled server application, suitable for single-server deployment scenarios.

## Changelog

```
Changelog:
- July 05, 2025. Initial setup
- July 05, 2025. Added PostgreSQL database integration with Neon
  - Created database tables for all entities (users, trips, reviews, expenses, chat, connections)
  - Updated storage layer from in-memory to PostgreSQL-backed
  - All database operations now use Drizzle ORM with real persistence
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```