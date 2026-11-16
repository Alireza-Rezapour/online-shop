const BASE = process.env.NEXT_PUBLIC_STORAGE_PUBLIC_BASE_URL?.replace(
  /\/$/,
  "",
);
let warned = false;

export function getPublicUrl(key: string | null | undefined): string | null {
  if (!key) return null;
  // Old rows that still hold a full URL keep working.
  if (/^https?:\/\//.test(key)) return key;

  if (!BASE) {
    if (!warned && process.env.NODE_ENV !== "production") {
      warned = true;
      console.warn(
        "NEXT_PUBLIC_STORAGE_PUBLIC_BASE_URL is not set: image keys cannot become URLs.",
      );
    }
    return null;
  }
  return `${BASE}/${key.replace(/^\//, "")}`;
}
