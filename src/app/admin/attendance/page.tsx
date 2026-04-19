"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/Button";
import { LogOut, Edit2, Calendar } from "lucide-react";

interface Student {
  id: string;
  name: string;
  email: string;
  phone?: string;
  course?: { id: string; name: string };
  totalClasses: number;
  attendedClasses: number;
  completionPercentage: number;
}

interface Course {
  id: string;
  name: string;
  totalDays: number;
  type: string;
}

export default function AttendancePage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [markingAttendance, setMarkingAttendance] = useState<string | null>(null);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceStatus, setAttendanceStatus] = useState("PRESENT");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("firebaseToken");
        if (!token) {
          router.push("/admin/login");
          return;
        }

        // Verify admin role
        const profileRes = await fetch("/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!profileRes.ok || (await profileRes.json()).role !== "ADMIN") {
          router.push("/home");
          return;
        }

        // Fetch students
        const studentsRes = await fetch("/api/students");
        if (studentsRes.ok) {
          const studentsData = await studentsRes.json();
          setStudents(studentsData);
        }

        // Fetch courses
        const coursesRes = await fetch("/api/courses");
        if (coursesRes.ok) {
          const coursesData = await coursesRes.json();
          setCourses(coursesData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("firebaseToken");
    localStorage.removeItem("firebaseUser");
    router.push("/admin/login");
  };

  const handleEditStudent = async (student: Student) => {
    if (!editingStudent) {
      setEditingStudent(student);
      return;
    }

    try {
      const res = await fetch("/api/students", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: editingStudent.id,
          phone: editingStudent.phone,
          courseId: editingStudent.course?.id,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setStudents(students.map((s) => (s.id === updated.id ? updated : s)));
        setEditingStudent(null);
      }
    } catch (error) {
      console.error("Error updating student:", error);
    }
  };

  const handleMarkAttendance = async (studentId: string) => {
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          date: attendanceDate,
          status: attendanceStatus,
        }),
      });

      if (res.ok) {
        // Refresh student data
        const studentsRes = await fetch("/api/students");
        if (studentsRes.ok) {
          const studentsData = await studentsRes.json();
          setStudents(studentsData);
        }
        setMarkingAttendance(null);
        alert("Attendance marked successfully");
      }
    } catch (error) {
      console.error("Error marking attendance:", error);
      alert("Failed to mark attendance");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="w-64 bg-white shadow-lg p-6"></div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-700">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-[#E91E63] rounded-lg flex items-center justify-center">
            <span className="font-bold text-white">R</span>
          </div>
          <span className="font-bold text-gray-900 text-lg">Rose Royal Admin</span>
        </div>

        <nav className="space-y-4 mb-8">
          <Link href="/admin/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition">
            Dashboard
          </Link>
          <Link
            href="/admin/attendance"
            className="block px-4 py-2 bg-[#E91E63] text-white rounded-lg font-medium"
          >
            Attendance
          </Link>
          <Link href="/admin/revenue" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition">
            Revenue
          </Link>
        </nav>

        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition font-medium flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="bg-white shadow-sm border-b border-gray-200 p-6">
          <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
          <p className="text-gray-700 mt-2">Manage student records and mark attendance</p>
        </div>

        <div className="p-6">
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Course</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Total Classes</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Completion %</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.length > 0 ? (
                  students.map((student) => (
                    <tr key={student.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{student.phone || "N/A"}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{student.course?.name || "Not assigned"}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{student.totalClasses}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full font-semibold ${
                          student.completionPercentage === 100
                            ? "bg-green-100 text-green-700"
                            : student.completionPercentage > 50
                              ? "bg-blue-100 text-blue-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {student.completionPercentage}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2 flex">
                        <button
                          onClick={() => handleEditStudent(student)}
                          className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 flex items-center gap-1"
                        >
                          <Edit2 className="w-4 h-4" /> Edit
                        </button>
                        <button
                          onClick={() => setMarkingAttendance(student.id)}
                          className="px-3 py-1 bg-[#E91E63] text-white rounded hover:bg-[#C2185B] flex items-center gap-1"
                        >
                          <Calendar className="w-4 h-4" />Mark
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-600">
                      No students found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Mark Attendance Modal */}
      {markingAttendance && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Mark Attendance</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E91E63] text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={attendanceStatus}
                  onChange={(e) => setAttendanceStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E91E63] text-gray-900"
                >
                  <option value="PRESENT">Present</option>
                  <option value="ABSENT">Absent</option>
                  <option value="HOLIDAY">Holiday</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <Button
                onClick={() => handleMarkAttendance(markingAttendance)}
                className="flex-1"
              >
                Mark Attendance
              </Button>
              <button
                onClick={() => setMarkingAttendance(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {editingStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Edit Student</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={editingStudent.phone || ""}
                  onChange={(e) =>
                    setEditingStudent({ ...editingStudent, phone: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E91E63] text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
                <select
                  value={editingStudent.course?.id || ""}
                  onChange={(e) => {
                    const course = courses.find((c) => c.id === e.target.value);
                    setEditingStudent({
                      ...editingStudent,
                      course: course || undefined,
                    });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E91E63] text-gray-900"
                >
                  <option value="">Select Course</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <Button onClick={() => handleEditStudent(editingStudent)} className="flex-1">
                Save Changes
              </Button>
              <button
                onClick={() => setEditingStudent(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
