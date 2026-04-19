"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/Button";
import { LogOut } from "lucide-react";

interface StudentProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  course?: { name: string; totalDays: number };
  createdAt: string;
  totalClasses: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("firebaseToken");
        if (!token) {
          router.push("/login");
          return;
        }

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
            setProfile(studentData);
            setPhone(studentData.phone || "");
          }
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleSave = async () => {
    if (!profile) return;

    try {
      setSaving(true);
      const res = await fetch("/api/students", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: profile.id,
          phone,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        setEditing(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setSaving(false);
    }
  };

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

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-700 mb-4">Unable to load profile</p>
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
            <button
              onClick={handleLogout}
              className="text-gray-700 hover:text-[#E91E63] font-medium flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

          {/* Profile Information */}
          <div className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                value={profile.name}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={!editing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#E91E63]"
              />
            </div>

            {/* Course */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assigned Course
              </label>
              <input
                type="text"
                value={profile.course?.name || "Not assigned"}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
              />
            </div>

            {/* Total Classes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Classes
              </label>
              <input
                type="number"
                value={profile.totalClasses}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
              />
            </div>

            {/* Joined Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Joined Date
              </label>
              <input
                type="text"
                value={new Date(profile.createdAt).toLocaleDateString()}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex gap-4">
            {editing ? (
              <>
                <Button onClick={handleSave} disabled={saving} className="flex-1">
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  onClick={() => {
                    setEditing(false);
                    setPhone(profile.phone || "");
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 hover:bg-gray-400"
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={() => setEditing(true)} className="w-full">
                Edit Profile
              </Button>
            )}
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="mt-6 w-full px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition font-medium"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
