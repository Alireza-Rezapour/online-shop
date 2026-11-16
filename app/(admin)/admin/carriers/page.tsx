"use client";

import { useState } from "react";
import {
  useGetCarriersQuery,
  useCreateCarrierMutation,
  useUpdateCarrierMutation,
  useDeleteCarrierMutation,
} from "@/redux/services/carrierApi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "../../components/AdminShell";

interface Carrier {
  id: string;
  name: string;
  cost: number;
}

export default function CarriersPage() {
  const { data: carriers, isLoading, isError } = useGetCarriersQuery();

  const [createCarrier, { isLoading: isCreating }] = useCreateCarrierMutation();
  const [updateCarrier, { isLoading: isUpdating }] = useUpdateCarrierMutation();
  const [deleteCarrier, { isLoading: isDeleting }] = useDeleteCarrierMutation();

  const [formOpen, setFormOpen] = useState(false);
  const [editingCarrier, setEditingCarrier] = useState<Carrier | null>(null);
  const [name, setName] = useState("");
  const [cost, setCost] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Carrier | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function openCreateForm() {
    setEditingCarrier(null);
    setName("");
    setCost("");
    setFormError(null);
    setFormOpen(true);
  }

  function openEditForm(carrier: Carrier) {
    setEditingCarrier(carrier);
    setName(carrier.name);
    setCost(String(carrier.cost));
    setFormError(null);
    setFormOpen(true);
  }

  async function handleSubmit() {
    setFormError(null);

    const trimmedName = name.trim();
    const parsedCost = Number(cost);

    if (!trimmedName) {
      setFormError("نام شرکت حمل و نقل الزامی است");
      return;
    }

    if (!cost || Number.isNaN(parsedCost) || parsedCost < 0) {
      setFormError("هزینه باید یک عدد معتبر و غیرمنفی باشد");
      return;
    }

    try {
      if (editingCarrier) {
        await updateCarrier({
          id: editingCarrier.id,
          name: trimmedName,
          cost: parsedCost,
        }).unwrap();
      } else {
        await createCarrier({
          name: trimmedName,
          cost: parsedCost,
        }).unwrap();
      }
      setFormOpen(false);
    } catch (err: any) {
      setFormError(err?.data?.error ?? "خطایی رخ داد. دوباره تلاش کنید");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteError(null);

    try {
      await deleteCarrier(deleteTarget.id).unwrap();
      setDeleteTarget(null);
    } catch (err: any) {
      setDeleteError(err?.data?.error ?? "حذف این شرکت حمل و نقل ممکن نیست");
    }
  }

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "شرکت‌ها", href: "/admin/carriers" }]}
      />
      <div className="p-6 space-y-6" dir="rtl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">مدیریت شرکت‌های حمل و نقل</h1>
          <Button onClick={openCreateForm}>
            <Plus className="ml-2 h-4 w-4" />
            افزودن شرکت حمل و نقل
          </Button>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="ml-2 h-5 w-5 animate-spin" />
            در حال بارگذاری...
          </div>
        )}

        {isError && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive">
            خطا در دریافت لیست شرکت‌های حمل و نقل
          </div>
        )}

        {carriers && carriers.length === 0 && (
          <div className="rounded-md border p-8 text-center text-muted-foreground">
            هنوز هیچ شرکت حمل و نقلی ثبت نشده است
          </div>
        )}

        {carriers && carriers.length > 0 && (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>نام</TableHead>
                  <TableHead>هزینه (تومان)</TableHead>
                  <TableHead className="w-32">عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {carriers.map((carrier: Carrier) => (
                  <TableRow key={carrier.id}>
                    <TableCell className="font-medium">
                      {carrier.name}
                    </TableCell>
                    <TableCell>
                      {carrier.cost.toLocaleString("fa-IR")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditForm(carrier)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setDeleteError(null);
                            setDeleteTarget(carrier);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Create / Edit dialog */}
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent dir="rtl">
            <DialogHeader>
              <DialogTitle>
                {editingCarrier
                  ? "ویرایش شرکت حمل و نقل"
                  : "افزودن شرکت حمل و نقل"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="name">نام</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثلاً: پست پیشتاز"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cost">هزینه (تومان)</Label>
                <Input
                  id="cost"
                  type="number"
                  min={0}
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="مثلاً: 50000"
                />
              </div>

              {formError && (
                <p className="text-sm text-destructive">{formError}</p>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setFormOpen(false)}
                disabled={isCreating || isUpdating}
              >
                انصراف
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isCreating || isUpdating}
              >
                {(isCreating || isUpdating) && (
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                )}
                {editingCarrier ? "ذخیره تغییرات" : "افزودن"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete confirmation */}
        <AlertDialog
          open={!!deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
        >
          <AlertDialogContent dir="rtl">
            <AlertDialogHeader>
              <AlertDialogTitle>حذف شرکت حمل و نقل</AlertDialogTitle>
              <AlertDialogDescription>
                آیا از حذف «{deleteTarget?.name}» مطمئن هستید؟ این عملیات قابل
                بازگشت نیست.
              </AlertDialogDescription>
            </AlertDialogHeader>

            {deleteError && (
              <p className="text-sm text-destructive">{deleteError}</p>
            )}

            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>
                انصراف
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isDeleting && (
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                )}
                حذف
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}
