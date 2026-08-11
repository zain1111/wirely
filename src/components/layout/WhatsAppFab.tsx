"use client";

import { MessageCircle } from "lucide-react";
import { trackWhatsAppContact } from "@/lib/analytics";
import { whatsappUrl } from "@/lib/utils";

export function WhatsAppFab() {
  return (
    <a
      href={whatsappUrl("Hi Wirely! I’d like help choosing the right accessory.")}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackWhatsAppContact()}
      className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.03]"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-5 w-5" />
      <span className="hidden sm:inline">Chat</span>
    </a>
  );
}
