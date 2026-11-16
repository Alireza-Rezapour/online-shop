"use client";

import { useState } from "react";
import {
  Eye,
  GripVertical,
  ImageOff,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  useReorderLooksMutation,
  useUpdateLookMutation,
  type AdminLook,
} from "@/redux/services/lookApi";
import ErrorToast from "@/lib/toast/error-toast";
import SuccessToast from "@/lib/toast/success-toast";
import { getLookStatus } from "@/app/(admin)/lib/looks/look-status";
import { useIsDesktop } from "@/app/(admin)/lib/hero/use-is-desktop";

function StatusBadge({ look }: { look: AdminLook }) {
  const status = getLookStatus(look);
  return (
    <Badge
      variant={status.variant}
      className="w-fit text-[10px] font-normal text-secondary"
    >
      {status.label}
    </Badge>
  );
}

function Thumbnail({ look }: { look: AdminLook }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const broken = failedSrc === look.imageUrl;
  return (
    <div className="flex h-14 w-11 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
      {look.imageUrl && !broken ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={look.imageUrl}
          alt=""
          className="size-full object-cover"
          onError={() => setFailedSrc(look.imageUrl)}
        />
      ) : (
        <ImageOff className="size-4 text-muted-foreground" aria-hidden />
      )}
    </div>
  );
}

interface Actions {
  onEdit: (look: AdminLook) => void;
  onDelete: (look: AdminLook) => void;
  onPreview: (look: AdminLook) => void;
}

interface RowProps extends Actions {
  look: AdminLook;
  isToggling: boolean;
  onTogglePublished: (look: AdminLook) => void;
}

function useSortableStyle(id: string) {
  const sortable = useSortable({ id });
  return {
    ...sortable,
    style: {
      transform: CSS.Transform.toString(sortable.transform),
      transition: sortable.transition,
    },
  };
}

function SortableRow({
  look,
  isToggling,
  onTogglePublished,
  ...actions
}: RowProps) {
  const { attributes, listeners, setNodeRef, style, isDragging } =
    useSortableStyle(look.id);
  const hiddenItems = look.items.filter((i) => !i.isPublished).length;

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && "relative z-10 bg-muted")}
    >
      <TableCell className="w-8">
        <button
          type="button"
          aria-label="جابه‌جایی"
          className="cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>
      </TableCell>
      <TableCell>
        <Thumbnail look={look} />
      </TableCell>
      <TableCell className="max-w-64">
        <p className="truncate font-medium">{look.title}</p>
        <p
          dir="ltr"
          className="truncate text-start text-xs text-muted-foreground"
        >
          {look.slug}
        </p>
      </TableCell>
      <TableCell className="text-sm">
        {look.items.length.toLocaleString("fa-IR")} محصول
        {hiddenItems > 0 && (
          <p className="text-xs text-destructive">
            {hiddenItems.toLocaleString("fa-IR")} منتشر نشده
          </p>
        )}
      </TableCell>
      <TableCell>
        <div className="flex flex-col items-start gap-1.5">
          <Switch
            checked={look.isPublished}
            disabled={isToggling}
            onCheckedChange={() => onTogglePublished(look)}
            aria-label="منتشر یا پیش‌نویس"
          />
          <StatusBadge look={look} />
        </div>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {(look.sortOrder + 1).toLocaleString("fa-IR")}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            aria-label="پیش‌نمایش"
            title="پیش‌نمایش"
            onClick={() => actions.onPreview(look)}
          >
            <Eye className="size-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            aria-label="ویرایش"
            title="ویرایش"
            onClick={() => actions.onEdit(look)}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            aria-label="حذف"
            title="حذف"
            className="text-secondary hover:bg-destructive/10 hover:text-destructive"
            onClick={() => actions.onDelete(look)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

function MobileCard({
  look,
  isToggling,
  onTogglePublished,
  ...actions
}: RowProps) {
  const { attributes, listeners, setNodeRef, style, isDragging } =
    useSortableStyle(look.id);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 rounded-lg border bg-card p-3",
        isDragging && "relative z-10 shadow-md",
      )}
    >
      <button
        type="button"
        aria-label="جابه‌جایی"
        className="shrink-0 touch-none text-muted-foreground active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>
      <Thumbnail look={look} />
      <div className="min-w-0 flex-1 space-y-1">
        <p className="truncate font-medium">{look.title}</p>
        <p className="text-xs text-muted-foreground">
          {look.items.length.toLocaleString("fa-IR")} محصول
        </p>
        <StatusBadge look={look} />
      </div>
      <div className="flex flex-col items-end gap-2">
        <Switch
          checked={look.isPublished}
          disabled={isToggling}
          onCheckedChange={() => onTogglePublished(look)}
          aria-label="منتشر یا پیش‌نویس"
        />
        {/* Editing is desktop only, like hero slides */}
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            aria-label="پیش‌نمایش"
            onClick={() => actions.onPreview(look)}
          >
            <Eye className="size-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            aria-label="حذف"
            className="text-secondary hover:bg-destructive/10 hover:text-destructive"
            onClick={() => actions.onDelete(look)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-2" aria-busy="true">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
      ))}
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-10 text-center">
      <p className="font-medium">هنوز ستی ساخته نشده است</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        با یک عکس از مدل و محصولاتِ آن، اولین ست را بسازید تا در صفحه‌ی اصلی
        نمایش داده شود.
      </p>
      <Button onClick={onCreate} className="gap-2">
        <Plus className="size-4" aria-hidden />
        ست جدید
      </Button>
    </div>
  );
}

interface LookTableProps extends Actions {
  looks: AdminLook[];
  isLoading: boolean;
  onCreate: () => void;
}

export function LookTable({
  looks,
  isLoading,
  onCreate,
  ...actions
}: LookTableProps) {
  const isDesktop = useIsDesktop();
  const [items, setItems] = useState<AdminLook[]>(looks);
  const [prevLooks, setPrevLooks] = useState(looks);
  const [reorderLooks] = useReorderLooksMutation();
  const [updateLook] = useUpdateLookMutation();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Follow fresh server data (after a refetch) without an effect
  if (looks !== prevLooks) {
    setPrevLooks(looks);
    setItems(looks);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  async function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const previous = items;
    const reordered = arrayMove(
      items,
      items.findIndex((l) => l.id === active.id),
      items.findIndex((l) => l.id === over.id),
    );

    setItems(reordered); // optimistic
    try {
      await reorderLooks({
        items: reordered.map((l, i) => ({ id: l.id, sortOrder: i })),
      }).unwrap();
    } catch {
      setItems(previous);
      ErrorToast("تغییر ترتیب ذخیره نشد. دوباره تلاش کنید.");
    }
  }

  async function handleTogglePublished(look: AdminLook) {
    setTogglingId(look.id);
    try {
      await updateLook({
        id: look.id,
        body: { isPublished: !look.isPublished },
      }).unwrap();
      SuccessToast(look.isPublished ? "ست به پیش‌نویس رفت" : "ست منتشر شد");
    } catch (err) {
      // e.g. publishing a look that has no products yet
      const e = err as {
        data?: { error?: string; issues?: { message: string }[] };
      };
      ErrorToast(
        e.data?.issues?.[0]?.message ??
          e.data?.error ??
          "تغییر وضعیت ذخیره نشد.",
      );
    } finally {
      setTogglingId(null);
    }
  }

  if (isLoading) return <Skeleton />;
  if (items.length === 0) return <EmptyState onCreate={onCreate} />;

  const rowProps = { ...actions, onTogglePublished: handleTogglePublished };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((l) => l.id)}
        strategy={verticalListSortingStrategy}
      >
        {isDesktop ? (
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8" />
                  <TableHead>تصویر</TableHead>
                  <TableHead>عنوان</TableHead>
                  <TableHead>محصولات</TableHead>
                  <TableHead>وضعیت</TableHead>
                  <TableHead>ترتیب</TableHead>
                  <TableHead>عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((look) => (
                  <SortableRow
                    key={look.id}
                    look={look}
                    isToggling={togglingId === look.id}
                    {...rowProps}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((look) => (
              <MobileCard
                key={look.id}
                look={look}
                isToggling={togglingId === look.id}
                {...rowProps}
              />
            ))}
          </div>
        )}
      </SortableContext>
    </DndContext>
  );
}
