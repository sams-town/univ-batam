"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";

export default function AdminLayout({
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

  const isAdmin =
    localStorageRole === "admin" ||
    localStorageRole === "superadmin" ||
    localStorageRole === "super_admin" ||
    localStorageRole === "admin_akademik" ||
    // profile.role is a VARCHAR string (from migration 007)
    (typeof profile?.role === 'string' &&
      (profile.role === "super_admin" || profile.role === "admin_akademik")) ||
    // fallback: if role is still a joined object (legacy)
    (profile?.role && typeof profile.role === 'object' &&
      ((profile.role as any)?.name === "super_admin" || (profile.role as any)?.name === "admin_akademik"));

  const isVerified = !loading && isAdmin;

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.replace("/dashboard");
    }
  }, [loading, isAdmin, router]);

  if (loading || !isVerified) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
          <p className="text-slate-600 text-sm font-medium">Loading Admin Dashboard...</p>
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
