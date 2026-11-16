import { OrdersView } from "../components/orders/orders-view";

export default function OrdersPage() {
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-medium text-foreground">
          سفارش های من
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          از این قسمت میتوانید سفارش های خود را رهگیری کنید.
        </p>
      </div>
      <OrdersView />
    </div>
  );
}
