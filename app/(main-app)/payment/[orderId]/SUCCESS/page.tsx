import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface PaymentSuccessPageProps {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ amount?: string }>;
}

export default async function PaymentSuccessPage({
  params,
  searchParams,
}: PaymentSuccessPageProps) {
  const { orderId } = await params;
  const { amount } = await searchParams;

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center gap-6 px-4">
      <Card className="rounded-2xl border-emerald-100 shadow-sm">
        <CardHeader className="items-center text-center">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2 className="h-9 w-9 text-emerald-600" />
          </div>
          <CardTitle className="text-2xl">Payment Successful</CardTitle>
          <CardDescription>
            Thanks for your order — it&rsquo;s been placed successfully.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-5">
          <div className="rounded-xl bg-muted/50 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Order number</span>
              <span className="font-medium">#{orderId}</span>
            </div>

            {amount && (
              <>
                <Separator className="my-3" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Amount paid</span>
                  <span className="font-medium">{Number(amount)}</span>
                </div>
              </>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            {/* TODO: point this at your real order-detail route */}
            <Button asChild className="flex-1 rounded-xl">
              <Link href={`/orders/${orderId}`}>View Order</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1 rounded-xl">
              <Link href="/">Continue Shopping</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
