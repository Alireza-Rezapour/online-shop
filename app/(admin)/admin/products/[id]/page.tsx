import { ProductWizard } from "@/app/(admin)/components/product/product-wizard";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ step?: string }>;
};

export default async function EditProductPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { step } = await searchParams;
  const parsed = Number(step);

  return (
    <ProductWizard
      productId={id}
      initialStep={Number.isInteger(parsed) && parsed > 0 ? parsed : 1}
    />
  );
}
