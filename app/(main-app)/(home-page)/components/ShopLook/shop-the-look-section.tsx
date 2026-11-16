import { getActiveLooksService } from "@/services/look/look.service";
import { ShopTheLook } from "./shop-the-look";

/**
 * Server component: fetches the active looks and hands serializable data to
 * the interactive carousel. Renders nothing when there are no active looks.
 *
 * Usage in the home page:
 *   <Suspense fallback={null}><ShopTheLookSection /></Suspense>
 */
export async function ShopTheLookSection() {
  const looks = await getActiveLooksService();
  if (looks.length === 0) return null;
  return <ShopTheLook looks={looks} />;
}
