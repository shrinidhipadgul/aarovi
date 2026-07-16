"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";

export default function Hero() {
  const prefersReducedMotion = useReducedMotion();

  const childVariants: Variants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" as const },
    },
  };

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  return (
    <section className="relative flex min-h-[calc(100vh-5rem)] items-center justify-center overflow-hidden bg-brand-bg">
      {/* Background Video — cropped 250px from each side (1920 → 1420) */}
      <div className="absolute inset-0 overflow-hidden">
        <video
          autoPlay
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
          style={{ transform: 'scale(1.352)', transformOrigin: 'center center' }}
        >
          <source src="/hero.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="absolute inset-0 bg-black/30" />
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8"
      >
        <motion.span
          variants={childVariants}
          className="mb-4 block text-xs font-medium uppercase tracking-[0.25em] text-white sm:text-sm"
        >
          Aarovi
        </motion.span>

        <motion.h1
          variants={childVariants}
          className="font-display text-4xl font-semibold leading-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
        >
          Where style meets your soul
        </motion.h1>

        <motion.p
          variants={childVariants}
          className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white sm:text-lg md:text-xl"
        >
          Handcrafted ethnic wear for life&apos;s every moment
        </motion.p>

        <motion.div
          variants={childVariants}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
        >
          <Link
            href="/shop/kurtis"
            className="inline-flex h-12 w-full items-center justify-center rounded-full bg-white px-8 text-sm font-medium uppercase tracking-wider text-brand-primary transition-all hover:bg-white/90 sm:w-auto sm:text-base"
          >
            Explore Collection
          </Link>
          <Link
            href="/customize"
            className="inline-flex h-12 w-full items-center justify-center rounded-full border-2 border-white/30 px-8 text-sm font-medium uppercase tracking-wider text-white transition-all hover:border-white/50 hover:bg-white/10 sm:w-auto sm:text-base"
          >
            Customize Your Look
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
