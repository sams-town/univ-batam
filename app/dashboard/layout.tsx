'use client'

// Root dashboard layout - no role-specific UI here!
// Only global context providers and basic structure
export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  )
}
