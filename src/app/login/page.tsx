"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getAuthInstance } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";

export default function LoginPage() {
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
      console.log("[Login] Signing in user...");
      
      const auth = getAuthInstance();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log("[Login] User signed in:", user.uid);

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
        console.log("[Login] User role:", profileData.role);
        
        if (profileData.role === "ADMIN") {
          router.push("/admin/dashboard");
        } else {
          router.push("/home");
        }
      } else {
        throw new Error("Failed to fetch user profile");
      }
    } catch (err) {
      console.error("[Login] Error:", err);
      
      let errorMessage = "Login failed";
      
      if (err instanceof Error) {
        if (err.message.includes("auth/invalid-credential")) {
          errorMessage = "Invalid email or password";
        } else if (err.message.includes("auth/user-not-found")) {
          errorMessage = "Account not found";
        } else if (err.message.includes("auth/wrong-password")) {
          errorMessage = "Incorrect password";
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
    <div className="min-h-screen bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Login</h1>
        <p className="text-gray-700 mb-6">Sign in to your account</p>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <Input
              type="password"
              placeholder="Enter your password"
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

        <p className="text-center text-gray-700 mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-pink-600 font-semibold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
