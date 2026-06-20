"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // Check what role is currently stored
    let userRole = localStorage.getItem("user_role");

    // FOOLPROOF FALLBACK: If no role is found, force it to 'admin' for development testing
    if (!userRole) {
      localStorage.setItem("user_role", "admin");
      userRole = "admin";
    }

    // Direct routing execution
    if (userRole === "admin" || userRole === "superadmin") {
      router.replace("/dashboard/admin");
    } else if (userRole === "lecturer") {
      router.replace("/dashboard/lecturer");
    } else if (userRole === "employee") {
      router.replace("/dashboard/employee");
    } else {
      router.replace("/dashboard/student");
    }
  }, [router]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-slate-100">
      <div className="text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
        <p className="mt-4 text-slate-600 font-semibold text-sm">Mengunci Hak Akses Dashboard...</p>
      </div>
    </div>
  );
}
