"use client";

import { useEffect, useState } from "react";
import { ArrowRight, ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

import {
  Address,
  AddressFormValues,
  CheckoutCostSummary,
  OrderDraft,
} from "../../types/types";
import { EmptyState } from "./EmptyState";

import {
  useCreateAddressMutation,
  useDeleteAddressMutation,
  useGetAddressesQuery,
  useUpdateAddressMutation,
} from "@/redux/services/addressApi";
import { AddressDialog } from "./AddressDialog";
import { AddressCard } from "./AddressCard";
import SessionNeeded from "../SessionNeeded";
import { authClient } from "@/lib/auth-client";
import { DeliveryInfoCard } from "../cart/DeliveryInfoCard";
import { useGetCarriersQuery } from "@/redux/services/carrierApi";

export default function CheckoutAddressPage({
  setStep,
  onChange,
  setSummary,
  summary,
}: {
  setStep: (step: string) => void;
  onChange: (patch: Partial<OrderDraft>) => void;
  setSummary: (summary: CheckoutCostSummary) => void;
  summary: CheckoutCostSummary;
}) {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return null;
  }

  if (!session) {
    return <SessionNeeded />;
  }

  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [selectedCarrierId, setSelectedCarrierId] = useState<
    string | undefined
  >(undefined);

  const { data: addresses, isLoading: addressesLoading } =
    useGetAddressesQuery(undefined);
  const { data: carriers, isLoading: carriersLoading } = useGetCarriersQuery();

  const [createAddress] = useCreateAddressMutation();
  const [editAddress] = useUpdateAddressMutation();
  const [deleteAddress] = useDeleteAddressMutation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  useEffect(() => {
    if (addressesLoading) {
      return;
    }
    if (addresses) {
      if (addresses.length > 0) {
        const defaultAddress = addresses.find(
          (address: Address) => address.isDefault,
        );

        setSelectedId(defaultAddress ? defaultAddress.id : addresses[0].id);
      }
    }
  }, [addresses]);

  useEffect(() => {
    if (carriersLoading) {
      return;
    }

    if (carriers) {
      setSelectedCarrierId(carriers[0].id || "");
    }
  }, [carriers]);

  if (addressesLoading || carriersLoading) {
    return;
  }

  const handleOpenAdd = () => {
    setEditingAddress(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (address: Address) => {
    setEditingAddress(address);
    setDialogOpen(true);
  };

  const handleOnContinue = () => {
    const selectedAddress = addresses.find(
      (address: Address) => address.id === selectedId,
    );
    const { receiverName, phone, province, city, details, postalCode } =
      selectedAddress;

    setSummary({
      ...summary,
      shippingFee: carriers?.find((c) => c.id === selectedCarrierId)?.cost,
    });

    setStep("payment");

    onChange({
      shippingReceiverName: receiverName,
      shippingAddress: details,
      shippingCity: city,
      shippingPhone: phone,
      shippingPostalCode: postalCode,
      shippingProvince: province,
      shippingCarrierId: selectedCarrierId,
    });
  };

  const handleSave = (
    data: AddressFormValues & { userId: string },
    id: string | undefined,
  ) => {
    if (id) {
      editAddress({ body: data, id: id });
    } else {
      createAddress(data);
    }
  };

  const handleDelete = (id: string) => {
    deleteAddress(id);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Stepper */}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">
          {/* Left: Address management */}
          <div className="lg:col-span-2">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <h1 className="text-2xl text-gray-900 sm:text-3xl">آدرس</h1>
                <p className="mt-1.5 text-sm text-gray-500">
                  آدرس محل تحویل را انتخاب کنید
                </p>
              </div>
            </div>

            {addresses.length > 0 ? (
              <>
                <div
                  role="radiogroup"
                  aria-label="Saved addresses"
                  className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                >
                  {addresses.map((address: Address) => (
                    <AddressCard
                      address={address}
                      onDelete={handleDelete}
                      onEdit={handleOpenEdit}
                      key={address.id}
                      selected={selectedId === address.id}
                      onSelect={setSelectedId}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleOpenAdd}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 py-4 text-sm font-medium text-gray-600 transition-colors duration-150 hover:border-[#68578b] hover:text-[#68578b] sm:w-auto sm:px-6"
                >
                  <Plus className="h-4 w-4" />
                  اضافه کردن آدرس جدید
                </button>
                <div className="mt-8">
                  <DeliveryInfoCard
                    carriers={carriers}
                    selectedCarrierId={selectedCarrierId}
                    setSelectedCarrierId={setSelectedCarrierId}
                  />
                </div>
              </>
            ) : (
              <EmptyState onAddAddress={handleOpenAdd} />
            )}

            <div className="mt-8">
              {/* <DeliveryInfoCard
                carriers={carriers}
                selectedCarrierId={selectedCarrierId}
                setSelectedCarrierId={setSelectedCarrierId}
              /> */}
            </div>

            {/* Order Summary — mobile position */}

            {/* Navigation buttons */}
            <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row ">
              <Button
                asChild
                variant="outline"
                className="gap-2 border-gray-300 text-gray-700 transition-colors duration-150 hover:border-gray-400 hover:bg-gray-50"
              >
                <Button onClick={() => setStep("cart")}>
                  <ArrowLeft className="h-4 w-4" />
                  بازگشت به سبد خرید
                </Button>
              </Button>

              <Button
                onClick={() => handleOnContinue()}
                disabled={!selectedId}
                className="gap-2 bg-[#68578b] text-white transition-colors duration-150 hover:bg-[#564874] disabled:opacity-50"
              >
                پرداخت
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <AddressDialog
        onSave={handleSave}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialAddress={editingAddress}
      />
    </div>
  );
}
