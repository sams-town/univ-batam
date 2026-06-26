"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";

export default function LecturerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, loading } = useAuth();
  const router = useRouter();
  const [localStorageRole, setLocalStorageRole] = useState<string | null>(null);

  useEffect(() => {
    setLocalStorageRole(localStorage.getItem("user_role"));
  }, []);

  // Helper to get role name with type narrowing
  const getRoleName = (): string | undefined => {
    if (typeof profile?.role === 'string') return profile.role
    if (profile?.role && 'name' in profile.role) return profile.role.name
    return undefined
  }
  const roleName = getRoleName()
  
  const isLecturer =
    localStorageRole === "lecturer" ||
    localStorageRole === "dosen" ||
    (roleName === "dosen")

  const isVerified = !loading && isLecturer;

  useEffect(() => {
    if (!loading && !isLecturer) {
      router.replace("/dashboard");
    }
  }, [loading, isLecturer, router]);

  if (loading || !isVerified) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
          <p className="text-slate-600 text-sm font-medium">Loading Lecturer Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 bg-slate-50 min-h-screen">
        {children}
      </main>
    </div>
  );
}
