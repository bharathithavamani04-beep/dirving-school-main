import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AttendanceStatus } from "@prisma/client";

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

    const attendance = await prisma.attendance.findMany({
      where,
      include: {
        student: {
          select: { name: true, email: true, phone: true },
        },
        course: {
          select: { name: true },
        },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(attendance);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      studentId,
      courseId,
      date,
      status,
      isHoliday,
      markForAll,
      studentIds,
    } = body;

    // Handle batch attendance
    if (markForAll && studentIds && Array.isArray(studentIds)) {
      const results = [];
      const errors = [];

      for (const sid of studentIds) {
        try {
          if (!sid || typeof sid !== "string") {
            errors.push({ studentId: sid, error: "Invalid student ID" });
            continue;
          }

          const attendanceDate = new Date(date);
          attendanceDate.setUTCHours(0, 0, 0, 0);

          const attendanceStatus = (
            status === "ABSENT"
              ? "ABSENT"
              : status === "HOLIDAY"
                ? "HOLIDAY"
                : "PRESENT"
          ) as AttendanceStatus;

          const student = await prisma.user.findUnique({
            where: { id: sid },
            select: { courseId: true, name: true },
          });

          if (!student) {
            errors.push({ studentId: sid, error: "Student not found" });
            continue;
          }

          const attendance = await prisma.attendance.upsert({
            where: {
              studentId_date: {
                studentId: sid,
                date: attendanceDate,
              },
            },
            update: {
              status: attendanceStatus,
              isHoliday: isHoliday || status === "HOLIDAY",
              courseId: student.courseId || courseId || null,
            },
            create: {
              studentId: sid,
              courseId: student.courseId || courseId || null,
              date: attendanceDate,
              status: attendanceStatus,
              isHoliday: isHoliday || status === "HOLIDAY",
            },
            include: {
              student: { select: { name: true } },
              course: { select: { name: true } },
            },
          });

          results.push(attendance);
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : String(err);
          console.error(`Error marking attendance for ${sid}:`, errorMsg);
          errors.push({ studentId: sid, error: errorMsg });
        }
      }

      return NextResponse.json(
        {
          message: `Marked attendance for ${results.length}/${studentIds.length} students`,
          results,
          successCount: results.length,
          failureCount: errors.length,
          errors: errors.length > 0 ? errors : undefined,
        },
        { status: results.length > 0 ? 201 : 400 }
      );
    }

    // Single student attendance
    if (!studentId || !date) {
      return NextResponse.json(
        { error: "studentId and date are required" },
        { status: 400 }
      );
    }

    const attendanceDate = new Date(date);
    attendanceDate.setUTCHours(0, 0, 0, 0);

    const attendanceStatus = (
      status === "ABSENT"
        ? "ABSENT"
        : status === "HOLIDAY"
          ? "HOLIDAY"
          : "PRESENT"
    ) as AttendanceStatus;

    const attendance = await prisma.attendance.upsert({
      where: {
        studentId_date: {
          studentId,
          date: attendanceDate,
        },
      },
      update: {
        status: attendanceStatus,
        isHoliday: isHoliday || status === "HOLIDAY",
        courseId: courseId || null,
      },
      create: {
        studentId,
        courseId: courseId || null,
        date: attendanceDate,
        status: attendanceStatus,
        isHoliday: isHoliday || status === "HOLIDAY",
      },
      include: {
        student: { select: { name: true, email: true } },
        course: { select: { name: true } },
      },
    });

    return NextResponse.json(attendance, { status: 201 });
  } catch (error) {
    console.error("Error creating attendance:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create attendance", message: errorMessage },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, isHoliday } = body;

    if (!id) {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 }
      );
    }

    const updateData: Record<string, AttendanceStatus | boolean> = {};
    if (status) {
      updateData.status = (
        status === "ABSENT"
          ? "ABSENT"
          : status === "HOLIDAY"
            ? "HOLIDAY"
            : "PRESENT"
      ) as AttendanceStatus;
    }
    if (typeof isHoliday === "boolean") {
      updateData.isHoliday = isHoliday;
    }

    const attendance = await prisma.attendance.update({
      where: { id },
      data: updateData,
      include: {
        student: true,
        course: true,
      },
    });

    return NextResponse.json(attendance);
  } catch (error) {
    console.error("Error updating attendance:", error);
    return NextResponse.json(
      { error: "Failed to update attendance" },
      { status: 500 }
    );
  }
}
