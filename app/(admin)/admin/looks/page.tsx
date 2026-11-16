import { PageHeader } from "@/app/(admin)/components/AdminShell";
import { LooksManager } from "@/app/(admin)/components/looks/looks-manager";

export default function AdminLooksPage() {
  return (
    <>
      <PageHeader breadcrumb={[{ label: "ست‌های لباس", href: "/admin/looks" }]} />
      <div className="p-4 md:p-6">
        <LooksManager />
      </div>
    </>
  );
}
