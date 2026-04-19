"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/Button";
import { LogOut } from "lucide-react";

interface StudentData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  course?: { name: string; totalDays: number };
  totalClasses: number;
  attendedClasses: number;
  completionPercentage: number;
  attendance: Array<{
    id: string;
    date: string;
    status: string;
    isHoliday: boolean;
  }>;
  createdAt: string;
}

interface FeedbackData {
  id: string;
  rating: number;
  message: string;
  createdAt: string;
}

export default function StudentDashboard() {
  const router = useRouter();
  const [student, setStudent] = useState<StudentData | null>(null);
  const [feedback, setFeedback] = useState<FeedbackData[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbackForm, setFeedbackForm] = useState({ rating: 5, message: "" });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

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
          if (profileData.role !== "STUDENT") {
            router.push("/admin/dashboard");
            return;
          }

          const studentRes = await fetch(`/api/students?studentId=${profileData.id}`);
          if (studentRes.ok) {
            const studentData = await studentRes.json();
            setStudent(studentData);

            // Fetch feedback
            const feedbackRes = await fetch(`/api/feedback?studentId=${profileData.id}`);
            if (feedbackRes.ok) {
              const feedbackData = await feedbackRes.json();
              setFeedback(feedbackData);
            }
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

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student || !feedbackForm.message.trim()) return;

    try {
      setSubmittingFeedback(true);
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: student.id,
          rating: feedbackForm.rating,
          message: feedbackForm.message,
        }),
      });

      if (res.ok) {
        const newFeedback = await res.json();
        setFeedback([newFeedback, ...feedback]);
        setFeedbackForm({ rating: 5, message: "" });
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
    } finally {
      setSubmittingFeedback(false);
    }
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
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome, {student.name}!</h1>
          <p className="text-gray-700">Course: {student.course?.name || "Not assigned"}</p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-4xl font-bold text-[#E91E63] mb-2">{student.totalClasses}</div>
            <p className="text-gray-700">Total Classes</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-4xl font-bold text-green-500 mb-2">{student.attendedClasses}</div>
            <p className="text-gray-700">Classes Attended</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-4xl font-bold text-blue-500 mb-2">
              {student.totalClasses - student.attendedClasses}
            </div>
            <p className="text-gray-700">Remaining Classes</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-4xl font-bold text-[#C2185B] mb-2">{student.completionPercentage}%</div>
            <p className="text-gray-700">Completion</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-lg shadow p-6 mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Your Progress</h2>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#E91E63] to-[#C2185B] h-full transition-all duration-500"
              style={{ width: `${student.completionPercentage}%` }}
            ></div>
          </div>
          <p className="text-gray-700 mt-4">
            {student.attendedClasses} out of {student.totalClasses} classes completed
          </p>
        </div>

        {/* Feedback Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Your Feedback</h2>

          {/* Feedback Form */}
          <form onSubmit={handleFeedbackSubmit} className="mb-8 p-4 bg-gray-50 rounded-lg">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating (1-5 stars)
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFeedbackForm({ ...feedbackForm, rating: star })}
                    className={`text-2xl ${
                      star <= feedbackForm.rating ? "text-yellow-400" : "text-gray-400"
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                value={feedbackForm.message}
                onChange={(e) =>
                  setFeedbackForm({ ...feedbackForm, message: e.target.value })
                }
                placeholder="Share your experience..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E91E63] text-gray-900"
                rows={4}
              />
            </div>

            <Button
              type="submit"
              disabled={submittingFeedback}
              className="w-full"
            >
              {submittingFeedback ? "Submitting..." : "Submit Feedback"}
            </Button>
          </form>

          {/* Feedback History */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Feedback History</h3>
            {feedback.length > 0 ? (
              <div className="space-y-4">
                {feedback.map((f) => (
                  <div key={f.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={i < f.rating ? "text-yellow-400" : "text-gray-400"}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {new Date(f.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{f.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No feedback submitted yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
