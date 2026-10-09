import { hasServiceRole } from "@/lib/supabase/env";
import { createServiceClient } from "@/lib/supabase/server";
import type { ProductReview } from "@/lib/types";

export async function getApprovedReviews(
  productSlug: string,
): Promise<ProductReview[]> {
  if (!hasServiceRole()) return [];
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("product_reviews")
    .select("*")
    .eq("product_slug", productSlug)
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(20);
  if (error || !data) return [];
  return data as ProductReview[];
}
