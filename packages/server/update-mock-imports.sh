#!/bin/bash

# Script to update repository test files to use the improved mockPrisma utility

for file in src/tests/repositories/*.test.ts; do
  echo "Updating $file"
  
  # Replace vitest-mock-extended with ../utils/mock-utils if still present
  sed -i "" "s|import { mockDeep.* from .*vitest-mock-extended.*|import { mockPrisma } from '../utils/mock-utils';|g" "$file"
  
  # Replace existing mockDeep import with mockPrisma import
  sed -i "" "s|import { mockDeep } from '../utils/mock-utils';|import { mockPrisma } from '../utils/mock-utils';|g" "$file"
  
  # Replace mockDeep<PrismaClient>() with mockPrisma()
  sed -i "" "s|mockDeep<PrismaClient>()|mockPrisma()|g" "$file"
  sed -i "" "s|mockDeep<.*PrismaClient.*>()|mockPrisma()|g" "$file"
  
  # Replace any MockPrismaClient type definitions
  sed -i "" "/type MockPrismaClient/d" "$file"
  
  # Replace MockPrismaClient with any
  sed -i "" "s/prisma: MockPrismaClient/prisma: any/g" "$file"
  
  # Replace any isolated mockDeep calls
  sed -i "" "s|prisma = mockDeep()|prisma = mockPrisma()|g" "$file"
  sed -i "" "s|prisma = mockDeep<any>()|prisma = mockPrisma()|g" "$file"
done

echo "Updated all repository test files" 