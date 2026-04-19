// Script to create admin account in Firebase and update DB
// Run: node scripts/create-firebase-admin.js
// This uses Firebase REST API to create the account
/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

// Load .env.local
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

const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

if (!FIREBASE_API_KEY) {
  console.error("NEXT_PUBLIC_FIREBASE_API_KEY not found in .env.local");
  process.exit(1);
}

const ADMIN_EMAIL = "roseroyal@admin.com";
const ADMIN_PASSWORD = "RoseRoyal@mdu";

async function createFirebaseUser(email, password) {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`;
  
  const data = JSON.stringify({
    email,
    password,
    returnSecureToken: true,
  });

  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
      },
    }, (res) => {
      let body = "";
      res.on("data", (chunk) => body += chunk);
      res.on("end", () => {
        try {
          const result = JSON.parse(body);
          if (result.error) {
            reject(new Error(`Firebase error: ${result.error.message}`));
          } else {
            resolve(result);
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

async function updateAdminFirebaseId(firebaseId, email) {
  // Call the seed API endpoint on localhost
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ firebaseId, email });
    
    const req = http.request("http://localhost:3000/api/admin/seed", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
      },
    }, (res) => {
      let body = "";
      res.on("data", (chunk) => body += chunk);
      res.on("end", () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  try {
    console.log("Creating Firebase account for admin...");
    console.log("Email:", ADMIN_EMAIL);
    
    const firebaseUser = await createFirebaseUser(ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log("Firebase account created!");
    console.log("Firebase UID:", firebaseUser.localId);

    console.log("\nUpdating database with Firebase UID...");
    try {
      const dbResult = await updateAdminFirebaseId(firebaseUser.localId, ADMIN_EMAIL);
      console.log("Database updated:", dbResult);
    } catch {
      console.log("Could not update via API (server may not be running).");
      console.log("The profile API will auto-update firebaseId on first login.");
      console.log("\nFirebase UID to manually update:", firebaseUser.localId);
    }

    console.log("\n✅ Admin setup complete!");
    console.log("Email:", ADMIN_EMAIL);
    console.log("Password: RoseRoyal@mdu");
    console.log("Firebase UID:", firebaseUser.localId);
  } catch (error) {
    if (error.message && error.message.includes("EMAIL_EXISTS")) {
      console.log("Firebase account already exists for", ADMIN_EMAIL);
      console.log("The profile API will auto-match by email on login.");
      console.log("\n✅ Admin should be able to login - the profile API email fallback will handle it.");
    } else {
      console.error("Error:", error.message || error);
    }
  }
}

main();
