/**
 * Test suite for database relationships and constraints
 * This file contains tests for:
 * 1. Cascade behaviors (when parent records are deleted/updated)
 * 2. Unique constraints
 * 3. Required fields
 * 4. Relationships between entities
 * 
 * (Migrated from standalone script to Vitest)
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import RepositoryFactory from '../repositories/repository-factory';
import prisma from '../sdks/prisma';

// Helper function to reset the database before testing
async function resetDatabase() {
  console.log('🧹 Resetting database for relationship tests...');
  
  // Delete all records from tables in reverse order of dependencies
  await prisma.activity.deleteMany();
  await prisma.contentTopic.deleteMany();
  await prisma.summary.deleteMany();
  await prisma.content.deleteMany();
  await prisma.source.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.user.deleteMany();
  
  console.log('✅ Database reset complete');
}

describe('Database Relationships and Constraints', () => {
  // Reset database before all tests
  beforeAll(async () => {
    await resetDatabase();
  });

  // Test user-source relationship
  it('should correctly handle user-source relationship', async () => {
    // Create a test user
    const user = await prisma.user.create({
      data: {
        firebaseUid: 'test-user-firebase-uid',
        email: 'test-user@example.com',
        name: 'Test User'
      }
    });
    
    // Create a source associated with the user
    const source = await prisma.source.create({
      data: {
        url: 'https://example.com/feed',
        name: 'Test Source',
        userId: user.id,
        sourceType: 'RSS'
      }
    });
    
    // Verify the relationship
    const retrievedSource = await prisma.source.findUnique({
      where: { id: source.id },
      include: { user: true }
    });
    
    expect(retrievedSource).not.toBeNull();
    expect(retrievedSource?.user.id).toBe(user.id);
    
    // Verify the reverse relationship
    const retrievedUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { sources: true }
    });
    
    expect(retrievedUser).not.toBeNull();
    expect(retrievedUser?.sources).toHaveLength(1);
    expect(retrievedUser?.sources[0].id).toBe(source.id);
  });

  // Test source-content relationship
  it('should correctly handle source-content relationship', async () => {
    // Get the test user
    const user = await prisma.user.findFirst({
      where: { email: 'test-user@example.com' }
    });
    
    // Get the test source
    const source = await prisma.source.findFirst({
      where: { name: 'Test Source' }
    });
    
    expect(user).not.toBeNull();
    expect(source).not.toBeNull();
    
    // Create content associated with the source
    const content = await prisma.content.create({
      data: {
        title: 'Test Content',
        url: 'https://example.com/article',
        sourceId: source!.id,
        publishedAt: new Date()
      }
    });
    
    // Verify the relationship
    const retrievedContent = await prisma.content.findUnique({
      where: { id: content.id },
      include: { source: true }
    });
    
    expect(retrievedContent).not.toBeNull();
    expect(retrievedContent?.source.id).toBe(source!.id);
    
    // Verify the reverse relationship
    const retrievedSource = await prisma.source.findUnique({
      where: { id: source!.id },
      include: { contents: true }
    });
    
    expect(retrievedSource).not.toBeNull();
    expect(retrievedSource?.contents).toHaveLength(1);
    expect(retrievedSource?.contents[0].id).toBe(content.id);
  });

  // Test content-summary relationship
  it('should correctly handle content-summary relationship', async () => {
    // Get the test content
    const content = await prisma.content.findFirst({
      where: { title: 'Test Content' }
    });
    
    expect(content).not.toBeNull();
    
    // Create a summary associated with the content
    const summary = await prisma.summary.create({
      data: {
        summaryText: 'This is a test summary',
        contentId: content!.id
      }
    });
    
    // Verify the relationship
    const retrievedSummary = await prisma.summary.findUnique({
      where: { id: summary.id },
      include: { content: true }
    });
    
    expect(retrievedSummary).not.toBeNull();
    expect(retrievedSummary?.content.id).toBe(content!.id);
    
    // Verify the reverse relationship
    const retrievedContent = await prisma.content.findUnique({
      where: { id: content!.id },
      include: { summary: true }
    });
    
    expect(retrievedContent).not.toBeNull();
    expect(retrievedContent?.summary).not.toBeNull();
    expect(retrievedContent?.summary?.id).toBe(summary.id);
  });

  // Test content-topic relationship
  it('should correctly handle content-topic relationship', async () => {
    // Get the test content
    const content = await prisma.content.findFirst({
      where: { title: 'Test Content' }
    });
    
    expect(content).not.toBeNull();
    
    // Create a topic
    const topic = await prisma.topic.create({
      data: {
        name: 'Test Topic'
      }
    });
    
    // Associate the content with the topic
    await prisma.contentTopic.create({
      data: {
        contentId: content!.id,
        topicId: topic.id
      }
    });
    
    // Verify the relationship
    const retrievedContentTopics = await prisma.contentTopic.findMany({
      where: { contentId: content!.id },
      include: { topic: true }
    });
    
    expect(retrievedContentTopics).toHaveLength(1);
    expect(retrievedContentTopics[0].topic.id).toBe(topic.id);
    
    // Verify the reverse relationship
    const retrievedTopicContents = await prisma.contentTopic.findMany({
      where: { topicId: topic.id },
      include: { content: true }
    });
    
    expect(retrievedTopicContents).toHaveLength(1);
    expect(retrievedTopicContents[0].content.id).toBe(content!.id);
  });

  // Test activity relationships
  it('should correctly handle activity relationships', async () => {
    // Get the test user and content
    const user = await prisma.user.findFirst({
      where: { email: 'test-user@example.com' }
    });
    
    const content = await prisma.content.findFirst({
      where: { title: 'Test Content' }
    });
    
    expect(user).not.toBeNull();
    expect(content).not.toBeNull();
    
    // Create an activity associated with the user and content
    const activity = await prisma.activity.create({
      data: {
        userId: user!.id,
        contentId: content!.id,
        action: 'read',
        createdAt: new Date()
      }
    });
    
    // Verify the relationships
    const retrievedActivity = await prisma.activity.findUnique({
      where: { id: activity.id },
      include: { user: true, content: true }
    });
    
    expect(retrievedActivity).not.toBeNull();
    expect(retrievedActivity?.user.id).toBe(user!.id);
    expect(retrievedActivity?.content?.id).toBe(content!.id);
    
    // Verify the reverse relationships
    const userActivities = await prisma.activity.findMany({
      where: { userId: user!.id }
    });
    
    expect(userActivities.length).toBeGreaterThan(0);
    expect(userActivities.some((a: any) => a.id === activity.id)).toBe(true);
    
    const contentActivities = await prisma.activity.findMany({
      where: { contentId: content!.id }
    });
    
    expect(contentActivities.length).toBeGreaterThan(0);
    expect(contentActivities.some((a: any) => a.id === activity.id)).toBe(true);
  });

  // Test unique constraints
  it('should enforce unique constraints', async () => {
    // Test unique constraint on user email
    const existingUser = await prisma.user.findFirst({
      where: { email: 'test-user@example.com' }
    });
    
    expect(existingUser).not.toBeNull();
    
    // Attempt to create a user with the same email
    await expect(prisma.user.create({
      data: {
        firebaseUid: 'another-firebase-uid',
        email: 'test-user@example.com',
        name: 'Another User'
      }
    })).rejects.toThrow();
    
    // Verify that multiple sources with the same URL are allowed
    // (URL is no longer a unique constraint)
    const existingSource = await prisma.source.findFirst({
      where: { url: 'https://example.com/feed' }
    });
    
    expect(existingSource).not.toBeNull();
    
    // Create another source with the same URL for the same user
    // This should succeed since URL uniqueness is no longer enforced
    const duplicateSource = await prisma.source.create({
      data: {
        url: 'https://example.com/feed',
        name: 'Duplicate Source',
        userId: existingUser!.id,
        sourceType: 'RSS'
      }
    });
    
    // Verify the duplicate source was created
    expect(duplicateSource).not.toBeNull();
    expect(duplicateSource.url).toBe('https://example.com/feed');
    expect(duplicateSource.id).not.toBe(existingSource!.id);
  });

  // Test required fields
  it('should enforce required fields', async () => {
    // Test required fields for user
    await expect(prisma.user.create({
      data: {
        email: 'missing-fields@example.com',
        name: 'Missing Fields User'
      }
    })).resolves.toBeTruthy();
    
    // Test required fields for source
    const user = await prisma.user.findFirst({
      where: { email: 'test-user@example.com' }
    });
    
    expect(user).not.toBeNull();
    
    await expect(prisma.source.create({
      data: {
        name: 'Missing URL Source',
        userId: user!.id,
        sourceType: 'RSS'
      } as any
    })).rejects.toThrow();
    
    // Now test missing sourceType
    await expect(prisma.source.create({
      data: {
        url: 'https://example.com/missing-sourcetype',
        name: 'Missing SourceType Source',
        userId: user!.id
      } as any
    })).rejects.toThrow();
    
    // Test required fields for content
    const source = await prisma.source.findFirst({
      where: { name: 'Test Source' }
    });
    
    expect(source).not.toBeNull();
    
    await expect(prisma.content.create({
      data: {
        url: 'https://example.com/missing-title',
        sourceId: source!.id,
        publishedAt: new Date()
      } as any
    })).rejects.toThrow();
  });

  // Test cascade behaviors
  it('should correctly handle cascade behaviors', async () => {
    // Create a new user for cascade testing
    const user = await prisma.user.create({
      data: {
        firebaseUid: 'cascade-test-user',
        email: 'cascade-test@example.com',
        name: 'Cascade Test User'
      }
    });
    
    // Create a source for the user
    const source = await prisma.source.create({
      data: {
        url: 'https://example.com/cascade-test',
        name: 'Cascade Test Source',
        userId: user.id,
        sourceType: 'RSS'
      }
    });
    
    // Create a topic
    const topic = await prisma.topic.create({
      data: {
        name: 'Cascade Test Topic'
      }
    });
    
    // Create content for the source
    const content = await prisma.content.create({
      data: {
        title: 'Cascade Test Content',
        url: 'https://example.com/cascade-article',
        sourceId: source.id,
        publishedAt: new Date()
      }
    });
    
    // Create a summary for the content
    const summary = await prisma.summary.create({
      data: {
        summaryText: 'This is a cascade test summary',
        contentId: content.id
      }
    });
    
    // Associate the content with the topic
    await prisma.contentTopic.create({
      data: {
        contentId: content.id,
        topicId: topic.id
      }
    });
    
    // Create an activity for the content
    await prisma.activity.create({
      data: {
        userId: user.id,
        contentId: content.id,
        action: 'cascade_test',
        createdAt: new Date()
      }
    });
    
    // Now delete the source and verify cascade behaviors
    await prisma.source.delete({
      where: { id: source.id }
    });
    
    // Verify source is deleted
    const deletedSource = await prisma.source.findUnique({
      where: { id: source.id }
    });
    
    expect(deletedSource).toBeNull();
    
    // Verify content is deleted
    const deletedContent = await prisma.content.findUnique({
      where: { id: content.id }
    });
    
    expect(deletedContent).toBeNull();
    
    // Verify summary is deleted
    const deletedSummary = await prisma.summary.findUnique({
      where: { id: summary.id }
    });
    
    expect(deletedSummary).toBeNull();
    
    // Verify content-topic association is deleted
    const deletedContentTopic = await prisma.contentTopic.findUnique({
      where: {
        contentId_topicId: {
          contentId: content.id,
          topicId: topic.id
        }
      }
    });
    
    expect(deletedContentTopic).toBeNull();
    
    // Verify topic still exists (not cascaded)
    const existingTopic = await prisma.topic.findUnique({
      where: { id: topic.id }
    });
    
    expect(existingTopic).not.toBeNull();
    
    // Verify activity has null contentId (set null)
    const updatedActivity = await prisma.activity.findFirst({
      where: {
        userId: user.id,
        action: 'cascade_test'
      }
    });
    
    expect(updatedActivity).not.toBeNull();
    expect(updatedActivity?.contentId).toBeNull();
  });
}); 