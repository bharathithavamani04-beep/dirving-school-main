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
    console.log('Starting course migration...');

    // Update existing courses to have the new fields
    const courses = await prisma.course.findMany();
    
    for (const course of courses) {
      let type = 'BASIC';
      let totalDays = 30;
      
      // Determine course type based on name or duration
      const nameLower = course.name.toLowerCase();
      if (nameLower.includes('advanced')) {
        type = 'ADVANCED';
        totalDays = 50;
      } else if (nameLower.includes('defense') || nameLower.includes('defensive')) {
        type = 'DEFENSE';
        totalDays = 90;
      } else if (nameLower.includes('basic')) {
        type = 'BASIC';
        totalDays = 30;
      } else {
        // Default based on duration if available
        if (course.duration >= 80) {
          type = 'DEFENSE';
          totalDays = 90;
        } else if (course.duration >= 40) {
          type = 'ADVANCED';
          totalDays = 50;
        } else {
          type = 'BASIC';
          totalDays = 30;
        }
      }

      await prisma.course.update({
        where: { id: course.id },
        data: {
          type: type,
          totalDays: totalDays,
          // Keep duration as is for backward compatibility
        },
      });
      
      console.log(`Updated course: ${course.name} -> ${type} (${totalDays} days)`);
    }

    console.log('Course migration completed successfully!');
    
    // Create default courses if they don't exist
    const defaultCourses = [
      {
        name: 'Basic Driving',
        description: 'Learn fundamental driving skills including vehicle control, traffic rules, and basic road safety.',
        type: 'BASIC',
        totalDays: 30,
        duration: 30,
        price: 5000,
      },
      {
        name: 'Advanced Driving',
        description: 'Master advanced driving techniques, defensive driving strategies, and complex traffic scenarios.',
        type: 'ADVANCED',
        totalDays: 50,
        duration: 50,
        price: 8000,
      },
      {
        name: 'Defense Driving',
        description: 'Comprehensive defensive driving course covering emergency maneuvers, hazard perception, and advanced safety protocols.',
        type: 'DEFENSE',
        totalDays: 90,
        duration: 90,
        price: 12000,
      },
    ];

    for (const courseData of defaultCourses) {
      const existing = await prisma.course.findUnique({
        where: { name: courseData.name },
      });

      if (!existing) {
        await prisma.course.create({
          data: courseData,
        });
        console.log(`Created default course: ${courseData.name}`);
      }
    }

    console.log('Default courses created successfully!');
    console.log('Migration completed!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
