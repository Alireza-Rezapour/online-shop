import Link from "next/link";
import { XCircle } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PaymentFailedPageProps {
  params: Promise<{ orderId: string }>;
}

export default async function PaymentFailedPage({
  params,
}: PaymentFailedPageProps) {
  const { orderId } = await params;

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center gap-6 px-4">
      <Card className="rounded-2xl border-red-100 shadow-sm">
        <CardHeader className="items-center text-center">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <XCircle className="h-9 w-9 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Payment Failed</CardTitle>
          <CardDescription>
            We couldn&rsquo;t complete your payment. Your order hasn&rsquo;t
            been charged.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-5">
          <div className="rounded-xl bg-muted/50 p-4 text-center text-sm">
            <span className="text-muted-foreground">Order number </span>
            <span className="font-medium">#{orderId}</span>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            {/* TODO: adjust to your real retry route if different */}
            <Button asChild className="flex-1 rounded-xl">
              <Link href={`/payment/${orderId}`}>Try Again</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1 rounded-xl">
              <Link href="/checkout">Back to Checkout</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
