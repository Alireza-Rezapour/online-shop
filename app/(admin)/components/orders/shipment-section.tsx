"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetCarriersQuery } from "@/redux/services/carrierApi";
import {
  useCreateShipmentMutation,
  useUpdateShipmentMutation,
  useUpdateShipmentStatusMutation,
} from "@/redux/services/shipmentApi";
import { formatDate } from "@/app/(dashboard)/data/utils";
import { ORDER_STATUS_LABELS, SHIPMENT_STATUS_LABELS } from "./statusLabels";
import type { ShipmentInfo } from "./types";
import { SHIPMENT_STATUS_TRANSITIONS } from "@/services/shipment/shipmentStatus.service";
import { getErrorMessage } from "../../lib/order/getErrorMessage";
import { StatusBadge } from "./status-badge";
import { ShipmentStatus } from "@/lib/generated/prisma/enums";

// What a shipment status does to the order (the server keeps them in step)
const ORDER_STATUS_AFTER: Record<string, string> = {
  PACKING: "PROCESSING",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  RETURNED: "RETURNED",
};

export function ShipmentSection({
  orderId,
  orderStatus,
  shipment,
}: {
  orderId: string;
  orderStatus: string;
  shipment: ShipmentInfo | null;
}) {
  const { data: carriers = [] } = useGetCarriersQuery();
  const [createShipment, { isLoading: isCreating }] =
    useCreateShipmentMutation();
  const [updateShipment, { isLoading: isUpdating }] =
    useUpdateShipmentMutation();
  const [updateShipmentStatus, { isLoading: isUpdatingStatus }] =
    useUpdateShipmentStatusMutation();

  const [carrierId, setCarrierId] = useState(shipment?.carrierId ?? "");
  const [trackingCode, setTrackingCode] = useState(
    shipment?.trackingCode ?? "",
  );
  const [selectedStatus, setSelectedStatus] = useState<ShipmentStatus | "">("");

  const allowedNext = shipment
    ? SHIPMENT_STATUS_TRANSITIONS[shipment.status]
    : [];
  const nextStatus =
    selectedStatus && allowedNext.includes(selectedStatus)
      ? selectedStatus
      : (allowedNext[0] ?? "");

  // The server only creates shipments for paid orders that have not shipped yet
  const canCreate = orderStatus === "PAID" || orderStatus === "PROCESSING";

  if (!shipment && !canCreate) {
    return (
      <p className="text-sm text-muted-foreground">
        {orderStatus === "PENDING"
          ? "برای ساخت مرسوله، سفارش باید پرداخت شده باشد."
          : "برای این سفارش مرسوله‌ای ثبت نشده است."}
      </p>
    );
  }

  const dirty =
    !shipment ||
    carrierId !== shipment.carrierId ||
    trackingCode.trim() !== (shipment.trackingCode ?? "");

  const handleSave = async () => {
    if (!carrierId) return;
    try {
      if (shipment) {
        await updateShipment({
          id: shipment.id,
          body: { carrierId, trackingCode },
        }).unwrap();
        toast.success("مرسوله به‌روزرسانی شد.");
      } else {
        await createShipment({
          orderId,
          body: { carrierId, trackingCode },
        }).unwrap();
        toast.success("مرسوله ساخته شد.");
      }
    } catch (error) {
      toast.error(getErrorMessage(error as any));
    }
  };

  const handleStatusUpdate = async () => {
    if (!shipment || !nextStatus) return;
    try {
      await updateShipmentStatus({
        id: shipment.id,
        status: nextStatus,
      }).unwrap();
      toast.success(
        `وضعیت ارسال به «${SHIPMENT_STATUS_LABELS[nextStatus] ?? nextStatus}» تغییر کرد.`,
      );
    } catch (error) {
      toast.error(getErrorMessage(error as any));
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="mb-1 text-sm">شرکت ارسال</Label>
          <Select value={carrierId} onValueChange={setCarrierId}>
            <SelectTrigger>
              <SelectValue placeholder="انتخاب شرکت" />
            </SelectTrigger>
            <SelectContent>
              {carriers.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-1 text-sm">کد رهگیری</Label>
          <Input
            dir="ltr"
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value)}
            placeholder="کد رهگیری"
          />
        </div>
      </div>

      <Button
        onClick={handleSave}
        disabled={!carrierId || !dirty || isCreating || isUpdating}
      >
        {shipment ? "به‌روزرسانی مرسوله" : "ساخت مرسوله"}
      </Button>

      {shipment && (
        <div className="space-y-2 border-t pt-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">وضعیت کنونی</span>
            <StatusBadge status={shipment.status} kind="shipment" />
          </div>
          {shipment.shippedAt && (
            <p className="text-sm">
              ارسال شده در: {formatDate(shipment.shippedAt)}
            </p>
          )}
          {shipment.deliveredAt && (
            <p className="text-sm">
              تحویل داده شده در: {formatDate(shipment.deliveredAt)}
            </p>
          )}

          {allowedNext.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {`مرسوله «${SHIPMENT_STATUS_LABELS[shipment.status] ?? shipment.status}» است و دیگر قابل تغییر نیست.`}
            </p>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <Select
                  value={nextStatus}
                  onValueChange={(v) => setSelectedStatus(v as ShipmentStatus)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {allowedNext.map((s) => (
                      <SelectItem key={s} value={s}>
                        {SHIPMENT_STATUS_LABELS[s] ?? s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  onClick={handleStatusUpdate}
                  disabled={isUpdatingStatus || !nextStatus}
                >
                  به‌روزرسانی وضعیت ارسال
                </Button>
              </div>
              {ORDER_STATUS_AFTER[nextStatus] &&
                ORDER_STATUS_AFTER[nextStatus] !== orderStatus && (
                  <p className="text-xs text-muted-foreground">
                    با این تغییر، وضعیت سفارش هم «
                    {ORDER_STATUS_LABELS[ORDER_STATUS_AFTER[nextStatus]]}»
                    می‌شود.
                  </p>
                )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
