import { Reveal } from "@/components/motion/Reveal";
import { FAQ_ITEMS } from "@/lib/constants";

export function Faq() {
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

      <div className="mt-8 divide-y divide-border rounded-3xl border border-border bg-card">
        {FAQ_ITEMS.map((item, i) => (
          <Reveal key={item.q} delay={i * 0.04}>
            <details className="group px-5 py-4">
              <summary className="cursor-pointer list-none font-display text-lg font-semibold marker:content-none">
                <span className="flex items-center justify-between gap-4">
                  {item.q}
                  <span className="text-accent transition group-open:rotate-45">+</span>
                </span>
              </summary>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">
                {item.a}
              </p>
            </details>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
