import { Badge } from "@/components/ui/badge";

import {
  BanknoteArrowUp,
  CheckCircle2,
  Ellipsis,
  Truck,
  Undo2,
  XCircle,
} from "lucide-react";
import { OrderStatus } from "../../types";

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  let statusName;
  let Icon;

  switch (status) {
    case "CANCELLED":
      statusName = "لغو شده";
      Icon = <XCircle />;
      break;
    case "PENDING":
      statusName = "پرداخت نشده";
      Icon = <XCircle />;
      break;
    case "DELIVERED":
      statusName = "تحویل داده شده";
      Icon = <CheckCircle2 />;
      break;

    case "PAID":
      statusName = "پرداخت شده";
      Icon = <BanknoteArrowUp />;
      break;

    case "PROCESSING":
      statusName = "درحال پردازش";
      Icon = <Ellipsis />;
      break;

    case "RETURNED":
      statusName = "مرجوع شده";
      Icon = <Undo2 />;
      break;

    case "SHIPPED":
      statusName = "ارسال شده";
      Icon = <Truck />;
      break;

    default:
      break;
  }

  return (
    <Badge
      className="text-secondary bg-primary-foreground p-2"
      variant={"default"}
    >
      {Icon}
      {statusName}
    </Badge>
  );
}
