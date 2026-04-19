import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    const registrations = await prisma.user.findMany({
      where: { role: "STUDENT" },
      include: {
        course: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json(registrations);
  } catch (error) {
    console.error("Error fetching recent registrations:", error);
    return NextResponse.json(
      { error: "Failed to fetch recent registrations" },
      { status: 500 }
    );
  }
}
