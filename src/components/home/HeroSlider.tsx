"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SHOWCASE_ITEMS } from "@/lib/showcase";

const SLIDE_MS = 8000;

export function HeroSlider() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const count = SHOWCASE_ITEMS.length;

  const goTo = useCallback(
    (index: number) => {
      setActive(((index % count) + count) % count);
    },
    [count],
  );

  const restartTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % count);
    }, SLIDE_MS);
  }, [count]);

  useEffect(() => {
    restartTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [restartTimer]);

  // Keep only the active video playing to save bandwidth/battery
  useEffect(() => {
    videoRefs.current.forEach((video, i) => {
      if (!video) return;
      if (i === active) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, [active]);

  function manualGo(index: number) {
    goTo(index);
    restartTimer();
  }

  const slide = SHOWCASE_ITEMS[active];

  return (
    <section className="relative min-h-[min(94vh,880px)] overflow-hidden bg-graphite">
      {/* Video backgrounds — stacked, crossfaded */}
      <div className="absolute inset-0">
        {SHOWCASE_ITEMS.map((item, i) => (
          <video
            key={item.id}
            ref={(el) => {
              videoRefs.current[i] = el;
            }}
            src={item.video}
            muted
            loop
            playsInline
            autoPlay={i === 0}
            preload={i === 0 ? "auto" : "metadata"}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
              i === active ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-graphite/95 via-graphite/60 to-graphite/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-graphite/85 via-transparent to-graphite/40" />
      </div>

      {/* Copy */}
      <div className="container-wirely relative flex min-h-[min(94vh,880px)] items-end pb-24 pt-28 md:items-center md:pb-32">
        <div className="max-w-2xl text-white">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduce ? undefined : { opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              <motion.span
                initial={reduce ? false : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] backdrop-blur-md"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-teal-300" />
                {slide.kicker}
              </motion.span>

              <motion.h1
                initial={reduce ? false : { opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="mt-6 font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl"
              >
                {slide.title}
                <br />
                <span className="text-gradient bg-gradient-to-r from-teal-300 to-emerald-200">
                  {slide.titleAccent}
                </span>
              </motion.h1>

              <motion.p
                initial={reduce ? false : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="mt-6 max-w-md text-base leading-relaxed text-white/75 sm:text-lg"
              >
                {slide.description}
              </motion.p>

              <motion.div
                initial={reduce ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="mt-8 flex flex-wrap gap-3"
              >
                <Link href={slide.buyHref} className="btn-primary text-base">
                  {slide.buyLabel}
                </Link>
                <Link
                  href="/shop"
                  className="btn-secondary border-white/30 text-white hover:border-white hover:bg-white/10"
                >
                  Explore the shop
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute inset-x-0 bottom-8 z-10">
        <div className="container-wirely flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            {SHOWCASE_ITEMS.map((item, i) => (
              <button
                key={item.id}
                type="button"
                onClick={() => manualGo(i)}
                aria-label={`Go to slide ${i + 1}: ${item.kicker}`}
                className="group relative h-8 w-12 overflow-hidden md:w-16"
              >
                <span className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/25 transition-colors group-hover:bg-white/40" />
                {i === active && (
                  <motion.span
                    key={`progress-${active}`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: SLIDE_MS / 1000, ease: "linear" }}
                    className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 origin-left rounded-full bg-teal-300"
                  />
                )}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => manualGo(active - 1)}
              aria-label="Previous slide"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-md transition hover:bg-white/25"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => manualGo(active + 1)}
              aria-label="Next slide"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-md transition hover:bg-white/25"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
