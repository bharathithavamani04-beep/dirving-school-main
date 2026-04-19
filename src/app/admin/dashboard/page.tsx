"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/Button";
import { LogOut, Users, BarChart3, TrendingUp, DollarSign } from "lucide-react";

interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  completedStudents: number;
  monthlyRevenue: number;
  totalRevenue: number;
  successRate: number;
}

interface Registration {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  course?: { name: string };
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

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

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData.role !== "ADMIN") {
            router.push("/home");
            return;
          }
        } else {
          router.push("/admin/login");
          return;
        }

        // Fetch dashboard stats
        const statsRes = await fetch("/api/admin/stats");
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        // Fetch recent registrations
        const regsRes = await fetch("/api/admin/registrations");
        if (regsRes.ok) {
          const regsData = await regsRes.json();
          setRegistrations(regsData.slice(0, 10));
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-700">Loading...</div>
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
          <Link
            href="/admin/dashboard"
            className="block px-4 py-2 bg-[#E91E63] text-white rounded-lg font-medium"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/attendance"
            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition"
          >
            Attendance
          </Link>
          <Link
            href="/admin/revenue"
            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition"
          >
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
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 p-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-700 mt-2">Manage Rose Royal Driving School</p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Stats Grid */}
          {stats && (
            <div className="grid md:grid-cols-5 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-700 text-sm font-medium">Total Students</h3>
                  <Users className="w-5 h-5 text-[#E91E63]" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.totalStudents}</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-700 text-sm font-medium">Active Students</h3>
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.activeStudents}</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-700 text-sm font-medium">Completed</h3>
                  <BarChart3 className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.completedStudents}</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-700 text-sm font-medium">Success Rate</h3>
                  <BarChart3 className="w-5 h-5 text-orange-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.successRate}%</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-700 text-sm font-medium">Monthly Revenue</h3>
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">₹{stats.monthlyRevenue.toLocaleString('en-IN')}</p>
              </div>
            </div>
          )}

          {/* Recent Registrations */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Recent Registrations</h2>
              <p className="text-gray-700 text-sm mt-1">Latest student registrations</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Course</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Join Date</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.length > 0 ? (
                    registrations.map((reg) => (
                      <tr key={reg.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{reg.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{reg.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{reg.course?.name || "Not assigned"}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {new Date(reg.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-600">
                        No registrations yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 border-t border-gray-200">
              <Link href="/admin/attendance">
                <Button>View All Students & Manage Attendance</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
