# Development Tools

This document outlines the development tools and utilities used in the AI Feed Consolidator project.

## MCP (Model Context Protocol) Tools

The project uses several MCP tools to enhance the development workflow:

### Browser Tools MCP

We're using [AgentDeskAI/browser-tools-mcp](https://github.com/AgentDeskAI/browser-tools-mcp) for browser integration during development. This tool provides capabilities for:

- Taking screenshots of the application
- Accessing browser console logs and errors
- Monitoring network requests
- Inspecting DOM elements
- Debugging client-side issues

These tools help with rapid debugging and quality assurance during development by providing direct access to browser functionality through the development environment.

### MCP Server Git Tools

For version control and code management, we're using [modelcontextprotocol/servers Git integration](https://github.com/modelcontextprotocol/servers/tree/main/src/git), which provides:

- Git operations from within the development environment
- Status checking for repositories
- Diff viewing for staged and unstaged changes
- Commit and branch management
- Automated logging of code changes

This integration streamlines the version control workflow and makes it easier to track changes without leaving the development environment.

## Docker Development Environment

As detailed in the [Docker Configuration Guide](./docker-setup.md), the project uses Docker for containerization with hot reloading for rapid development:

- Client container with Vite for hot reloading
- Server container with Express/tRPC 
- Volume mounts for code changes
- Special configuration for Firebase integration

## Additional Development Tools

- **TypeScript**: For static type checking
- **ESLint**: For code linting
- **Prisma**: For database schema management and migrations
- **Firebase Emulators**: For local authentication testing 