import Link from "next/link";

export default function AdminLoginPage() {
  return (
    <div className="mx-auto max-w-md rounded-3xl border border-border bg-card p-8">
      <h1 className="font-display text-2xl font-bold">Admin</h1>
      <p className="mt-2 text-sm text-muted">
        This site is running in <strong>static mode</strong> — there is no
        database login. Catalog data comes from local seed files.
      </p>
      <Link href="/admin" className="btn-primary mt-6 w-full">
        Open dashboard
      </Link>
    </div>
  );
}
