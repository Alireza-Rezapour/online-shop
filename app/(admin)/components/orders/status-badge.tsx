import { Badge } from "@/components/ui/badge";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  SHIPMENT_STATUS_LABELS,
} from "./statusLabels";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  PAID: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  PROCESSING: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  PACKING: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  SHIPPED: "bg-purple-100 text-purple-800 hover:bg-purple-100",
  DELIVERED: "bg-green-100 text-green-800 hover:bg-green-100",
  SUCCESS: "bg-green-100 text-green-800 hover:bg-green-100",
  CANCELLED: "bg-red-100 text-red-800 hover:bg-red-100",
  FAILED: "bg-red-100 text-red-800 hover:bg-red-100",
  RETURNED: "bg-orange-100 text-orange-800 hover:bg-orange-100",
  REFUNDED: "bg-orange-100 text-orange-800 hover:bg-orange-100",
};

const LABELS = {
  order: ORDER_STATUS_LABELS,
  payment: PAYMENT_STATUS_LABELS,
  shipment: SHIPMENT_STATUS_LABELS,
};

// Pass the status CODE; the badge picks the color and the Persian label
export function StatusBadge({
  status,
  kind = "order",
}: {
  status: string;
  kind?: keyof typeof LABELS;
}) {
  return (
    <Badge variant="outline" className={STATUS_STYLES[status] ?? ""}>
      {LABELS[kind][status] ?? status}
    </Badge>
  );
}
