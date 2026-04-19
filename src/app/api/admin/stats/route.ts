import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get total students
    const totalStudents = await prisma.user.count({
      where: { role: "STUDENT" },
    });

    // Get all students with attendance and course data
    const students = await prisma.user.findMany({
      where: { role: "STUDENT" },
      include: {
        course: true,
        attendance: true,
      },
    });

    // Calculate active and completed students
    let activeStudents = 0;
    let completedStudents = 0;

    students.forEach((student) => {
      const totalClasses = student.course?.totalDays || 0;
      const attendedClasses = student.attendance.filter(
        (a) => a.status === "PRESENT"
      ).length;
      const completionPercentage =
        totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0;

      if (completionPercentage === 100) {
        completedStudents++;
      } else if (completionPercentage > 0) {
        activeStudents++;
      }
    });

    // Calculate current month revenue
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const monthlyRevenue = await prisma.payment.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        date: {
          gte: firstDay,
          lte: lastDay,
        },
      },
    });

    // Calculate total revenue (all time)
    const totalRevenue = await prisma.payment.aggregate({
      _sum: {
        amount: true,
      },
    });

    // Calculate success rate
    const successRate =
      totalStudents > 0
        ? Math.round((completedStudents / totalStudents) * 100)
        : 0;

    return NextResponse.json({
      totalStudents,
      activeStudents,
      completedStudents,
      monthlyRevenue: monthlyRevenue._sum.amount || 0,
      totalRevenue: totalRevenue._sum.amount || 0,
      successRate,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
