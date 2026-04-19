// Script to seed admin user into the database
// Run: node scripts/seed-admin.js
// Requires DATABASE_URL in .env.local
/* eslint-disable @typescript-eslint/no-require-imports */

const { PrismaClient } = require("@prisma/client");
const { PrismaNeon } = require("@prisma/adapter-neon");
const fs = require("fs");
const path = require("path");

// Load .env.local manually
const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const eqIndex = trimmed.indexOf("=");
      if (eqIndex > 0) {
        const key = trimmed.substring(0, eqIndex).trim();
        const value = trimmed.substring(eqIndex + 1).trim();
        process.env[key] = value;
      }
    }
  });
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL not found. Make sure .env.local exists.");
  process.exit(1);
}

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function seedAdmin() {
  const adminEmail = "roseroyal@admin.com";
  const adminName = "Rose Royal Admin";

  console.log("Checking for existing admin user...");

  // Check if admin already exists
  const existing = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existing) {
    console.log("Admin already exists:", existing.id);
    // Update role to ADMIN if it's not already
    if (existing.role !== "ADMIN") {
      await prisma.user.update({
        where: { id: existing.id },
        data: { role: "ADMIN" },
      });
      console.log("Updated role to ADMIN");
    }
    return existing;
  }

  // Create admin user with a placeholder firebaseId
  // This will be updated when the admin first logs in via the profile API
  const admin = await prisma.user.create({
    data: {
      firebaseId: "admin-pending-firebase-setup",
      email: adminEmail,
      name: adminName,
      phone: "0000000000",
      role: "ADMIN",
    },
  });

  console.log("Admin user created:", admin.id);
  return admin;
}

// Also seed default courses if they don't exist
async function seedCourses() {
  const courses = [
    {
      name: "Basic Driving",
      description: "Perfect for beginners. Learn all the fundamentals of driving safely.",
      type: "BASIC",
      totalDays: 30,
      duration: 30,
      price: 5000,
    },
    {
      name: "Advanced Driving",
      description: "Master advanced techniques including highway and night driving.",
      type: "ADVANCED",
      totalDays: 50,
      duration: 50,
      price: 10000,
    },
    {
      name: "Defense Driving",
      description: "Learn defensive driving for all road conditions and emergencies.",
      type: "DEFENSE",
      totalDays: 90,
      duration: 90,
      price: 7500,
    },
  ];

  for (const course of courses) {
    const existing = await prisma.course.findUnique({
      where: { name: course.name },
    });

    if (!existing) {
      await prisma.course.create({ data: course });
      console.log("Created course:", course.name);
    } else {
      console.log("Course already exists:", course.name);
    }
  }
}

async function main() {
  try {
    await seedAdmin();
    await seedCourses();
    console.log("\nSeeding complete!");
  } catch (error) {
    console.error("Seeding error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
