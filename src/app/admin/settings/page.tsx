import Link from "next/link";
import { WHATSAPP_NUMBER } from "@/lib/constants";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold">Settings</h1>
      <div className="max-w-xl space-y-3 rounded-3xl border border-border bg-card p-6">
        <p className="rounded-2xl border border-border bg-accent-soft/40 px-4 py-3 text-sm text-accent-dark">
          Static mode — site settings come from environment variables and{" "}
          <code className="rounded bg-card px-1">src/lib/constants.ts</code>.
        </p>
        <p className="text-sm">
          <span className="text-muted">WhatsApp number:</span>{" "}
          <span className="font-medium">+{WHATSAPP_NUMBER}</span>
        </p>
        <p className="text-sm">
          <span className="text-muted">Logo:</span>{" "}
          <span className="font-medium">/brand/logo.png</span>
        </p>
        <Link href="/" className="btn-secondary mt-4 inline-flex">
          View store
        </Link>
      </div>
    </div>
  );
}
