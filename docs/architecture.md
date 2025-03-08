# Project Architecture

AI Feed Consolidator Application

**Note**: This document details the architectural decisions and setup progress for the project.

---

## Architectural Decisions

### Deployment Strategy
- **Docker Containerization**: Using Docker and Docker Compose for server and client components
- **Local Database**: PostgreSQL running locally on the host machine (not containerized)
- **Dual Deployment Options**:
  - Local: Docker for application, local PostgreSQL for database
  - Cloud: fly.io for application deployment, managed PostgreSQL or external database service
- **Persistent Storage**: Local PostgreSQL data directory with regular backup strategy
- **Starter Repository**: Using jason-greenberg/trpc-express-prisma-react-vite-docker-starter as the foundation with modifications for local database

### Frontend Architecture
- **React with TypeScript**: For type safety and better developer experience
- ~~**Material-UI**: For responsive design across devices~~ (No longer a requirement)
- **UI Library**: Any lightweight UI library can be used as needed
- **React Query**: For efficient data fetching, caching, and state management
- **Vite**: For fast development and optimized production builds
- **Component Architecture**: Reusable components for content cards, views, and actions
- **tRPC to REST Adaptation**: Converting the starter's tRPC implementation to direct REST API endpoints

### Backend Architecture
- **Node.js with Express**: For RESTful API endpoints
- **API-First Design**: Clear separation between frontend and backend
- **Service Layer Pattern**: Separate business logic from API controllers
- **Repository Pattern**: Abstract database access behind repositories
- **Authentication**: Firebase Authentication (replacing JWT in the starter template)
- **Error Handling**: Centralized error handling middleware

### Database Architecture
- **PostgreSQL 16**: Running locally (not in Docker) for reliable relational data storage
- **Prisma ORM**: For type-safe database access and migrations
- **Database Schema**: Normalized schema with proper relationships
- **Custom Port (5433)**: To avoid conflicts with other PostgreSQL instances
- **Environment Configuration**:
  - Development: `ai_feed_consolidator` database on local PostgreSQL instance
  - Testing: `ai_feed_test` database on local PostgreSQL instance
- **Connection**: Application connects to local PostgreSQL from Docker containers

### Integration Architecture
- **Adapter Pattern**: Separate adapters for each platform (YouTube, X, RSS, Email)
- **Polling Mechanism**: Regular checks for new content on integrated platforms
- **Authentication Storage**: Secure storage of API keys and tokens
- **Rate Limiting**: Respect API rate limits for each platform

### AI Processing Architecture
- **OpenAI API Integration**: For content summarization
- **Tiered Model Approach**: 
  - Primary: GPT-4 for high-quality summaries
  - Fallback: GPT-3.5-turbo for less complex tasks
- **Prompt Engineering**: Specialized prompts for effective summaries
- **Caching Strategy**: Redis for caching summaries to reduce API costs

## Setup Progress
- [ ] Initialize project repository and structure
- [x] Set up Docker and Docker Compose configuration
- [x] Configure PostgreSQL database setup
  - [x] Install PostgreSQL (already available locally)
  - [x] Development database
  - [x] Testing database
  - [x] Verify Docker containers can connect to local PostgreSQL
- [ ] Create React frontend with Vite
  - [ ] Install Material-UI and base components
  - [ ] Set up React Query
- [ ] Create Node.js backend with Express
  - [ ] Set up API routes structure
  - [ ] Configure Firebase Authentication
  - [ ] Configure JWT middleware for API authentication
- [ ] Set up Prisma ORM
  - [ ] Define database schema
  - [ ] Create initial migrations
- [ ] Configure environment variables
  - [ ] Development environment
  - [ ] Production environment
- [ ] Implement platform integrations
  - [ ] RSS/Atom feed integration
  - [ ] YouTube API integration
  - [ ] X/Twitter API integration
  - [ ] Email integration
- [ ] Set up OpenAI API integration
  - [ ] Configure API access
  - [ ] Implement summary generation
  - [ ] Set up caching system
- [ ] Configure deployment
  - [ ] Local Docker deployment
  - [ ] fly.io deployment

## Database Schema

### Tables

#### `User`
- `id`: UUID (primary key)
- `email`: String (unique)
- `createdAt`: DateTime
- `updatedAt`: DateTime

#### `Source`
- `id`: UUID (primary key)
- `userId`: UUID (foreign key to User)
- `name`: String
- `type`: Enum (RSS, YouTube, Twitter, Email, Slack)
- `url`: String (optional)
- `credentials`: JSON (encrypted)
- `settings`: JSON
- `lastSyncedAt`: DateTime
- `createdAt`: DateTime
- `updatedAt`: DateTime

#### `Content`
- `id`: UUID (primary key)
- `sourceId`: UUID (foreign key to Source)
- `externalId`: String
- `title`: String
- `originalContent`: Text
- `url`: String
- `author`: String (optional)
- `publishedAt`: DateTime
- `acquiredAt`: DateTime
- `lastAccessedAt`: DateTime (optional)
- `status`: Enum (Unread, Read, Saved)
- `priority`: Enum (High, Medium, Low)
- `estimatedTimeToConsume`: Integer (minutes)
- `metadata`: JSON
- `createdAt`: DateTime
- `updatedAt`: DateTime

#### `Summary`
- `id`: UUID (primary key)
- `contentId`: UUID (foreign key to Content)
- `briefSummary`: Text
- `detailedSummary`: Text
- `model`: String
- `promptVersion`: String
- `generatedAt`: DateTime
- `createdAt`: DateTime
- `updatedAt`: DateTime

#### `Topic`
- `id`: UUID (primary key)
- `userId`: UUID (foreign key to User)
- `name`: String
- `description`: Text (optional)
- `isAutoDetected`: Boolean
- `createdAt`: DateTime
- `updatedAt`: DateTime

#### `ContentTopic`
- `contentId`: UUID (foreign key to Content)
- `topicId`: UUID (foreign key to Topic)
- `score`: Float
- `isManuallyAssigned`: Boolean
- `createdAt`: DateTime
- `updatedAt`: DateTime

#### `Activity`
- `id`: UUID (primary key)
- `userId`: UUID (foreign key to User)
- `contentId`: UUID (foreign key to Content, optional)
- `type`: Enum (View, MarkRead, ChangePriority, etc.)
- `details`: JSON
- `createdAt`: DateTime

## Notes
- The database schema will evolve as implementation progresses
- Security will be prioritized for credential storage using proper encryption
- Database indexes will be optimized based on query patterns during development
- Firebase Authentication will be used for user management and login
- Starter repository (jason-greenberg/trpc-express-prisma-react-vite-docker-starter) was selected for the project foundation
- Material-UI is no longer a requirement for the frontend