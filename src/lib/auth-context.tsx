"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { getAuthInstance } from "./firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only set up auth listener if we're on client side
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    try {
      const auth = getAuthInstance();
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        console.log("[Auth] User state changed:", currentUser?.email || "logged out");
        setUser(currentUser);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("[Auth] Failed to initialize auth:", error);
      setLoading(false);
    }
  }, []);

  const logout = async () => {
    try {
      const auth = getAuthInstance();
      console.log("[Auth] Logging out...");
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("[Auth] Logout error:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
