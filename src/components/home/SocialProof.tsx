import { Reveal } from "@/components/motion/Reveal";

const stats = [
  { label: "Nationwide delivery", value: "2–4 days" },
  { label: "Advance orders", value: "Free shipping" },
  { label: "Returns window", value: "7 days" },
  { label: "Support", value: "WhatsApp 24/7" },
];

export function SocialProof() {
  return (
    <section className="border-b border-border/70 bg-card/60">
      <div className="container-wirely grid grid-cols-2 gap-6 py-8 md:grid-cols-4">
        {stats.map((item, i) => (
          <Reveal key={item.label} delay={i * 0.05}>
            <p className="font-display text-xl font-semibold text-graphite md:text-2xl">
              {item.value}
            </p>
            <p className="mt-1 text-sm text-muted">{item.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
