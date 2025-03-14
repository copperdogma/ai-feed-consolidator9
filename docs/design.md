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
- **Testing**: Vitest and React Testing Library

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
- Utilize structured JSON output for standardized processing and storage
- Implement content type detection with specialized prompting per type
- Include time sensitivity flagging
- Extract background knowledge requirements
- Apply "Answer-Forward Testing" methodology to ensure summaries address obvious follow-up questions

#### Content Analysis
- Extract key topics and entities from content
- Determine time-to-consume estimates based on content type and length
  - Calculate reading time based on word count (250 words per minute standard)
  - Extract video/audio duration for media content
  - Handle mixed content types with composite calculation
- Detect content complexity and flag when content is too complex for brief summary
- Cache analysis results to minimize API costs
- Implement automated quality testing using more capable models to evaluate summaries

#### Summary Response Schema
```typescript
interface SummaryResponse {
  summary: string;                // 1-3 sentences, max 50 words
  content_type: 'technical' | 'news' | 'analysis' | 'tutorial' | 'entertainment';
  time_sensitive: boolean;
  requires_background: string[];  // Required knowledge areas, empty array if none
  consumption_time: {
    minutes: number;              // Time to read/watch/listen (no comprehension time)
    type: 'read' | 'watch' | 'listen' | 'mixed';
  };
}
```

#### Content Type-Specific Prompting
Different content types require tailored prompting strategies:

- **Technical Content**:
  - What new approach/technology is presented?
  - How does it improve on existing solutions?
  - What background knowledge is needed?

- **News Content**:
  - What exactly changed/happened?
  - Who is affected and how?
  - When does it take effect?

- **Analysis Content**:
  - What main argument/conclusion is presented?
  - Based on what evidence?
  - What are the key assumptions?

- **Tutorial Content**:
  - What will the user learn?
  - What prerequisites are needed?
  - What are the practical applications?

- **Entertainment Content**:
  - Format and style (no spoilers)
  - Genre/category
  - Time investment required

#### Time-to-Consume Calculation
Implement specialized calculators for different content types:

- Text content: Word count ÷ average reading speed (250 words/minute)
- Video content: Extract duration from metadata
- Audio content: Extract duration from metadata
- Mixed content: Combine calculations proportionally

#### Answer-Forward Testing
A validation methodology ensuring summaries preemptively answer the obvious follow-up questions they raise:

1. Identify natural questions that arise from the summary
2. Verify the summary includes concise answers to those questions
3. Ensure no critical information is omitted

#### Quality Testing Framework
Implement an automated quality evaluation system:

- Use more capable models (GPT-4) to evaluate summaries produced by faster/cheaper models (GPT-3.5)
- Assess summaries against criteria like completeness, accuracy, and conciseness
- Track metrics like answer completeness, information density, and error rates
- Create a continuous improvement loop by refining prompts based on evaluation results

#### Deep Analysis Integration
The application offers a third level of content analysis through direct ChatGPT integration:

- **Implementation Approach**: 
  ```typescript
  const gptAnalyze = (item: FeedItem) => {
    const prompt = `Analyze ${item.url}

  Please search the web and provide:
  1. Main arguments and key findings
  2. Supporting evidence and data
  3. Context and implications
  4. Notable quotes or statements
  5. Technical details or methodologies
  6. Critical evaluation`;

    const encodedPrompt = encodeURIComponent(prompt);
    const chatGPTUrl = `https://chat.openai.com/?q=${encodedPrompt}`;
    window.open(chatGPTUrl, '_blank');
  };
  ```

- **Three-Tier Analysis System**:
  1. Quick Summary (1-3 sentences): For rapid content evaluation
  2. Detailed Summary: For deeper understanding without leaving the app
  3. gptAnalyze: For comprehensive analysis leveraging ChatGPT's capabilities

- **Content-Type Specific Analysis Prompts**:
  - Technical content: Focus on methodologies, innovations, and implications
  - News content: Emphasize context, stakeholders, and broader impact
  - Analysis content: Focus on arguments, evidence, and alternative perspectives
  - Tutorial content: Highlight methodologies, prerequisites, and applications
  - Entertainment content: Focus on themes, style, and critical reception

- **User Experience Considerations**:
  - Opens in new tab to preserve current application context
  - Zero additional API costs (leverages user's ChatGPT access)
  - Complements internal summary features
  - User-initiated for on-demand deep analysis

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

## Error Handling Framework
The application implements a robust error handling framework to ensure reliability and resilience:

### Error Categorization
- **Network Errors**: Connection issues, timeouts, DNS failures
- **Authentication Errors**: Invalid credentials, expired tokens
- **Authorization Errors**: Insufficient permissions
- **Validation Errors**: Invalid input, schema violations
- **Resource Errors**: Not found, already exists, conflict
- **External Service Errors**: Third-party API failures
- **Internal Errors**: Unexpected application errors

### Error Handling Pattern
The application uses a consistent error handling pattern across all components:

```typescript
async function safeOperation() {
  try {
    // Attempt the operation
    const result = await performOperation();
    
    // Verify result integrity
    if (!result || !result.data) {
      logger.warn('Operation returned incomplete data', { result });
      return getDefaultValue();
    }
    
    return processResult(result);
  } catch (error) {
    // Log detailed error information
    logger.error('Operation failed', { 
      error, 
      operation: 'performOperation',
      context: getCurrentContext()
    });
    
    // Handle specific error types
    if (error instanceof DatabaseError) {
      await reconnectDatabase();
      return getDefaultValue();
    }
    
    // Return sensible default for other errors
    return getDefaultValue();
  }
}
```

### Recovery Strategies
- **Retry with Exponential Backoff**: For transient errors
- **Circuit Breaker Pattern**: For persistent external service failures
- **Graceful Degradation**: Fall back to simpler functionality
- **Default Values**: Return sensible defaults when operations fail
- **User Notification**: Inform users of non-recoverable errors

## Feed Health Monitoring
The application implements comprehensive feed health tracking to ensure reliable content integration:

### Feed Health Interface
```typescript
interface FeedHealth {
  lastCheckAt: Date;
  consecutiveFailures: number;
  lastErrorCategory: string;
  lastErrorDetail: string;
  isPermananentlyInvalid: boolean;
  requiresSpecialHandling: boolean;
  specialHandlerType?: string;
}
```

### Feed Validation Pipeline
The application uses a multi-stage validation pipeline for feed sources:
```
Input Feed URL
↓
DNS Resolution Check
↓
HTTP Status Validation
↓
Content Type Verification
↓
XML/RSS Format Validation
↓
Feed-Specific Handler (if needed)
↓
Content Extraction
```

### Feed Error Categories
- **HTTP Status Errors**: 404 (Not Found), 403 (Forbidden), 410 (Gone)
- **Certificate/SSL Issues**: Invalid certificates, hostname mismatches
- **Feed Format/Parsing Issues**: Invalid XML, unrecognized feed format
- **Duplicate Entry Issues**: Constraint violations
- **Network/Connection Issues**: Timeouts, connection resets
- **XML Parsing Errors**: Invalid characters, malformed structure

### Retry Strategies
- Implement graduated retry intervals based on failure patterns
- Use source-specific handlers for problematic feeds
- Track error patterns for feed categorization
- Auto-disable feeds after persistent failures

## Structured Logging System
The application implements a comprehensive logging strategy for improved observability and debugging:

### Logger Implementation
- Centralized logger configuration in a dedicated module
- Multi-target output (console and file)
- Structured JSON logging with pretty printing for development
- Environment-specific configuration via environment variables

### Logger Configuration
```typescript
{
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    targets: [
      {
        target: 'pino-pretty',  // Console output for development
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname'
        }
      },
      {
        target: 'pino/file',    // File output for persistence
        options: { 
          destination: './logs/app.log',
          mkdir: true
        }
      }
    ]
  }
}
```

### Log Categories
- **Authentication**: Login, logout, session management
- **Database**: Queries, connections, transactions
- **API**: Requests, responses, errors
- **Content**: Feed fetching, processing, summarization
- **System**: Application lifecycle, configuration
- **Error**: Detailed error information

### Log Levels
- **trace**: Detailed debugging information
- **debug**: Debugging information for development
- **info**: General operational information
- **warn**: Warnings and potential issues
- **error**: Error conditions
- **fatal**: Critical errors requiring immediate attention

## Verification Methodologies
The application implements comprehensive verification and testing methodologies:

### Log-Based Verification
- Verify application behavior through log analysis
- Use structured logging for easier debugging
- Include context information in logs for better troubleshooting
- Add debug logs for complex operations

### Multi-Level Testing
- **Unit Tests**: Individual component testing
- **Integration Tests**: Component interaction testing
- **End-to-End Tests**: Complete workflow testing
- **Test both success and failure scenarios**
- **Edge case and boundary condition testing**

### Test Environment Management
- Reset test environment between test runs
- Use proper database cleanup procedures
- Manage test data to avoid test interference
- Environment-specific configuration

### Continuous Verification
- Run tests automatically on code changes
- Monitor application logs in development and production
- Implement health checks for critical components
- Set up alerts for unexpected behavior

### Verification Workflow
```bash
# Clear logs before starting
echo "" > logs/app.log

# Start the application
npm run dev &

# Wait for application to initialize
sleep 5

# Check logs for errors
grep -i error logs/app.log

# Verify expected behavior
grep -i "Server listening" logs/app.log
grep -i "Connected to database" logs/app.log

# Monitor ongoing operations
tail -f logs/app.log
```

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

## Database Configuration

The application uses three different databases for different environments:

- Development: `ai-feed-consolidator-dev` on local PostgreSQL
- Testing: `ai-feed-consolidator-test` on local PostgreSQL
- Production: `ai-feed-consolidator-prod` on local PostgreSQL (or managed service)

All databases use the same schema defined in Prisma but are kept separate to prevent development and testing from affecting production data.

Connection to these databases is configured in the .env files:
- For Docker containers: Using `host.docker.internal` to access the host machine's PostgreSQL
- For local development: Using `localhost` to access PostgreSQL directly

The database schema is managed through Prisma ORM with migrations tracked in the repository.