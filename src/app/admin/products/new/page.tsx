import { ProductEditor } from "@/components/admin/ProductEditor";
import { canEditProductsInAdmin } from "@/lib/admin";

export default function NewProductPage() {
  return <ProductEditor canSave={canEditProductsInAdmin()} />;
}
