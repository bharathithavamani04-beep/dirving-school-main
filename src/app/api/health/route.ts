import { NextResponse } from "next/server";

export async function GET() {
  console.log("[HEALTH] DATABASE_URL Environment Check");
  console.log("[HEALTH] NODE_ENV:", process.env.NODE_ENV);
  console.log("[HEALTH] DATABASE_URL available:", Boolean(process.env.DATABASE_URL));
  console.log("[HEALTH] DATABASE_URL value:", process.env.DATABASE_URL ? "SET" : "MISSING");
  console.log("[HEALTH] All env keys with DATABASE:", Object.keys(process.env).filter(k => k.includes('DATABASE')));
  
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({
      status: "ERROR",
      message: "DATABASE_URL is NOT set in Vercel environment",
      nodeEnv: process.env.NODE_ENV,
      databaseUrlAvailable: false,
      allEnvKeys: Object.keys(process.env).slice(0, 10),
    }, { status: 500 });
  }

  return NextResponse.json({
    status: "OK",
    message: "DATABASE_URL is available",
    nodeEnv: process.env.NODE_ENV,
    databaseUrlAvailable: true,
    databaseUrlMasked: process.env.DATABASE_URL.replace(/:[^:@]+@/, ":***@"),
  }, { status: 200 });
}
