import { PageHeader } from "@/app/(admin)/components/AdminShell";
import { DesktopOnly } from "@/app/(admin)/components/hero/desktop-only";
import { NewLook } from "@/app/(admin)/components/looks/new-look";

export default function NewLookPage() {
  return (
    <>
      <PageHeader
        breadcrumb={[
          { label: "ست‌های لباس", href: "/admin/looks" },
          { label: "ست جدید", href: "/admin/looks/new" },
        ]}
      />
      <div className="p-4 md:p-6">
        <DesktopOnly>
          <NewLook />
        </DesktopOnly>
      </div>
    </>
  );
}
