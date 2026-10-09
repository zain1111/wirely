import Image from "next/image";
import Link from "next/link";
import { canEditProductsInAdmin, getAdminProducts } from "@/lib/admin";
import { formatPkr, productImageSrc } from "@/lib/utils";

export default async function AdminProductsPage() {
  const canEdit = canEditProductsInAdmin();
  const products = await getAdminProducts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-bold">Products</h1>
        {canEdit && (
          <Link href="/admin/products/new" className="btn-primary text-sm">
            Add product
          </Link>
        )}
      </div>

      {!canEdit && (
        <p className="rounded-2xl border border-border bg-accent-soft/40 px-4 py-3 text-sm text-accent-dark">
          Previewing the seed catalog from{" "}
          <code className="rounded bg-card px-1">seed-products.ts</code>. Configure
          Supabase on the server to list and edit live database products.
        </p>
      )}

      {canEdit && products.length === 0 && (
        <p className="rounded-2xl border border-border bg-card px-4 py-3 text-sm text-muted">
          No products in Supabase yet. Run{" "}
          <code className="rounded bg-background px-1">
            supabase/migrations/002_seed_products.sql
          </code>{" "}
          in the SQL editor, or click <strong>Add product</strong>.
        </p>
      )}

      <div className="overflow-hidden rounded-3xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-background/70">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-background">
                      <Image
                        src={productImageSrc(p.images[0])}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <div>
                      <p className="font-semibold">{p.short_name}</p>
                      <p className="text-xs text-muted">{p.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">{formatPkr(p.price)}</td>
                <td className="px-4 py-3">{p.stock}</td>
                <td className="px-4 py-3">
                  {p.is_active ? "Active" : "Hidden"}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/products/${p.id}`}
                    className="text-accent underline"
                  >
                    {canEdit ? "Edit" : "View"}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
