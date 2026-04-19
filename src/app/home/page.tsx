"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/Button";
import { LogOut, BarChart3, Users} from "lucide-react";

interface StudentData {
  id: string;
  name: string;
  email: string;
  role: string;
  course?: { name: string; totalDays: number };
  totalClasses: number;
  attendedClasses: number;
  completionPercentage: number;
}

interface Stats {
  totalStudents: number;
  successRate: number;
  completedStudents: number;
}

export default function HomePage() {
  const router = useRouter();
  const [student, setStudent] = useState<StudentData | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("firebaseToken");
        if (!token) {
          router.push("/login");
          return;
        }

        // Fetch student profile
        const profileRes = await fetch("/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          
          if (profileData.role === "ADMIN") {
            router.push("/admin/dashboard");
            return;
          }

          const studentRes = await fetch(`/api/students?studentId=${profileData.id}`);
          if (studentRes.ok) {
            const studentData = await studentRes.json();
            setStudent(studentData);
          }

          // Fetch stats
          const statsRes = await fetch("/api/admin/stats");
          if (statsRes.ok) {
            const statsData = await statsRes.json();
            setStats(statsData);
          }
        } else {
          router.push("/login");
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
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-700">Loading...</div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-700 mb-4">Unable to load student data</p>
          <Button onClick={handleLogout}>Go to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#E91E63] rounded-lg flex items-center justify-center">
              <span className="font-bold text-white text-lg">R</span>
            </div>
            <span className="font-bold text-gray-900 text-lg">Rose Royal</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/student/dashboard" className="text-gray-700 hover:text-[#E91E63] font-medium">
              Dashboard
            </Link>
            <Link href="/profile" className="text-gray-700 hover:text-[#E91E63] font-medium">
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="text-gray-700 hover:text-[#E91E63] font-medium flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome, {student.name}! 👋
          </h1>
          <p className="text-xl text-gray-700">
            You&apos;re enrolled in <span className="font-semibold text-[#E91E63]">{student.course?.name || "No course assigned"}</span>
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <div className="text-3xl font-bold text-[#E91E63] mb-2">{student.completionPercentage}%</div>
            <p className="text-gray-700">Completion</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <div className="text-3xl font-bold text-green-500 mb-2">{student.attendedClasses}</div>
            <p className="text-gray-700">Classes Attended</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <div className="text-3xl font-bold text-blue-500 mb-2">{student.totalClasses}</div>
            <p className="text-gray-700">Total Classes</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <div className="text-3xl font-bold text-orange-500 mb-2">{student.totalClasses - student.attendedClasses}</div>
            <p className="text-gray-700">Remaining</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-lg shadow p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Progress</h2>
          <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden mb-4">
            <div
              className="bg-gradient-to-r from-[#E91E63] to-[#C2185B] h-full transition-all duration-500 rounded-full"
              style={{ width: `${student.completionPercentage}%` }}
            ></div>
          </div>
          <p className="text-gray-700">
            {student.attendedClasses} out of {student.totalClasses} classes completed
          </p>
        </div>

        {/* School Stats & CTA */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* School Stats */}
          <div className="bg-white rounded-lg shadow p-8">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-6 h-6 text-[#E91E63]" />
              <h2 className="text-2xl font-bold text-gray-900">School Statistics</h2>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-gray-700 text-sm">Total Students</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalStudents || 0}</p>
              </div>
              <div>
                <p className="text-gray-700 text-sm">Success Rate</p>
                <p className="text-3xl font-bold text-[#E91E63]">{stats?.successRate || 0}%</p>
              </div>
              <div>
                <p className="text-gray-700 text-sm">Completed Students</p>
                <p className="text-3xl font-bold text-green-500">{stats?.completedStudents || 0}</p>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-gradient-to-br from-[#E91E63] to-[#C2185B] rounded-lg shadow p-8 text-white">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-6 h-6" />
              <h2 className="text-2xl font-bold">Next Steps</h2>
            </div>
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 text-lg font-bold">1</div>
                <div>
                  <p className="font-semibold">Track Your Progress</p>
                  <p className="text-pink-100 text-sm">Monitor your attendance and completion percentage in real-time</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 text-lg font-bold">2</div>
                <div>
                  <p className="font-semibold">Attend Classes</p>
                  <p className="text-pink-100 text-sm">Complete all required classes to finish your course</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 text-lg font-bold">3</div>
                <div>
                  <p className="font-semibold">Share Feedback</p>
                  <p className="text-pink-100 text-sm">Help us improve by sharing your learning experience</p>
                </div>
              </div>
            </div>
            <Link href="/student/dashboard">
              <Button className="w-full bg-white text-[#E91E63] hover:bg-gray-100 font-bold">
                Go to Dashboard →
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
