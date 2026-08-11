import Image from "next/image";
import Link from "next/link";
import { WHATSAPP_NUMBER } from "@/lib/constants";
import { whatsappUrl } from "@/lib/utils";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-graphite text-white">
      <div className="container-wirely grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Image
            src="/brand/footer-logo.png"
            alt="Wirely"
            width={160}
            height={48}
            className="mb-4 h-10 w-auto object-contain brightness-0 invert"
          />
          <p className="max-w-sm text-sm leading-relaxed text-white/70">
            Wirely delivers authentic Apple chargers, cables, and AirPods across
            Pakistan — with free delivery on advance orders and WhatsApp support.
          </p>
        </div>

        <div>
          <p className="mb-3 font-display text-sm font-semibold tracking-wide uppercase">
            Explore
          </p>
          <ul className="space-y-2 text-sm text-white/75">
            <li>
              <Link href="/shop" className="hover:text-white">
                Shop
              </Link>
            </li>
            <li>
              <Link href="/shipping" className="hover:text-white">
                Shipping
              </Link>
            </li>
            <li>
              <Link href="/returns" className="hover:text-white">
                Returns
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="mb-3 font-display text-sm font-semibold tracking-wide uppercase">
            Contact
          </p>
          <a
            href={whatsappUrl("Hi Wirely! I need help with an order.")}
            className="text-sm text-white/75 hover:text-white"
          >
            WhatsApp +{WHATSAPP_NUMBER}
          </a>
          <p className="mt-3 text-sm text-white/55">wire-ly.shop</p>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/45">
        © {new Date().getFullYear()} Wirely Accessories & Tech. All rights reserved.
      </div>
    </footer>
  );
}
