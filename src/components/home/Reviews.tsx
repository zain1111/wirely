import { Reveal } from "@/components/motion/Reveal";
import { MARKETING_REVIEWS } from "@/lib/constants";

export function Reviews() {
  return (
    <section id="reviews" className="container-wirely scroll-mt-24 py-16 md:py-24">
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
          <Reveal key={review.name} delay={i * 0.05}>
            <blockquote className="h-full rounded-3xl border border-border bg-card p-5">
              <p className="text-accent" aria-label={`${review.rating} out of 5 stars`}>
                {"★".repeat(review.rating)}
                {"☆".repeat(5 - review.rating)}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                “{review.text}”
              </p>
              <footer className="mt-4 text-sm font-semibold">{review.name}</footer>
            </blockquote>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
