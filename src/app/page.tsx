import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Cable, MessageCircle, RotateCcw, Truck, Wallet } from "lucide-react";
import { ReviewSlider } from "@/components/home/ReviewSlider";
import { ProductCard } from "@/components/product/ProductCard";
import { CUSTOMER_REVIEWS } from "@/lib/customer-reviews";
import { getProducts } from "@/lib/products";
import { whatsappUrl, formatPkr } from "@/lib/utils";
import { deliveryFeePkr, deliverySummary } from "@/lib/constants";
export const revalidate = 300;
export default async function HomePage() {
    const products = await getProducts();
    const charging = products.filter(p => /charger|cable/.test(p.slug));
    return <>
    <section className="store-hero container-wirely">
      <div className="hero-copy">
        <p className="eyebrow">EVERYDAY CHARGING. SORTED.</p>
        <h1>Less low battery.<br />More <span>living.</span></h1>
        <p className="hero-description">The charger by your bed. The cable in your bag. Find the charging essentials that fit your phone and your everyday.</p>
        <div className="flex flex-wrap gap-3"><Link href="/shop?category=charging" className="btn-primary">Shop charging essentials <ArrowRight size={18}/></Link><a href="#find-your-fit" className="btn-secondary">Find your fit</a></div>
        <p className="mt-6 flex items-center gap-2 text-sm text-muted"><Truck size={16}/> Delivered across Pakistan · Cash on delivery available</p>
      </div>
      <div className="hero-product">
        <div className="hero-product-top"><span>THE EVERYDAY ESSENTIALS</span><span>01 / CHARGING</span></div>
        <Image src="/products/40w-cable.jpeg" alt="Wirely charger and USB-C cable bundle" fill priority sizes="(max-width: 768px) 100vw, 55vw" className="hero-product-image object-cover"/>
        <Link href="/charger-cable-combo" className="hero-product-caption"><div><p className="text-xs text-muted">ONE SET. READY TO GO.</p><p className="mt-1 font-semibold">Charger + USB-C cable</p></div><span className="flex items-center gap-3 text-sm font-semibold">{formatPkr(charging.find(p => p.slug === "charger-cable-combo")?.price ?? 5198)} <ArrowRight size={20}/></span></Link>
      </div>
    </section>
    <div className="service-strip"><div className="container-wirely grid grid-cols-2 gap-5 py-6 lg:grid-cols-4">{[{ icon: Truck, title: "Nationwide delivery", text: "2–4 working days after confirmation" }, { icon: Wallet, title: "Your choice of payment", text: "Advance payment or cash on delivery" }, { icon: RotateCcw, title: "7-day return window", text: "Unused items in original packaging" }, { icon: MessageCircle, title: "A little help? Just ask.", text: "Talk to us on WhatsApp" }].map(({ icon: Icon, title, text }) => <div key={title} className="flex gap-3"><Icon size={22} className="mt-1 shrink-0 text-accent"/><div><p className="text-sm font-semibold">{title}</p><p className="mt-1 text-xs leading-relaxed text-muted">{text}</p></div></div>)}</div></div>
    <section id="find-your-fit" className="container-wirely section-space scroll-mt-28"><div className="section-heading"><div><p className="eyebrow">START WITH YOUR DEVICE</p><h2>Find your daily connection.</h2></div><p className="max-w-sm text-sm text-muted">A good charging setup starts with the right connector. Let’s make it easy.</p></div><div className="grid gap-4 md:grid-cols-3">
      <Link href="/shop?category=iphone" className="category-tile"><span className="category-number">01</span><div className="category-image"><Image src="/products/40w-charger.jpeg" alt="Charging adapter packaging" fill sizes="(max-width: 768px) 90vw, 380px" className="object-cover"/></div><div className="flex items-center justify-between"><div><h3>For your iPhone</h3><p>USB-C charging essentials</p></div><ArrowRight size={20}/></div></Link>
      <Link href="/shop?category=samsung" className="category-tile"><span className="category-number">02</span><div className="category-image"><Image src="/products/samsung-packaging-catalog-v2.png" alt="Samsung power adapter retail packaging" fill sizes="(max-width: 768px) 90vw, 380px" className="object-contain"/></div><div className="flex items-center justify-between"><div><h3>For your Samsung</h3><p>Find your compatible setup</p></div><ArrowRight size={20}/></div></Link>
      <Link href="/shop?category=cables" className="category-tile"><span className="category-number">03</span><div className="category-image"><Image src="/products/usb-c-cable-detail.png" alt="Braided USB-C cable with both connectors visible" fill sizes="(max-width: 768px) 90vw, 380px" className="object-cover"/></div><div className="flex items-center justify-between"><div><h3>Cables that connect</h3><p>For the desk, bag & bedside</p></div><ArrowRight size={20}/></div></Link>
    </div></section>
    <section className="container-wirely section-space pt-0"><div className="section-heading"><div><p className="eyebrow">BUILD YOUR CHARGING SETUP</p><h2>Small essentials. Big difference.</h2></div><Link href="/shop" className="text-sm font-semibold flex items-center gap-2">Shop all products <ArrowRight size={17}/></Link></div><div className="grid grid-cols-2 gap-4 lg:grid-cols-3">{charging.map((p, i) => <ProductCard key={p.id} product={p} index={i}/>)}</div></section>
    <section id="why-us" className="container-wirely buying-guide scroll-mt-28"><div><p className="eyebrow">THE RIGHT FIT, BEFORE YOU BUY</p><h2>No guesswork.<br />Just the right connection.</h2><p className="mt-5 max-w-md text-muted">Not every cable fits every phone. Check your connector and device compatibility before ordering. If you’re unsure, send us your phone model.</p><a href={whatsappUrl("Hi Wirely! Can you help me choose a charger and cable for my phone?")} className="btn-primary mt-6"><MessageCircle size={18}/> Help me choose</a></div><div className="space-y-6">{[{ n: "01", title: "Check your phone’s port", text: "USB-C and Lightning are different. Match the cable to the port on your device." }, { n: "02", title: "Match your adapter and cable", text: "Check the product’s output and connectors. Charging speed depends on your phone and the full setup." }, { n: "03", title: "Know what you’re paying", text: `Advance orders ship free. ${deliveryFeePkr("cod") === 0 ? "Cash on delivery is free" : `Cash on delivery adds ${formatPkr(deliveryFeePkr("cod"))}`}. Review your total before placing your order.` }].map(x => <div className="guide-step" key={x.n}><span>{x.n}</span><div><h3 className="font-semibold">{x.title}</h3><p className="mt-2 text-sm leading-relaxed text-muted">{x.text}</p></div></div>)}</div></section>
    <section id="faq" className="container-wirely section-space"><div className="section-heading"><div><p className="eyebrow">GOOD TO KNOW</p><h2>A few things before you order.</h2></div></div><div className="faq-list">{[{ q: "Can I pay when my order arrives?", a: `Yes. Choose cash on delivery at checkout. ${deliverySummary()}` }, { q: "When will my order arrive?", a: "Most orders arrive within 2–4 working days after confirmation. We confirm order details and share tracking on WhatsApp." }, { q: "Will this work with my phone?", a: "Check the compatibility information on the product page. For Samsung devices or models not listed, message us before ordering so we can help check your setup." }, { q: "What if I need to return something?", a: "You can request a return within 7 days of delivery for unused products in their original packaging. See our returns policy for details." }].map(x => <details key={x.q}><summary>{x.q}<span>+</span></summary><p>{x.a}</p></details>)}</div></section>
    <ReviewSlider reviews={CUSTOMER_REVIEWS} />
    <section className="container-wirely final-banner"><Cable size={36}/><div><h2>Your next charging setup starts here.</h2><p>Choose your essentials. Get back to your day.</p></div><Link href="/shop?category=charging" className="btn-primary">Explore the collection <ArrowRight size={18}/></Link></section>
  </>;
}
