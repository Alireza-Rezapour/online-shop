import { PageHeader } from "@/app/(admin)/components/AdminShell";
import { DesktopOnly } from "@/app/(admin)/components/hero/desktop-only";
import { EditHeroSlide } from "@/app/(admin)/components/hero/edit-hero-slide";

export default async function EditHeroSlidePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      <PageHeader
        breadcrumb={[
          { label: "اسلایدهای هیرو", href: "/admin/hero" },
          { label: "ویرایش اسلاید", href: `/admin/hero/${id}` },
        ]}
      />
      <div className="p-4 md:p-6">
        <DesktopOnly>
          <EditHeroSlide id={id} />
        </DesktopOnly>
      </div>
    </>
  );
}
