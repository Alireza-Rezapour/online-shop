import { PageHeader } from "@/app/(admin)/components/AdminShell";
import { CouponsTab } from "@/app/(admin)/components/users/tabs/coupons-tab";
import { OrdersTab } from "@/app/(admin)/components/users/tabs/orders-tab";
import { UserDetailHeader } from "@/app/(admin)/components/users/user-detail-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      <PageHeader
        breadcrumb={[
          { label: "کاربران", href: "/admin/users" },
          { label: "کاربر", href: `/admin/users/${id}` },
        ]}
      />
      <div dir="rtl" className="space-y-6 p-10">
        <UserDetailHeader userId={id} />

        <Tabs defaultValue="orders" dir="rtl">
          <TabsList>
            <TabsTrigger value="orders">سفارش‌ها</TabsTrigger>
            <TabsTrigger value="coupons">کوپن‌ها</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <OrdersTab userId={id} />
          </TabsContent>
          <TabsContent value="coupons">
            <CouponsTab userId={id} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
