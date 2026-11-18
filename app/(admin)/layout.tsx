// app/(admin)/layout.tsx
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { AdminShell } from "./components/AdminShell";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

async function AdminGate({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || session.user.role !== "admin") {
    redirect("/");
  }

  return <>{children}</>;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="p-6">در حال بارگذاری...</div>}>
      <AdminShell>
        <AdminGate>{children}</AdminGate>
      </AdminShell>
    </Suspense>
  );
}
