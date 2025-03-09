# Docker Configuration Guide

This document provides details on the Docker configuration used in the AI Feed Consolidator project.

## Overview

The project uses Docker for containerizing the client and server applications, while keeping PostgreSQL running locally on the host machine. This hybrid approach provides consistency for application deployment while allowing flexibility with database management.

## Container Architecture

- **Client container**: React application with Vite for development
- **Server container**: Node.js/Express application with tRPC
- **Database**: PostgreSQL running locally on the host machine

## Hot Reloading Setup

The Docker configuration includes hot reloading for a better development experience:

### Client Container

```dockerfile
FROM node:20
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install
RUN npm install --save firebase

# Copy the tsconfig.json and vite config files
COPY tsconfig.json ./
COPY vite.config.ts ./

# Copy the index.html template
COPY index.html ./

# Create basic src directory structure to avoid errors
RUN mkdir -p src/lib
COPY src/lib/server-types.ts ./src/lib/
COPY src/lib/trpc.ts ./src/lib/

# Create a dummy server directory with a tsconfig.json to prevent errors
RUN mkdir -p /server
RUN echo '{"compilerOptions":{"target":"es2018","module":"commonjs"}}' > /server/tsconfig.json

# The rest of the source code will be mounted as a volume
# in docker-compose.yaml for hot reloading

# Add host flag to vite command for proper hot reloading
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

### Volume Mounts in docker-compose.yaml

```yaml
volumes:
  - ./packages/client:/app
  - /app/node_modules
```

The first volume mount maps the local client directory to the container's /app directory, enabling changes to be immediately reflected. The second volume mount is a special trick to prevent the container's node_modules from being overwritten by the host machine.

### Working with Firebase

Firebase dependencies are installed in both containers, and environment variables for Firebase configuration are passed through docker-compose.yaml:

```yaml
environment:
  # Firebase client environment variables
  - VITE_FIREBASE_API_KEY=${VITE_FIREBASE_API_KEY}
  - VITE_FIREBASE_AUTH_DOMAIN=${VITE_FIREBASE_AUTH_DOMAIN}
  - VITE_FIREBASE_PROJECT_ID=${VITE_FIREBASE_PROJECT_ID}
  # ... more Firebase variables ...
```

### Special Considerations

1. **Dependency Scanning Fix**: The Vite build process in the client container sometimes looks for `/server/tsconfig.json` when scanning for dependencies. We address this by creating a dummy file at that location.

2. **TypeScript Types**: To avoid issues with cross-package dependencies, we use simplified TypeScript types in the client code when referencing server definitions.

3. **Docker Layer Caching**: The Dockerfiles are structured to take advantage of layer caching, with dependencies installed before copying the full source code.

## Running the Containers

```bash
# Start the containers
docker-compose up -d

# Rebuild when Dockerfile or package.json changes
docker-compose down && docker-compose build --no-cache && docker-compose up -d

# View logs
docker-compose logs client
docker-compose logs server
```

## When to Rebuild

You only need to rebuild the Docker containers when:
1. You modify the Dockerfile
2. You add new dependencies to package.json
3. You change configuration files like vite.config.ts

For most development work, hot reloading will automatically detect file changes and update the application. 