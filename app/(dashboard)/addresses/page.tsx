import { AddressesView } from "../components/addresses/addresses-view";

export default function AddressesPage() {
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-medium text-foreground">
          آدرس های من
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          ویرایش آدرس های محل تحویل
        </p>
      </div>
      <AddressesView />
    </div>
  );
}
