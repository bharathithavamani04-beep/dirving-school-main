import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");

    const where: { studentId?: string } = {};
    if (studentId) where.studentId = studentId;

    const feedback = await prisma.feedback.findMany({
      where,
      include: {
        student: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(feedback);
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, rating, message } = body;

    if (!studentId || !rating || !message) {
      return NextResponse.json(
        { error: "studentId, rating, and message are required" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    const feedback = await prisma.feedback.create({
      data: {
        studentId,
        rating,
        message,
      },
      include: {
        student: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    console.error("Error creating feedback:", error);
    return NextResponse.json(
      { error: "Failed to create feedback" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 }
      );
    }

    await prisma.feedback.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Feedback deleted successfully" });
  } catch (error) {
    console.error("Error deleting feedback:", error);
    return NextResponse.json(
      { error: "Failed to delete feedback" },
      { status: 500 }
    );
  }
}
