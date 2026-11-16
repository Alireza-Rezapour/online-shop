"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(min-width: 768px)";

/** true on md and up. Server and first paint assume desktop. */
export function useIsDesktop() {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(QUERY);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(QUERY).matches,
    () => true,
  );
}
