"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Collection } from "../../lib/types";

interface DeleteCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collection: Collection | null;
  onConfirm: (id: string) => void;
}

export function DeleteCollectionDialog({
  open,
  onOpenChange,
  collection,
  onConfirm,
}: DeleteCollectionDialogProps) {
  if (!collection) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>حذف مجموعه</AlertDialogTitle>
          <AlertDialogDescription>
            آیا از حذف مجموعه «{collection.name}» مطمئن هستید؟ این عملیات قابل
            بازگشت نیست. خود محصولات حذف نمی‌شوند و فقط از این مجموعه خارج
            می‌شوند.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>انصراف</AlertDialogCancel>
          <AlertDialogAction
            className="bg-danger text-white hover:bg-danger/90"
            onClick={() => {
              onConfirm(collection.id);
              onOpenChange(false);
            }}
          >
            حذف
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
