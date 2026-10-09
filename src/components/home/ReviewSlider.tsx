"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import type { CustomerReview } from "@/lib/customer-reviews";

export function ReviewSlider({
  reviews,
  title = "What customers sent us",
  eyebrow = "Real orders",
  layout = "feature",
}: {
  reviews: CustomerReview[];
  title?: string;
  eyebrow?: string;
  /** feature = one review at a time. gallery = a row of review images that slides. */
  layout?: "feature" | "gallery";
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = reviews.length;

  useEffect(() => {
    setIndex(0);
  }, [count]);

  useEffect(() => {
    if (layout === "gallery" || paused || count < 2) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, 5500);
    return () => window.clearInterval(timer);
  }, [paused, count]);

  if (!count) return null;

  if (layout === "gallery") {
    return (
      <ReviewGallery
        reviews={reviews}
        title={title}
        eyebrow={eyebrow}
        index={index}
        setIndex={setIndex}
        paused={paused}
        setPaused={setPaused}
      />
    );
  }

  const review = reviews[index] ?? reviews[0];

  function go(next: number) {
    setIndex((next + count) % count);
  }

  return (
    <section
      id="reviews"
      className="container-wirely scroll-mt-24 py-16 md:py-24"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
            {eyebrow}
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">
            {title}
          </h2>
        </div>
        {count > 1 && (
          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Previous review"
              onClick={() => go(index - 1)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              aria-label="Next review"
              onClick={() => go(index + 1)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      <article className="mt-8 grid items-center gap-6 overflow-hidden rounded-[2rem] border border-border bg-card p-4 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:p-8">
        <div className="flex h-[420px] items-center justify-center rounded-3xl bg-[#f3f5f8] p-3 md:h-[520px]">
          <Image
            key={review.image}
            src={review.image}
            alt={`Review from ${review.name}`}
            width={720}
            height={1280}
            className="max-h-full w-auto max-w-full rounded-2xl object-contain shadow-md"
          />
        </div>
        <div className="px-2 py-2 md:px-4">
          <p className="flex gap-0.5 text-accent" aria-label={`${review.rating} out of 5 stars`}>
            {Array.from({ length: 5 }).map((_, star) => (
              <Star
                key={star}
                className={`h-5 w-5 ${star < review.rating ? "fill-current" : "opacity-30"}`}
              />
            ))}
          </p>
          <blockquote className="mt-5 font-display text-2xl font-semibold leading-snug text-foreground md:text-3xl">
            “{review.quote}”
          </blockquote>
          <p className="mt-6 text-sm font-semibold">{review.name}</p>
          <p className="text-sm text-muted">Customer on WhatsApp</p>
          {count > 1 && (
            <div className="mt-8 flex gap-2">
              {reviews.map((item, dot) => (
                <button
                  key={item.id}
                  type="button"
                  aria-label={`Show review ${dot + 1}`}
                  onClick={() => setIndex(dot)}
                  className={`h-2.5 rounded-full transition-all ${
                    dot === index ? "w-8 bg-accent" : "w-2.5 bg-border"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </article>
    </section>
  );
}

function ReviewGallery({
  reviews,
  title,
  eyebrow,
  index,
  setIndex,
  paused,
  setPaused,
}: {
  reviews: CustomerReview[];
  title: string;
  eyebrow: string;
  index: number;
  setIndex: (value: number | ((current: number) => number)) => void;
  paused: boolean;
  setPaused: (value: boolean) => void;
}) {
  const [perView, setPerView] = useState(1);
  const count = reviews.length;
  const maxIndex = Math.max(0, count - perView);

  useEffect(() => {
    const update = () => {
      if (window.innerWidth >= 1024) setPerView(3);
      else if (window.innerWidth >= 640) setPerView(2);
      else setPerView(1);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (index > maxIndex) setIndex(0);
  }, [index, maxIndex, setIndex]);

  useEffect(() => {
    if (paused || maxIndex < 1) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current >= maxIndex ? 0 : current + 1));
    }, 4000);
    return () => window.clearInterval(timer);
  }, [paused, maxIndex, setIndex]);

  function go(next: number) {
    if (next < 0) setIndex(maxIndex);
    else if (next > maxIndex) setIndex(0);
    else setIndex(next);
  }

  return (
    <section
      className="container-wirely scroll-mt-24 py-16 md:py-20"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
            {eyebrow}
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">
            {title}
          </h2>
        </div>
        {maxIndex > 0 && (
          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Previous reviews"
              onClick={() => go(index - 1)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              aria-label="Next reviews"
              onClick={() => go(index + 1)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      <div className="mt-8 overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${index * (100 / perView)}%)` }}
        >
          {reviews.map((review) => (
            <figure
              key={review.id}
              className="shrink-0 px-2"
              style={{ width: `${100 / perView}%` }}
            >
              <div className="flex h-[460px] items-center justify-center rounded-3xl border border-border bg-[#f3f5f8] p-3">
                <Image
                  src={review.image}
                  alt={`Review from ${review.name}`}
                  width={720}
                  height={1280}
                  className="max-h-full w-auto max-w-full rounded-2xl object-contain shadow-md"
                />
              </div>
              <figcaption className="px-1 pt-4">
                <p className="text-sm font-semibold leading-relaxed">
                  “{review.quote}”
                </p>
                <p className="mt-2 text-xs text-muted">{review.name}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
