import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function findUser() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'cam.marsollier@gmail.com' }
    });
    console.log('Found user:', user);
  } catch (error) {
    console.error('Error finding user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findUser(); 