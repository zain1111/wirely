import type { Metadata } from "next";
import { ProductCard } from "@/components/product/ProductCard";
import { Reveal } from "@/components/motion/Reveal";
import { getProducts } from "@/lib/products";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Shop Apple & Samsung Accessories",
  description:
    "Explore iPhone chargers, Samsung chargers, AirPods, and USB-C cables. Free nationwide delivery on advance orders across Pakistan.",
  alternates: { canonical: "/shop" },
};

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <div className="container-wirely py-12 md:py-16">
      <Reveal>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
          Shop
        </p>
        <h1 className="mt-2 max-w-2xl font-display text-4xl font-bold md:text-5xl">
          The full Wirely lineup
        </h1>
        <p className="mt-4 max-w-2xl text-muted">
          Chargers, cables, and AirPods — every product checked before it
          ships, delivered free on advance payment, and confirmed on WhatsApp.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </div>
    </div>
  );
}
