# GlobeMate - Global Travel Platform

## Overview
GlobeMate is a full-stack web application designed for global travel planning and community building. It leverages AI to offer personalized trip recommendations, itinerary generation, and expense tracking. The platform integrates advanced AI capabilities with robust social features to simplify travel logistics, fostering a vibrant global travel community. It supports over 70 countries with multilingual support (Hebrew/English) and provides detailed destination data, including climate information.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture
### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with shadcn/ui and Radix UI
- **Routing**: Wouter
- **State Management**: TanStack Query
- **Form Handling**: React Hook Form with Zod
- **UI/UX Decisions**: Consistent use of shadcn/ui components, Tailwind CSS for custom styling, responsive design, and unified interfaces with tabbed navigation. Features a continent-based trip selection system. Visuals include a clean white background, colorful gradient card backgrounds (orange-50 → teal-50 → blue-50), and consistent orange (orange-500) section titles with matching icons.

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js (REST API)
- **Database**: Supabase (PostgreSQL) with Drizzle ORM
- **Authentication**: Google OAuth via Supabase
- **Session Management**: Express sessions with PostgreSQL store
- **Real-time Communication**: WebSocket support

### Python Microservice (GlobeMate Collector)
- **Framework**: FastAPI with Python 3.11
- **Purpose**: Google Places API data collection and processing
- **Location**: `/globemate/` directory

### Database Design
- **ORM**: Drizzle with PostgreSQL
- **Key Tables**: Users, Sessions, Trips, Reviews, Expenses, Chat (rooms & messages), User Connections. Includes detailed tables for destinations, accommodations, attractions, restaurants, location_reviews, location_photos, location_ancestors.

### Core Features & Technical Implementations
- **AI-Powered Trip Planning**: Utilizes OpenAI for personalized trip recommendations, itinerary generation, and an interactive travel assistant, considering traveler composition and trip type. Integrates Google Places API for real-world booking suggestions.
- **Community Features**: Reviews system, user connections, WebSocket-based real-time chat, content sharing, and gamified achievements.
- **Budget Tracking**: Expense categorization, trip association, visual analytics, and multi-currency support with dynamic budget range display.
- **User Onboarding & Personalization**: Multi-step registration to collect user preferences for personalized recommendations.
- **Multi-API Travel Data Integration**: Combines Google Places API for real-time search with a seeded database and TripAdvisor-ready infrastructure.
- **Weather & Travel Timing System**: Real-time weather data (OpenWeather API) and historical climate analysis for "Best Time to Travel" recommendations.
- **Real Places Booking Integration**: Enriches AI-generated suggestions with bookable locations from Google Places API.
- **Destinations Hub**: Comprehensive destination discovery system with search, filters, sorting, and detailed pages including weather cards, attractions, and interactive Google Maps integration. Displays real destinations from Google Places API.
- **Global Expansion & Multilingual Support**: Worldwide destination coverage with full Hebrew/English bilingual support across all features, including instant language toggling and RTL support for content and interactive elements.
- **Support Pages**: Implementation of Help Center, Contact Us, Privacy Policy, Terms of Service, and About Us pages with full translation and RTL support.
- **Optimized Image Loading**: Implemented `OptimizedImage` component with automatic retry, lazy loading, skeleton states, and error handling for all galleries.

## External Dependencies
- **PostgreSQL**: Primary database (managed by Supabase).
- **Supabase**: Backend-as-a-service providing PostgreSQL, Authentication (Google OAuth), and storage.
- **OpenAI API**: For AI trip planning and conversational features.
- **Google Places API**: For real-world location data, booking suggestions, and enriching AI outputs.
- **OpenWeather API**: For real-time weather data and forecasts.
- **drizzle-orm**: ORM for database interaction.
- **@tanstack/react-query**: Server state management.
- **wouter**: Client-side routing.
- **@radix-ui/**: Accessible UI primitives.
- **connect-pg-simple**: PostgreSQL session store.
- **FastAPI**: Python web framework used in the Collector microservice.
- **Uvicorn**: ASGI server.
- **Requests**: HTTP library.
- **Jinja2**: Template engine.
- **SQLAlchemy**: ORM used in Collector microservice.
- **Google Maps JavaScript API**: For interactive maps.