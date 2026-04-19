import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtDecode } from "jwt-decode";

interface DecodedFirebaseToken {
  user_id?: string;
  sub?: string;
  email?: string;
}

export async function GET(request: NextRequest) {
  try {
    console.log("[API] GET /api/auth/profile called");

    if (!process.env.DATABASE_URL) {
      console.error("[API] DATABASE_URL not available");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Get authorization header
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("[API] Missing or invalid authorization header");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Decode the Firebase JWT token to extract user_id and email
    let firebaseId: string | null = null;
    let email: string | null = null;

    try {
      const decoded = jwtDecode<DecodedFirebaseToken>(token);
      firebaseId = decoded.user_id || decoded.sub || null;
      email = decoded.email || null;
      console.log("[API] Decoded token - firebaseId:", firebaseId, "email:", email);
    } catch (decodeErr) {
      console.error("[API] Failed to decode token:", decodeErr);
    }

    // Also check headers and query params as fallback
    if (!firebaseId) {
      firebaseId = request.headers.get("x-user-id");
    }
    if (!firebaseId) {
      const { searchParams } = new URL(request.url);
      firebaseId = searchParams.get("id");
    }

    if (!firebaseId && !email) {
      console.error("[API] No firebaseId or email available");
      return NextResponse.json(
        { error: "User ID not provided" },
        { status: 400 }
      );
    }

    console.log("[API] Looking up user - firebaseId:", firebaseId, "email:", email);

    // Try finding by firebaseId first, then by email as fallback
    let user = null;
    
    if (firebaseId) {
      user = await prisma.user.findUnique({
        where: { firebaseId },
        select: {
          id: true,
          firebaseId: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          courseId: true,
          course: {
            select: {
              id: true,
              name: true,
              type: true,
              totalDays: true,
              description: true,
            },
          },
          createdAt: true,
          updatedAt: true,
        },
      });
    }

    // Fallback: find by email if firebaseId lookup failed
    if (!user && email) {
      console.log("[API] Trying email fallback lookup:", email);
      user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          firebaseId: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          courseId: true,
          course: {
            select: {
              id: true,
              name: true,
              type: true,
              totalDays: true,
              description: true,
            },
          },
          createdAt: true,
          updatedAt: true,
        },
      });

      // Update firebaseId if it was missing or different
      if (user && firebaseId && user.firebaseId !== firebaseId) {
        console.log("[API] Updating firebaseId for user:", user.id);
        await prisma.user.update({
          where: { id: user.id },
          data: { firebaseId },
        });
        user.firebaseId = firebaseId;
      }
    }

    if (!user) {
      console.log("[API] User not found - firebaseId:", firebaseId, "email:", email);
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    console.log("[API] Profile returned for:", user.id, "role:", user.role);

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("[API] Profile fetch error:", error);
    
    const message = error instanceof Error ? error.message : "Unknown error";
    
    return NextResponse.json(
      { error: `Failed to fetch profile: ${message}` },
      { status: 500 }
    );
  }
}
