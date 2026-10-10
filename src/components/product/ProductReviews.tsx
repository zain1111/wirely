import type { DisplayReview } from "@/lib/customer-reviews";
import { reviewSummary } from "@/lib/customer-reviews";
import { productImageSrc } from "@/lib/utils";
import Image from "next/image";

function stars(rating: number) {
  return "★★★★★".slice(0, rating) + "☆☆☆☆☆".slice(rating);
}

export function ProductReviews({ reviews }: { reviews: DisplayReview[] }) {
  if (!reviews.length) return null;
  const summary = reviewSummary(reviews);

  return (
    <section className="container-wirely pb-8">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
        From customers
      </p>
      <h2 className="mt-2 font-display text-2xl font-semibold">
        Photos and messages after delivery
      </h2>
      {summary && (
        <p className="mt-2 text-sm text-muted">
          {summary.average.toFixed(1)} out of 5 from {summary.count}{" "}
          {summary.count === 1 ? "rated review" : "rated reviews"}
        </p>
      )}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {reviews.map((review) => (
          <article
            key={review.id}
            className="overflow-hidden rounded-md border border-border bg-card"
          >
            {review.image && (
              <div className="relative aspect-[4/3] bg-background">
                <Image
                  src={productImageSrc(review.image)}
                  alt={`Review from ${review.name}`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  quality={75}
                />
              </div>
            )}
            <div className="p-4">
              <p className="font-semibold">
                {review.name}
                {review.city ? ` · ${review.city}` : ""}
              </p>
              {review.rating != null && (
                <p className="text-sm text-accent" aria-label={`${review.rating} out of 5`}>
                  {stars(review.rating)}
                </p>
              )}
              {review.verifiedPurchase && (
                <p className="text-xs text-muted">Verified purchase</p>
              )}
              <p className="mt-2 text-sm leading-relaxed text-muted">
                “{review.quote}”
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
