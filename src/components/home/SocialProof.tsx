import { Clock, MessageCircle, RotateCcw, Truck } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";

const stats = [
  { icon: Clock, label: "Nationwide delivery", value: "2–4 days" },
  { icon: Truck, label: "Advance orders", value: "Free shipping" },
  { icon: RotateCcw, label: "Returns window", value: "7 days" },
  { icon: MessageCircle, label: "Support", value: "WhatsApp 24/7" },
];

export function SocialProof() {
  return (
    <section className="border-b border-border/70 bg-card/60">
      <div className="container-wirely grid grid-cols-2 gap-6 py-10 md:grid-cols-4">
        {stats.map(({ icon: Icon, label, value }, i) => (
          <Reveal key={label} delay={i * 0.06}>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-accent-dark">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-display text-lg font-semibold text-graphite md:text-xl">
                  {value}
                </p>
                <p className="mt-0.5 text-sm text-muted">{label}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
