#!/bin/bash

# Database reset and seed script
# This script resets the database and repopulates it with test data

echo "🗑️  Resetting database..."

# Navigate to the server directory (adjust if needed)
cd "$(dirname "$0")/.."

# Reset the database
echo "🔄 Applying Prisma schema..."
npx prisma db push --force-reset

# Seed the database
echo "🌱 Seeding database..."
npx prisma db seed

echo "✅ Database reset and seed completed!" 