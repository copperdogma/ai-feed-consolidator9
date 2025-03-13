// Script to check users in the database
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Querying database for users...');
  
  try {
    const users = await prisma.user.findMany();
    
    console.log(`Found ${users.length} users in the database:`);
    users.forEach((user, index) => {
      console.log(`User ${index + 1}:`);
      console.log(JSON.stringify(user, null, 2));
      console.log('-----------------------------------');
    });
    
    if (users.length === 0) {
      console.log('No users found in the database.');
    }
  } catch (error) {
    console.error('Error querying the database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 