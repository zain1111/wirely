import { BadgeCheck, MessageCircle, RotateCcw, Truck } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { TRUST_POINTS } from "@/lib/constants";

const icons = [BadgeCheck, Truck, RotateCcw, MessageCircle];

export function WhyUs() {
  return (
    <section
      id="why-us"
      className="relative scroll-mt-24 overflow-hidden bg-graphite py-16 text-white md:py-24"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-teal-500/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl"
      />

      <div className="container-wirely relative">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-300">
            Why Wirely
          </p>
          <h2 className="mt-2 max-w-xl font-display text-3xl font-bold md:text-4xl">
            Built to make buying Apple gear feel effortless.
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {TRUST_POINTS.map((point, i) => {
            const Icon = icons[i % icons.length];
            return (
              <Reveal key={point.title} delay={i * 0.07}>
                <div className="group h-full rounded-3xl border border-white/10 bg-white/5 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-teal-300/40 hover:bg-white/10 hover:shadow-[0_20px_60px_rgba(20,184,166,0.15)]">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-400/15 text-teal-300 transition-colors duration-300 group-hover:bg-teal-400/25">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 font-display text-xl font-semibold">
                    {point.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">
                    {point.body}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
