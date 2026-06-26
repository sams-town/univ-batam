"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EmployeeLayout({
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

  // Helper to get role name
  const getRoleName = (): string | undefined => {
    if (typeof profile?.role === 'string') return profile.role
    if (profile?.role?.name) return profile.role.name
    return undefined
  }
  const roleName = getRoleName()
  const isEmployee =
    localStorageRole === "employee" ||
    localStorageRole === "karyawan" ||
    localStorageRole === "pegawai" ||
    (roleName && ["karyawan", "pegawai", "employee"].includes(roleName))

  const isVerified = !loading && isEmployee;

  useEffect(() => {
    if (!loading && !isEmployee) {
      router.replace("/dashboard");
    }
  }, [loading, isEmployee, router]);

  if (loading || !isVerified) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
          <p className="text-slate-600 text-sm font-medium">Loading Karyawan Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="bg-slate-50 min-h-screen">
      {children}
    </main>
  );
}
