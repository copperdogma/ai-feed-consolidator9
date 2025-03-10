# Story: User Profile Management

**Status**: In Progress

---

## Related Requirement
This story relates to the [Authentication and Security](../requirements.md#authentication-and-security) and [User Management](../requirements.md#user-management) sections of the requirements document, which specify the need for user profile data storage and management.

## Alignment with Design
This story aligns with the [Authentication and Authorization](../design.md#authentication-and-authorization) and [Data Model](../design.md#data-model) sections of the design document, which outline the user profile storage requirements.

## Dependent Stories
- Story 001.1: Firebase Authentication Implementation (must be completed first)
- Story 002: Local PostgreSQL and Schema Implementation (must be completed first)

## Acceptance Criteria
- User profiles are stored in the database when users authenticate
- User information from Google authentication (name, email, profile picture) is saved
- User profiles can be updated and managed
- User profile information is properly secured
- User profile data is accessible to authorized API endpoints
- All functionality is properly tested with unit and integration tests

## Tasks
- [x] Implement user profile management:
  - [x] Create/update user records in database when users authenticate
  - [x] Store Google authentication user information (name, email, profile picture)
  - [x] Implement profile fetching from the database
  - [x] Add user profile display in the UI
  - [x] Add API endpoints for user profile management
- [x] Enhance profile security:
  - [x] Ensure profile data is only accessible to the authenticated user
  - [x] Implement proper validation for profile updates
  - [x] Add authorization checks to profile-related API endpoints
- [x] Implement user profile UI:
  - [x] Create a profile page showing user information
  - [x] Create a profile editing form
  - [x] Display user profile information in relevant parts of the UI
- [ ] Implement comprehensive tests:
  - [ ] Write tests following Test-Driven Development (TDD) principles, writing tests before implementing features
  - [ ] Write unit tests for user router endpoints (getProfile, updateProfile)
  - [ ] Write integration tests for the authentication flow and user creation/update
  - [ ] Write tests for authorization checks and data validation
  - [ ] Create mock Firebase authentication for testing
  - [ ] Write UI tests for the profile page functionality

## Implementation Details
- Updated context.ts to save and update user profile information from Firebase:
  - Stores email, name, and avatar URL from Firebase authentication
  - Updates existing user records when Firebase information changes
- Created user.router.ts with API endpoints:
  - getProfile: Fetches the current user's profile
  - updateProfile: Updates the user's name and avatar
- Added the user router to the main router for API access
- Created ProfilePage.tsx with:
  - Profile information display (name, email, avatar)
  - Edit mode for updating profile information
  - Form validation and error handling
- Added a profile route to App.tsx
- Created a Navigation component with:
  - Avatar display showing the user's profile picture
  - Dropdown menu with a link to the profile page
- Updated App.tsx to include the Navigation component in all protected routes

## Testing Status
No tests have been implemented yet for:
- User API endpoints
- Authentication flow and user creation/update process
- Profile page UI functionality

## Notes
- This story was split from Story 001.1 as it depends on the database schema implementation in Story 002
- User profile management requires the database schema to be in place first
- We already have access to user profile data from Google authentication (name, email, profile picture)
- This story focuses on persisting and managing that data in our own database
- The core authentication functionality was completed in Story 001.1
- This story builds on the database schema created in Story 002
- There are some TypeScript/linter errors that need to be addressed
- Testing was originally overlooked but is now included as a requirement before completion
