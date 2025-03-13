import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function findAllUsers() {
  try {
    const users = await prisma.user.findMany();
    console.log('All users in database:', users);
    console.log(`Total users found: ${users.length}`);
  } catch (error) {
    console.error('Error finding users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findAllUsers(); 