# Entity-Relationship Diagram (ERD)

This document contains the Entity-Relationship Diagram for the AI Feed Consolidator database schema.

## Database Schema Overview

The AI Feed Consolidator uses a PostgreSQL database with the following structure:

```mermaid
erDiagram
    User ||--o{ Password : has
    User ||--o{ Source : owns
    User ||--o{ Activity : performs
    Source ||--o{ Content : contains
    Content ||--o{ Activity : generates
    Content ||--o| Summary : has
    Content }o--o{ Topic : "categorized by"
    ContentTopic }|--|| Content : for
    ContentTopic }|--|| Topic : with

    User {
        string id PK "UUID"
        string email "Unique"
        string name "Optional"
        string firebaseUid "Unique"
        string avatar "Optional"
        boolean isActive "Default: true"
        datetime createdAt "Auto"
        datetime updatedAt "Auto"
    }

    Password {
        string hash
        string userId FK,PK
    }

    Source {
        string id PK "UUID"
        string name
        string url
        enum sourceType "RSS, YOUTUBE, TWITTER, EMAIL"
        string userId FK
        string icon "Optional"
        boolean isActive "Default: true"
        int refreshRate "Default: 60 min"
        datetime lastFetched "Optional"
        json settings "Optional"
        datetime createdAt "Auto"
        datetime updatedAt "Auto"
    }

    Content {
        string id PK "UUID"
        string title
        string url "Optional"
        string contentText "Optional"
        string contentHtml "Optional"
        string sourceId FK
        string author "Optional"
        datetime publishedAt
        enum status "Default: UNREAD"
        enum priority "Default: MEDIUM"
        json metadata "Optional"
        boolean isDeleted "Default: false"
        datetime createdAt "Auto"
        datetime updatedAt "Auto"
    }

    Summary {
        string id PK "UUID"
        string contentId FK "Unique"
        string summaryText
        datetime createdAt "Auto"
        datetime updatedAt "Auto"
    }

    Topic {
        string id PK "UUID"
        string name "Unique"
        string description "Optional"
        datetime createdAt "Auto"
        datetime updatedAt "Auto"
    }

    ContentTopic {
        string contentId FK,PK
        string topicId FK,PK
        datetime assignedAt "Auto"
    }

    Activity {
        string id PK "UUID"
        string userId FK
        string contentId FK "Optional"
        string action
        json details "Optional"
        datetime createdAt "Auto"
    }

    Todo {
        string id PK
        string title
        boolean isCompleted "Default: false"
        datetime createdAt "Auto"
        datetime updatedAt "Auto"
    }
```

## Enum Types

### SourceType
- `RSS`: RSS and Atom feed sources
- `YOUTUBE`: YouTube platform sources (Watch Later, playlists)
- `TWITTER`: X/Twitter platform sources (bookmarks) 
- `EMAIL`: Email-based content sources

### ContentStatus
- `UNREAD`: Content that has not been viewed/read yet
- `READ`: Content that has been viewed/read  
- `ARCHIVED`: Content that has been archived for later reference
- `DELETED`: Content marked for deletion (soft delete)

### ContentPriority
- `LOW`: Low priority content
- `MEDIUM`: Medium priority content (default)
- `HIGH`: High priority content
- `URGENT`: Urgent content requiring immediate attention

## Key Relationships

- A **User** can have multiple **Sources**, but each Source belongs to one User
- A **Source** can have multiple **Content** items, but each Content item comes from one Source
- A **Content** item can have one **Summary**
- A **Content** item can be associated with multiple **Topics** through the **ContentTopic** junction table
- A **User** can have multiple **Activities**, and each Activity is performed by one User
- An **Activity** can be related to a **Content** item, but this relationship is optional

## Design Considerations

- UUIDs are used for primary keys to avoid exposure of sequential IDs
- All models include created/updated timestamps for auditing
- Full-text search is supported via PostgreSQL's capabilities
- JSON fields are used for flexible metadata storage
- Relationships are defined with appropriate cascade behaviors 