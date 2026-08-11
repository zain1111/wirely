import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product/ProductDetail";
import { ReviewForm } from "@/components/product/ReviewForm";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { getProductBySlug, getProducts } from "@/lib/products";
import { absoluteUrl, productImageSrc } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 300;

const RESERVED = new Set([
  "checkout",
  "admin",
  "api",
  "shop",
  "shipping",
  "returns",
  "robots.txt",
  "sitemap.xml",
]);

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (RESERVED.has(slug)) return {};
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };

  const title =
    product.meta_title || `${product.name} | ${SITE_NAME} Pakistan`;
  const description =
    product.meta_description ||
    product.description.slice(0, 155).replace(/\s+/g, " ");
  const image = absoluteUrl(productImageSrc(product.images[0] || "/brand/logo.png"));

  return {
    title,
    description,
    alternates: { canonical: `/${product.slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${product.slug}`,
      images: [{ url: image }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  if (RESERVED.has(slug)) notFound();

  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const all = await getProducts();
  const related = all.filter((p) => p.slug !== product.slug).slice(0, 3);

  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((src) => absoluteUrl(productImageSrc(src))),
    sku: product.slug,
    brand: { "@type": "Brand", name: SITE_NAME },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/${product.slug}`,
      priceCurrency: "PKR",
      price: product.price,
      availability: "https://schema.org/InStock",
      seller: { "@type": "Organization", name: SITE_NAME },
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: product.short_name,
        item: `${SITE_URL}/${product.slug}`,
      },
    ],
  };

  return (
    <>
      <JsonLd data={[productLd, breadcrumbLd]} />
      <ProductDetail product={product} related={related} />
      <div className="container-wirely pb-24 md:pb-16">
        <ReviewForm productSlug={product.slug} />
      </div>
    </>
  );
}
