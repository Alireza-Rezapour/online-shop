// components/admin/users/user-detail-header.tsx
"use client";

import { authClient } from "@/lib/auth-client";
import { RoleBadge } from "./role-badge";
import { BanStatusBadge } from "./ban-status-badge";
import { ChangeRoleDialog } from "./change-role-dialog";
import { BanUserDialog } from "./ban-user-dialog";
import { UnbanUserButton } from "./unban-user-button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetAdminUserQuery } from "@/redux/services/adminUserApi";

export function UserDetailHeader({ userId }: { userId: string }) {
  const { data: user, isLoading, refetch } = useGetAdminUserQuery(userId);
  const { data: session } = authClient.useSession();

  if (isLoading || !user) return <Skeleton className="h-28 w-full" />;

  const isSelf = session?.user?.id === user.id;
  const fullName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || user.name;

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-[#EDE3CC] bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold text-[#2A2018]">{fullName}</h1>
          <RoleBadge role={user.role} />
          <BanStatusBadge banned={user.banned} banExpires={user.banExpires} />
        </div>
        <div dir="ltr" className="text-sm text-[#6B5D4F]">
          <div>{user.email}</div>
          {user.phoneNumber && <div>{user.phoneNumber}</div>}
        </div>
        {user.banned && user.banReason && (
          <p className="text-sm text-red-600">
            دلیل مسدودسازی: {user.banReason}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <ChangeRoleDialog
          userId={user.id}
          userEmail={user.email}
          currentRole={user.role}
          disabled={isSelf}
          onChanged={refetch}
        />
        {user.banned ? (
          <UnbanUserButton userId={user.id} onChanged={refetch} />
        ) : (
          <BanUserDialog
            userId={user.id}
            disabled={isSelf}
            onChanged={refetch}
          />
        )}
      </div>

      {isSelf && (
        <p className="text-xs text-[#6B5D4F]">
          نمی‌توانید نقش یا وضعیت مسدودی حساب خودتان را تغییر دهید.
        </p>
      )}
    </div>
  );
}
