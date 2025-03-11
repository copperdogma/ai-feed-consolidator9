import RepositoryFactory from './repositories/repository-factory';
import { PrismaClient } from '@prisma/client';

async function testRepository() {
  try {
    // Get repository instances
    const userRepo = RepositoryFactory.getUserRepository();
    const sourceRepo = RepositoryFactory.getSourceRepository();
    const contentRepo = RepositoryFactory.getContentRepository();
    
    // Create a test user (will fail if email exists)
    try {
      const newUser = await userRepo.create({
        email: 'test@example.com',
        name: 'Test User',
        firebaseUid: 'test-firebase-uid-' + Date.now(), // Use timestamp to make it unique
        isActive: true
      });
      console.log('Created user:', newUser);
      
      // Create a source for the user
      const newSource = await sourceRepo.create({
        name: 'Test RSS Source',
        url: 'https://example.com/rss',
        sourceType: 'RSS', // Use string instead of enum
        userId: newUser.id,
        isActive: true,
        refreshRate: 30
      });
      console.log('Created source:', newSource);
      
      // Create content for the source
      const newContent = await contentRepo.create({
        title: 'Test Article',
        sourceId: newSource.id,
        publishedAt: new Date(),
        status: 'UNREAD', // Use string instead of enum
        priority: 'MEDIUM' // Use string instead of enum
      });
      console.log('Created content:', newContent);
      
    } catch (error: any) {
      console.log('Could not create new entities, may already exist:', error.message);
    }
    
    // Test finding all users
    const users = await userRepo.findAll();
    console.log('All users:', users);
    
    // Test finding all sources
    const sources = await sourceRepo.findAll();
    console.log('All sources:', sources);
    
    // Test finding all content
    const content = await contentRepo.findAll();
    console.log('All content:', content);
    
    console.log('Repository test completed successfully');
  } catch (error) {
    console.error('Error testing repository:', error);
  }
}

testRepository()
  .then(() => console.log('Test finished'))
  .catch((error) => console.error('Test failed:', error)); 