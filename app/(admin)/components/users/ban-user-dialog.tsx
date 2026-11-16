// components/admin/users/ban-user-dialog.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import { toast } from "sonner";

const EXPIRY_OPTIONS: { label: string; seconds: number | undefined }[] = [
  { label: "۱ روز", seconds: 60 * 60 * 24 },
  { label: "۷ روز", seconds: 60 * 60 * 24 * 7 },
  { label: "۳۰ روز", seconds: 60 * 60 * 24 * 30 },
  { label: "دائمی", seconds: undefined },
];

interface BanUserDialogProps {
  userId: string;
  disabled?: boolean;
  onChanged?: () => void;
}

export function BanUserDialog({
  userId,
  disabled,
  onChanged,
}: BanUserDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [expiryLabel, setExpiryLabel] = useState(EXPIRY_OPTIONS[3].label);
  const [loading, setLoading] = useState(false);

  async function handleBan() {
    setLoading(true);
    try {
      const option = EXPIRY_OPTIONS.find((o) => o.label === expiryLabel);
      const { error } = await authClient.admin.banUser({
        userId,
        banReason: reason.trim() || undefined,
        banExpiresIn: option?.seconds,
      });
      if (error) {
        // toast.error(error.message ?? "مسدودسازی با خطا مواجه شد");
        return;
      }
      //   toast.success("کاربر مسدود شد");
      setOpen(false);
      setReason("");
      onChanged?.();
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm" disabled={disabled}>
          مسدودسازی
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>مسدودسازی کاربر</DialogTitle>
          <DialogDescription>
            کاربر مسدود شده امکان ورود به حساب کاربری خود را نخواهد داشت.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ban-reason">دلیل مسدودسازی</Label>
            <Textarea
              id="ban-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="مثلا: نقض قوانین سایت"
            />
          </div>

          <div className="space-y-2">
            <Label>مدت مسدودسازی</Label>
            <Select value={expiryLabel} onValueChange={setExpiryLabel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXPIRY_OPTIONS.map((o) => (
                  <SelectItem key={o.label} value={o.label}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            انصراف
          </Button>
          <Button variant="destructive" onClick={handleBan} disabled={loading}>
            {loading ? "در حال انجام..." : "مسدود کن"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
