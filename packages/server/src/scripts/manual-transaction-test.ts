import RepositoryFactory from './repositories/repository-factory';

async function testTransaction() {
  try {
    console.log('Testing transactions...');

    // Example 1: Create a user and source within a transaction
    const result = await RepositoryFactory.executeTransaction(async ({ userRepository, sourceRepository }) => {
      console.log('Transaction started');
      
      // Create a user
      const user = await userRepository.create({
        email: `test-transaction-${Date.now()}@example.com`,
        name: 'Transaction Test User',
        firebaseUid: `transaction-test-uid-${Date.now()}`,
        isActive: true
      });
      console.log('User created within transaction:', user.id);
      
      // Create a source for the user
      const source = await sourceRepository.create({
        name: 'Transaction Test Source',
        url: 'https://example.com/transaction-test',
        sourceType: 'RSS',
        userId: user.id,
        isActive: true,
        refreshRate: 30
      });
      console.log('Source created within transaction:', source.id);
      
      // Return both entities
      return { user, source };
    });
    
    console.log('Transaction committed successfully');
    console.log('Created user:', result.user.id);
    console.log('Created source:', result.source.id);

    // Example 2: Transaction that will be rolled back on error
    try {
      await RepositoryFactory.executeTransaction(async ({ userRepository }) => {
        console.log('Starting transaction that will fail...');
        
        // Create a user with an existing email to cause an error
        await userRepository.create({
          email: result.user.email, // This should cause a unique constraint violation
          name: 'Will Fail User',
          firebaseUid: 'will-fail-uid',
          isActive: true
        });
        
        return { success: true };
      });
    } catch (error: any) {
      console.log('Transaction rolled back as expected due to error:', error.message);
    }

    console.log('Transaction tests completed successfully');
  } catch (error: any) {
    console.error('Error testing transactions:', error.message);
  }
}

testTransaction()
  .then(() => console.log('Tests finished'))
  .catch((error: any) => console.error('Tests failed:', error.message)); 