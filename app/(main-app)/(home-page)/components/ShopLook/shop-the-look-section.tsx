import { getActiveLooksService } from "@/services/look/look.service";
import { ShopTheLook } from "./shop-the-look";
import { connection } from "next/server";

export async function ShopTheLookSection() {
  await connection(); // opt this component into request-time rendering
  const looks = await getActiveLooksService();
  if (looks.length === 0) return null;
  return <ShopTheLook looks={looks} />;
}
