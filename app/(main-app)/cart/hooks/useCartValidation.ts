"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { applyServerSnapshot, selectCartItems } from "@/redux/slices/cartSlice";
import { useValidateCartQuery } from "@/redux/services/cartApi";
import { CartValidationRequest } from "@/services/cart/cartValidation.schema";

function useDebouncedValue<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

/**
 * Keeps the cart in line with the server: current prices, available stock and
 * the coupon preview. Runs on mount and (debounced) after every quantity or
 * coupon change; the answer is written back into the cart slice.
 */
export function useCartValidation(couponCode: string | null) {
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);

  // Built from variant ids and quantities only, so price updates do not retrigger it
  const requestKey = useMemo(
    () =>
      JSON.stringify({
        items: items
          .map((item) => ({
            variantId: item.variantId,
            quantity: item.cartQty,
          }))
          .sort((a, b) => a.variantId.localeCompare(b.variantId)),
        ...(couponCode ? { couponCode } : {}),
      }),
    [items, couponCode],
  );

  const debouncedKey = useDebouncedValue(requestKey, 400);
  const args = useMemo(
    () => JSON.parse(debouncedKey) as CartValidationRequest,
    [debouncedKey],
  );

  const { data, isFetching, isError, refetch } = useValidateCartQuery(args, {
    skip: items.length === 0,
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    if (data) dispatch(applyServerSnapshot(data.items));
  }, [data, dispatch]);

  return {
    coupon: data?.coupon ?? null,
    couponError: data?.couponError ?? null,
    // true while a change is waiting to be checked, so checkout never uses stale numbers
    isSyncing: items.length > 0 && (debouncedKey !== requestKey || isFetching),
    isError,
    retry: refetch,
  };
}
