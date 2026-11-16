"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { CART_STORAGE_KEY, populateCart } from "@/redux/slices/cartSlice";

// Loads the cart from localStorage after mount, and keeps other tabs in sync
export function CartHydrator() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(populateCart());

    const onStorage = (event: StorageEvent) => {
      if (event.key === CART_STORAGE_KEY) dispatch(populateCart());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [dispatch]);

  return null;
}
