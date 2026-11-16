"use client";

import { useState } from "react";
import { Eye, GripVertical, ImageOff, Pencil, Trash2 } from "lucide-react";
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
  useReorderHeroSlidesMutation,
  useUpdateHeroSlideMutation,
  type AdminHeroSlide,
} from "@/redux/services/heroSlideApi";
import ErrorToast from "@/lib/toast/error-toast";
import SuccessToast from "@/lib/toast/success-toast";
import {
  HeroSlideEmptyState,
  HeroSlideTableSkeleton,
} from "./hero-slide-table-states";
import {
  getSlideStatus,
  HERO_CTA_TYPE_LABELS,
} from "../../lib/hero/hero-labels";
import { useIsDesktop } from "../../lib/hero/use-is-desktop";
import { getPublicUrl } from "@/services/storage/storage.public-url";
import Image from "next/image";

const titleOneLine = (title: string) => title.replace(/\n/g, " ");

function CtaBadge({ slide }: { slide: AdminHeroSlide }) {
  if (!slide.ctaLabel || !slide.ctaType) {
    return <span className="text-xs text-muted-foreground">بدون دکمه</span>;
  }
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-sm">{slide.ctaLabel}</span>
      <Badge variant="secondary" className="w-fit text-[10px] font-normal">
        {HERO_CTA_TYPE_LABELS[slide.ctaType]}
        {slide.ctaTarget ? ` · ${slide.ctaTarget.label}` : " · مقصد نامعتبر"}
      </Badge>
    </div>
  );
}

function StatusBadge({ slide }: { slide: AdminHeroSlide }) {
  const status = getSlideStatus(slide);
  return (
    <Badge
      variant={status.variant}
      className="w-fit text-[10px] font-normal text-secondary"
    >
      {status.label}
    </Badge>
  );
}

function Thumbnail({ slide }: { slide: AdminHeroSlide }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const broken = failedSrc === slide.image;
  return (
    <div className="relative flex h-12 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
      {slide.image && !broken ? (
        // eslint-disable-next-line @next/next/no-img-element
        <Image
          src={getPublicUrl(slide.image)!}
          fill
          alt={slide.imageAlt ?? ""}
          className="h-full w-full object-cover"
          style={{ objectPosition: `${slide.focalX}% ${slide.focalY}%` }}
          onError={() => setFailedSrc(slide.image)}
        />
      ) : (
        <ImageOff className="size-4 text-muted-foreground" aria-hidden="true" />
      )}
    </div>
  );
}

interface RowActionsProps {
  slide: AdminHeroSlide;
  onEdit: (slide: AdminHeroSlide) => void;
  onDelete: (slide: AdminHeroSlide) => void;
  onPreview: (slide: AdminHeroSlide) => void;
}

function RowActions({ slide, onEdit, onDelete, onPreview }: RowActionsProps) {
  return (
    <div className="flex items-center gap-1">
      <Button
        size="icon"
        variant="ghost"
        onClick={() => onPreview(slide)}
        title="پیش‌نمایش"
        aria-label="پیش‌نمایش"
      >
        <Eye className="size-4" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        onClick={() => onEdit(slide)}
        title="ویرایش"
        aria-label="ویرایش"
      >
        <Pencil className="size-4" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className="text-secondary hover:bg-destructive/10 hover:text-destructive"
        onClick={() => onDelete(slide)}
        title="حذف"
        aria-label="حذف"
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}

interface SortableItemProps extends RowActionsProps {
  isToggling: boolean;
  onToggleActive: (slide: AdminHeroSlide) => void;
}

function useSortableStyle(id: string) {
  const sortable = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
  };
  return { ...sortable, style };
}

function SortableRow({
  slide,
  isToggling,
  onToggleActive,
  ...actions
}: SortableItemProps) {
  const { attributes, listeners, setNodeRef, style, isDragging } =
    useSortableStyle(slide.id);

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
        <Thumbnail slide={slide} />
      </TableCell>
      <TableCell className="max-w-64 truncate font-medium">
        {titleOneLine(slide.title)}
      </TableCell>
      <TableCell>
        <CtaBadge slide={slide} />
      </TableCell>
      <TableCell>
        <div className="flex flex-col items-start gap-1.5">
          <Switch
            checked={slide.isActive}
            disabled={isToggling}
            onCheckedChange={() => onToggleActive(slide)}
            aria-label="فعال یا غیرفعال"
          />
          <StatusBadge slide={slide} />
        </div>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {slide.sortOrder + 1}
      </TableCell>
      <TableCell>
        <RowActions slide={slide} {...actions} />
      </TableCell>
    </TableRow>
  );
}

function MobileCard({
  slide,
  isToggling,
  onToggleActive,
  ...actions
}: SortableItemProps) {
  const { attributes, listeners, setNodeRef, style, isDragging } =
    useSortableStyle(slide.id);

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
      <Thumbnail slide={slide} />
      <div className="min-w-0 flex-1 space-y-1">
        <p className="truncate font-medium">{titleOneLine(slide.title)}</p>
        <StatusBadge slide={slide} />
      </div>
      <div className="flex flex-col items-end gap-2">
        <Switch
          checked={slide.isActive}
          disabled={isToggling}
          onCheckedChange={() => onToggleActive(slide)}
          aria-label="فعال یا غیرفعال"
        />
        {/* Editing is desktop only, so mobile cards only preview and delete */}
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => actions.onPreview(slide)}
            aria-label="پیش‌نمایش"
          >
            <Eye className="size-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="text-secondary hover:bg-destructive/10 hover:text-destructive"
            onClick={() => actions.onDelete(slide)}
            aria-label="حذف"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

interface HeroSlideTableProps {
  slides: AdminHeroSlide[];
  isLoading: boolean;
  onEdit: (slide: AdminHeroSlide) => void;
  onDelete: (slide: AdminHeroSlide) => void;
  onPreview: (slide: AdminHeroSlide) => void;
  onCreate: () => void;
}

export function HeroSlideTable({
  slides,
  isLoading,
  onEdit,
  onDelete,
  onPreview,
  onCreate,
}: HeroSlideTableProps) {
  const isDesktop = useIsDesktop();
  const [items, setItems] = useState<AdminHeroSlide[]>(slides);
  const [prevSlides, setPrevSlides] = useState(slides);
  const [reorderHeroSlides] = useReorderHeroSlidesMutation();
  const [updateHeroSlide] = useUpdateHeroSlideMutation();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Follow fresh server data (after a refetch) without an effect
  if (slides !== prevSlides) {
    setPrevSlides(slides);
    setItems(slides);
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

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((s) => s.id === active.id);
    const newIndex = items.findIndex((s) => s.id === over.id);
    const previous = items;
    const reordered = arrayMove(items, oldIndex, newIndex);

    setItems(reordered); // optimistic
    try {
      await reorderHeroSlides({
        items: reordered.map((s, i) => ({ id: s.id, sortOrder: i })),
      }).unwrap();
    } catch {
      setItems(previous); // revert
      ErrorToast("تغییر ترتیب ذخیره نشد. دوباره تلاش کنید.");
    }
  }

  async function handleToggleActive(slide: AdminHeroSlide) {
    setTogglingId(slide.id);
    try {
      await updateHeroSlide({
        id: slide.id,
        body: { isActive: !slide.isActive },
      }).unwrap();
      SuccessToast(slide.isActive ? "اسلاید غیرفعال شد" : "اسلاید فعال شد");
    } catch {
      ErrorToast("تغییر وضعیت ذخیره نشد.");
    } finally {
      setTogglingId(null);
    }
  }

  if (isLoading) return <HeroSlideTableSkeleton />;
  if (items.length === 0) return <HeroSlideEmptyState onCreate={onCreate} />;

  const rowProps = {
    onEdit,
    onDelete,
    onPreview,
    onToggleActive: handleToggleActive,
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((s) => s.id)}
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
                  <TableHead>دکمه</TableHead>
                  <TableHead>وضعیت</TableHead>
                  <TableHead>ترتیب</TableHead>
                  <TableHead>عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((slide) => (
                  <SortableRow
                    key={slide.id}
                    slide={slide}
                    isToggling={togglingId === slide.id}
                    {...rowProps}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((slide) => (
              <MobileCard
                key={slide.id}
                slide={slide}
                isToggling={togglingId === slide.id}
                {...rowProps}
              />
            ))}
          </div>
        )}
      </SortableContext>
    </DndContext>
  );
}
