/**
 * Database seed script
 * 
 * This script populates the database with test data for development and testing purposes.
 * Run it using Prisma's seeding functionality: npx prisma db seed
 */

import { PrismaClient } from '@prisma/client';
import {
  userGenerator,
  sourceGenerator,
  contentGenerator,
  summaryGenerator,
  topicGenerator,
  contentTopicGenerator,
  activityGenerator
} from './data-generators';

// Configuration
const SEED_CONFIG = {
  users: 3,
  sourcesPerUser: 5,
  contentPerSource: 10,
  summaryPercentage: 0.7, // 70% of content has summaries
  topics: 10,
  contentTopicAssociations: 50,
  activitiesPerUser: 30
};

// Create Prisma client
const prisma = new PrismaClient();

/**
 * Main seed function
 */
async function main() {
  console.log('🌱 Starting database seed...');

  try {
    // Clear existing data (in reverse order of dependencies)
    console.log('Cleaning existing data...');
    await prisma.activity.deleteMany({});
    await prisma.contentTopic.deleteMany({});
    await prisma.summary.deleteMany({});
    await prisma.content.deleteMany({});
    await prisma.source.deleteMany({});
    await prisma.topic.deleteMany({});
    await prisma.password.deleteMany({});
    await prisma.user.deleteMany({});
    console.log('✅ Database cleaned');

    // Generate users
    console.log(`Generating ${SEED_CONFIG.users} users...`);
    const users = userGenerator.generateMany(SEED_CONFIG.users);
    const createdUsers = await prisma.user.createMany({
      data: users
    });
    console.log(`✅ Created ${createdUsers.count} users`);

    // Generate topics
    console.log(`Generating ${SEED_CONFIG.topics} topics...`);
    const topics = topicGenerator.generateMany(SEED_CONFIG.topics);
    const createdTopics = await prisma.topic.createMany({
      data: topics
    });
    console.log(`✅ Created ${createdTopics.count} topics`);

    // For references in subsequent operations
    const userRecords = await prisma.user.findMany();
    const topicRecords = await prisma.topic.findMany();
    
    // Arrays to store created IDs for later associations
    const allContentIds: string[] = [];
    const allTopicIds: string[] = topicRecords.map(topic => topic.id);

    // Generate sources, content, and summaries for each user
    console.log('Generating sources, content, and summaries...');
    
    for (const user of userRecords) {
      // Generate sources for this user
      const sources = sourceGenerator.generateMany(user.id, SEED_CONFIG.sourcesPerUser);
      await prisma.source.createMany({
        data: sources
      });
      
      // Get created sources to reference their IDs
      const userSources = await prisma.source.findMany({
        where: { userId: user.id }
      });
      
      // Generate content for each source
      for (const source of userSources) {
        const contents = contentGenerator.generateMany(source.id, SEED_CONFIG.contentPerSource);
        await prisma.content.createMany({
          data: contents
        });
        
        // Get created content to reference IDs
        const sourceContents = await prisma.content.findMany({
          where: { sourceId: source.id }
        });
        
        // Store content IDs for later use
        allContentIds.push(...sourceContents.map(content => content.id));
        
        // Generate summaries for some content
        const summaryContents = sourceContents
          .filter(() => Math.random() < SEED_CONFIG.summaryPercentage);
        
        if (summaryContents.length > 0) {
          const summaries = summaryContents.map(content => 
            summaryGenerator.generate(content.id)
          );
          
          await prisma.summary.createMany({
            data: summaries
          });
        }
      }
    }
    
    console.log(`✅ Generated sources, content, and summaries for ${userRecords.length} users`);

    // Generate content-topic associations
    console.log(`Generating content-topic associations...`);
    const contentTopics = contentTopicGenerator.generateRandomAssociations(
      allContentIds,
      allTopicIds,
      SEED_CONFIG.contentTopicAssociations
    );
    
    await prisma.contentTopic.createMany({
      data: contentTopics
    });
    console.log(`✅ Created ${contentTopics.length} content-topic associations`);

    // Generate activities for each user
    console.log('Generating user activities...');
    
    for (const user of userRecords) {
      const activities = activityGenerator.generateForUser(
        user.id,
        allContentIds,
        SEED_CONFIG.activitiesPerUser
      );
      
      await prisma.activity.createMany({
        data: activities
      });
    }
    
    console.log(`✅ Generated activities for ${userRecords.length} users`);

    console.log('🎉 Database seed completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
main()
  .then(() => {
    console.log('✨ Seed script finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seed script failed:', error);
    process.exit(1);
  }); 