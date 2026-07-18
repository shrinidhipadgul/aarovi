"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, SplitText, prefersReducedMotion } from "@/lib/animations";

export default function Preloader() {
  const containerRef = useRef<HTMLDivElement>(null);
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState(false);

  useGSAP(
    () => {
      const container = containerRef.current;
      const wordmark = wordmarkRef.current;
      if (!container || prefersReducedMotion()) {
        setHidden(true);
        return;
      }

      const chars = wordmark ? SplitText.create(wordmark, { type: "chars" }) : null;

      const tl = gsap.timeline({
        onComplete: () => setHidden(true),
      });

      if (chars) {
        gsap.set(chars.chars, { y: 50, opacity: 0 });
        tl.to(chars.chars, {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.045,
          ease: "power4.out",
        });
      }

      tl.to(".preload-rule", {
        scaleX: 1,
        duration: 0.5,
        ease: "power3.inOut",
      }, wordmark ? 0.2 : 0);

      tl.to(container, {
        scaleY: 0,
        duration: 0.7,
        ease: "power4.inOut",
        onStart: () => {
          if (wordmark) {
            gsap.to(wordmark, { opacity: 0, duration: 0.3 });
          }
        },
      }, 0.7);

      tl.set(container, { pointerEvents: "none" });
    },
    [],
  );

  if (hidden) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-brand-espresso"
      style={{ transformOrigin: "bottom center" }}
      aria-hidden="true"
    >
      <div ref={wordmarkRef} className="text-center">
        <h2 className="font-hero text-[clamp(3rem,12vw,7rem)] font-bold leading-none tracking-[0.12em] text-brand-ivory">
          AAROVI
        </h2>
        <div className="preload-rule mx-auto mt-2 h-px w-16 origin-center scale-x-0 bg-amber-200/60" />
      </div>
    </div>
  );
}
