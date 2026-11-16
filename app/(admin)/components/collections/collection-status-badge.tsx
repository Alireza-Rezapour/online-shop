// collection-status-badge.tsx
import { Badge } from "@/components/ui/badge";
import { getCollectionStatus } from "./collection-status";

export function CollectionStatusBadge({
  collection,
}: {
  collection: {
    isActive: boolean;
    startsAt: string | null;
    endsAt: string | null;
  };
}) {
  switch (getCollectionStatus(collection)) {
    case "live":
      return (
        <Badge className="bg-success-bg text-success hover:bg-success-bg">
          فعال
        </Badge>
      );
    case "scheduled":
      return (
        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
          زمان‌بندی شده
        </Badge>
      );
    case "ended":
      return <Badge variant="secondary">پایان یافته</Badge>;
    default:
      return <Badge variant="secondary">غیرفعال</Badge>;
  }
}
