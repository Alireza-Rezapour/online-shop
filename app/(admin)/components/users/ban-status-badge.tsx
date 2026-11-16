export function BanStatusBadge({
  banned,
  banExpires,
}: {
  banned: boolean | null;
  banExpires: string | null;
}) {
  if (!banned) {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
        فعال
      </span>
    );
  }
  const expiresLabel = banExpires
    ? `تا ${new Date(banExpires).toLocaleDateString("fa-IR")}`
    : "دائمی";
  return (
    <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700">
      مسدود ({expiresLabel})
    </span>
  );
}
