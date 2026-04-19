"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/Button";
import { LogOut, Plus, Trash2 } from "lucide-react";

interface Payment {
  id: string;
  studentId: string;
  amount: number;
  date: string;
  student: { name: string; email: string };
  course?: { name: string };
}

interface Student {
  id: string;
  name: string;
  email: string;
}

interface Stats {
  totalRevenue: number;
  monthlyRevenue: number;
}

export default function RevenuePage() {
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<Stats>({ totalRevenue: 0, monthlyRevenue: 0 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));
  const [formData, setFormData] = useState({
    studentId: "",
    amount: "",
    date: new Date().toISOString().split('T')[0],
  });

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

        // Fetch payments
        const paymentsRes = await fetch(`/api/payments?month=${filterMonth}`);
        if (paymentsRes.ok) {
          const paymentsData = await paymentsRes.json();
          setPayments(paymentsData);
        }

        // Fetch students for dropdown
        const studentsRes = await fetch("/api/students");
        if (studentsRes.ok) {
          const studentsData = await studentsRes.json();
          setStudents(studentsData);
        }

        // Fetch stats
        const statsRes = await fetch("/api/admin/stats");
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats({
            totalRevenue: statsData.totalRevenue,
            monthlyRevenue: statsData.monthlyRevenue,
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filterMonth, router]);

  const handleLogout = () => {
    localStorage.removeItem("firebaseToken");
    localStorage.removeItem("firebaseUser");
    router.push("/admin/login");
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.studentId || !formData.amount) {
      alert("Please fill all fields");
      return;
    }

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: formData.studentId,
          amount: parseFloat(formData.amount),
          date: formData.date,
        }),
      });

      if (res.ok) {
        const newPayment = await res.json();
        setPayments([newPayment, ...payments]);
        setFormData({ studentId: "", amount: "", date: new Date().toISOString().split('T')[0] });
        setShowForm(false);

        // Refresh stats
        const statsRes = await fetch("/api/admin/stats");
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats({
            totalRevenue: statsData.totalRevenue,
            monthlyRevenue: statsData.monthlyRevenue,
          });
        }
      }
    } catch (error) {
      console.error("Error adding payment:", error);
      alert("Failed to add payment");
    }
  };

  const handleDeletePayment = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this payment?")) return;

    try {
      const res = await fetch(`/api/payments?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setPayments(payments.filter((p) => p.id !== id));
      }
    } catch (error) {
      console.error("Error deleting payment:", error);
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
          <Link href="/admin/attendance" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition">
            Attendance
          </Link>
          <Link
            href="/admin/revenue"
            className="block px-4 py-2 bg-[#E91E63] text-white rounded-lg font-medium"
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
        <div className="bg-white shadow-sm border-b border-gray-200 p-6">
          <h1 className="text-3xl font-bold text-gray-900">Revenue Management</h1>
          <p className="text-gray-700 mt-2">Track financial records and payments</p>
        </div>

        <div className="p-6">
          {/* Revenue Summary */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-700 text-sm font-medium mb-2">Total Revenue</p>
              <p className="text-4xl font-bold text-[#E91E63]">
                ₹{stats.totalRevenue.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-700 text-sm font-medium mb-2">Monthly Revenue</p>
              <p className="text-4xl font-bold text-green-600">
                ₹{stats.monthlyRevenue.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {/* Add Payment & Filter */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Payment History</h2>
              <div className="flex gap-4">
                <input
                  type="month"
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E91E63] text-gray-900"
                />
                <Button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add Payment
                </Button>
              </div>
            </div>

            {/* Add Payment Form */}
            {showForm && (
              <form onSubmit={handleAddPayment} className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Student</label>
                    <select
                      value={formData.studentId}
                      onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E91E63] text-gray-900"
                    >
                      <option value="">Select Student</option>
                      {students.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E91E63] text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E91E63] text-gray-900"
                    />
                  </div>

                  <div className="flex items-end gap-2">
                    <Button type="submit" className="flex-1">
                      Add
                    </Button>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Payments Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Student Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.length > 0 ? (
                    payments.map((payment) => (
                      <tr key={payment.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{payment.student.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{payment.student.email}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-[#E91E63]">₹{payment.amount.toLocaleString('en-IN')}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {new Date(payment.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => handleDeletePayment(payment.id)}
                            className="text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                          >
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-600">
                        No payments found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
