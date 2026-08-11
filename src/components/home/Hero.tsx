"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

export function Hero() {
  const reduce = useReducedMotion();

  return (
    <section className="relative min-h-[min(92vh,860px)] overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/products/airpods-pro-2.jpeg"
          alt="Wirely Apple accessories"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-graphite/90 via-graphite/70 to-graphite/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-graphite/70 via-transparent to-transparent" />
      </div>

      <div className="container-wirely relative flex min-h-[min(92vh,860px)] items-end pb-16 pt-28 md:items-center md:pb-24">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-xl text-white"
        >
          <p className="font-display text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
            Wirely
          </p>
          <h1 className="mt-4 max-w-md text-2xl font-medium leading-snug text-white/90 sm:text-3xl">
            Charge faster. Sound better. Delivered free across Pakistan.
          </h1>
          <p className="mt-4 max-w-md text-base text-white/70">
            Authentic iPhone chargers, cables, and AirPods — ordered in minutes,
            confirmed on WhatsApp.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/#shop" className="btn-primary">
              Shop bestsellers
            </Link>
            <Link
              href="/charger-cable-combo"
              className="btn-secondary border-white/30 text-white hover:border-white hover:bg-white/10"
            >
              View combo deal
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
