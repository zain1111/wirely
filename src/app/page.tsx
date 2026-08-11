import { Faq } from "@/components/home/Faq";
import { FinalCta } from "@/components/home/FinalCta";
import { Hero } from "@/components/home/Hero";
import { OfferBand } from "@/components/home/OfferBand";
import { ProductGrid } from "@/components/home/ProductGrid";
import { Reviews } from "@/components/home/Reviews";
import { SocialProof } from "@/components/home/SocialProof";
import { WhyUs } from "@/components/home/WhyUs";
import { getProducts } from "@/lib/products";

export default async function HomePage() {
  const products = await getProducts();

  return (
    <>
      <Hero />
      <SocialProof />
      <ProductGrid products={products} />
      <WhyUs />
      <OfferBand />
      <Reviews />
      <Faq />
      <FinalCta />
    </>
  );
}
