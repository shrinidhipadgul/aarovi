"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/animations";

const items = [
  "Hand-embroidered in India",
  "Complimentary shipping over ₹999",
  "Easy 7-day returns",
  "Made-to-measure available",
  "New drops every Friday",
];

function TrackLine({ ariaHidden }: { ariaHidden?: boolean }) {
  return (
    <div aria-hidden={ariaHidden} className="flex shrink-0 items-center">
      {items.map((item) => (
        <span
          key={item}
          className="flex items-center whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.3em] text-brand-gold-light"
        >
          <span className="px-6">{item}</span>
          <span className="text-brand-gold/60">✦</span>
        </span>
      ))}
    </div>
  );
}

export default function Marquee() {
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion() || !trackRef.current) return;

      const tween = gsap.to(trackRef.current, {
        xPercent: -50,
        duration: 35,
        repeat: -1,
        ease: "none",
      });

      const el = trackRef.current.parentElement;
      if (el) {
        el.addEventListener("mouseenter", () => tween.timeScale(0.2));
        el.addEventListener("mouseleave", () => tween.timeScale(1));
      }

      return () => {
        tween.kill();
      };
    },
    [],
  );

  return (
    <div className="relative overflow-hidden border-y border-brand-gold/20 bg-brand-espresso py-3.5 texture-grain-dark">
      <div ref={trackRef} className="flex w-max">
        <TrackLine />
        <TrackLine ariaHidden />
      </div>
    </div>
  );
}
