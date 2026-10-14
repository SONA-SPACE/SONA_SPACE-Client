import type { gsap as GsapInstance } from "gsap";
import type { ScrollTrigger as ScrollTriggerPlugin } from "gsap/ScrollTrigger";

export type Motion = {
  gsap: typeof GsapInstance;
  ScrollTrigger: typeof ScrollTriggerPlugin;
};

let motionPromise: Promise<Motion> | null = null;

// GSAP stays out of the entry chunk: every caller shares one dynamic import.
export function loadMotion(): Promise<Motion> {
  motionPromise ??= Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
    ([gsapModule, scrollTriggerModule]) => {
      const { gsap } = gsapModule;
      const { ScrollTrigger } = scrollTriggerModule;
      gsap.registerPlugin(ScrollTrigger);
      return { gsap, ScrollTrigger };
    }
  );
  return motionPromise;
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
