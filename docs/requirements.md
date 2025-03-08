# Project Requirements

**START CRITICAL NOTES -- DO NOT REMOVE**
- This document focuses on WHAT the system should do and WHY, not HOW it should be implemented.
- Keep this document formatted according to `requitements-template.md`
- Record every single user-given requirements that get into HOW instead of WHY below in the `Non-Requirements Detail` section.
- Ask the user if they should transition to the next phase if:
    - If we have enought requirements for an MVP.
    - If the user is moving past basic requirements into HOW to achieve the project goals.
- `scratchpad.mdc` will explain which script to run to transition to the next phase.
**END CRITICAL NOTES -- DO NOT REMOVE**

# AI Feed Consolidator Application

## Core Purpose
Create a personal platform for managing and consuming content from various services by integrating with their native flagging systems (bookmarks, watch later, etc.), providing intelligent summaries, and maintaining a unified interface for content review and prioritization. This is primarily designed for personal use, with potential extension to immediate family members.

## Scope Clarification
- Single user focus (personal use)
- Web-first interface for multi-device access
- Streamlined authentication (personal API keys)
- Direct database access (no multi-user concerns)
- Flexible implementation (can be tailored to personal preferences)
- Family sharing as potential future enhancement

## Fundamental Principles
1. **Platform Integration First**
   - Leverage existing platform flags (bookmarks, watch later, saves)
   - Maintain sync with platform status
   - Respect platform limitations and API constraints
   - Enable flagging during normal platform use when possible

2. **Efficient Consumption**
   - Clear, structured summaries
   - Time-to-consume estimates
   - Quick priority management
   - Topic-based organization
   - Easy access to original content

3. **Complete History**
   - Preserve all content and summaries
   - Maintain reading/viewing status
   - Track priority changes
   - Enable efficient historical search

4. **User Agency**
   - Control over prioritization
   - Freedom to use original platforms
   - Choice in consumption method
   - Flexible organization options

## Target Audience
The primary user is the developer themselves, with possible extension to immediate family members in the future. This is a personal-use application designed to solve the problem of managing content across multiple platforms.

## Key Features

### 1. Content Integration
- Connect to multiple content sources:
  - Direct RSS/Atom feeds (primary)
  - YouTube (Watch Later, Playlists)
  - X/Twitter (Bookmarks)
  - Email (Priority Flagging)
  - Slack (Saved Items, Important Messages)
- Maintain local state:
  - Track read/unread status
  - Save items for later
  - Handle offline scenarios
- Email integration:
  - Priority prefix in subject ("**: ")
  - URL extraction
  - Metadata parsing
- Handle authentication securely
  - Use Firebase Authentication for user management
  - Store feed credentials safely
  - Manage API keys for services
  - Encrypt sensitive data

### 2. Content Organization
- Timeline Management:
  - Track content acquisition timestamp
  - Maintain platform original timestamp
  - Track last accessed/viewed date
  - Enable chronological and priority-based sorting
- Summary Generation:
  - Intelligent Content Summarization
  - Direct ChatGPT integration
  - Time-to-consume estimates
- Topic Organization:
  - Automatic topic detection
  - Topic-based grouping
  - Cross-platform topic alignment
  - Default collapsed and expanded topic views

### 3. User Interface
- Content Views:
  - All Content (chronological)
  - High Priority
  - By Topic
  - By Platform
- Content cards with essential information
- Quick actions for content management
- Topic Management tools

### 4. Historical Feed
- Infinite scroll interface
- Performance optimization
- Advanced search/filter
- Export capabilities
- Activity tracking

### 5. Learning System
- Track user behavior
- Improve system over time

## MVP Criteria
1. Core platform integration:
   - YouTube Watch Later
   - X Bookmarks
   - Direct RSS feeds
2. Basic email integration
3. Two-level summary generation
4. Simple priority management
5. Basic topic organization
6. Essential historical feed

## Success Criteria
1. Platform flag sync completed in <30 seconds
2. Summary generation takes <5 seconds
3. Users spend <30 seconds reviewing summaries
4. Two-level summaries capture >90% of key information
5. System maintains responsiveness with 10,000+ items
6. Historical content accessible within 2 clicks
7. Priority management takes <2 clicks
8. Original content accessible within 1 click
9. Summary generation achieves:
   - 90% of readers can decide whether to read full content
   - 80% of readers can accurately explain main points to others
   - 70% of readers need no additional context for basic understanding
   - System recognizes and flags content too complex for brief summary

## Deployment Strategy
- Docker containerization for consistent environment
- Two deployment options:
  1. Local: Docker on Mac Mini home server
  2. Cloud: fly.io using existing account
- Web interface accessible from any device
- Environment variables for configuration
- Volume mounts for persistent storage
- Regular backups to secure location

## Outstanding Questions

### High Priority
- How should we integrate with third-party flagging systems?
  - Context: Need to determine technical approach for personal accounts
  - Related sections: Content Integration
  - Questions:
    - Can we hook into YouTube "Watch Later" API using personal API key?
    - What are the API limitations for personal X account?
  - Status: Needs research

- What should be the format for email-based prioritization?
  - Context: Personal email workflow integration
  - Related sections: Content Integration
  - Questions:
    - What email subject prefix works best for your workflow?
    - How to handle personal email filters/rules?
  - Status: Needs discussion

- How should we handle OpenAI API integration?
  - Context: Using personal OpenAI account
  - Related sections: Intelligent Summaries
  - Questions:
    - Which model best balances cost vs quality for personal use?
    - What's a reasonable monthly API budget?
  - Implementation:
    - Primary: Use GPT-4 for summary generation
    - Fallback: GPT-3.5-turbo for less complex tasks
    - Cache summaries to minimize API costs
  - Status: Partially resolved, needs implementation details

- How should we handle content persistence?
  - Context: Docker volume storage
  - Related sections: Historical Feed
  - Questions:
    - Backup strategy for Docker volumes?
    - Cache storage location?
  - Status: Needs discussion

### Medium Priority
- How should historical content be organized?
  - Context: Need to balance accessibility with performance
  - Related sections: Historical Feed
  - Status: Needs discussion

- What metadata should we store per content item?
  - Context: Affects search and filtering capabilities
  - Status: Needs specification