import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { whatsappUrl } from "@/lib/utils";

export function FinalCta() {
  return (
    <section className="container-wirely pb-20">
      <Reveal>
        <div className="rounded-[2rem] border border-border bg-card px-6 py-12 text-center md:px-12">
          <h2 className="font-display text-3xl font-bold md:text-4xl">
            Ready to place your order?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            Add your product, checkout in one page, and confirm on WhatsApp.
            That’s the Wirely funnel — simple on purpose.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/#shop" className="btn-primary">
              Shop now
            </Link>
            <a
              href={whatsappUrl("Hi Wirely! Help me place an order.")}
              className="btn-secondary"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp us
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
