import { Faq } from "@/components/home/Faq";
import { FinalCta } from "@/components/home/FinalCta";
import { HeroScroll } from "@/components/home/HeroScroll";
import { OfferBand } from "@/components/home/OfferBand";
import { ProductShowcase } from "@/components/home/ProductShowcase";
import { Reviews } from "@/components/home/Reviews";
import { SocialProof } from "@/components/home/SocialProof";
import { WhyUs } from "@/components/home/WhyUs";

export const revalidate = 300;

export default function HomePage() {
  return (
    <>
      <HeroScroll />
      <SocialProof />
      <ProductShowcase />
      <WhyUs />
      <OfferBand />
      <Reviews />
      <Faq />
      <FinalCta />
    </>
  );
}
