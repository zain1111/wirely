"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BadgeCheck, Check, RotateCcw, Truck } from "lucide-react";
import type { Product } from "@/lib/types";
import { trackAddToCart, trackBeginCheckout } from "@/lib/analytics";
import { ProductCard } from "@/components/product/ProductCard";
import { resolveUnitPrice } from "@/lib/pricing";
import { formatPkr, productImageSrc } from "@/lib/utils";
import { useCart } from "@/store/cart";

const trustRow = [
  { icon: Truck, label: "Free advance delivery" },
  { icon: RotateCcw, label: "7-day returns" },
  { icon: BadgeCheck, label: "100% authentic" },
];

export function ProductDetail({
  product,
  related,
}: {
  product: Product;
  related: Product[];
}) {
  const router = useRouter();
  const reduce = useReducedMotion();
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
  const saving =
    product.compare_at_price && product.compare_at_price > priced.price
      ? product.compare_at_price - priced.price
      : null;

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
        <Link href="/" className="transition-colors hover:text-foreground">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{product.short_name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        {/* Gallery */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="product-stage relative aspect-square overflow-hidden rounded-[2rem] border border-border">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={image}
                initial={reduce ? false : { opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduce ? undefined : { opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <Image
                  src={productImageSrc(image)}
                  alt={product.name}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </motion.div>
            </AnimatePresence>

            {saving && (
              <span className="absolute left-4 top-4 z-10 rounded-full bg-accent px-3.5 py-1.5 text-xs font-bold text-white shadow-lg">
                Save {formatPkr(saving)}
              </span>
            )}
          </div>

          {product.images.length > 1 && (
            <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
              {product.images.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  aria-label={`View image ${i + 1}`}
                  className={`product-stage relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 transition-all duration-200 ${
                    i === activeImage
                      ? "ring-glow border-accent"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={productImageSrc(src)}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Buy panel */}
        <div>
          {product.badge && (
            <motion.span
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block rounded-full bg-accent-soft px-3.5 py-1.5 text-xs font-semibold text-accent-dark"
            >
              {product.badge}
            </motion.span>
          )}
          <h1 className="mt-3 font-display text-3xl font-bold leading-tight md:text-4xl">
            {product.name}
          </h1>

          <div className="mt-5 flex flex-wrap items-baseline gap-3">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={priced.price}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="text-3xl font-bold text-accent"
              >
                {formatPkr(priced.price)}
              </motion.span>
            </AnimatePresence>
            {product.compare_at_price ? (
              <span className="text-lg font-normal text-muted line-through">
                {formatPkr(product.compare_at_price)}
              </span>
            ) : null}
          </div>

          <p className="mt-5 leading-relaxed text-muted">{product.description}</p>

          {variations.length > 0 && (
            <div className="mt-7">
              <p className="mb-3 text-sm font-semibold">Options</p>
              <div className="flex flex-wrap gap-2">
                {variations.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setVariationId(v.id)}
                    className={`rounded-full border px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
                      variationId === v.id
                        ? "ring-glow border-accent bg-accent-soft text-accent-dark"
                        : "border-border hover:border-accent/50"
                    }`}
                  >
                    {v.label} · {formatPkr(v.price)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <ul className="mt-7 space-y-2.5">
            {product.highlights.map((h) => (
              <li key={h} className="flex items-start gap-2.5 text-sm text-foreground">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-dark">
                  <Check className="h-3 w-3" />
                </span>
                {h}
              </li>
            ))}
          </ul>

          <div className="mt-8 hidden gap-3 md:flex">
            <button
              type="button"
              className="btn-primary flex-1 justify-center text-base"
              onClick={() => addToCart(true)}
            >
              Buy now
            </button>
            <button
              type="button"
              className="btn-secondary flex-1 justify-center text-base"
              onClick={() => addToCart(false)}
            >
              Add to cart
            </button>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {trustRow.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted"
              >
                <Icon className="h-3.5 w-3.5 text-accent" />
                {label}
              </span>
            ))}
          </div>

          {product.device_compatibility?.length > 0 && (
            <div className="mt-10">
              <h2 className="font-display text-xl font-semibold">
                Compatibility
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {product.device_compatibility.map((d) => (
                  <div
                    key={d.name}
                    className="rounded-2xl border border-border bg-card p-4 transition-colors hover:border-accent/40"
                  >
                    <p className="font-semibold">
                      <span className="mr-1.5">{d.icon}</span>
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
        <section className="mt-20">
          <h2 className="font-display text-2xl font-bold md:text-3xl">
            You may also like
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Mobile sticky buy bar */}
      <div className="glass fixed inset-x-0 bottom-0 z-30 border-t border-border p-3 md:hidden">
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-muted">{product.short_name}</p>
            <p className="font-bold text-accent">{formatPkr(priced.price)}</p>
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
            className="btn-primary px-5 py-3 text-sm"
            onClick={() => addToCart(true)}
          >
            Buy now
          </button>
        </div>
      </div>
    </div>
  );
}
