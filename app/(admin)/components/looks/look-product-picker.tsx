"use client";

import { useState } from "react";
import { GripVertical, Shirt, X } from "lucide-react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatPrice } from "@/lib/utils";
import { useDebouncedValue } from "@/app/hooks/use-debounce-value";
import { SearchableCombobox } from "@/app/components/shared/searchable-combobox";
import { useSearchLookProductsQuery } from "@/redux/services/lookApi";
import {
  MAX_LOOK_ITEMS,
  type AdminLookItemDto,
} from "@/services/look/look.types";

interface Props {
  value: AdminLookItemDto[];
  onChange: (value: AdminLookItemDto[]) => void;
}

function SelectedProduct({
  product,
  onRemove,
}: {
  product: AdminLookItemDto;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: product.productId });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-center gap-3 rounded-lg border bg-card p-2",
        isDragging && "relative z-10 shadow-md",
      )}
    >
      <button
        type="button"
        aria-label="جابه‌جایی"
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>

      <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
        {product.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.coverImageUrl}
            alt=""
            className="size-full object-cover"
          />
        ) : (
          <Shirt className="size-4 text-muted-foreground" aria-hidden />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{product.title}</p>
        <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
          <span>{formatPrice(product.currentPrice, "تومان")}</span>
          {!product.isPublished && (
            <Badge variant="destructive" className="text-[10px] font-normal">
              منتشر نشده؛ در فروشگاه نمایش داده نمی‌شود
            </Badge>
          )}
        </div>
      </div>

      <Button
        type="button"
        size="icon"
        variant="ghost"
        aria-label="حذف از ست"
        onClick={onRemove}
      >
        <X className="size-4" />
      </Button>
    </li>
  );
}

export function LookProductPicker({ value, onChange }: Props) {
  const [search, setSearch] = useState("");
  const debounced = useDebouncedValue(search, 300);
  const { data, isFetching } = useSearchLookProductsQuery({
    search: debounced || undefined,
  });

  const selectedIds = new Set(value.map((p) => p.productId));
  const atLimit = value.length >= MAX_LOOK_ITEMS;

  const options = (data ?? [])
    .filter((p) => !selectedIds.has(p.productId))
    .map((p) => ({ value: p.productId, label: p.title, description: p.slug }));

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleAdd(id: string | null) {
    if (!id || atLimit) return;
    const product = data?.find((p) => p.productId === id);
    if (product) onChange([...value, product]);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const from = value.findIndex((p) => p.productId === active.id);
    const to = value.findIndex((p) => p.productId === over.id);
    onChange(arrayMove(value, from, to));
  }

  return (
    <div className="space-y-3">
      <SearchableCombobox
        value={null}
        onChange={handleAdd}
        onSearchChange={setSearch}
        options={options}
        isLoading={isFetching}
        disabled={atLimit}
        placeholder={
          atLimit ? `حداکثر ${MAX_LOOK_ITEMS} محصول` : "افزودن محصول به ست..."
        }
        searchPlaceholder="جستجوی نام یا نشانی محصول..."
        emptyText="محصولی یافت نشد."
      />

      <p className="text-xs text-muted-foreground">
        {value.length.toLocaleString("fa-IR")} از{" "}
        {MAX_LOOK_ITEMS.toLocaleString("fa-IR")} محصول. ترتیب این فهرست، ترتیب
        نمایش در فروشگاه است؛ برای تغییر آن بکشید و رها کنید.
      </p>

      {value.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={value.map((p) => p.productId)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="space-y-2">
              {value.map((product) => (
                <SelectedProduct
                  key={product.productId}
                  product={product}
                  onRemove={() =>
                    onChange(value.filter((p) => p.productId !== product.productId))
                  }
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          هنوز محصولی به این ست اضافه نشده است.
        </div>
      )}
    </div>
  );
}
