"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateOrderStatusMutation } from "@/redux/services/orderApi";
import { ORDER_STATUS_LABELS } from "./statusLabels";
import { ORDER_STATUS_TRANSITIONS } from "@/services/order/orderStatusTransitions";
import ErrorToast from "@/lib/toast/error-toast";
import SuccessToast from "@/lib/toast/success-toast";
import { getErrorMessage } from "../../lib/order/getErrorMessage";
import { OrderStatus } from "@/lib/generated/prisma/enums";

const CANCEL_TEXT: Record<string, string> = {
  PENDING:
    "سفارش لغو می‌شود و موجودی رزروشده (در صورت شروع پرداخت) آزاد می‌شود. کد تخفیف استفاده‌شده به مشتری برمی‌گردد.",
  PAID: "سفارش لغو می‌شود و محصولات به موجودی انبار برمی‌گردند. مرسوله‌ای که هنوز ارسال نشده حذف می‌شود. مبلغ پرداخت‌شده خودکار بازگردانده نمی‌شود و باید از طریق درگاه برگردانده شود.",
  PROCESSING:
    "سفارش لغو می‌شود و محصولات به موجودی انبار برمی‌گردند. مرسوله‌ای که هنوز ارسال نشده حذف می‌شود. مبلغ پرداخت‌شده خودکار بازگردانده نمی‌شود و باید از طریق درگاه برگردانده شود.",
};

export function OrderStatusSection({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: OrderStatus;
}) {
  const [updateStatus, { isLoading }] = useUpdateOrderStatusMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const allowed = ORDER_STATUS_TRANSITIONS[currentStatus];
  const canCancel = allowed.includes("CANCELLED");
  const manualNext: OrderStatus[] = allowed.filter(
    (s) => s !== "CANCELLED" && s !== "PAID",
  );

  const [selected, setSelected] = useState<OrderStatus | "">("");
  const target =
    selected && manualNext.includes(selected)
      ? selected
      : (manualNext[0] ?? "");

  const handleUpdate = async (status: OrderStatus) => {
    try {
      await updateStatus({ id: orderId, status }).unwrap();
      SuccessToast(
        `وضعیت سفارش به «${ORDER_STATUS_LABELS[status] ?? status}» تغییر کرد.`,
      );
      setConfirmOpen(false);
    } catch (error) {
      ErrorToast(getErrorMessage(error as any));
    }
  };

  if (allowed.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {`سفارش «${ORDER_STATUS_LABELS[currentStatus] ?? currentStatus}» است و دیگر قابل تغییر نیست.`}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {manualNext.length > 0 ? (
        <div className="flex items-center gap-2">
          <Select
            value={target}
            onValueChange={(v) => setSelected(v as OrderStatus)}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {manualNext.map((s) => (
                <SelectItem key={s} value={s}>
                  {ORDER_STATUS_LABELS[s] ?? s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={() => target && handleUpdate(target)}
            disabled={isLoading || !target}
          >
            به‌روزرسانی وضعیت
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          این سفارش در انتظار پرداخت است. پس از پرداخت موفق، وضعیت آن خودکار
          «پرداخت شده» می‌شود.
        </p>
      )}

      {canCancel && (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setConfirmOpen(true)}
          disabled={isLoading}
        >
          لغو سفارش
        </Button>
      )}

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader className="text-start">
            <AlertDialogTitle>لغو سفارش</AlertDialogTitle>
            <AlertDialogDescription>
              {CANCEL_TEXT[currentStatus] ?? "سفارش لغو می‌شود."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:justify-start">
            <AlertDialogAction
              disabled={isLoading}
              onClick={(e) => {
                e.preventDefault();
                handleUpdate("CANCELLED");
              }}
            >
              لغو سفارش
            </AlertDialogAction>
            <AlertDialogCancel disabled={isLoading}>انصراف</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
