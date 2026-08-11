"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ChevronDown } from "lucide-react";
import { SHOWCASE_ITEMS } from "@/lib/showcase";

const COUNT = SHOWCASE_ITEMS.length;

function ProductVisual({
  index,
  progress,
  reduce,
}: {
  index: number;
  progress: MotionValue<number>;
  reduce: boolean | null;
}) {
  const item = SHOWCASE_ITEMS[index];
  const start = index / COUNT;
  const end = (index + 1) / COUNT;
  const mid = (start + end) / 2;
  const isFirst = index === 0;

  // Exclusive visibility windows — no two images share opacity > 0
  const opacity = useTransform(
    progress,
    [start, start + 0.02, mid, end - 0.02, end],
    isFirst ? [1, 1, 1, 1, 0] : index === COUNT - 1
      ? [0, 1, 1, 1, 1]
      : [0, 1, 1, 1, 0],
  );

  const scale = useTransform(
    progress,
    [start, mid, end],
    reduce ? [1, 1, 1] : [0.72, 1.05, 1.12],
  );

  const rotate = useTransform(
    progress,
    [start, mid],
    reduce ? [0, 0] : [18, 0],
  );

  const y = useTransform(
    progress,
    [start, mid],
    reduce ? [0, 0] : [40, 0],
  );

  return (
    <motion.div
      style={{ opacity, scale, rotate, y }}
      className="absolute inset-0 flex items-center justify-center"
    >
      <div className="relative aspect-square w-[min(52vw,260px)] sm:w-[min(44vw,340px)] lg:w-[min(38vw,480px)]">
        <div
          aria-hidden
          className="absolute inset-[-12%] rounded-full bg-teal-400/20 blur-3xl"
        />
        <Image
          src={item.image}
          alt={item.title}
          fill
          priority={isFirst}
          className="relative rounded-[2.5rem] object-cover shadow-[0_40px_120px_rgba(0,0,0,0.5)]"
          sizes="(max-width: 1024px) 60vw, 480px"
        />
      </div>
    </motion.div>
  );
}

export function HeroScroll() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);
  const lockingRef = useRef(false);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  // Spring-smooth the raw scroll so product motion feels fluid, not jittery
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 70,
    damping: 22,
    mass: 0.35,
    restDelta: 0.001,
  });

  const syncActive = useCallback((value: number) => {
    const next = Math.min(
      COUNT - 1,
      Math.max(0, Math.floor(value * COUNT + 0.001)),
    );
    setActive((prev) => (prev === next ? prev : next));
  }, []);

  useEffect(() => {
    const unsub = scrollYProgress.on("change", syncActive);
    return unsub;
  }, [scrollYProgress, syncActive]);

  const scrollToSlide = useCallback((index: number) => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const clamped = Math.min(COUNT - 1, Math.max(0, index));
    const top = wrapper.offsetTop;
    const scrollable = wrapper.offsetHeight - window.innerHeight;
    const target = top + (scrollable * (clamped + 0.5)) / COUNT;
    lockingRef.current = true;
    window.scrollTo({ top: target, behavior: "smooth" });
    window.setTimeout(() => {
      lockingRef.current = false;
    }, 650);
  }, []);

  // Wheel snap: one deliberate flick advances exactly one slide
  useEffect(() => {
    if (reduce) return;

    function onWheel(e: WheelEvent) {
      const wrapper = wrapperRef.current;
      if (!wrapper || lockingRef.current) return;

      const rect = wrapper.getBoundingClientRect();
      // Only intercept while the sticky hero is filling the viewport
      if (rect.top > 8 || rect.bottom < window.innerHeight - 8) return;

      const goingDown = e.deltaY > 8;
      const goingUp = e.deltaY < -8;
      if (!goingDown && !goingUp) return;

      if (goingDown && active < COUNT - 1) {
        e.preventDefault();
        scrollToSlide(active + 1);
      } else if (goingUp && active > 0) {
        e.preventDefault();
        scrollToSlide(active - 1);
      }
      // On last slide going down / first going up → allow normal page scroll
    }

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [active, reduce, scrollToSlide]);

  const slide = SHOWCASE_ITEMS[active];

  return (
    <section ref={wrapperRef} className="relative h-[420vh] bg-graphite">
      <div className="sticky top-0 h-svh overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-40 top-[-10%] h-[32rem] w-[32rem] rounded-full bg-teal-500/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 bottom-[-15%] h-[28rem] w-[28rem] rounded-full bg-emerald-400/10 blur-3xl"
        />

        <div className="container-wirely grid h-full items-center gap-6 pb-20 pt-14 lg:grid-cols-2 lg:gap-10 lg:pb-12 lg:pt-16">
          {/* Single text layer — never stacks */}
          <div className="order-2 relative min-h-[300px] text-white lg:order-1 lg:min-h-[360px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id}
                initial={
                  reduce
                    ? false
                    : { opacity: 0, y: 28, filter: "blur(6px)" }
                }
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={
                  reduce
                    ? undefined
                    : { opacity: 0, y: -24, filter: "blur(6px)" }
                }
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 flex flex-col justify-center"
              >
                <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] backdrop-blur-md">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-300" />
                  {slide.kicker}
                </span>

                <h2 className="mt-5 font-display text-3xl font-bold leading-[1.08] tracking-tight sm:text-5xl xl:text-6xl">
                  {slide.title}
                  <br />
                  <span className="text-gradient bg-gradient-to-r from-teal-300 to-emerald-200">
                    {slide.titleAccent}
                  </span>
                </h2>

                <p className="mt-5 max-w-md text-sm leading-relaxed text-white/75 sm:text-lg">
                  {slide.description}
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <Link href={slide.buyHref} className="btn-primary">
                    {slide.buyLabel}
                  </Link>
                  <Link href="/shop" className="btn-secondary-light">
                    Explore the shop
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Product images — exclusive opacity + spring-smoothed scroll */}
          <div className="order-1 relative flex h-[min(52vw,280px)] items-center justify-center sm:h-[340px] lg:order-2 lg:h-[480px]">
            {SHOWCASE_ITEMS.map((_, i) => (
              <ProductVisual
                key={SHOWCASE_ITEMS[i].id}
                index={i}
                progress={smoothProgress}
                reduce={reduce}
              />
            ))}
          </div>
        </div>

        {/* Slide indicators */}
        <div className="absolute right-4 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-3 md:right-8">
          {SHOWCASE_ITEMS.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollToSlide(i)}
              aria-label={`Go to slide ${i + 1}: ${item.kicker}`}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                active === i
                  ? "w-8 bg-teal-300"
                  : "w-2.5 bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>

        {/* Scroll hint */}
        <div
          className={`absolute bottom-6 left-1/2 z-10 -translate-x-1/2 transition-opacity duration-500 ${
            active === COUNT - 1 ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-1 text-white/50"
          >
            <span className="text-[11px] font-medium uppercase tracking-[0.2em]">
              Scroll
            </span>
            <ChevronDown className="h-5 w-5" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
