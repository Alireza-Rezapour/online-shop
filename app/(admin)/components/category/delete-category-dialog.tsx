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
import { CategoryNode } from "../../lib/category/category-utils";

type Props = {
  category: CategoryNode | null;
  isDeleting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export function DeleteCategoryDialog({
  category,
  isDeleting,
  onOpenChange,
  onConfirm,
}: Props) {
  return (
    <AlertDialog open={!!category} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader className="text-start">
          <AlertDialogTitle>حذف دسته‌بندی</AlertDialogTitle>
          <AlertDialogDescription>
            آیا از حذف دسته‌بندی «{category?.name}» مطمئن هستید؟ این عملیات قابل
            بازگشت نیست.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:justify-start">
          <AlertDialogAction
            disabled={isDeleting}
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
          >
            حذف
          </AlertDialogAction>
          <AlertDialogCancel disabled={isDeleting}>انصراف</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
