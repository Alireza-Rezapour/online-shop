import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Carrier } from "@/lib/generated/prisma/client";
import { formatPrice } from "@/lib/utils";

export function DeliveryInfoCard({
  carriers,
  selectedCarrierId,
  setSelectedCarrierId,
}: {
  carriers: Carrier[] | undefined;
  selectedCarrierId: string | undefined;
  setSelectedCarrierId: (id: string) => void;
}) {
  if (!carriers) return;

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-5">
      <h3 className="mb-4 text-sm text-gray-900">اطلاعات ارسال</h3>
      <RadioGroup
        dir="rtl"
        className="flex gap-2"
        defaultValue={carriers[0].id}
        value={selectedCarrierId}
        onValueChange={(v) => setSelectedCarrierId(v)}
      >
        {carriers.map((carrier) => (
          <div key={carrier.id} className="flex items-center gap-3">
            <RadioGroupItem value={carrier.id} id={`option-${carrier.id}`} />
            <Label htmlFor={`option-${carrier.id}`}>{`${carrier.name}`}</Label>
            {formatPrice(carrier.cost, "تومان")}
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
