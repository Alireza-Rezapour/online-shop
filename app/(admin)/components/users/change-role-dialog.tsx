// components/admin/users/change-role-dialog.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { toast } from "sonner"; // swap for your toast lib if different

interface ChangeRoleDialogProps {
  userId: string;
  userEmail: string;
  currentRole: string | null;
  disabled?: boolean;
  onChanged?: () => void;
}

export function ChangeRoleDialog({
  userId,
  userEmail,
  currentRole,
  disabled,
  onChanged,
}: ChangeRoleDialogProps) {
  const router = useRouter();
  const targetRole = currentRole === "admin" ? "user" : "admin";
  const isPromotingToAdmin = targetRole === "admin";

  const [open, setOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const canConfirm = isPromotingToAdmin
    ? confirmEmail.trim().toLowerCase() === userEmail.toLowerCase()
    : true;

  async function handleConfirm() {
    if (!canConfirm) return;
    setLoading(true);
    try {
      const { error } = await authClient.admin.setRole({
        userId,
        role: targetRole,
      });
      if (error) {
        // toast.error(error.message ?? "تغییر نقش با خطا مواجه شد");
        return;
      }
      //   toast.success(
      //     isPromotingToAdmin
      //       ? "کاربر به ادمین ارتقا یافت"
      //       : "دسترسی ادمین حذف شد",
      //   );
      setOpen(false);
      setConfirmEmail("");
      onChanged?.();
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant={isPromotingToAdmin ? "default" : "outline"}
          size="sm"
          disabled={disabled}
        >
          {isPromotingToAdmin ? "ارتقا به ادمین" : "حذف دسترسی ادمین"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isPromotingToAdmin ? "ارتقا کاربر به ادمین" : "حذف دسترسی ادمین"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isPromotingToAdmin
              ? "این کاربر به تمام بخش‌های مدیریتی دسترسی کامل پیدا می‌کند. این عملیات را با دقت انجام دهید."
              : "دسترسی مدیریتی این کاربر حذف می‌شود و به یک کاربر عادی تبدیل می‌شود."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {isPromotingToAdmin && (
          <div className="space-y-2">
            <Label htmlFor="confirm-email">
              برای تایید، ایمیل کاربر (<span dir="ltr">{userEmail}</span>) را
              وارد کنید
            </Label>
            <Input
              id="confirm-email"
              dir="ltr"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              placeholder={userEmail}
            />
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setConfirmEmail("")}>
            انصراف
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
            disabled={!canConfirm || loading}
          >
            {loading ? "در حال انجام..." : "تایید"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
