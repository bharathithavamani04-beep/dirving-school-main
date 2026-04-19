import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    console.log("[API] POST /api/auth/register called");
    
    if (!process.env.DATABASE_URL) {
      console.error("[API] DATABASE_URL not available");
      return NextResponse.json(
        { error: "Server configuration error: DATABASE_URL not set" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { firebaseId, email, name, phone } = body;

    console.log("[API] Register request:", { firebaseId, email, name });

    // Validate required fields
    if (!firebaseId || !email || !name) {
      return NextResponse.json(
        { error: "Missing required fields: firebaseId, email, name" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { firebaseId },
          { email },
        ],
      },
    });

    if (existingUser) {
      console.log("[API] User already exists:", existingUser.id);
      return NextResponse.json(
        { error: "Email or account already registered" },
        { status: 409 }
      );
    }

    // Create user
    console.log("[API] Creating user in database...");
    const user = await prisma.user.create({
      data: {
        firebaseId,
        email,
        name,
        phone: phone || null,
        role: "STUDENT",
      },
    });

    console.log("[API] User created successfully:", user.id);

    return NextResponse.json(
      {
        id: user.id,
        firebaseId: user.firebaseId,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API] Register error:", error);
    
    const message = error instanceof Error ? error.message : "Unknown error";
    const code = error instanceof Error && "code" in error ? (error as Record<string, unknown>).code : undefined;
    console.error("[API] Error details:", {
      message,
      code,
    });

    return NextResponse.json(
      { error: `Registration failed: ${message}` },
      { status: 500 }
    );
  }
}
