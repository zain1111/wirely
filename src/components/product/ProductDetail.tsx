"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { MessageCircle, Check, RotateCcw, Truck } from "lucide-react";
import type { Product } from "@/lib/types";
import { trackAddToCart, trackBeginCheckout } from "@/lib/analytics";
import { DevTodo } from "@/components/dev/DevTodo";
import { CompatibilityList } from "@/components/product/CompatibilityList";
import { ProductCard } from "@/components/product/ProductCard";
import { RETURN_TERMS, deliverySummary } from "@/lib/constants";
import { trackMeta } from "@/lib/meta-client";
import { resolveUnitPrice } from "@/lib/pricing";
import {
  stripListedPhrases,
  type ProductPageConfig,
} from "@/lib/product-pages";
import { formatPkr, productImageSrc, whatsappUrl } from "@/lib/utils";
import { useCart } from "@/store/cart";

const COLOR_SWATCHES: Record<string, string> = {
  white: "#f4f4f4",
  black: "#1a1a1a",
  blue: "#205088",
  grey: "#9ca3af",
  gray: "#9ca3af",
  silver: "#d1d5db",
  gold: "#d4a017",
  pink: "#f4b6c2",
  green: "#3f7d4e",
  red: "#c2413a",
};

function colorSwatch(label: string): string {
  return COLOR_SWATCHES[label.trim().toLowerCase()] ?? "#d9dde3";
}

const trustRow = [
  {
    icon: Truck,
    label: "Free delivery",
  },
  { icon: RotateCcw, label: "7-day returns" },
  { icon: MessageCircle, label: "WhatsApp support" },
];

export function ProductDetail({
  product,
  related,
  page = null,
  separateBundlePrice = null,
}: {
  product: Product;
  related: Product[];
  page?: ProductPageConfig | null;
  separateBundlePrice?: number | null;
}) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const addItem = useCart((s) => s.addItem);
  const variations = product.variations ?? [];
  const phrases = page?.omitPhrases ?? [];
  const description = stripListedPhrases(product.description, phrases);
  const highlights = product.highlights
    .map((item) => stripListedPhrases(item, phrases))
    .filter((item) => item.length > 1);
  const compatibility = page
    ? []
    : (product.device_compatibility ?? []).filter(
        (item) =>
          !phrases.some((phrase) =>
            `${item.name} ${item.models}`.toLowerCase().includes(phrase),
          ),
      );
  const [variationId, setVariationId] = useState<string | null>(
    variations[0]?.id ?? null,
  );
  const [activeImage, setActiveImage] = useState(0);
  const priced = useMemo(
    () => resolveUnitPrice(product, variationId),
    [product, variationId],
  );
  const slides = useMemo(() => {
    const images = product.images.map((src) => ({ kind: "image" as const, src }));
    const video = page?.videoSrc || product.video_url;
    if (!video) return images;
    const clip = { kind: "video" as const, src: video };
    if (!images.length) return [clip];
    return [images[0], clip, ...images.slice(1)];
  }, [page?.videoSrc, product.images, product.video_url]);
  const slide = slides[activeImage] || slides[0];
  const selectedVariation = variations.find(v => v.id === variationId);
  const enquiryOnly = product.purchase_mode === "enquiry";
  const stockCount = selectedVariation?.stock ?? product.stock;
  const stockKnown = Number.isFinite(stockCount);
  const available = !enquiryOnly && stockKnown && stockCount > 0;
  const stockText = !stockKnown
    ? null
    : enquiryOnly
      ? "Contact us to confirm availability"
      : stockCount <= 0
        ? "Out of stock"
        : `${stockCount} in stock`;
  const compareAt =
    product.compare_at_price != null && product.compare_at_price > priced.price
      ? product.compare_at_price
      : null;
  const saving = compareAt != null ? compareAt - priced.price : null;
  const bundle = page?.bundle;
  const bundleSaving =
    bundle?.pricePkr != null &&
    separateBundlePrice != null &&
    separateBundlePrice > bundle.pricePkr
      ? separateBundlePrice - bundle.pricePkr
      : null;

  const viewed = useRef("");
  useEffect(() => {
    if (viewed.current === product.slug) return;
    viewed.current = product.slug;
    trackMeta("ViewContent", {
      content_ids: [product.slug],
      content_name: product.name,
      content_type: "product",
      value: priced.price,
      currency: "PKR",
    });
  }, [product.slug, product.name, priced.price]);

  function addToCart(buyNow = false) {
    if (!available) return;
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
    trackMeta("AddToCart", {
      content_ids: [product.slug],
      content_name: product.name,
      content_type: "product",
      value: priced.price,
      currency: "PKR",
    });
    if (buyNow) {
      trackBeginCheckout(priced.price, [
        { item_id: product.slug, item_name: product.name, price: priced.price },
      ]);
      router.push("/checkout");
    }
  }

  return (
    <div className="container-wirely pb-24 pt-8 md:py-12">
      <nav className="mb-6 text-sm text-muted" aria-label="Breadcrumb">
        <Link href="/" className="transition-colors hover:text-foreground">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{product.short_name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        {/* Gallery */}
        <div className="lg:sticky lg:top-32 lg:self-start">
          <div className="product-stage relative aspect-square overflow-hidden rounded-lg border border-border">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={slide ? `${slide.kind}-${slide.src}` : "empty"}
                initial={reduce ? false : { opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduce ? undefined : { opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                {slide?.kind === "video" ? (
                  <video
                    src={slide.src}
                    className="h-full w-full object-contain"
                    muted
                    loop
                    playsInline
                    controls
                    autoPlay
                    preload="metadata"
                  />
                ) : slide ? (
                  <Image
                    src={productImageSrc(slide.src)}
                    alt={product.name}
                    fill
                    priority={activeImage === 0}
                    quality={75}
                    className="object-contain"
                    sizes="(max-width: 1024px) 100vw, 640px"
                  />
                ) : null}
              </motion.div>
            </AnimatePresence>

            {saving && (
              <span className="absolute left-4 top-4 z-10 rounded-full bg-accent px-3.5 py-1.5 text-xs font-bold text-white shadow-lg">
                Save {formatPkr(saving)}
              </span>
            )}
          </div>

          {page?.mediaTodos.map((todo) => (
            <DevTodo key={todo}>{todo}</DevTodo>
          ))}
          {page && page.compatibility.length === 0 && (
            <DevTodo>
              TODO: [FILL IN] model list + speeds, verified against Samsung specs, in src/lib/product-pages.ts.
            </DevTodo>
          )}

          {slides.length > 1 && (
            <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
              {slides.map((item, i) => (
                <button
                  key={`${item.kind}-${item.src}`}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  aria-pressed={activeImage === i}
                  aria-label={item.kind === "video" ? "Play video" : `View image ${i + 1}`}
                  className={`product-stage relative h-20 w-20 shrink-0 overflow-hidden rounded-md border-2 transition-all duration-200 ${
                    i === activeImage
                      ? "ring-glow border-accent"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  {item.kind === "video" ? (
                    <span className="flex h-full items-center justify-center text-xs font-semibold">
                      Video
                    </span>
                  ) : (
                    <Image
                      src={productImageSrc(item.src)}
                      alt=""
                      fill
                      quality={75}
                      className="object-contain"
                      sizes="80px"
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Buy panel */}
        <div>
          <p className="eyebrow">WIRELY / EVERYDAY ESSENTIALS</p>
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
          {page?.subhead && (
            <p className="mt-3 text-sm leading-relaxed text-muted">{page.subhead}</p>
          )}

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
            {compareAt != null ? (
              <span className="text-lg font-normal text-muted line-through">
                {formatPkr(compareAt)}
              </span>
            ) : null}
          </div>

          {stockText && (
            <p className="mt-4 flex items-center gap-2 text-xs font-medium">
              <span className={`h-1.5 w-1.5 rounded-full ${available ? "bg-green-700" : "bg-muted"}`} />
              {stockText}
            </p>
          )}
          <p className="mt-5 text-sm leading-relaxed text-muted">{description}</p>

          {variations.length > 0 && (
            <div className="mt-7">
              <p className="mb-3 text-sm font-semibold">
                Color:{" "}
                <span className="font-normal text-muted">
                  {selectedVariation?.label}
                  {selectedVariation ? ` · ${formatPkr(selectedVariation.price)}` : ""}
                </span>
              </p>
              <div className="flex flex-wrap gap-2">
                {variations.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setVariationId(v.id)}
                    aria-pressed={variationId === v.id}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition-all duration-200 ${
                      variationId === v.id
                        ? "ring-glow border-accent bg-accent-soft text-accent-dark"
                        : "border-border hover:border-accent/50"
                    }`}
                  >
                    <span
                      className="h-4 w-4 rounded-full border border-black/10"
                      style={{ background: colorSwatch(v.label) }}
                      aria-hidden
                    />
                    {v.label}
                    {v.stock <= 0 ? " · Out of stock" : ""}
                  </button>
                ))}
              </div>
            </div>
          )}

          <ul className="mt-7 space-y-2.5">
            {highlights.map((h) => (
              <li key={h} className="flex items-start gap-2.5 text-sm text-foreground">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-dark">
                  <Check className="h-3 w-3" />
                </span>
                {h}
              </li>
            ))}
          </ul>

          {enquiryOnly && <a href={whatsappUrl(`Hi Wirely! Please confirm availability for ${product.name}. My phone model is:`)} className="btn-primary mt-8 w-full">Ask about availability</a>}
          <div className={`mt-8 gap-3 ${enquiryOnly ? "hidden" : "hidden md:flex"}`}>
            <button
              type="button"
              disabled={!available}
              className="btn-primary flex-1 justify-center text-base disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={() => addToCart(true)}
            >
              {enquiryOnly ? "Price pending" : available ? "Order now" : "Out of stock"}
            </button>
            <button
              type="button"
              disabled={!available}
              className="btn-secondary flex-1 justify-center text-base disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={() => addToCart(false)}
            >
              Add to cart
            </button>
          </div>

          {bundle && bundle.pricePkr != null && separateBundlePrice != null && (
            <div className="mt-5 rounded-md border border-accent/40 bg-accent-soft p-4">
              <p className="font-semibold">{bundle.title}</p>
              <p className="mt-1 text-sm text-muted">
                {formatPkr(bundle.pricePkr)}
                {bundleSaving != null ? ` · Save ${formatPkr(bundleSaving)} versus buying separately` : ""}
              </p>
              <DevTodo>
                TODO: [FILL IN] Create a catalog product for this bundle before adding a buy button. The cable alone is a different price.
              </DevTodo>
            </div>
          )}
          {bundle && bundle.pricePkr == null && (
            <DevTodo>
              TODO: [FILL IN] bundle price for {bundle.title}. Separate parts are currently {separateBundlePrice != null ? formatPkr(separateBundlePrice) : "missing a cable price"}.
            </DevTodo>
          )}

          <div className="purchase-note mt-5">
            <p className="font-semibold">Delivery and returns</p>
            <p className="mt-1 text-muted">{deliverySummary()}</p>
            <p className="mt-2 text-muted">{page?.returns || RETURN_TERMS}</p>
            <Link href="/shipping" className="mt-2 inline-block underline underline-offset-4">See delivery details</Link>
            <span className="mx-3 text-border">|</span>
            <Link href="/returns" className="underline underline-offset-4">Return policy</Link>
          </div>
          {page && page.box.length > 0 && (
            <div className="mt-6">
              <h2 className="text-sm font-semibold">In the box</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
                {page.box.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          {page && page.specs.length > 0 && (
            <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
              {page.specs.map((spec) => (
                <div key={spec.label}>
                  <dt className="text-muted">{spec.label}</dt>
                  <dd className="font-medium">{spec.value}</dd>
                </div>
              ))}
            </dl>
          )}
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

          {page?.compatibility && page.compatibility.length > 0 && (
            <CompatibilityList models={page.compatibility} />
          )}
          {!page && (
            <div className="product-details-section"><a className="flex items-center gap-2 text-sm font-semibold" href={whatsappUrl(`Hi Wirely! I have a question about ${product.name}. My phone model is:`)}><MessageCircle size={18} className="text-accent" />Not sure it fits? Ask us before you order.</a><p className="mt-2 text-xs leading-relaxed text-muted">Charging performance depends on your device, adapter and cable. Check the listed connectors and supported models.</p></div>
          )}
          {compatibility.length > 0 && (
            <div className="mt-10">
              <h2 className="font-display text-xl font-semibold">
                Will it work with your device?
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {compatibility.map((d) => (
                  <div
                    key={d.name}
                    className="rounded-md border border-border bg-card p-4 transition-colors hover:border-accent/40"
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
            Complete your setup
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Mobile sticky buy bar */}
      {!enquiryOnly && <div className="glass fixed inset-x-0 bottom-0 z-30 border-t border-border p-3 md:hidden">
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-muted">{product.short_name}</p>
            <p className="font-bold text-accent">{formatPkr(priced.price)}</p>
          </div>
          <a
            href={whatsappUrl(
              `Hi Wirely, I want to order ${product.name}${selectedVariation?.label ? ` in ${selectedVariation.label}` : ""}.`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary px-3 py-3 text-sm"
            onClick={() =>
              trackMeta("Contact", {
                content_ids: [product.slug],
                content_name: product.name,
                currency: "PKR",
              })
            }
          >
            Order on WhatsApp
          </a>
          <button
            type="button"
            disabled={!available} className="btn-primary px-5 py-3 text-sm disabled:opacity-40"
            onClick={() => addToCart(true)}
          >
            {available ? "Order now" : "Out of stock"}
          </button>
        </div>
      </div>}
    </div>
  );
}
