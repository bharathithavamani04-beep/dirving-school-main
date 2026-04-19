import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");

    if (studentId) {
      // Get single student with full details
      const student = await prisma.user.findUnique({
        where: { id: studentId },
        include: {
          course: true,
          attendance: {
            orderBy: { date: "desc" },
          },
        },
      });

      if (!student) {
        return NextResponse.json({ error: "Student not found" }, { status: 404 });
      }

      // Calculate statistics
      const totalClasses = student.course?.totalDays || 0;
      const attendedClasses = student.attendance.filter(
        (a) => a.status === "PRESENT"
      ).length;
      const completionPercentage =
        totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0;

      return NextResponse.json({
        ...student,
        totalClasses,
        attendedClasses,
        completionPercentage: Math.round(completionPercentage),
      });
    }

    // Get all students
    const students = await prisma.user.findMany({
      where: { role: "STUDENT" },
      include: {
        course: true,
        attendance: true,
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Add calculated fields
    const studentsWithStats = students.map((student) => {
      const totalClasses = student.course?.totalDays || 0;
      const attendedClasses = student.attendance.filter(
        (a) => a.status === "PRESENT"
      ).length;
      const completionPercentage =
        totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0;
      const totalRevenue = student.payments.reduce((sum, p) => sum + p.amount, 0);

      return {
        ...student,
        totalClasses,
        attendedClasses,
        completionPercentage: Math.round(completionPercentage),
        totalRevenue,
      };
    });

    return NextResponse.json(studentsWithStats);
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, phone, courseId, name } = body;

    if (!studentId) {
      return NextResponse.json(
        { error: "studentId is required" },
        { status: 400 }
      );
    }

    const updateData: { phone?: string; courseId?: string; name?: string } = {};
    if (phone) updateData.phone = phone;
    if (courseId) updateData.courseId = courseId;
    if (name) updateData.name = name;

    const student = await prisma.user.update({
      where: { id: studentId },
      data: updateData,
      include: {
        course: true,
        attendance: true,
      },
    });

    return NextResponse.json(student);
  } catch (error) {
    console.error("Error updating student:", error);
    return NextResponse.json(
      { error: "Failed to update student" },
      { status: 500 }
    );
  }
}
