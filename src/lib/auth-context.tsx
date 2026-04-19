"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "./firebase";

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
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("[Auth] User state changed:", currentUser?.email || "logged out");
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
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
