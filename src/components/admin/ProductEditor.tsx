"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { productImageSrc } from "@/lib/utils";

export function ProductEditor({ product }: { product?: Product }) {
  const isNew = !product;

  return (
    <div className="space-y-4 rounded-3xl border border-border bg-card p-6">
      <h1 className="font-display text-2xl font-bold">
        {isNew ? "Add product" : `Edit ${product.short_name}`}
      </h1>
      <p className="rounded-2xl border border-border bg-accent-soft/40 px-4 py-3 text-sm text-accent-dark">
        Static mode is on — products are edited in{" "}
        <code className="rounded bg-card px-1">src/lib/data/seed-products.ts</code>
        . Images live in <code className="rounded bg-card px-1">public/products/</code>.
      </p>

      {product && (
        <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
          <div className="product-stage relative aspect-square overflow-hidden rounded-2xl">
            <Image
              src={productImageSrc(product.images[0])}
              alt={product.name}
              fill
              className="object-cover"
              sizes="160px"
            />
          </div>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-muted">Slug</dt>
              <dd className="font-medium">{product.slug}</dd>
            </div>
            <div>
              <dt className="text-muted">Price</dt>
              <dd className="font-medium">Rs {product.price.toLocaleString("en-PK")}</dd>
            </div>
            <div>
              <dt className="text-muted">Stock</dt>
              <dd className="font-medium">{product.stock}</dd>
            </div>
          </dl>
        </div>
      )}

      <Link href="/admin/products" className="btn-secondary inline-flex">
        Back to products
      </Link>
    </div>
  );
}
