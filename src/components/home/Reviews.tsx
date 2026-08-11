import { Star } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { MARKETING_REVIEWS } from "@/lib/constants";

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function Reviews() {
  return (
    <section
      id="reviews"
      className="container-wirely scroll-mt-24 py-16 md:py-24"
    >
      <Reveal>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
          Social proof
        </p>
        <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">
          Loved by iPhone owners across Pakistan
        </h2>
      </Reveal>

      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {MARKETING_REVIEWS.map((review, i) => (
          <Reveal key={review.name} delay={i * 0.06}>
            <blockquote className="card-lift flex h-full flex-col rounded-3xl border border-border bg-card p-6">
              <p
                className="flex gap-0.5 text-accent"
                aria-label={`${review.rating} out of 5 stars`}
              >
                {Array.from({ length: 5 }).map((_, star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star < review.rating
                        ? "fill-current"
                        : "fill-transparent opacity-30"
                    }`}
                  />
                ))}
              </p>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-muted">
                “{review.text}”
              </p>
              <footer className="mt-5 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-xs font-bold text-accent-dark">
                  {initials(review.name)}
                </span>
                <div>
                  <p className="text-sm font-semibold">{review.name}</p>
                  <p className="text-xs text-muted">Verified buyer</p>
                </div>
              </footer>
            </blockquote>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
