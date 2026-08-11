import { notFound } from "next/navigation";
import { ProductEditor } from "@/components/admin/ProductEditor";
import { getAdminProducts } from "@/lib/admin";

type Props = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const products = await getAdminProducts();
  const product = products.find((p) => p.id === id);
  if (!product) notFound();
  return <ProductEditor product={product} />;
}
