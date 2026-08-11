"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { SHOWCASE_ITEMS, type ShowcaseItem } from "@/lib/showcase";

function ShowcaseVideo({ src, title }: { src: string; title: string }) {
  const ref = useRef<HTMLVideoElement | null>(null);

  // Play only while visible to save bandwidth and battery
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      src={src}
      muted
      loop
      playsInline
      preload="metadata"
      aria-label={title}
      className="h-full w-full object-cover"
    />
  );
}

function ShowcaseSection({
  item,
  index,
}: {
  item: ShowcaseItem;
  index: number;
}) {
  const reduce = useReducedMotion();
  const flip = index % 2 === 1;

  return (
    <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
      <motion.div
        initial={reduce ? false : { opacity: 0, x: flip ? 40 : -40 }}
        whileInView={reduce ? undefined : { opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className={flip ? "lg:order-2" : ""}
      >
        <Link
          href="/shop"
          className="card-lift group relative block overflow-hidden rounded-[2rem] border border-border"
          aria-label={`Explore ${item.title} in the shop`}
        >
          <div className="relative aspect-[4/3]">
            <ShowcaseVideo src={item.video} title={item.title} />
            <div className="absolute inset-0 bg-gradient-to-t from-graphite/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <span className="absolute bottom-4 right-4 flex h-11 w-11 translate-y-2 items-center justify-center rounded-full bg-white/90 text-graphite opacity-0 shadow-lg backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              <ArrowRight className="h-5 w-5" />
            </span>
          </div>
        </Link>
      </motion.div>

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 32 }}
        whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        className={flip ? "lg:order-1" : ""}
      >
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
          {item.kicker}
        </p>
        <h3 className="mt-3 font-display text-3xl font-bold leading-tight md:text-4xl">
          {item.title}
          <br />
          <span className="text-gradient">{item.titleAccent}</span>
        </h3>
        <p className="mt-4 max-w-md leading-relaxed text-muted">
          {item.description}
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/shop" className="btn-primary">
            Explore in shop
          </Link>
          <Link href={item.buyHref} className="btn-secondary">
            {item.buyLabel}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export function ProductShowcase() {
  return (
    <section id="shop" className="container-wirely scroll-mt-24 py-16 md:py-24">
      <div className="mb-14 md:mb-20">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
          The lineup
        </p>
        <h2 className="mt-2 max-w-xl font-display text-3xl font-bold md:text-4xl">
          Four essentials. Zero compromises.
        </h2>
        <p className="mt-3 max-w-2xl text-muted">
          Watch each product in action, then explore the full range in our
          shop — clear pricing, free advance delivery, WhatsApp confirmation.
        </p>
      </div>

      <div className="space-y-20 md:space-y-28">
        {SHOWCASE_ITEMS.map((item, i) => (
          <ShowcaseSection key={item.id} item={item} index={i} />
        ))}
      </div>
    </section>
  );
}
