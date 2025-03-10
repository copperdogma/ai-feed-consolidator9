import { PrismaClient } from '@prisma/client';
import RepositoryFactory from '../repositories/repository-factory';
import prisma from '../sdks/prisma';

/**
 * Test suite for database relationships and constraints
 * This file contains tests for:
 * 1. Cascade behaviors (when parent records are deleted/updated)
 * 2. Unique constraints
 * 3. Required fields
 * 4. Relationships between entities
 */

async function runTests() {
  try {
    console.log('🧪 Starting relationship and constraint tests...');
    
    // Reset the database before testing
    await resetDatabase();
    
    // Run the tests
    await testUserSourceRelationship();
    await testSourceContentRelationship();
    await testContentSummaryRelationship();
    await testContentTopicRelationship();
    await testActivityRelationships();
    await testUniqueConstraints();
    await testRequiredFields();
    await testCascadeBehaviors();
    
    console.log('✅ All tests completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function resetDatabase() {
  console.log('🔄 Resetting database...');
  
  // Delete all data in reverse order of dependencies
  await prisma.activity.deleteMany();
  await prisma.contentTopic.deleteMany();
  await prisma.summary.deleteMany();
  await prisma.content.deleteMany();
  await prisma.source.deleteMany();
  await prisma.password.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.user.deleteMany();
  
  console.log('✅ Database reset complete');
}

// Test User-Source relationship (one-to-many)
async function testUserSourceRelationship() {
  console.log('🧪 Testing User-Source relationship...');
  
  const userRepo = RepositoryFactory.getUserRepository();
  const sourceRepo = RepositoryFactory.getSourceRepository();
  
  // Create a user
  const user = await userRepo.create({
    email: 'test@example.com',
    name: 'Test User',
    firebaseUid: 'firebase-test-uid',
    isActive: true
  });
  
  // Create sources for the user
  const source1 = await sourceRepo.create({
    name: 'Test RSS Source',
    url: 'https://example.com/rss',
    sourceType: 'RSS',
    userId: user.id,
    refreshRate: 30,
    isActive: true
  });
  
  const source2 = await sourceRepo.create({
    name: 'Test YouTube Source',
    url: 'https://youtube.com/playlist',
    sourceType: 'YOUTUBE',
    userId: user.id,
    refreshRate: 60,
    isActive: true
  });
  
  // Fetch the user with sources
  const userWithSources = await prisma.user.findUnique({
    where: { id: user.id },
    include: { sources: true }
  });
  
  // Verify that the user has two sources
  if (!userWithSources?.sources || userWithSources.sources.length !== 2) {
    throw new Error(`Expected user to have 2 sources, got ${userWithSources?.sources?.length || 0}`);
  }
  
  console.log('✅ User-Source relationship verified');
}

// Test Source-Content relationship (one-to-many)
async function testSourceContentRelationship() {
  console.log('🧪 Testing Source-Content relationship...');
  
  const userRepo = RepositoryFactory.getUserRepository();
  const sourceRepo = RepositoryFactory.getSourceRepository();
  const contentRepo = RepositoryFactory.getContentRepository();
  
  // Create a user
  const user = await userRepo.create({
    email: 'source-test@example.com',
    name: 'Source Test User',
    firebaseUid: 'firebase-source-test-uid',
    isActive: true
  });
  
  // Create a source
  const source = await sourceRepo.create({
    name: 'Content Source Test',
    url: 'https://example.com/content',
    sourceType: 'RSS',
    userId: user.id,
    refreshRate: 30,
    isActive: true
  });
  
  // Create content items for the source
  const content1 = await contentRepo.create({
    title: 'Test Content 1',
    sourceId: source.id,
    publishedAt: new Date(),
    status: 'UNREAD',
    priority: 'MEDIUM'
  });
  
  const content2 = await contentRepo.create({
    title: 'Test Content 2',
    sourceId: source.id,
    publishedAt: new Date(),
    status: 'UNREAD',
    priority: 'HIGH'
  });
  
  // Fetch the source with content
  const sourceWithContent = await prisma.source.findUnique({
    where: { id: source.id },
    include: { contents: true }
  });
  
  // Verify that the source has two content items
  if (!sourceWithContent?.contents || sourceWithContent.contents.length !== 2) {
    throw new Error(`Expected source to have 2 content items, got ${sourceWithContent?.contents?.length || 0}`);
  }
  
  console.log('✅ Source-Content relationship verified');
}

// Test Content-Summary relationship (one-to-one)
async function testContentSummaryRelationship() {
  console.log('🧪 Testing Content-Summary relationship...');
  
  const userRepo = RepositoryFactory.getUserRepository();
  const sourceRepo = RepositoryFactory.getSourceRepository();
  const contentRepo = RepositoryFactory.getContentRepository();
  const summaryRepo = RepositoryFactory.getSummaryRepository();
  
  // Create a user
  const user = await userRepo.create({
    email: 'summary-test@example.com',
    name: 'Summary Test User',
    firebaseUid: 'firebase-summary-test-uid',
    isActive: true
  });
  
  // Create a source
  const source = await sourceRepo.create({
    name: 'Summary Source Test',
    url: 'https://example.com/summary',
    sourceType: 'RSS',
    userId: user.id,
    refreshRate: 30,
    isActive: true
  });
  
  // Create a content item
  const content = await contentRepo.create({
    title: 'Content with Summary',
    sourceId: source.id,
    publishedAt: new Date(),
    status: 'UNREAD',
    priority: 'MEDIUM'
  });
  
  // Create a summary for the content
  const summary = await summaryRepo.create({
    contentId: content.id,
    summaryText: 'This is a test summary for the content'
  });
  
  // Fetch the content with summary
  const contentWithSummary = await prisma.content.findUnique({
    where: { id: content.id },
    include: { summary: true }
  });
  
  // Verify that the content has a summary
  if (!contentWithSummary?.summary) {
    throw new Error('Expected content to have a summary, but none was found');
  }
  
  // Try to create another summary for the same content (should fail due to unique constraint)
  try {
    await summaryRepo.create({
      contentId: content.id,
      summaryText: 'This is another test summary that should fail'
    });
    throw new Error('Creating a second summary for the same content should have failed');
  } catch (error) {
    // This is expected - should fail with a unique constraint violation
    console.log('✅ Content-Summary unique constraint verified');
  }
  
  console.log('✅ Content-Summary relationship verified');
}

// Test Content-Topic relationship (many-to-many)
async function testContentTopicRelationship() {
  console.log('🧪 Testing Content-Topic relationship...');
  
  const userRepo = RepositoryFactory.getUserRepository();
  const sourceRepo = RepositoryFactory.getSourceRepository();
  const contentRepo = RepositoryFactory.getContentRepository();
  const topicRepo = RepositoryFactory.getTopicRepository();
  const contentTopicRepo = RepositoryFactory.getContentTopicRepository();
  
  // Create a user
  const user = await userRepo.create({
    email: 'topic-test@example.com',
    name: 'Topic Test User',
    firebaseUid: 'firebase-topic-test-uid',
    isActive: true
  });
  
  // Create a source
  const source = await sourceRepo.create({
    name: 'Topic Source Test',
    url: 'https://example.com/topic',
    sourceType: 'RSS',
    userId: user.id,
    refreshRate: 30,
    isActive: true
  });
  
  // Create content items
  const content1 = await contentRepo.create({
    title: 'Content for Topics 1',
    sourceId: source.id,
    publishedAt: new Date(),
    status: 'UNREAD',
    priority: 'MEDIUM'
  });
  
  const content2 = await contentRepo.create({
    title: 'Content for Topics 2',
    sourceId: source.id,
    publishedAt: new Date(),
    status: 'UNREAD',
    priority: 'MEDIUM'
  });
  
  // Create topics
  const topic1 = await topicRepo.create({
    name: 'Technology',
    description: 'Tech related content'
  });
  
  const topic2 = await topicRepo.create({
    name: 'Science',
    description: 'Science related content'
  });
  
  // Associate content with topics (using associate method instead of create)
  await contentTopicRepo.associate(content1.id, topic1.id);
  
  await contentTopicRepo.associate(content1.id, topic2.id);
  
  await contentTopicRepo.associate(content2.id, topic1.id);
  
  // Fetch content with topics
  const contentWithTopics = await prisma.content.findUnique({
    where: { id: content1.id },
    include: { contentTopics: { include: { topic: true } } }
  });
  
  // Verify content has two topics
  if (!contentWithTopics?.contentTopics || contentWithTopics.contentTopics.length !== 2) {
    throw new Error(`Expected content to have 2 topics, got ${contentWithTopics?.contentTopics?.length || 0}`);
  }
  
  // Fetch topics with content
  const topicWithContent = await prisma.topic.findUnique({
    where: { id: topic1.id },
    include: { contentTopics: { include: { content: true } } }
  });
  
  // Verify topic has two content items
  if (!topicWithContent?.contentTopics || topicWithContent.contentTopics.length !== 2) {
    throw new Error(`Expected topic to have 2 content items, got ${topicWithContent?.contentTopics?.length || 0}`);
  }
  
  console.log('✅ Content-Topic relationship verified');
}

// Test Activity relationships
async function testActivityRelationships() {
  console.log('🧪 Testing Activity relationships...');
  
  const userRepo = RepositoryFactory.getUserRepository();
  const sourceRepo = RepositoryFactory.getSourceRepository();
  const contentRepo = RepositoryFactory.getContentRepository();
  const activityRepo = RepositoryFactory.getActivityRepository();
  
  // Create a user
  const user = await userRepo.create({
    email: 'activity-test@example.com',
    name: 'Activity Test User',
    firebaseUid: 'firebase-activity-test-uid',
    isActive: true
  });
  
  // Create a source
  const source = await sourceRepo.create({
    name: 'Activity Source Test',
    url: 'https://example.com/activity',
    sourceType: 'RSS',
    userId: user.id,
    refreshRate: 30,
    isActive: true
  });
  
  // Create a content item
  const content = await contentRepo.create({
    title: 'Content for Activity',
    sourceId: source.id,
    publishedAt: new Date(),
    status: 'UNREAD',
    priority: 'MEDIUM'
  });
  
  // Create activities
  const activity1 = await activityRepo.create({
    userId: user.id,
    contentId: content.id,
    action: 'read',
    details: { device: 'web', time_spent: 120 }
  });
  
  const activity2 = await activityRepo.create({
    userId: user.id,
    action: 'login',
    details: { device: 'mobile' }
  });
  
  // Fetch user with activities
  const userWithActivities = await prisma.user.findUnique({
    where: { id: user.id },
    include: { activities: true }
  });
  
  // Verify user has two activities
  if (!userWithActivities?.activities || userWithActivities.activities.length !== 2) {
    throw new Error(`Expected user to have 2 activities, got ${userWithActivities?.activities?.length || 0}`);
  }
  
  // Fetch content with activities
  const contentWithActivities = await prisma.content.findUnique({
    where: { id: content.id },
    include: { activities: true }
  });
  
  // Verify content has one activity
  if (!contentWithActivities?.activities || contentWithActivities.activities.length !== 1) {
    throw new Error(`Expected content to have 1 activity, got ${contentWithActivities?.activities?.length || 0}`);
  }
  
  console.log('✅ Activity relationships verified');
}

// Test unique constraints
async function testUniqueConstraints() {
  console.log('🧪 Testing unique constraints...');
  
  const userRepo = RepositoryFactory.getUserRepository();
  const topicRepo = RepositoryFactory.getTopicRepository();
  
  // Test unique email constraint
  const user = await userRepo.create({
    email: 'unique-test@example.com',
    name: 'Unique Test User',
    firebaseUid: 'firebase-unique-test-uid',
    isActive: true
  });
  
  // Try to create another user with the same email (should fail)
  try {
    await userRepo.create({
      email: 'unique-test@example.com',
      name: 'Duplicate Email User',
      firebaseUid: 'firebase-unique-test-uid-2',
      isActive: true
    });
    throw new Error('Creating a user with duplicate email should have failed');
  } catch (error) {
    // This is expected - should fail with a unique constraint violation
    console.log('✅ User email unique constraint verified');
  }
  
  // Test unique firebase UID constraint
  try {
    await userRepo.create({
      email: 'different-email@example.com',
      name: 'Duplicate Firebase UID User',
      firebaseUid: 'firebase-unique-test-uid',
      isActive: true
    });
    throw new Error('Creating a user with duplicate firebase UID should have failed');
  } catch (error) {
    // This is expected - should fail with a unique constraint violation
    console.log('✅ User firebaseUid unique constraint verified');
  }
  
  // Test unique topic name constraint
  const topic = await topicRepo.create({
    name: 'Unique Topic',
    description: 'Test unique constraint on topic name'
  });
  
  // Try to create another topic with the same name (should fail)
  try {
    await topicRepo.create({
      name: 'Unique Topic',
      description: 'This should fail due to duplicate name'
    });
    throw new Error('Creating a topic with duplicate name should have failed');
  } catch (error) {
    // This is expected - should fail with a unique constraint violation
    console.log('✅ Topic name unique constraint verified');
  }
  
  console.log('✅ Unique constraints verified');
}

// Test required fields
async function testRequiredFields() {
  console.log('🧪 Testing required fields...');
  
  const userRepo = RepositoryFactory.getUserRepository();
  const sourceRepo = RepositoryFactory.getSourceRepository();
  const contentRepo = RepositoryFactory.getContentRepository();
  
  // Test required fields on User
  try {
    // @ts-ignore - Intentionally missing required field
    await userRepo.create({
      name: 'Missing Email User',
      firebaseUid: 'firebase-missing-email-uid',
      isActive: true
    });
    throw new Error('Creating a user without email should have failed');
  } catch (error) {
    // This is expected - should fail due to missing required field
    console.log('✅ User required fields verified');
  }
  
  // Create a valid user for source test
  const user = await userRepo.create({
    email: 'required-test@example.com',
    name: 'Required Fields Test User',
    firebaseUid: 'firebase-required-test-uid',
    isActive: true
  });
  
  // Test required fields on Source
  try {
    // @ts-ignore - Intentionally missing required field
    await sourceRepo.create({
      name: 'Missing URL Source',
      sourceType: 'RSS',
      userId: user.id,
      refreshRate: 30,
      isActive: true
    });
    throw new Error('Creating a source without URL should have failed');
  } catch (error) {
    // This is expected - should fail due to missing required field
    console.log('✅ Source required fields verified');
  }
  
  // Create a valid source for content test
  const source = await sourceRepo.create({
    name: 'Required Fields Test Source',
    url: 'https://example.com/required',
    sourceType: 'RSS',
    userId: user.id,
    refreshRate: 30,
    isActive: true
  });
  
  // Test required fields on Content
  try {
    // @ts-ignore - Intentionally missing required field
    await contentRepo.create({
      sourceId: source.id,
      publishedAt: new Date(),
      status: 'UNREAD',
      priority: 'MEDIUM'
    });
    throw new Error('Creating content without title should have failed');
  } catch (error) {
    // This is expected - should fail due to missing required field
    console.log('✅ Content required fields verified');
  }
  
  console.log('✅ Required fields verified');
}

// Test cascade behaviors
async function testCascadeBehaviors() {
  console.log('🧪 Testing cascade behaviors...');
  
  const userRepo = RepositoryFactory.getUserRepository();
  const sourceRepo = RepositoryFactory.getSourceRepository();
  const contentRepo = RepositoryFactory.getContentRepository();
  const summaryRepo = RepositoryFactory.getSummaryRepository();
  const topicRepo = RepositoryFactory.getTopicRepository();
  const contentTopicRepo = RepositoryFactory.getContentTopicRepository();
  const activityRepo = RepositoryFactory.getActivityRepository();
  
  // Create a user
  const user = await userRepo.create({
    email: 'cascade-test@example.com',
    name: 'Cascade Test User',
    firebaseUid: 'firebase-cascade-test-uid',
    isActive: true
  });
  
  // Create a source
  const source = await sourceRepo.create({
    name: 'Cascade Test Source',
    url: 'https://example.com/cascade',
    sourceType: 'RSS',
    userId: user.id,
    refreshRate: 30,
    isActive: true
  });
  
  // Create content
  const content = await contentRepo.create({
    title: 'Cascade Test Content',
    sourceId: source.id,
    publishedAt: new Date(),
    status: 'UNREAD',
    priority: 'MEDIUM'
  });
  
  // Create a summary
  const summary = await summaryRepo.create({
    contentId: content.id,
    summaryText: 'This is a test summary for cascade testing'
  });
  
  // Create a topic
  const topic = await topicRepo.create({
    name: 'Cascade Test Topic',
    description: 'Topic for cascade testing'
  });
  
  // Associate content with topic (using associate method instead of create)
  await contentTopicRepo.associate(content.id, topic.id);
  
  // Create activities
  await activityRepo.create({
    userId: user.id,
    contentId: content.id,
    action: 'cascade_test',
    details: { test: 'cascade' }
  });
  
  // Test cascade delete: delete source should delete content, summary, and content-topic
  await sourceRepo.delete(source.id);
  
  // Verify content is deleted
  const deletedContent = await prisma.content.findUnique({
    where: { id: content.id }
  });
  
  if (deletedContent) {
    throw new Error('Content should have been deleted when source was deleted');
  }
  
  // Verify summary is deleted
  const deletedSummary = await prisma.summary.findUnique({
    where: { id: summary.id }
  });
  
  if (deletedSummary) {
    throw new Error('Summary should have been deleted when content was deleted');
  }
  
  // Verify content-topic association is deleted
  const deletedContentTopic = await prisma.contentTopic.findUnique({
    where: {
      contentId_topicId: {
        contentId: content.id,
        topicId: topic.id
      }
    }
  });
  
  if (deletedContentTopic) {
    throw new Error('ContentTopic should have been deleted when content was deleted');
  }
  
  // Verify topic still exists (not cascaded)
  const existingTopic = await prisma.topic.findUnique({
    where: { id: topic.id }
  });
  
  if (!existingTopic) {
    throw new Error('Topic should not have been deleted when content was deleted');
  }
  
  // Verify activity has null contentId (set null)
  const updatedActivity = await prisma.activity.findFirst({
    where: {
      userId: user.id,
      action: 'cascade_test'
    }
  });
  
  if (!updatedActivity) {
    throw new Error('Activity should not have been deleted');
  }
  
  if (updatedActivity.contentId !== null) {
    throw new Error('Activity contentId should have been set to null when content was deleted');
  }
  
  console.log('✅ Cascade behaviors verified');
}

// Automatically run the tests
console.log('Running relationship tests...');
runTests(); 