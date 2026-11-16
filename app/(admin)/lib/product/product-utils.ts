export function getErrorMessage(error: unknown, fallback: string): string {
  const data = (error as { data?: { message?: string; error?: string } })?.data;
  return data?.message ?? data?.error ?? fallback;
}

export function toEnglishDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));
}

export function formatPrice(value: number): string {
  return value.toLocaleString("fa-IR");
}

// SKUs are ASCII only, so a Persian slug falls back to the end of the product id
export function skuPrefix(slug: string, productId: string): string {
  const ascii = slug
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return (ascii || productId.slice(-6).toUpperCase()).slice(0, 24);
}

export function buildSku(
  prefix: string,
  colorCode: string,
  sizeName: string,
  sizeFallback: number,
): string {
  const size =
    sizeName.toUpperCase().replace(/[^A-Z0-9]+/g, "") || `S${sizeFallback}`;
  return [prefix, colorCode.toUpperCase(), size].join("-");
}

export const SKU_PATTERN = /^[A-Z0-9][A-Z0-9_-]*$/;
