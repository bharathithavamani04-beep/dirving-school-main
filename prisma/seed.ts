/// <reference types="node" />
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env file
try {
  const envPath = resolve(process.cwd(), ".env");
  const envContent = readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const eqIndex = trimmed.indexOf("=");
      if (eqIndex > 0) {
        const key = trimmed.substring(0, eqIndex).trim();
        const value = trimmed.substring(eqIndex + 1).trim();
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  });
} catch {
  // .env file not found or couldn't be read
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database with updated course structure...");

  // Create courses with new structure (30, 50, 90 days)
  const courses = await Promise.all([
    prisma.course.upsert({
      where: { name: "Basic Driving" },
      update: {
        type: "BASIC",
        totalDays: 30,
        duration: 30,
        description: "Learn fundamental driving skills including vehicle control, traffic rules, and basic road safety. Duration: 30 days.",
      },
      create: {
        name: "Basic Driving",
        description: "Learn fundamental driving skills including vehicle control, traffic rules, and basic road safety. Duration: 30 days.",
        type: "BASIC",
        totalDays: 30,
        duration: 30,
        price: 5000,
      },
    }),
    prisma.course.upsert({
      where: { name: "Advanced Driving" },
      update: {
        type: "ADVANCED",
        totalDays: 50,
        duration: 50,
        description: "Master advanced driving techniques, defensive driving strategies, and complex traffic scenarios. Duration: 50 days.",
      },
      create: {
        name: "Advanced Driving",
        description: "Master advanced driving techniques, defensive driving strategies, and complex traffic scenarios. Duration: 50 days.",
        type: "ADVANCED",
        totalDays: 50,
        duration: 50,
        price: 8000,
      },
    }),
    prisma.course.upsert({
      where: { name: "Defense Driving" },
      update: {
        type: "DEFENSE",
        totalDays: 90,
        duration: 90,
        description: "Comprehensive defensive driving course covering emergency maneuvers, hazard perception, and advanced safety protocols. Duration: 90 days.",
      },
      create: {
        name: "Defense Driving",
        description: "Comprehensive defensive driving course covering emergency maneuvers, hazard perception, and advanced safety protocols. Duration: 90 days.",
        type: "DEFENSE",
        totalDays: 90,
        duration: 90,
        price: 12000,
      },
    }),
  ]);

  console.log("Created/Updated courses:");
  courses.forEach((c) => {
    console.log(`  - ${c.name} (${(c as any).type}, ${(c as any).totalDays} days)`);
  });
  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
