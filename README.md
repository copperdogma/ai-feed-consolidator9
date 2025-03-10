# AI Feed Consolidator

An AI-powered content aggregator that consolidates, summarizes, and organizes content from various sources including YouTube, X/Twitter, RSS feeds, and email.

## Overview

AI Feed Consolidator is designed to help you manage information overload by:

- **Consolidating content** from multiple platforms into a single, unified feed
- **Summarizing content** using OpenAI's GPT models to provide quick insights
- **Organizing content** by topic, priority, and source
- **Personalizing delivery** based on your preferences and reading patterns

## Features

- **Content Integration**
  - YouTube playlists and Watch Later integration
  - X/Twitter bookmarks integration
  - RSS/Atom feed integration
  - Email integration with priority detection

- **Content Summarization**
  - Two-level summary system (brief overview and detailed summary)
  - Topic detection and categorization
  - Time-to-consume estimates
  - Priority suggestions

- **Content Organization**
  - Timeline-based browsing
  - Topic-based organization
  - Priority-based filtering
  - Cross-platform search

- **User Interface**
  - Responsive design that works across devices
  - Customizable views
  - Dark/light mode support
  - Offline access to previously loaded content

## Technology Stack

- **Frontend**: React with TypeScript, Vite
- **Backend**: Node.js with Express
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Firebase Authentication
- **AI**: OpenAI API (GPT-4 and GPT-3.5-turbo)
- **Deployment**: Docker, fly.io

## Getting Started

### Prerequisites

- Node.js 16+ and Yarn
- Docker and Docker Compose
- Firebase account
- OpenAI API key
- PostgreSQL database (not containerized, running locally)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ai-feed-consolidator.git
cd ai-feed-consolidator
```

2. Copy the .env.example file to .env and update it with your environment variables:
```bash
cp .env.example .env
```

3. Update the following environment variables in the .env file:
   - Database credentials
   - Firebase authentication settings
   - OpenAI API key

4. Create PostgreSQL databases:
```bash
createdb ai_feed_consolidator
createdb ai_feed_test
```

5. Apply database schema:
```bash
cd packages/server
npx prisma db push
```

6. Build and start the containers:
```bash
docker-compose up -d
```

7. Access the application at http://localhost:5173

## Development

### Database Management

- Apply schema changes: `npx prisma db push`
- Generate migrations: `npx prisma migrate dev --name [migration_name]`
- Reset development database: `./scripts/reset-db.sh`

### Docker Commands

- Start containers: `docker-compose up -d`
- View logs: `docker-compose logs client` or `docker-compose logs server`
- Rebuild if needed: `docker-compose down && docker-compose build --no-cache && docker-compose up -d`

## Documentation

For more detailed documentation, see the following:
- [Database Schema](docs/erd-diagram.md)
- [Firebase Authentication](docs/stories/story-001.1-firebase-authentication-implementation.md)
- [Docker Configuration](docs/docker-setup.md)
- [Development Tools](docs/development-tools.md)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
