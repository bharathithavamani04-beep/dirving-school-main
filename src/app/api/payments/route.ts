import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    const month = searchParams.get("month"); // YYYY-MM format

    const where: { studentId?: string; date?: { gte: Date; lt: Date } } = {};

    if (studentId) where.studentId = studentId;

    if (month) {
      const [year, monthNum] = month.split("-");
      const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(monthNum), 1);
      where.date = { gte: startDate, lt: endDate };
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        student: {
          select: { name: true, email: true },
        },
        course: {
          select: { name: true },
        },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, courseId, amount, paymentMethod, notes, date } = body;

    if (!studentId || !amount) {
      return NextResponse.json(
        { error: "studentId and amount are required" },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.create({
      data: {
        studentId,
        courseId: courseId || null,
        amount,
        paymentMethod: paymentMethod || "CASH",
        notes: notes || null,
        date: date ? new Date(date) : new Date(),
      },
      include: {
        student: {
          select: { name: true, email: true },
        },
        course: {
          select: { name: true },
        },
      },
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json(
      { error: "Failed to create payment" },
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

    await prisma.payment.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Payment deleted successfully" });
  } catch (error) {
    console.error("Error deleting payment:", error);
    return NextResponse.json(
      { error: "Failed to delete payment" },
      { status: 500 }
    );
  }
}
