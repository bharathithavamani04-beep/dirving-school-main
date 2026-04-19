"use client";

import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function StudentNav() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/student/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#E91E63] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">R</span>
            </div>
            <span className="font-bold text-gray-900 hidden sm:inline">
              Rose Royal
            </span>
          </Link>

          <div className="hidden md:flex gap-8">
            <Link
              href="/student/dashboard"
              className="text-gray-700 hover:text-[#E91E63] transition"
            >
              Dashboard
            </Link>
            <Link
              href="/student/monitoring"
              className="text-gray-700 hover:text-[#E91E63] transition"
            >
              Monitoring
            </Link>
            <Link
              href="/profile"
              className="text-gray-700 hover:text-[#E91E63] transition"
            >
              Profile
            </Link>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition font-medium text-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
