# Scratchpad - Work Phase

Suggested headings: Current Story, Current Task, Plan Checklist, Issues/Blockers, Recently Completed, Decisions Made, Lessons Learned

## Temp TODO:
- [ ] Document we're developing using this: https://github.com/AgentDeskAI/browser-tools-mcp
- [ ] Document we're developing using this (mcp-server-git): https://github.com/modelcontextprotocol/servers/tree/main/src/git


## Current Story
**Story 001: Project Setup and Infrastructure**

This story involves setting up the foundational project structure, Docker configuration, database, development environment, and Firebase Authentication.

## Current Task
Complete the Firebase Authentication UI components to enable user registration and login.

## Plan Checklist
- [x] Initialize Git repository with proper .gitignore
- [x] Create project directory structure (monorepo approach):
  - [x] `packages/client` - React application
  - [x] `packages/server` - Node.js/Express application with tRPC
- [x] Set up Docker and Docker Compose:
  - [x] Create Dockerfile for client
  - [x] Create Dockerfile for server
  - [x] Configure Docker Compose to connect to local PostgreSQL
  - [x] Remove PostgreSQL container from Docker configuration
  - [x] Configure networking to allow Docker containers to access local PostgreSQL
- [x] Set up local PostgreSQL:
  - [x] Install PostgreSQL on host machine (already installed)
  - [x] Configure PostgreSQL to accept connections from Docker
  - [x] Create initial databases for development and testing
- [x] Client application setup:
  - [x] Vite with React and TypeScript is already set up
  - [x] Basic routing is configured
- [x] Server application setup:
  - [x] Node.js with Express and tRPC is configured
  - [x] TypeScript is set up
  - [x] Basic API structure is implemented
- [x] Set up Firebase Authentication (backend):
  - [x] Configure Firebase Admin SDK
  - [x] Set up token verification in server context
- [x] Set up database connection:
  - [x] Connection to local PostgreSQL configured
  - [x] Prisma ORM set up
  - [x] Initial schema created
  - [x] Connection from Docker containers tested
- [x] Configure environment variables:
  - [x] Create .env file
  - [x] Document required environment variables
  - [x] Add Firebase configuration variables
  - [x] Configure database connection variables for local PostgreSQL
- [x] Write documentation:
  - [x] Create comprehensive README.md
  - [x] Document project structure
- [x] Complete Firebase Authentication frontend:
  - [x] Implement login component (SignInButton.tsx)
  - [x] Implement registration component (SignUpButton.tsx)
  - [x] Implement account management (LogoutButton.tsx)
  - [x] Implement authentication state management (useAuth.tsx)
  - [x] Add Google authentication to login and signup forms
  - [x] Test authentication flow
- [x] Story 001 is now complete!

## Issues/Blockers
- None currently

## Recently Completed
- Fixed Docker container configuration for Firebase integration
- Set up mock Firebase credentials for development
- Successfully running both client and server containers
- Fixed Firebase Admin initialization to work in development mode
- Verified that Firebase Authentication UI components are already implemented
- Added Google authentication buttons to both SignInButton and SignUpButton components
- Implemented hot reloading for development with the following improvements:
  - Volume mounts for immediate code changes
  - Preserved node_modules in containers
  - Added host flags for proper external access
  - Created workaround for Vite dependency scanning
  - Documented all Docker configuration details
- Documented Docker configuration in design.md, story files, and a new docker-setup.md
- Created development-tools.md to document the use of:
  - AgentDeskAI/browser-tools-mcp for browser integration
  - modelcontextprotocol/servers Git integration for version control
- Added references to development tools in the README

## Decisions Made
- Using a monorepo structure with client and server packages
- Using tRPC for type-safe API communication instead of REST
- Using Prisma for database access
- Using Firebase for authentication
- Using Docker for containerization of server and client (not database)
- Running PostgreSQL locally on the host machine
- Added Google authentication as an enhancement to the existing authentication UI
- Implemented Docker hot reloading using volume mounts for a better development experience
- Created a dummy tsconfig.json in the server directory to fix Vite dependency scanning issues

## Lessons Learned
- Firebase Admin SDK initialization requires special handling in development mode
- Docker containers need careful configuration to work with Firebase
- Environment variables must be properly passed to Docker containers
- The Evergreen UI library doesn't have a Divider component, but we can simulate one using a Pane with height=1 and appropriate background color
- Vite's dependency scanning can look for tsconfig.json files in unexpected locations, requiring workarounds
- Volume mounts in Docker need special handling for node_modules to prevent conflicts
- Docker layer caching can be optimized by structuring Dockerfiles to install dependencies before copying source code

**Next Steps:**
We have successfully completed Story 001 (Project Setup and Infrastructure) and added Google authentication as an enhancement. The next story to tackle is Story 002 (Local PostgreSQL and Schema Implementation).

Keep this file concise (<300 lines): summarize or remove outdated info regularly to prevent overloading the context. Focus on the current phase and immediate next steps.