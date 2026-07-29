"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

export default function CustomizeHero() {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { duration: 1, ease: "power4.out" } });
      tl.from(".ch-overline", { y: 24, opacity: 0 }, 0.2)
        .from(".ch-title", { y: 40, opacity: 0 }, 0.4)
        .from(".ch-sub", { y: 20, opacity: 0 }, 0.6)
        .from(".ch-cta", { y: 16, opacity: 0 }, 0.8);
    },
    { scope: containerRef },
  );

  const scrollToBuilder = () => {
    document.getElementById("brief-builder")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-brand-espresso texture-grain-dark px-4 py-28 sm:px-6"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_#221105_100%)]" />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <p className="ch-overline font-mono text-[11px] uppercase tracking-[0.35em] text-brand-gold">
          N&deg; 00 &mdash; BESPOKE
        </p>
        <h1 className="ch-title mt-6 font-display text-4xl leading-tight text-brand-ivory sm:text-5xl md:text-6xl lg:text-7xl">
          Design something
          <br />
          that&rsquo;s entirely yours.
        </h1>
        <p className="ch-sub mx-auto mt-6 max-w-lg font-serif text-lg italic leading-relaxed text-brand-parchment/70 sm:text-xl">
          Every piece is cut, dyed, and embroidered by hand — one commission at a
          time. Start with a few choices and we&rsquo;ll craft the rest.
        </p>

        <button
          onClick={scrollToBuilder}
          className="ch-cta mt-10 inline-flex h-12 items-center gap-2 rounded-full bg-brand-ivory px-10 font-mono text-xs font-medium uppercase tracking-[0.2em] text-brand-espresso transition-all duration-300 hover:bg-amber-200 active:scale-[0.97]"
        >
          Begin Your Brief
          <span className="transition-transform duration-300 group-hover:translate-x-1">
            &darr;
          </span>
        </button>
      </div>
    </section>
  );
}
