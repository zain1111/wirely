"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/lib/types";
import { displayPrice } from "@/lib/pricing";
import { formatPkr, productImageSrc } from "@/lib/utils";
export function ProductCard({ product }: {
    product: Product;
    index?: number;
}) {
    const price = displayPrice(product);
    return <article className="group h-full"><Link href={`/${product.slug}`} className="product-card-link card-lift"><div className="product-stage relative aspect-square overflow-hidden"><Image src={productImageSrc(product.images[0] || "/brand/logo.png")} alt={product.name} fill className="object-cover transition-transform duration-300 group-hover:scale-[1.02]" sizes="(max-width: 640px) 45vw, (max-width: 1024px) 45vw, 400px"/>{product.slug.includes("combo") && <span className="absolute left-3 top-3 rounded bg-white px-2.5 py-1.5 text-[10px] font-semibold">CHARGER + CABLE</span>}</div><div className="product-card-info"><p className="mb-2 text-[10px] uppercase tracking-widest text-muted">{product.slug.includes("airpods") ? "Audio essentials" : "Charging essentials"}</p><h3>{product.short_name}</h3><p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted">{product.highlights[0]}</p><p className="mt-4 text-base font-semibold">{(product.variations?.length ?? 0) > 0 && <span className="text-xs text-muted">From </span>}{formatPkr(price)}{product.compare_at_price && product.compare_at_price > price ? <span className="ml-2 text-xs font-normal text-muted line-through">{formatPkr(product.compare_at_price)}</span> : null}</p></div><div className="product-card-cta"><span>{product.purchase_mode === "enquiry" ? "View charger" : product.stock > 0 ? "View product" : "View availability"}</span><ArrowRight size={16}/></div></Link></article>;
}
