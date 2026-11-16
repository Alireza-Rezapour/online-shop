"use client";

import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Address } from "../../types/types";

interface DeleteAddressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  address: Address | null;
  onConfirm: () => void;
}

export function DeleteAddressDialog({
  open,
  onOpenChange,
  address,
  onConfirm,
}: DeleteAddressDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-105 bg-background">
        <DialogHeader>
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50">
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <DialogTitle className="pt-3 text-lg">
            میخواهید آدرس را حذف کنید
          </DialogTitle>
          <DialogDescription>
            {address
              ? `آدرس ${address.details} برای ${address.receiverName} به صورت دائم حذف میشود و قابل بازگردانی نیست.`
              : "پس از حذف امکان بازگردانی وجود ندارد."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 pt-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            لغو
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            className="bg-red-500 text-white transition-colors duration-150 hover:bg-red-600"
          >
            حذف آدرس
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
