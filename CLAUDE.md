# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Start development server
yarn dev
# or
npm run dev

# Build for production
yarn build
# or
npm run build

# Run linting
yarn lint
# or
npm run lint

# Start production server
yarn start
# or
npm start

# Database operations (Prisma)
npx prisma generate    # Generate Prisma client
npx prisma db push     # Push schema changes to database
npx prisma studio      # Open Prisma Studio for database management
npx prisma migrate dev # Create and apply migrations in development
```

## Architecture Overview

This is a Next.js 14 AI-powered interview platform with the following key architectural components:

### Tech Stack
- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, shadcn/ui components
- **Backend**: Next.js API routes with Prisma ORM
- **Database**: PostgreSQL (via Prisma)
- **Authentication**: Clerk (organization and user management)
- **AI Integration**: OpenRouter/OpenAI for interview analysis and insights
- **Voice Integration**: Retell SDK for audio interviews
- **Deployment**: Netlify-ready with Docker support

### Core Architecture Patterns

**App Router Structure**: Uses Next.js 14 app directory with route groups:
- `(client)` - Authenticated dashboard routes
- `(user)` - Public interview participation routes
- `api/` - Backend API endpoints

**State Management**: React Context pattern for global state:
- `InterviewContext` - Interview data and CRUD operations
- `InterviewerContext` - AI interviewer management
- `ClientContext` - Client/respondent data
- `ResponseContext` - Interview response handling

**Database Layer**: Prisma ORM with service pattern:
- Services in `src/services/` provide database abstraction
- Database client in `src/lib/db.ts` with singleton pattern
- All services follow consistent error handling and return patterns

**AI Integration**: 
- AI prompts centralized in `src/lib/prompts/`
- Analytics generation, communication analysis, and question generation
- Integration with Retell SDK for voice-based interviews

### Key Components

**Interview Flow**:
1. Create interview via `createInterviewModal.tsx`
2. AI generates questions using `/api/generate-interview-questions`
3. Participants access via shareable links
4. Voice interviews conducted via Retell integration
5. AI analysis generates insights via `/api/generate-insights`

**Data Models** (see `src/types/`):
- `Interview` - Core interview entity with questions, insights, respondents
- `Interviewer` - AI interviewer profiles with specialties
- `Response` - Individual interview responses and analytics

### File Organization

- `src/app/` - Next.js app directory (pages, layouts, API routes)
- `src/components/` - Reusable UI components organized by feature
- `src/services/` - Database service layer with consistent patterns
- `src/contexts/` - React context providers for state management
- `src/types/` - TypeScript type definitions
- `src/lib/` - Utilities, database client, prompts, and shared logic

### Authentication & Organizations

Uses Clerk for authentication with organization support. All interviews and interviewers are scoped to organizations. User access patterns:
- Organization members can view/edit organization interviews
- Individual users can view their personal interviews
- Access control handled via Clerk hooks in contexts

### API Patterns

All API routes follow consistent patterns:
- Error handling with try/catch
- Authentication via Clerk
- Service layer abstraction
- Consistent response formats

Key API endpoints:
- `/api/create-interview` - Interview creation
- `/api/generate-insights` - AI analysis of responses
- `/api/register-call` - Retell integration
- `/api/response-webhook` - Webhook handling

### Styling & UI

- Tailwind CSS for styling
- shadcn/ui component library
- Custom components in `src/components/ui/`
- Responsive design with mobile support
- Consistent theme and color system

## Environment Setup

Required environment variables (see README.md for setup details):
- `DATABASE_URL` - PostgreSQL connection string
- `CLERK_PUBLISHABLE_KEY` & `CLERK_SECRET_KEY` - Clerk authentication
- `OPENROUTER_API_KEY` - OpenRouter API for AI features
- `RETELL_API_KEY` - Retell SDK for voice interviews
- `NEXT_PUBLIC_RETELL_AGENT_ID` - Retell agent configuration

## Database Schema

**Core Models:**
- `User` - User accounts with organization relationships
- `Organization` - Multi-tenant organization support
- `Interview` - Core interview entity with questions, insights, and configuration
- `Response` - Individual interview responses with analytics
- `Interviewer` - AI interviewer profiles with characteristics
- `Feedback` - System feedback collection

**Key Relationships:**
- Users belong to organizations (optional)
- Interviews are scoped to organizations or individual users
- Responses are linked to interviews and users
- All data uses Prisma with PostgreSQL

## Development Patterns

**Service Layer Architecture:**
- All database operations go through services in `src/services/`
- Services provide consistent error handling and return patterns
- Use Prisma client singleton pattern (`src/lib/db.ts`)

**Context Pattern:**
- Global state managed via React contexts
- Each major entity has its own context (interviews, interviewers, clients, responses)
- Contexts handle CRUD operations and provide data to components

**API Route Conventions:**
- All API routes use try/catch error handling
- Authentication via Clerk middleware
- Consistent response formats across endpoints
- Service layer abstraction keeps business logic separate

**AI Integration Points:**
- Prompts centralized in `src/lib/prompts/` directory
- OpenRouter integration for interview analysis and question generation
- Retell SDK integration for voice-based interviews
- Analytics generation uses structured prompts for consistent output
