"use client";

import { useRef } from "react";
import Lenis from "lenis";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/animations";

export default function SmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null);

  useGSAP(
    () => {
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });

      lenisRef.current = lenis;

      lenis.on("scroll", ScrollTrigger.update);

      const raf = (time: number) => {
        lenis.raf(time * 1000);
      };
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);

      return () => {
        gsap.ticker.remove(raf);
        lenis.destroy();
      };
    },
    [],
  );

  return null;
}
