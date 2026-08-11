import { Reveal } from "@/components/motion/Reveal";
import { TRUST_POINTS } from "@/lib/constants";

export function WhyUs() {
  return (
    <section id="why-us" className="scroll-mt-24 bg-graphite py-16 text-white md:py-24">
      <div className="container-wirely">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-300">
            Why Wirely
          </p>
          <h2 className="mt-2 max-w-xl font-display text-3xl font-bold md:text-4xl">
            Built to make buying Apple gear feel effortless.
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {TRUST_POINTS.map((point, i) => (
            <Reveal key={point.title} delay={i * 0.06}>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <h3 className="font-display text-xl font-semibold">
                  {point.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">
                  {point.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
