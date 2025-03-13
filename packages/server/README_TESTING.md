# User Authentication Testing Guide

This guide explains how to run the tests for the authentication and user creation flow.

## Overview

The tests are written using Jest and are designed to verify that users are properly created in the database after successful authentication. We have tests for both the client-side and server-side parts of the authentication flow.

## Prerequisites

- Node.js 18+ installed
- Docker running (for the database and server)
- All project dependencies installed (`npm install` in both packages/client and packages/server)

## Installing Dependencies

Before running the tests, make sure you have all the required dependencies:

```bash
# Install server dependencies
cd packages/server
npm install

# Install client dependencies
cd ../client
npm install
```

## Running the Tests

### Server Tests

The server tests verify the user creation in the database:

```bash
# From the server directory
cd packages/server

# Run all tests
npm test

# Run specific tests
npm test -- src/tests/auth/user-creation.test.js

# Run with watch mode
npm run test:watch

# Run with coverage report
npm run test:coverage
```

### Client Tests

The client tests verify the authentication flow from the client-side:

```bash
# From the client directory
cd packages/client

# Run all tests
npm test

# Run specific tests
npm test -- src/tests/auth/google-auth.test.js

# Run with watch mode
npm run test:watch
```

## Test Files

Here's an overview of the main test files:

### Server Tests

- `packages/server/src/tests/auth/user-creation.test.js`: Tests the database user creation after authentication
- `packages/server/src/tests/lib/context.test.js`: Tests the context creation which handles user authentication

### Client Tests

- `packages/client/src/tests/auth/google-auth.test.js`: Tests the client-side Google authentication flow

## Troubleshooting

### Database Connection Issues

If the tests can't connect to the database:

1. Make sure Docker is running
2. Check that the database container is up: `docker ps | grep postgres`
3. Verify the database connection string in `packages/server/src/tests/setup.ts`

### Firebase Authentication Issues

If there are issues with Firebase authentication:

1. Make sure the Firebase Admin SDK is properly initialized
2. Check that mock Firebase tokens are accepted in development mode
3. Verify that the Firebase configuration is properly set up in the client

## Continuous Integration

These tests can be integrated into a CI/CD pipeline to ensure authentication works before deploying. Here's an example GitHub Actions workflow:

```yaml
name: Authentication Tests

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_USER: admin
          POSTGRES_PASSWORD: password
          POSTGRES_DB: ai_feed_consolidator_test
        ports:
          - 5432:5432
        options: --health-cmd pg_isready --health-interval 10s --health-timeout 5s --health-retries 5
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install Server Dependencies
      run: cd packages/server && npm install
    
    - name: Run Server Tests
      run: cd packages/server && npm test
    
    - name: Install Client Dependencies
      run: cd packages/client && npm install
    
    - name: Run Client Tests
      run: cd packages/client && npm test
``` 