"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/animations";

export default function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion() || !ref.current) return;
      gsap.to(ref.current, {
        scaleX: 1,
        transformOrigin: "left center",
        ease: "none",
        scrollTrigger: {
          trigger: document.documentElement,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.35,
        },
      });
    },
    [],
  );

  return (
    <div
      ref={ref}
      className="pointer-events-none fixed top-0 left-0 right-0 z-[160] h-[2px] origin-left scale-x-0 bg-amber-200/70"
    />
  );
}
