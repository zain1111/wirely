"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
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

  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      className="group"
    >
      <Link href={`/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-card">
          <Image
            src={productImageSrc(image)}
            alt={product.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.04]"
            sizes="(max-width: 768px) 90vw, 280px"
          />
          {product.badge && (
            <span className="absolute left-3 top-3 rounded-full bg-graphite px-3 py-1 text-xs font-semibold text-white">
              {product.badge}
            </span>
          )}
        </div>
        <div className="mt-4 space-y-1 px-1">
          <h3 className="font-display text-lg font-semibold leading-snug">
            {product.short_name}
          </h3>
          <p className="text-sm text-muted line-clamp-2">{product.description}</p>
          <p className="pt-1 text-base font-semibold text-accent">
            {hasFrom ? "From " : ""}
            {formatPkr(price)}
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
