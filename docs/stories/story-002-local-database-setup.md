# Story: Local PostgreSQL and Schema Implementation

**Status**: To Do

---

## Related Requirement
This story relates to the content management requirements in the [Key Features](../requirements.md#key-features) section of the requirements document, particularly the need to store and manage content from various sources.

## Alignment with Design
This story aligns with the [Database](../design.md#database) section of the design document which specifies using a local PostgreSQL database (not containerized) and the [Database Schema](../architecture.md#database-schema) section of the architecture document.

## Acceptance Criteria
- Local PostgreSQL instance is set up and configured
- Database schema is fully defined in Prisma format
- All necessary tables are created with proper relationships
- Migrations are set up for version control
- Data access layer is implemented with Prisma
- Repository pattern is implemented for data access
- Docker containers can successfully connect to the local database
- Schema supports all required features:
  - User management
  - Source configuration
  - Content storage
  - Summary storage
  - Topic management
  - Activity tracking

## Tasks
- [x] Set up local PostgreSQL:
  - [x] Install PostgreSQL locally (already installed)
  - [x] Create development database (`ai_feed_consolidator`)
  - [x] Create test database (`ai_feed_test`)
  - [x] Configure PostgreSQL to allow connections from Docker containers
  - [x] Set up a database user with appropriate permissions
- [ ] Set up Prisma ORM:
  - [ ] Install Prisma CLI and dependencies
  - [ ] Initialize Prisma in the project
  - [ ] Configure database connection to local PostgreSQL
- [x] Update Docker configuration:
  - [x] Remove PostgreSQL service from docker-compose.yaml
  - [x] Update connection strings to point to host machine's PostgreSQL
  - [x] Configure networking to allow container-to-host communication
- [ ] Implement core schema models:
  - [ ] User model for Firebase Authentication integration
  - [ ] Source model for content sources
  - [ ] Content model for storing content items
  - [ ] Summary model for storing AI-generated summaries
  - [ ] Topic model for content categorization
  - [ ] ContentTopic junction model for many-to-many relationships
  - [ ] Activity model for tracking user actions
- [ ] Define relationships between models:
  - [ ] User to Source (one-to-many)
  - [ ] Source to Content (one-to-many)
  - [ ] Content to Summary (one-to-one)
  - [ ] Content to Topic (many-to-many via ContentTopic)
  - [ ] User to Activity (one-to-many)
  - [ ] Content to Activity (one-to-many)
- [ ] Configure PostgreSQL-specific features:
  - [ ] Set up full-text search indexes
  - [ ] Configure JSON column types for metadata
  - [ ] Set up efficient indexes for common query patterns
- [ ] Create initial migration:
  - [ ] Generate migration files
  - [ ] Validate migration SQL
  - [ ] Apply migration to development database
- [ ] Implement repository pattern:
  - [ ] Create base repository interface
  - [ ] Implement repositories for each entity
  - [ ] Add transaction support
- [ ] Create database seeding:
  - [ ] Create seed script for development data
  - [ ] Implement data generators for testing
- [ ] Document schema:
  - [ ] Create Entity-Relationship Diagram (ERD)
  - [ ] Document each model and its attributes
  - [ ] Document relationships and constraints

## Notes
- PostgreSQL is already installed locally on the host machine
- The schema should be designed to accommodate future enhancements
- Consider using enums for predefined values (status, priority, content types)
- Use UUID for primary keys to avoid exposure of sequential IDs
- Ensure all timestamps include created/updated tracking
- Consider soft deletion for critical data
- Ensure proper backup procedures for the local database
- For production deployment on fly.io, a managed database service will be used 