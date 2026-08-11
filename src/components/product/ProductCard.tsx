"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { Product } from "@/lib/types";
import { displayPrice } from "@/lib/pricing";
import { formatPkr, productImageSrc } from "@/lib/utils";

type Props = {
  product: Product;
  index?: number;
};

export function ProductCard({ product, index = 0 }: Props) {
  const reduce = useReducedMotion();
  const price = displayPrice(product);
  const hasFrom = (product.variations?.length ?? 0) > 0;
  const image = product.images[0] || "/brand/logo.png";
  const discount =
    product.compare_at_price && product.compare_at_price > price
      ? Math.round(
          ((product.compare_at_price - price) / product.compare_at_price) * 100,
        )
      : null;

  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className="group h-full"
    >
      <Link
        href={`/${product.slug}`}
        className="card-lift flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-border bg-card"
      >
        <div className="product-stage relative aspect-[4/5] overflow-hidden">
          <Image
            src={productImageSrc(image)}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
            sizes="(max-width: 768px) 90vw, 340px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-graphite/25 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          <div className="absolute left-3 top-3 flex flex-col gap-2">
            {product.badge && (
              <span className="rounded-full bg-graphite/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                {product.badge}
              </span>
            )}
            {discount && (
              <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-white">
                −{discount}%
              </span>
            )}
          </div>

          <span className="absolute bottom-3 right-3 flex h-10 w-10 translate-y-2 items-center justify-center rounded-full bg-white/90 text-graphite opacity-0 shadow-lg backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <ArrowUpRight className="h-4.5 w-4.5" />
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-1.5 p-5">
          <h3 className="font-display text-lg font-semibold leading-snug">
            {product.short_name}
          </h3>
          <p className="text-sm leading-relaxed text-muted line-clamp-2">
            {product.description}
          </p>
          <p className="mt-auto pt-2 text-base font-bold text-foreground">
            {hasFrom && (
              <span className="mr-1 text-sm font-medium text-muted">From</span>
            )}
            <span className="text-accent">{formatPkr(price)}</span>
            {product.compare_at_price ? (
              <span className="ml-2 text-sm font-normal text-muted line-through">
                {formatPkr(product.compare_at_price)}
              </span>
            ) : null}
          </p>
        </div>
      </Link>
    </motion.article>
  );
}
