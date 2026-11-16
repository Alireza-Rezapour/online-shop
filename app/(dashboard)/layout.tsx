// app/(dashboard)/layout.tsx
import { Suspense } from "react";
import { Metadata } from "next";
import { DashboardAuthGate } from "./components/layout/dashboard-auth-gate";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardAuthGate>{children}</DashboardAuthGate>
    </Suspense>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <div className="hidden lg:block fixed inset-y-0 left-0 w-68 border-r bg-gray-50" />
      <div className="lg:pl-68">
        <div className="h-16 border-b" />
        <main className="mx-auto max-w-350 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="h-8 w-48 animate-pulse rounded bg-gray-100" />
        </main>
      </div>
    </div>
  );
}
