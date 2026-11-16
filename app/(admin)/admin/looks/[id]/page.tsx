import { PageHeader } from "@/app/(admin)/components/AdminShell";
import { DesktopOnly } from "@/app/(admin)/components/hero/desktop-only";
import { EditLook } from "@/app/(admin)/components/looks/edit-look";

export default async function EditLookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <>
      <PageHeader
        breadcrumb={[
          { label: "ست‌های لباس", href: "/admin/looks" },
          { label: "ویرایش ست", href: `/admin/looks/${id}` },
        ]}
      />
      <div className="p-4 md:p-6">
        <DesktopOnly>
          <EditLook id={id} />
        </DesktopOnly>
      </div>
    </>
  );
}
