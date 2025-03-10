# Development Tools

This document outlines the development tools used in the AI Feed Consolidator project.

## MCP (Model Context Protocol) Tools

### Smithery PostgreSQL MCP Server
- [Smithery PostgreSQL MCP Server](https://smithery.ai/server/@smithery-ai/postgres): Interactive database access for development and debugging
- Used with: `npx -y @smithery/cli@latest run @smithery-ai/postgres --config "{\"databaseUrl\":\"postgresql://admin:password@localhost:5432/ai_feed_consolidator\"}"`

### Browser Tools MCP
- [AgentDeskAI/browser-tools-mcp](https://github.com/AgentDeskAI/browser-tools-mcp): Browser integration for screenshots, console logs, network monitoring, DOM inspection

### Git Tools MCP
- [modelcontextprotocol/servers Git](https://github.com/modelcontextprotocol/servers/tree/main/src/git): Git operations within the development environment

## Docker Development Environment
- Client container (Vite with hot reloading)
- Server container (Express/tRPC)
- Volume mounts for code changes
- Firebase integration

## Core Development Tools
- TypeScript: Static type checking
- ESLint: Code linting
- Prisma: Database schema management
- Firebase Emulators: Local authentication testing 