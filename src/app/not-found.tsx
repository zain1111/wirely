import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-wirely py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
        404
      </p>
      <h1 className="mt-3 font-display text-4xl font-bold">Page not found</h1>
      <p className="mt-3 text-muted">
        That link doesn’t exist. Head back to the shop.
      </p>
      <Link href="/" className="btn-primary mt-8 inline-flex">
        Go home
      </Link>
    </div>
  );
}
