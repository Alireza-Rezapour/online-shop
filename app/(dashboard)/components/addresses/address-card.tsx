import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, MapPin, Star, LocateFixedIcon } from "lucide-react";
import { Address } from "@/app/(main-app)/cart/types/types";

export function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
}: {
  address: Address;
  onEdit: (address: Address) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-border_soft bg-white p-5 shadow-soft transition-shadow hover:shadow-hover">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary">
            <MapPin className="h-4 w-4" />
          </div>
          <p className="font-medium text-foreground">{address.receiverName}</p>
        </div>
        <div className="flex gap-2">
          {address.isDefault && (
            <Badge className="text-secondary bg-primary-foreground py-3">
              <Star className="h-3 w-3" /> پیش فرض
            </Badge>
          )}
          {address.label && (
            <Badge className="text-secondary bg-primary-foreground py-3">
              <LocateFixedIcon className="h-3 w-3" /> {address.label}
            </Badge>
          )}
        </div>
      </div>

      <div className="mt-3.5 space-y-1 text-sm text-muted-foreground">
        <p>{address.phone}</p>
        <p>
          {address.details}, {address.city}, {address.province}{" "}
          {address.postalCode}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-border_soft pt-4">
        <Button variant="outline" size="sm" onClick={() => onEdit(address)}>
          <Pencil className="h-3.5 w-3.5" /> ویرایش
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(address.id)}
        >
          <Trash2 className="h-3.5 w-3.5" /> حذف
        </Button>
        {!address.isDefault && (
          <Button
            variant="default"
            size="sm"
            onClick={() => onSetDefault(address.id)}
            className="text-secondary bg-primary-foreground py-3"
          >
            تنظیم به عنوان پیش فرض
          </Button>
        )}
      </div>
    </div>
  );
}
