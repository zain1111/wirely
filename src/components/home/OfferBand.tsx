import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { COD_FEE_PKR } from "@/lib/constants";
import { formatPkr } from "@/lib/utils";

export function OfferBand() {
  return (
    <section className="container-wirely py-16 md:py-20">
      <Reveal>
        <div className="overflow-hidden rounded-[2rem] bg-accent px-6 py-10 text-white md:px-12 md:py-14">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/80">
            Limited friction checkout
          </p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-bold md:text-4xl">
            Free nationwide delivery when you pay in advance.
          </h2>
          <p className="mt-3 max-w-xl text-white/85">
            Prefer doorstep cash? Choose COD for {formatPkr(COD_FEE_PKR)} extra.
            Either way, we confirm your order on WhatsApp within minutes.
          </p>
          <Link href="/#shop" className="btn-secondary mt-8 border-white/40 text-white hover:bg-white/10">
            Choose a product
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
