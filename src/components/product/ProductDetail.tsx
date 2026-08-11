"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/types";
import { trackAddToCart, trackBeginCheckout } from "@/lib/analytics";
import { resolveUnitPrice } from "@/lib/pricing";
import { formatPkr, productImageSrc } from "@/lib/utils";
import { useCart } from "@/store/cart";

export function ProductDetail({
  product,
  related,
}: {
  product: Product;
  related: Product[];
}) {
  const router = useRouter();
  const addItem = useCart((s) => s.addItem);
  const variations = product.variations ?? [];
  const [variationId, setVariationId] = useState<string | null>(
    variations[0]?.id ?? null,
  );
  const [activeImage, setActiveImage] = useState(0);
  const priced = useMemo(
    () => resolveUnitPrice(product, variationId),
    [product, variationId],
  );
  const image = product.images[activeImage] || product.images[0];

  function addToCart(buyNow = false) {
    addItem({
      productSlug: product.slug,
      productName: product.name,
      variationId: priced.variationId,
      variationLabel: priced.label,
      unitPrice: priced.price,
      image: product.images[0] || "/brand/logo.png",
      quantity: 1,
    });
    trackAddToCart({
      item_id: product.slug,
      item_name: product.name,
      price: priced.price,
      quantity: 1,
    });
    if (buyNow) {
      trackBeginCheckout(priced.price, [
        { item_id: product.slug, item_name: product.name, price: priced.price },
      ]);
      router.push("/checkout");
    }
  }

  return (
    <div className="container-wirely py-8 md:py-14">
      <nav className="mb-6 text-sm text-muted" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{product.short_name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-card">
            <Image
              src={productImageSrc(image)}
              alt={product.name}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {product.images.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={`relative h-18 w-18 shrink-0 overflow-hidden rounded-2xl border ${
                    i === activeImage ? "border-accent" : "border-border"
                  }`}
                >
                  <Image
                    src={productImageSrc(src)}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="72px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          {product.badge && (
            <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent-dark">
              {product.badge}
            </span>
          )}
          <h1 className="mt-3 font-display text-3xl font-bold md:text-4xl">
            {product.name}
          </h1>
          <p className="mt-4 text-2xl font-semibold text-accent">
            {formatPkr(priced.price)}
            {product.compare_at_price ? (
              <span className="ml-3 text-base font-normal text-muted line-through">
                {formatPkr(product.compare_at_price)}
              </span>
            ) : null}
          </p>
          <p className="mt-4 leading-relaxed text-muted">{product.description}</p>

          {variations.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 text-sm font-semibold">Options</p>
              <div className="flex flex-wrap gap-2">
                {variations.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setVariationId(v.id)}
                    className={`rounded-full border px-4 py-2 text-sm ${
                      variationId === v.id
                        ? "border-accent bg-accent-soft text-accent-dark"
                        : "border-border"
                    }`}
                  >
                    {v.label} · {formatPkr(v.price)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <ul className="mt-6 space-y-2">
            {product.highlights.map((h) => (
              <li key={h} className="flex gap-2 text-sm text-foreground">
                <span className="text-accent">✓</span>
                {h}
              </li>
            ))}
          </ul>

          <div className="mt-8 hidden gap-3 md:flex">
            <button type="button" className="btn-primary" onClick={() => addToCart(false)}>
              Add to cart
            </button>
            <button type="button" className="btn-secondary" onClick={() => addToCart(true)}>
              Buy now
            </button>
          </div>

          {product.device_compatibility?.length > 0 && (
            <div className="mt-10">
              <h2 className="font-display text-xl font-semibold">Compatibility</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {product.device_compatibility.map((d) => (
                  <div
                    key={d.name}
                    className="rounded-2xl border border-border bg-card p-4"
                  >
                    <p className="font-semibold">
                      <span className="mr-1">{d.icon}</span>
                      {d.name}
                    </p>
                    <p className="mt-1 text-sm text-muted">{d.models}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold">You may also like</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <Link
                key={p.id}
                href={`/${p.slug}`}
                className="rounded-3xl border border-border bg-card p-4 transition hover:border-accent"
              >
                <div className="relative mb-3 aspect-square overflow-hidden rounded-2xl">
                  <Image
                    src={productImageSrc(p.images[0])}
                    alt={p.short_name}
                    fill
                    className="object-cover"
                    sizes="240px"
                  />
                </div>
                <p className="font-semibold">{p.short_name}</p>
                <p className="text-sm text-accent">{formatPkr(p.price)}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 p-3 backdrop-blur md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <p className="text-xs text-muted">{product.short_name}</p>
            <p className="font-semibold text-accent">{formatPkr(priced.price)}</p>
          </div>
          <button
            type="button"
            className="btn-secondary px-4 py-3 text-sm"
            onClick={() => addToCart(false)}
          >
            Add
          </button>
          <button
            type="button"
            className="btn-primary px-4 py-3 text-sm"
            onClick={() => addToCart(true)}
          >
            Buy now
          </button>
        </div>
      </div>
    </div>
  );
}
