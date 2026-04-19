"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    // Validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.password) {
      setError("All fields are required");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ""))) {
      setError("Phone number must be 10 digits");
      return;
    }

    setLoading(true);

    try {
      console.log("[Register] Creating Firebase user...");
      
      // Step 1: Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      
      const firebaseUser = userCredential.user;
      console.log("[Register] Firebase user created:", firebaseUser.uid);

      // Step 2: Save user to database
      console.log("[Register] Saving user to database...");
      const dbResponse = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firebaseId: firebaseUser.uid,
          email: formData.email,
          name: formData.name,
          phone: formData.phone,
        }),
      });

      if (!dbResponse.ok) {
        const errorData = await dbResponse.json();
        console.error("[Register] Database save failed:", errorData);
        throw new Error(errorData.error || "Failed to save user to database");
      }

      const dbUser = await dbResponse.json();
      console.log("[Register] User saved to database:", dbUser.id);

      // Step 3: Get auth token and store in both localStorage and cookie
      const token = await firebaseUser.getIdToken();
      localStorage.setItem("firebaseToken", token);
      localStorage.setItem("firebaseUser", JSON.stringify({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
      }));
      
      // Also set as cookie for middleware access
      document.cookie = `firebaseToken=${token};path=/;max-age=3600`;
      document.cookie = `firebaseId=${firebaseUser.uid};path=/;max-age=3600`;

      setSuccessMessage("Account created successfully! Redirecting...");
      
      // Redirect after 1 second
      setTimeout(() => {
        router.push("/home");
      }, 1000);
      
    } catch (err) {
      console.error("[Register] Error:", err);
      
      let errorMessage = "An error occurred during registration";
      
      if (err instanceof Error) {
        if (err.message.includes("auth/email-already-in-use")) {
          errorMessage = "Email already registered. Please use a different email.";
        } else if (err.message.includes("auth/invalid-email")) {
          errorMessage = "Invalid email address";
        } else if (err.message.includes("auth/weak-password")) {
          errorMessage = "Password is too weak";
        } else if (err.message.includes("Failed to save user")) {
          errorMessage = err.message;
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
        <p className="text-gray-700 mb-6">Join Rose Royal Driving School</p>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm font-medium">{successMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <Input
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <Input
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <Input
              type="tel"
              placeholder="Enter 10-digit phone number"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <Input
              type="password"
              placeholder="Enter password (min 6 characters)"
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password *
            </label>
            <Input
              type="password"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-pink-500 hover:bg-pink-600 disabled:bg-gray-400"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        <p className="text-center text-gray-700 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-pink-600 font-semibold hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
