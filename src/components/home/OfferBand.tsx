import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { COD_FEE_PKR } from "@/lib/constants";
import { formatPkr } from "@/lib/utils";

export function OfferBand() {
  return (
    <section className="container-wirely py-16 md:py-20">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-teal-500 via-accent to-accent-dark px-6 py-12 text-white md:px-14 md:py-16">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10 blur-2xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-28 left-1/4 h-64 w-64 rounded-full bg-teal-200/20 blur-3xl"
          />

          <div className="relative">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/80">
              Limited friction checkout
            </p>
            <h2 className="mt-3 max-w-2xl font-display text-3xl font-bold md:text-4xl">
              Free nationwide delivery when you pay in advance.
            </h2>
            <p className="mt-3 max-w-xl text-white/85">
              Prefer doorstep cash? Choose COD for {formatPkr(COD_FEE_PKR)}{" "}
              extra. Either way, we confirm your order on WhatsApp within
              minutes.
            </p>
            <Link
              href="/shop"
              className="btn-secondary-light mt-8"
            >
              Choose a product
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
