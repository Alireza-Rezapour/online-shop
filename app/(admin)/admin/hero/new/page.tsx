import { PageHeader } from "@/app/(admin)/components/AdminShell";
import { DesktopOnly } from "@/app/(admin)/components/hero/desktop-only";
import { NewHeroSlide } from "@/app/(admin)/components/hero/new-hero-slide";

export default function NewHeroSlidePage() {
  return (
    <>
      <PageHeader
        breadcrumb={[
          { label: "اسلایدهای هیرو", href: "/admin/hero" },
          { label: "اسلاید جدید", href: "/admin/hero/new" },
        ]}
      />
      <div className="p-4 md:p-6">
        <DesktopOnly>
          <NewHeroSlide />
        </DesktopOnly>
      </div>
    </>
  );
}
