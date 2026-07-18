"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/animations";

interface Props {
  children: React.ReactNode;
  className?: string;
}

function collectAll(...lists: NodeListOf<Element>[]): Element[] {
  return lists.flatMap((l) => Array.from(l));
}

export default function SectionReveal({ children, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      const root = ref.current;

      const eyebrow = root.querySelectorAll(".reveal-eyebrow");
      const title = root.querySelectorAll(".reveal-title");
      const sub = root.querySelectorAll(".reveal-sub");
      const cards = root.querySelectorAll(".reveal-card");

      if (prefersReducedMotion()) {
        gsap.set(collectAll(eyebrow, title, sub, cards), { opacity: 1, y: 0 });
        gsap.set(cards, { clipPath: "inset(0 0 0% 0)" });
        return;
      }

      const clipFrom: Record<string, string> = {
        clipPath: "inset(0 0 100% 0)",
      };
      const clipTo: Record<string, string> = {
        clipPath: "inset(0 0 0% 0)",
      };

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top 84%",
          once: true,
        },
      });

      tl.fromTo(
        eyebrow,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
      );

      tl.fromTo(
        title,
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" },
        "-=0.35",
      );

      tl.fromTo(
        sub,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.55, ease: "power3.out" },
        "-=0.4",
      );

      tl.fromTo(
        cards,
        clipFrom,
        {
          ...clipTo,
          stagger: 0.07,
          duration: 0.85,
          ease: "power4.inOut",
        },
        "-=0.2",
      );

      tl.fromTo(
        cards,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, stagger: 0.07, duration: 0.5, ease: "power2.out" },
        "-=0.55",
      );
    },
    [],
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
