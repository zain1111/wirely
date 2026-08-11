"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Plus } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { FAQ_ITEMS } from "@/lib/constants";

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const reduce = useReducedMotion();

  return (
    <section id="faq" className="container-wirely scroll-mt-24 py-16 md:py-24">
      <Reveal>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
          FAQ
        </p>
        <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">
          Answers before you order
        </h2>
      </Reveal>

      <div className="mt-8 divide-y divide-border overflow-hidden rounded-3xl border border-border bg-card">
        {FAQ_ITEMS.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={item.q}>
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition-colors hover:bg-background/60 md:px-7"
              >
                <span className="font-display text-lg font-semibold">
                  {item.q}
                </span>
                <motion.span
                  animate={{ rotate: isOpen ? 45 : 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-dark"
                >
                  <Plus className="h-4 w-4" />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={reduce ? false : { height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={reduce ? undefined : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="max-w-3xl px-5 pb-6 text-sm leading-relaxed text-muted md:px-7">
                      {item.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
