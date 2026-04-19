/* eslint-disable @typescript-eslint/no-require-imports */

const { PrismaClient } = require('@prisma/client');
const { PrismaNeon } = require('@prisma/adapter-neon');

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }

  const adapter = new PrismaNeon({ connectionString });
  const prisma = new PrismaClient({ adapter });

  try {
    console.log('Applying migration: making courseId nullable in Attendance table...');
    await prisma.$executeRawUnsafe(
      'ALTER TABLE "Attendance" ALTER COLUMN "courseId" DROP NOT NULL'
    );
    console.log('SUCCESS: courseId is now nullable in the Attendance table.');
  } catch (error) {
    if (error.message && error.message.includes('already nullable')) {
      console.log('INFO: courseId is already nullable. No changes needed.');
    } else {
      console.error('ERROR:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
