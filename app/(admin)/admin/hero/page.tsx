import { PageHeader } from "../../components/AdminShell";
import { HeroSlidesManager } from "../../components/hero/hero-slides-manager";

export default function AdminHeroPage() {
  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "اسلایدهای هیرو", href: "/admin/hero" }]}
      />
      <div className="p-4 md:p-6">
        <HeroSlidesManager />
      </div>
    </>
  );
}
