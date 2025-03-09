# Project Design

AI Feed Consolidator Application

**Note**: This document outlines the technical design and implementation details (HOW), based on the requirements in `requirements.md`.

---

## Architecture Overview
The AI Feed Consolidator will use a modern web application architecture with a clear separation of concerns:

1. **Frontend Layer**: A responsive web interface that works across devices
2. **Backend Service Layer**: API services for content management, integration, and summarization
3. **Data Layer**: PostgreSQL database for persistent storage
4. **Integration Layer**: Adapters to connect with external services (YouTube, X, RSS, email)
5. **AI Processing Layer**: Integration with OpenAI for content summarization

This architecture allows for a Docker-based deployment (either locally or on fly.io) while maintaining flexibility for future enhancements.

## Technology Stack

### Frontend
- **Framework**: React with TypeScript
- ~~**UI Library**: Material-UI (MUI) for responsive components~~ (No longer a requirement)
- **UI Approach**: Lightweight, responsive components without specific library dependency
- **State Management**: React Query for API data fetching and caching
- **Build Tool**: Vite for fast development experience
- **Testing**: Jest and React Testing Library

### Backend
- **Framework**: Node.js with Express
- **API Style**: RESTful for content management (adapted from tRPC in the starter)
- **Authentication**: Firebase Authentication (replacing JWT in the starter template)
- **API Integration**: Platform-specific SDKs and OAuth where applicable
- **Validation**: Zod for type validation

### Database
- **Database**: PostgreSQL 16 (running locally, not in Docker)
- **ORM**: Prisma for type-safe database access
- **Migration**: Prisma Migrate for schema versioning
- **Connection**: Direct connection to local PostgreSQL from Dockerized application

### AI Integration
- **Service**: OpenAI API
- **Models**: GPT-4 (primary) and GPT-3.5-turbo (fallback)
- **Caching**: Redis for summary caching to reduce API costs

### Deployment
- **Containerization**: Docker and Docker Compose (for server and client only)
- **Local Database**: PostgreSQL running natively on the host machine
- **Starter Template**: jason-greenberg/trpc-express-prisma-react-vite-docker-starter (modified for local database)
- **Production**: fly.io for cloud hosting with external database
- **Local**: Mac Mini home server option
- **Environment**: .env files for configuration
- **Persistence**: Local database files for data storage
- **Backup**: Scheduled database exports

## Feature Implementations

### Feature: Content Integration
**Related Requirement**: Content Integration in requirements.md

#### RSS/Atom Feed Integration
- Use RSS parser libraries to fetch and parse feeds
- Store feed metadata and content in the database
- Implement polling mechanism with configurable intervals
- Track read/unread status for each item

#### YouTube Integration
- Integrate with YouTube Data API v3
- Authenticate with personal API key
- Fetch Watch Later playlist and other user playlists
- Store video metadata (title, description, duration, etc.)

#### X/Twitter Integration
- Implement X API v2 integration
- Authenticate with personal access token
- Fetch bookmarked tweets
- Store tweet content and metadata

#### Email Integration
- Implement IMAP/POP3 client for email fetching
- Parse emails with priority prefix in subject ("**: ")
- Extract URLs and content from email body
- Flag high-priority items based on subject prefix

### Feature: Content Summarization
**Related Requirement**: Summary Generation in requirements.md

#### Intelligent Summarization
- Implement OpenAI API integration with GPT-4
- Create prompt templates for effective summary generation
- Implement two-level summary system:
  - Brief 1-3 sentence overview for quick scanning
  - Detailed summary for deeper understanding
- Store summaries in database to avoid regeneration
- Implement fallback to GPT-3.5-turbo for cost optimization

#### Content Analysis
- Extract key topics and entities from content
- Determine time-to-consume estimates based on content type and length
- Detect content complexity and flag when content is too complex for brief summary
- Cache analysis results to minimize API costs

### Feature: Content Organization
**Related Requirement**: Content Organization in requirements.md

#### Topic Detection and Management
- Implement ML-based topic clustering
- Allow manual topic adjustment
- Store topic relationships in database
- Implement topic merging/splitting functionality

#### Priority Management
- Create priority levels (High, Medium, Low)
- Store priority metadata
- Implement rules engine for automatic prioritization based on sources
- Allow manual priority overrides

#### Timeline Management
- Track all relevant timestamps (creation, acquisition, read/view)
- Implement sorting options (chronological, priority, topic)
- Create indexes for efficient timeline queries

### Feature: User Interface
**Related Requirement**: User Interface in requirements.md

#### Responsive Web Design
- Implement Material-UI components for cross-device compatibility
- Create responsive layouts for desktop, tablet, and mobile
- Optimize for touch interfaces

#### Content Views
- Implement multiple view options (All, High Priority, By Topic, By Platform)
- Create reusable card components for content display
- Implement infinite scroll for efficient loading
- Create detailed view for individual content items

#### User Actions
- Implement quick action buttons on content cards
- Create intuitive navigation between views
- Implement keyboard shortcuts for power users

### Feature: Historical Feed and Search
**Related Requirement**: Historical Feed in requirements.md

#### Historical Data Management
- Implement data retention policies
- Create efficient database indexes for historical queries
- Implement data archiving for older content

#### Search and Filter
- Implement full-text search using PostgreSQL features
- Create filter options for various metadata fields
- Implement saved searches/filters
- Optimize query performance for large datasets

#### Export Capabilities
- Create export formats (CSV, JSON)
- Implement selective export (by topic, date range, etc.)
- Add scheduled export option for backup purposes

## Performance Considerations
- Use pagination and infinite scroll to handle large content lists
- Implement database indexes for common query patterns
- Cache summaries and analysis results
- Use React Query for frontend data caching
- Optimize image loading with lazy loading techniques

## Security Considerations
- Use Firebase Authentication for user management and authentication
- Store API keys and credentials securely using environment variables
- Implement JWT for backend API authentication
- Encrypt sensitive data in the database
- Set up proper CORS policies
- Implement rate limiting for API endpoints

## Project Structure

The project uses a monorepo approach, with the following structure:

- `packages/client`: React application built with Vite
- `packages/server`: Node.js/Express application using tRPC
- `docs`: Project documentation
- `scripts`: Utility scripts for development and deployment

### Docker Configuration

Docker is used for containerization of both client and server applications, with the following considerations:

- PostgreSQL runs locally on the host machine, not in a container
- Docker containers are configured to connect to the local PostgreSQL instance
- Firebase dependencies are included in both client and server Dockerfiles
- Volume mounts are configured for hot reloading during development
- Environment variables for Firebase and other services are passed through docker-compose.yaml

#### Hot Reloading Implementation

The project uses a robust hot reloading setup to improve developer experience:

1. **Volume Mounts**: Source code directories are mounted into the containers, allowing changes to be immediately reflected:
   ```yaml
   volumes:
     - ./packages/client:/app
     - /app/node_modules
   ```

2. **Node Modules Preservation**: A special volume mount for node_modules prevents host files from overwriting container dependencies.

3. **Vite Configuration**: The client's Vite development server is configured with the `--host 0.0.0.0` flag to enable connections from outside the container.

4. **Docker Optimizations**:
   - Package.json files are copied and dependencies installed before copying the rest of the source code
   - This leverages Docker's layer caching for faster rebuilds
   - A special workaround for server dependencies involves creating a dummy tsconfig.json to prevent Vite build errors

5. **Environment Variable Passing**: Environment variables from .env files are passed to containers for configuration.

This setup allows developers to make changes to the code on their local machine and see those changes immediately reflected in the running application, without requiring container rebuilds for most code changes.

### Root Structure
```
ai-feed-consolidator/
├── .env                    # Environment variables
├── .gitignore              # Git ignore file
├── docker-compose.yaml     # Docker Compose configuration
├── package.json            # Root package.json for workspace configuration
├── README.md               # Project documentation
├── packages/               # Workspace packages
│   ├── client/             # Frontend React application
│   └── server/             # Backend Express application
└── scripts/                # Utility scripts
```

### Client Structure
```
packages/client/
├── Dockerfile.client       # Docker configuration for client
├── index.html              # HTML entry point
├── package.json            # Client dependencies
├── public/                 # Static assets
├── src/                    # Source code
│   ├── assets/             # Images, fonts, etc.
│   ├── components/         # Reusable UI components
│   ├── lib/                # Utility functions and libraries
│   ├── views/              # Page components
│   ├── App.tsx             # Main application component
│   └── main.tsx            # Application entry point
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite configuration
```

### Server Structure
```
packages/server/
├── Dockerfile.server       # Docker configuration for server
├── package.json            # Server dependencies
├── prisma/                 # Prisma ORM configuration
│   └── schema.prisma       # Database schema
├── src/                    # Source code
│   ├── lib/                # Utility functions and libraries
│   ├── router/             # API route definitions
│   ├── sdks/               # External service integrations
│   ├── trpc/               # tRPC configuration and models
│   ├── types/              # TypeScript type definitions
│   └── main.ts             # Server entry point
└── tsconfig.json           # TypeScript configuration
```

### Planned Modifications

The following modifications will be made to the starter template to meet our requirements:

1. **Authentication**:
   - Replace JWT authentication with Firebase Authentication
   - Update auth-related components in both client and server

2. **API Integration**:
   - Add platform-specific adapters for YouTube, X/Twitter, RSS, and Email
   - Implement in the server/src/sdks directory

3. **AI Integration**:
   - Add OpenAI API client in server/src/sdks
   - Implement content summarization and topic detection services

4. **Database Schema**:
   - Extend the Prisma schema to support our content model
   - Add tables for sources, content, summaries, and topics

5. **UI Components**:
   - Create feed display components
   - Implement filtering and search functionality
   - Add content detail views

These modifications will transform the starter template into a fully-functional AI Feed Consolidator application that meets all the requirements specified in the project documentation.

## Authentication

Authentication is handled using Firebase Authentication, with the following features:

- Email/password authentication
- Google authentication
- JWT tokens for API authentication
- Firebase Admin SDK for token verification on the server

### Authentication Flow

1. Users register or sign in using email/password or Google authentication
2. Firebase issues a JWT token
3. The token is passed to the server with each API request
4. The server verifies the token using Firebase Admin SDK
5. Resources are only accessible to authenticated users