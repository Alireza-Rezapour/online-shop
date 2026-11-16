// app/admin/users/page.tsx
import { Suspense } from "react";
import { PageHeader } from "../../components/AdminShell";
import { UserFilters } from "../../components/users/user-filters";
import { UserTable } from "../../components/users/user-table";

export default function AdminUsersPage() {
  return (
    <>
      <PageHeader breadcrumb={[{ label: "کاربران", href: "/admin/users" }]} />
      <div dir="rtl" className="space-y-6 p-10">
        <div>
          <h1 className="text-xl font-semibold text-[#2A2018]">
            مدیریت کاربران
          </h1>
          <p className="text-sm text-[#6B5D4F]">
            مشاهده، جستجو و مدیریت نقش و وضعیت کاربران
          </p>
        </div>

        <Suspense>
          <UserFilters />
        </Suspense>
        <Suspense>
          <UserTable />
        </Suspense>
      </div>
    </>
  );
}
