"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

export { gsap, ScrollTrigger, SplitText };

let _reducedMotion: boolean | null = null;
export function prefersReducedMotion(): boolean {
  if (_reducedMotion === null) {
    if (typeof window === "undefined") return true;
    _reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  return _reducedMotion;
}

let _isTouch: boolean | null = null;
export function isTouchDevice(): boolean {
  if (_isTouch === null) {
    if (typeof window === "undefined") return true;
    _isTouch = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
  }
  return _isTouch;
}

let _canHover: boolean | null = null;
export function canHover(): boolean {
  if (_canHover === null) {
    if (typeof window === "undefined") return false;
    _canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  }
  return _canHover;
}

const rootMql =
  typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : null;
if (rootMql) {
  rootMql.addEventListener("change", () => {
    _reducedMotion = rootMql.matches;
  });
}

ScrollTrigger.defaults({
  toggleActions: "play none none none",
  markers: false,
});

ScrollTrigger.config({
  ignoreMobileResize: false,
});

export const EASINGS = {
  expo: "power4.out",
  expoInOut: "power4.inOut",
  soft: "power3.out",
  back: "back.out(1.7)",
  elastic: "elastic.out(1, 0.4)",
} as const;
