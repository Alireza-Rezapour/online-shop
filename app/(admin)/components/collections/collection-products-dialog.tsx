"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import ErrorToast from "@/lib/toast/error-toast";
import SuccessToast from "@/lib/toast/success-toast";
import { useGetProductsQuery } from "@/redux/services/productApi";
import {
  useGetCollectionProductsQuery,
  useSetCollectionProductsMutation,
} from "@/redux/services/collectionApi";
import {
  AdminCollectionDto,
  CollectionProductDto,
} from "@/services/collection/collection.service";
import { getPublicUrl } from "@/services/storage/storage.public-url";

function useDebounced<T>(value: T, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collection: AdminCollectionDto | null;
}

export function CollectionProductsDialog({
  open,
  onOpenChange,
  collection,
}: Props) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Map<string, CollectionProductDto>>(
    new Map(),
  );
  const [initialized, setInitialized] = useState(false);

  const debouncedSearch = useDebounced(search.trim());

  const { data: members } = useGetCollectionProductsQuery(
    collection?.id ?? "",
    {
      skip: !open || !collection,
      refetchOnMountOrArgChange: true,
    },
  );
  const { data: results, isFetching } = useGetProductsQuery(
    { page, pageSize: 20, search: debouncedSearch || undefined, sort: "title" },
    { skip: !open },
  );
  const [saveProducts, { isLoading: isSaving }] =
    useSetCollectionProductsMutation();

  // Start every opening from what is saved
  useEffect(() => {
    if (!open) {
      setInitialized(false);
      setSearch("");
      setPage(1);
    }
  }, [open]);

  useEffect(() => {
    if (open && members && !initialized) {
      setSelected(new Map(members.map((m) => [m.id, m])));
      setInitialized(true);
    }
  }, [open, members, initialized]);

  useEffect(() => setPage(1), [debouncedSearch]);

  const toggle = (product: CollectionProductDto) =>
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(product.id)) next.delete(product.id);
      else next.set(product.id, product);
      return next;
    });

  const dirty =
    !!members &&
    (selected.size !== members.length ||
      members.some((m) => !selected.has(m.id)));

  const handleSave = async () => {
    if (!collection) return;
    try {
      await saveProducts({
        id: collection.id,
        productIds: [...selected.keys()],
      }).unwrap();
      SuccessToast("محصولات مجموعه ذخیره شد");
      onOpenChange(false);
    } catch (error) {
      const data = (error as { data?: { message?: string; error?: string } })
        ?.data;
      ErrorToast(data?.message ?? data?.error ?? "ذخیره محصولات ناموفق بود");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-xl">
        <DialogHeader className="text-start">
          <DialogTitle>محصولات «{collection?.name}»</DialogTitle>
          <DialogDescription>
            محصولات این مجموعه را انتخاب کنید. محصولات پیش‌نویس در فروشگاه نمایش
            داده نمی‌شوند.
          </DialogDescription>
        </DialogHeader>

        {/* Already chosen */}
        <div className="space-y-2">
          <p className="text-sm font-medium">
            انتخاب شده ({selected.size.toLocaleString("fa-IR")})
          </p>
          {selected.size === 0 ? (
            <p className="text-xs text-muted-foreground">
              هنوز محصولی انتخاب نشده است.
            </p>
          ) : (
            <div className="flex max-h-24 flex-wrap gap-1.5 overflow-y-auto">
              {[...selected.values()].map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => toggle(product)}
                  className="flex items-center gap-1 rounded-full border bg-muted px-2.5 py-1 text-xs hover:border-destructive/50"
                >
                  {product.title}
                  <X className="size-3" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search and pick */}
        <div className="relative">
          <Search className="pointer-events-none absolute inset-s-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجوی محصول ..."
            className="ps-9"
          />
        </div>

        <div className="min-h-40 flex-1 overflow-y-auto rounded-lg border">
          {!results ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : results.items.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">
              محصولی پیدا نشد.
            </p>
          ) : (
            <ul className={isFetching ? "opacity-60" : ""}>
              {results.items.map((item) => {
                const product: CollectionProductDto = {
                  id: item.id,
                  title: item.title,
                  slug: item.slug,
                  coverImage: item.coverImage,
                  isPublished: item.isPublished,
                };
                const cover = getPublicUrl(item.coverImage);

                return (
                  <li key={item.id} className="border-b last:border-b-0">
                    <label className="flex cursor-pointer items-center gap-3 p-3 hover:bg-muted/50">
                      <Checkbox
                        checked={selected.has(item.id)}
                        onCheckedChange={() => toggle(product)}
                      />
                      <span className="size-10 shrink-0 overflow-hidden rounded-md border bg-muted">
                        {cover && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={cover}
                            alt=""
                            className="size-full object-cover"
                          />
                        )}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm">
                        {item.title}
                      </span>
                      {!item.isPublished && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          پیش‌نویس
                        </span>
                      )}
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {results && results.pageCount > 1 && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={page <= 1 || isFetching}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronRight className="size-4" />
              قبلی
            </Button>
            <span>
              صفحه {page.toLocaleString("fa-IR")} از{" "}
              {results.pageCount.toLocaleString("fa-IR")}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={page >= results.pageCount || isFetching}
              onClick={() => setPage((p) => p + 1)}
            >
              بعدی
              <ChevronLeft className="size-4" />
            </Button>
          </div>
        )}

        <DialogFooter className="gap-2 sm:justify-start">
          <Button onClick={handleSave} disabled={!dirty || isSaving}>
            {isSaving && <Loader2 className="size-4 animate-spin" />}
            ذخیره
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            انصراف
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
