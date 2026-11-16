import { Check, Pencil, Trash2, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Address } from "../../types/types";

interface AddressCardProps {
  address: Address;
  selected: boolean;
  onSelect: (id: string) => void;
  onEdit: (address: Address) => void;
  onDelete: (addressId: string) => void;
}

export function AddressCard({
  address,
  selected,
  onSelect,
  onEdit,
  onDelete,
}: AddressCardProps) {
  return (
    <div
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onClick={() => onSelect(address.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(address.id);
        }
      }}
      className={`group relative cursor-pointer rounded-xl border p-5 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#68578b] focus-visible:ring-offset-2 ${
        selected
          ? "border-[#68578b] bg-[#68578b]/4 shadow-sm"
          : "border-gray-200 bg-white hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md"
      }`}
    >
      <div
        className={`absolute right-5 top-5 flex h-5 w-5 items-center justify-center rounded-full border transition-colors duration-200 ${
          selected
            ? "border-[#68578b] bg-[#68578b]"
            : "border-gray-300 bg-white"
        }`}
      >
        {selected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
      </div>

      <div className="flex flex-wrap items-center gap-2 pr-8">
        <h3 className=" text-gray-900">{address.receiverName}</h3>
        {address.label && (
          <Badge
            variant="outline"
            className="rounded-full border-gray-300 px-2.5 py-0 text-[11px] font-normal text-gray-600"
          >
            {address.label}
          </Badge>
        )}
        {address.isDefault && (
          <Badge className="rounded-full bg-[#68578b] px-2.5 py-0 text-[11px] font-normal text-white hover:bg-[#68578b]">
            پیش‌فرض
          </Badge>
        )}
      </div>

      <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
        <Phone className="h-3.5 w-3.5" />
        <span>{address.phone}</span>
      </div>

      <p className="mt-2.5 text-sm leading-relaxed text-gray-600">
        {address.details}
        <br />
        {address.city}, {address.province} {address.postalCode}
      </p>

      <div className="mt-4 flex items-center gap-4 border-t border-gray-100 pt-3">
        <button
          type="button"
          aria-label={`Edit address for ${address.receiverName}`}
          onClick={(e) => {
            e.stopPropagation();
            onEdit(address);
          }}
          className="flex items-center gap-1.5 text-xs font-medium text-gray-500 transition-colors duration-150 hover:text-[#68578b]"
        >
          <Pencil className="h-3.5 w-3.5" />
          ویرایش
        </button>
        <button
          type="button"
          aria-label={`Delete address for ${address.receiverName}`}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(address.id);
          }}
          className="flex items-center gap-1.5 text-xs font-medium text-gray-400 transition-colors duration-150 hover:text-red-500"
        >
          <Trash2 className="h-3.5 w-3.5" />
          حذف
        </button>
      </div>
    </div>
  );
}
