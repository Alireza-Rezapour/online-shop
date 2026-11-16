"use client";

import { Toaster } from "@/components/ui/sonner";
import { store } from "@/redux/store/store";
import { Provider } from "react-redux";
import { CartHydrator } from "./components/CartHydrator";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Toaster />
      <Provider store={store}>
        <CartHydrator />
        {children}
      </Provider>
    </>
  );
}
