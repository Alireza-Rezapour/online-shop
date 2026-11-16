"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Address, AddressFormValues } from "../../types/types";
import { provinces } from "../../../../constants/provinces";
import { authClient } from "@/lib/auth-client";

interface AddressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialAddress?: Address | null;
  onSave: (data: AddressFormValues & { userId: string }, id?: string) => void;
}

const emptyForm: AddressFormValues = {
  receiverName: "",
  phone: "",
  province: "",
  city: "",
  details: "",
  postalCode: "",
  label: "",
  isDefault: false,
  userId: "",
};

export function AddressDialog({
  open,
  onOpenChange,
  initialAddress,
  onSave,
}: AddressDialogProps) {
  const [form, setForm] = useState<AddressFormValues>(emptyForm);

  const { data } = authClient.useSession();

  useEffect(() => {
    if (!data) return;

    if (open) {
      setForm(
        initialAddress
          ? {
              receiverName: initialAddress.receiverName,
              phone: initialAddress.phone,
              province: initialAddress.province,
              city: initialAddress.city,
              details: initialAddress.details,
              postalCode: initialAddress.postalCode,
              label: initialAddress.label,
              isDefault: initialAddress.isDefault ?? false,
              userId: data.user.id,
            }
          : emptyForm,
      );
    }
  }, [open, initialAddress]);

  if (!data) return;

  const update = (field: keyof AddressFormValues, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...form, userId: data.user.id }, initialAddress?.id);
    onOpenChange(false);
  };

  const isValid =
    form.receiverName.trim() &&
    form.phone.trim() &&
    form.province.trim() &&
    form.city.trim() &&
    form.details.trim() &&
    form.postalCode.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background max-h-[90vh] overflow-y-auto sm:max-w-130">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {initialAddress ? "ویرایش آدرس" : "افزودن آدرس"}
          </DialogTitle>
          <DialogDescription>
            {initialAddress
              ? "جزییات آدرس را ویرایش کنید"
              : "جزییات آدرس را وارد کنید"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="receiverName">نام و نام‌خانوادگی</Label>
              <Input
                id="receiverName"
                value={form.receiverName}
                onChange={(e) => update("receiverName", e.target.value)}
                placeholder="علیرضا رضاپور"
                required
                className="transition-colors py-5 duration-150 focus-visible:ring-[#68578b]"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="phone">شماره تماس</Label>
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="09179832338"
                required
                className="transition-colors duration-150 focus-visible:ring-[#68578b]"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="province">استان</Label>
              <Select
                value={form.province}
                onValueChange={(value) => update("province", value)}
              >
                <SelectTrigger className="w-full max-w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectGroup>
                    <SelectLabel>استان</SelectLabel>
                    {provinces.map((item) => (
                      <SelectItem key={item.province} value={item.province}>
                        {item.province}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="city">شهر</Label>
              <Select
                value={form.city}
                onValueChange={(value) => update("city", value)}
              >
                <SelectTrigger className="w-full max-w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectGroup>
                    <SelectLabel>شهر</SelectLabel>
                    {provinces
                      .find((province) => province.province === form.province)
                      ?.cities.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="street">جزییات آدرس</Label>
              <Input
                id="street"
                value={form.details}
                onChange={(e) => update("details", e.target.value)}
                placeholder="خیابان ... ، آپارتمان ... ، واحد ..."
                required
                className="transition-colors duration-150 focus-visible:ring-[#68578b]"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="postalCode">کد پستی</Label>
              <Input
                id="postalCode"
                value={form.postalCode}
                onChange={(e) => update("postalCode", e.target.value)}
                placeholder="941029328"
                required
                className="transition-colors duration-150 focus-visible:ring-[#68578b]"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-1">
              <Label>
                برچسب آدرس <span className="text-gray-400">(اخیاری)</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="label"
                  value={form.label}
                  onChange={(e) => update("label", e.target.value)}
                  placeholder="خانه ، محل کار و ..."
                  className="transition-colors duration-150 focus-visible:ring-[#68578b]"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-lg bg-gray-50 px-4 py-3">
            <Checkbox
              id="isDefault"
              checked={form.isDefault}
              onCheckedChange={(checked) =>
                update("isDefault", checked === true)
              }
              className="data-[state=checked]:border-[#68578b] data-[state=checked]:bg-[#68578b]"
            />
            <Label
              htmlFor="isDefault"
              className="cursor-pointer text-sm font-normal text-gray-700"
            >
              آدرس پیش فرض
            </Label>
          </div>

          <DialogFooter className="gap-2 pt-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="transition-colors duration-150"
            >
              لغو
            </Button>
            <Button
              type="submit"
              disabled={!isValid}
              className="bg-[#68578b] text-white transition-colors duration-150 hover:bg-[#564874]"
            >
              ذخیره آدرس
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
