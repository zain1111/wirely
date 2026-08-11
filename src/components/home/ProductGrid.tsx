import { ProductCard } from "@/components/product/ProductCard";
import { Reveal } from "@/components/motion/Reveal";
import type { Product } from "@/lib/types";

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <section id="shop" className="container-wirely scroll-mt-24 py-16 md:py-24">
      <Reveal>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
          Shop
        </p>
        <h2 className="mt-2 max-w-xl font-display text-3xl font-bold md:text-4xl">
          Pick your upgrade. Checkout in under two minutes.
        </h2>
        <p className="mt-3 max-w-2xl text-muted">
          Every product is curated for iPhone users in Pakistan — clear pricing,
          free delivery on advance payment, and WhatsApp confirmation.
        </p>
      </Reveal>

      <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </div>
    </section>
  );
}
