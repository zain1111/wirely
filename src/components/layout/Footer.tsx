import Image from "next/image";
import Link from "next/link";
import { WHATSAPP_NUMBER } from "@/lib/constants";
import { whatsappUrl } from "@/lib/utils";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-graphite text-white">
      <div className="container-wirely grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Image
            src="/brand/footer-logo.png"
            alt="Wirely"
            width={220}
            height={220}
            className="mb-4 h-28 w-28 rounded-2xl bg-[#f4efe6] object-contain"
          />
          <p className="max-w-sm text-sm leading-relaxed text-white/70">
            Everyday charging essentials and audio accessories, delivered across
            Pakistan. Find your fit, check the details, and ask us if you need a hand.
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
            <li>
              <Link href="/privacy" className="hover:text-white">
                Privacy policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-white">
                Terms and conditions
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
