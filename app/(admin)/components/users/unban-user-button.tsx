// components/admin/users/unban-user-button.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import ErrorToast from "@/lib/toast/error-toast";
import SuccessToast from "@/lib/toast/success-toast";

export function UnbanUserButton({
  userId,
  onChanged,
}: {
  userId: string;
  onChanged?: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleUnban() {
    setLoading(true);
    try {
      const { error } = await authClient.admin.unbanUser({ userId });
      if (error) {
        ErrorToast(error.message ?? "رفع مسدودیت با خطا مواجه شد");
        return;
      }
      SuccessToast("مسدودیت کاربر رفع شد");
      onChanged?.();
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleUnban}
      disabled={loading}
    >
      {loading ? "در حال انجام..." : "رفع مسدودیت"}
    </Button>
  );
}
