"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

import {
  useCreateCollectionMutation,
  useUpdateCollectionMutation,
} from "@/redux/services/collectionApi";
import { AdminCollectionDto } from "@/services/collection/collection.service";

interface CollectionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collection: AdminCollectionDto | null; // null = create mode
}

interface FormState {
  name: string;
  slug: string;
  description: string;
  image: string;
  isActive: boolean;
  startsAt: string;
  endsAt: string;
}

const emptyForm: FormState = {
  name: "",
  slug: "",
  description: "",
  image: "",
  isActive: true,
  startsAt: "",
  endsAt: "",
};

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .replace(/-+/g, "-");
}

// yyyy-MM-dd for <input type="date">
function toDateInputValue(value: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

export function CollectionFormDialog({
  open,
  onOpenChange,
  collection,
}: CollectionFormDialogProps) {
  const isEdit = !!collection;
  const [form, setForm] = useState<FormState>(emptyForm);
  const [slugTouched, setSlugTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [createCollection, { isLoading: isCreating }] =
    useCreateCollectionMutation();
  const [updateCollection, { isLoading: isUpdating }] =
    useUpdateCollectionMutation();

  const isSaving = isCreating || isUpdating;

  useEffect(() => {
    if (!open) return;

    if (collection) {
      setForm({
        name: collection.name,
        slug: collection.slug,
        description: collection.description ?? "",
        image: collection.image ?? "",
        isActive: collection.isActive,
        startsAt: toDateInputValue(collection.startsAt),
        endsAt: toDateInputValue(collection.endsAt),
      });
      setSlugTouched(true);
    } else {
      setForm(emptyForm);
      setSlugTouched(false);
    }
    setError(null);
  }, [open, collection]);

  function handleNameChange(value: string) {
    setForm((prev) => ({
      ...prev,
      name: value,
      slug: slugTouched ? prev.slug : slugify(value),
    }));
  }

  async function handleSubmit() {
    if (form.startsAt && form.endsAt && form.endsAt < form.startsAt) {
      setError("تاریخ پایان باید بعد از تاریخ شروع باشد.");
      return;
    }

    const body = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim() || null,
      image: form.image.trim() || null,
      isActive: form.isActive,
      startsAt: form.startsAt ? `${form.startsAt}T00:00:00.000Z` : null,
      endsAt: form.endsAt ? `${form.endsAt}T23:59:59.999Z` : null,
    };

    try {
      if (isEdit && collection) {
        await updateCollection({ id: collection.id, body }).unwrap();
      } else {
        await createCollection(body).unwrap();
      }
      onOpenChange(false);
    } catch (err) {
      const data = (err as { data?: { message?: string; error?: string } })
        ?.data;
      setError(
        data?.message ??
          data?.error ??
          "ذخیره مجموعه با خطا مواجه شد. دوباره تلاش کنید.",
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "ویرایش مجموعه" : "افزودن مجموعه"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="collection-name">نام</Label>
            <Input
              id="collection-name"
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="مثلا: کالکشن تابستانه"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="collection-slug">اسلاگ</Label>
            <Input
              id="collection-slug"
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                setForm((prev) => ({ ...prev, slug: e.target.value }));
              }}
              placeholder="summer-collection"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="collection-description">توضیحات</Label>
            <Textarea
              id="collection-description"
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="توضیحات کوتاه (اختیاری)"
              className="min-h-24 resize-y"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="collection-image">لینک تصویر</Label>
            <Input
              id="collection-image"
              value={form.image}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, image: e.target.value }))
              }
              placeholder="https://..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="collection-startsAt">تاریخ شروع</Label>
              <Input
                id="collection-startsAt"
                type="date"
                value={form.startsAt}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, startsAt: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="collection-endsAt">تاریخ پایان</Label>
              <Input
                id="collection-endsAt"
                type="date"
                value={form.endsAt}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, endsAt: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border_soft p-3">
            <Label htmlFor="collection-isActive" className="cursor-pointer">
              فعال
            </Label>
            <Switch
              id="collection-isActive"
              checked={form.isActive}
              onCheckedChange={(checked) =>
                setForm((prev) => ({ ...prev, isActive: checked }))
              }
            />
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            انصراف
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? "در حال ذخیره..." : isEdit ? "ذخیره تغییرات" : "افزودن"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
