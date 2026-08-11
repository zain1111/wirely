import { ReviewActions } from "@/components/admin/ReviewActions";
import { getAdminReviews } from "@/lib/admin";

export default async function AdminReviewsPage() {
  const reviews = await getAdminReviews();

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold">Reviews</h1>
      <div className="space-y-3">
        {reviews.map((review) => (
          <article
            key={review.id}
            className="rounded-3xl border border-border bg-card p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">
                  {review.reviewer_name} · {review.product_slug}
                </p>
                <p className="text-xs text-muted">
                  {review.rating}/5 · {review.status} ·{" "}
                  {new Date(review.created_at).toLocaleString("en-PK")}
                </p>
              </div>
              {review.status === "pending" && <ReviewActions id={review.id} />}
            </div>
            <p className="mt-3 text-sm text-muted">{review.body}</p>
          </article>
        ))}
        {!reviews.length && (
          <p className="text-sm text-muted">No reviews yet.</p>
        )}
      </div>
    </div>
  );
}
