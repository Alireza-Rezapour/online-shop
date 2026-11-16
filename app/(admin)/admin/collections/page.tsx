import { AdminShell, PageHeader } from "../../components/AdminShell";
import { CollectionsTable } from "../../components/collections/collections-table";

export default function CollectionsPage() {
  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "کالکشن‌ها", href: "/admin/collections" }]}
      />
      <div className="space-y-6 p-6">
        <div>
          <p className="text-sm text-muted-foreground">
            مدیریت کالکشن‌های محصولات فروشگاه
          </p>
        </div>
        <CollectionsTable />
      </div>
    </>
  );
}
