"use client";

import { useState } from "react";
import { Plus, MapPinOff } from "lucide-react";
import { AddressCard } from "./address-card";
import {
  useCreateAddressMutation,
  useDeleteAddressMutation,
  useGetAddressesQuery,
  useUpdateAddressMutation,
} from "@/redux/services/addressApi";

import { AddressDialog } from "@/app/(main-app)/cart/components/address/AddressDialog";
import { Address, AddressFormValues } from "@/app/(main-app)/cart/types/types";
import { EmptyState } from "../shared/state-views";
import { Button } from "@/app/(main-app)/components/product-listing/ui";
import Loading from "@/app/components/shared/loading";

export function AddressesView() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);

  const { data: addresses, isLoading: addressesLoading } =
    useGetAddressesQuery(undefined);

  const [createAddress] = useCreateAddressMutation();
  const [editAddress] = useUpdateAddressMutation();
  const [deleteAddress] = useDeleteAddressMutation();

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (address: Address) => {
    setEditing(address);
    setDialogOpen(true);
  };

  const handleSave = (data: AddressFormValues, id?: string) => {
    if (id) {
      editAddress({ body: data, id: id });
    } else {
      createAddress(data);
    }
  };

  const handleDelete = (id: string) => {
    deleteAddress(id);
  };
  const handleSetDefault = (id: string) => {
    editAddress({ body: { isDefault: true }, id });
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Button onClick={openNew} className="p-2">
          <Plus className="h-4 w-4" /> اضافه کردن آدرس جدید
        </Button>
      </div>
      {addressesLoading ? (
        <Loading />
      ) : (
        <div>
          {addresses.length === 0 ? (
            <EmptyState
              icon={MapPinOff}
              title="هیچ آدرسی ثبت نشده است."
              description="آدرس را به حساب کاربری خود اضافه کنید"
              actionLabel="اضافه کردن آدرس"
              onAction={openNew}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {addresses.map((address: Address) => (
                <AddressCard
                  key={address.id}
                  address={address}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                  onSetDefault={handleSetDefault}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <AddressDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialAddress={editing}
        onSave={handleSave}
      />
    </div>
  );
}
