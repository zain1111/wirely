import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import { getProducts } from "@/lib/products";
import { whatsappUrl } from "@/lib/utils";
export const revalidate = 300;
export const metadata: Metadata = { title: "Shop chargers, cables & accessories", description: "Find your everyday charging setup. Shop chargers and USB-C cables with delivery across Pakistan.", alternates: { canonical: "/shop" } };
const categories = [{ id: "all", label: "All products" }, { id: "charging", label: "Charging essentials" }, { id: "iphone", label: "For iPhone" }, { id: "samsung", label: "For Samsung" }, { id: "cables", label: "Cables" }, { id: "audio", label: "Audio" }];
export default async function ShopPage({ searchParams }: {
    searchParams: Promise<{
        category?: string;
    }>;
}) {
    const { category = "all" } = await searchParams;
    const products = await getProducts();
    const selected = categories.find(c => c.id === category) ?? categories[0];
    const filtered = products.filter(p => selected.id === "all" || (selected.id === "audio" ? p.slug.includes("airpods") : selected.id === "samsung" ? p.device_compatibility.some(d => /samsung/i.test(d.name + " " + d.models)) : selected.id === "cables" ? p.slug.includes("cable") : selected.id === "iphone" ? p.device_compatibility.some(d => /iphone/i.test(d.name)) && /charger|cable/.test(p.slug) : /charger|cable/.test(p.slug)));
    return <div className="container-wirely section-space"><p className="eyebrow">THE WIRELY COLLECTION</p><h1 className="mt-4 text-4xl font-semibold md:text-5xl">Your everyday essentials.</h1><p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">Find a charger for your bedside, a cable for your bag, or a complete setup. Check your device compatibility before you order.</p><nav aria-label="Product categories" className="mt-8 flex flex-wrap gap-2 border-b border-border pb-6">{categories.map(c => <Link key={c.id} href={`/shop?category=${c.id}`} aria-current={selected.id === c.id ? "page" : undefined} className={`rounded-md border px-4 py-2.5 text-sm ${selected.id === c.id ? "border-graphite bg-graphite text-white" : "border-border hover:bg-background"}`}>{c.label}</Link>)}</nav><div className="my-7 flex justify-between text-sm"><h2 className="font-semibold">{selected.label}</h2><span className="text-muted">{filtered.length} products</span></div>{filtered.length ? <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">{filtered.map(p => <ProductCard key={p.id} product={p}/>)}</div> : <div className="rounded-lg border border-border bg-[#f5f5f0] p-8 md:p-12"><h2 className="text-2xl font-semibold">Let’s check your Samsung setup.</h2><p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">Samsung-specific chargers and cables aren’t listed in our current catalog. Send us your model so we can help check compatibility and availability before you buy.</p><a href={whatsappUrl("Hi Wirely! I need a charger or cable for my Samsung. My model is:")} className="btn-primary mt-6">Ask about my Samsung</a></div>}</div>;
}
