"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Get token and store in both localStorage and cookie
      const token = await user.getIdToken();
      localStorage.setItem("firebaseToken", token);
      localStorage.setItem("firebaseUser", JSON.stringify({
        uid: user.uid,
        email: user.email,
      }));
      
      // Also set as cookie for middleware access
      document.cookie = `firebaseToken=${token};path=/;max-age=3600`;
      document.cookie = `firebaseId=${user.uid};path=/;max-age=3600`;

      // Fetch user role from API
      const profileRes = await fetch("/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        
        if (profileData.role !== "ADMIN") {
          setError("You do not have admin access");
          localStorage.removeItem("firebaseToken");
          localStorage.removeItem("firebaseUser");
          return;
        }
        
        router.push("/admin/dashboard");
      } else {
        throw new Error("Failed to verify admin role");
      }
    } catch (err) {
      console.error("Admin login error:", err);
      
      let errorMessage = "Login failed";
      
      if (err instanceof Error) {
        if (err.message.includes("auth/invalid-credential")) {
          errorMessage = "Invalid email or password";
        } else if (err.message.includes("auth/user-not-found")) {
          errorMessage = "Admin account not found";
        } else if (err.message.includes("does not have admin access")) {
          errorMessage = "You do not have admin access";
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-[#E91E63] rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">R</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Portal</h1>
            <p className="text-gray-700 mt-2">Rose Royal Driving School</p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="admin@roseroyaldriving.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-pink-500 hover:bg-pink-600 disabled:bg-gray-400"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="text-center text-gray-700 text-sm mt-6">
            Student?{" "}
            <Link href="/login" className="text-[#E91E63] font-medium hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
