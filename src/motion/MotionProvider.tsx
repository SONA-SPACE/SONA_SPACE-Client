import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { loadMotion, prefersReducedMotion, type Motion } from "./gsap";

/*
 * Page-level motion, driven by data attributes so pages never call GSAP themselves:
 *
 *   data-reveal            fades the element up when it scrolls into view; elements that
 *                          enter together are staggered in DOM order.
 *   data-parallax="8"      drifts the element vertically by +/- N percent while its parent
 *                          crosses the viewport. Use on an image inside an overflow:hidden frame.
 *   data-magnetic="0.2"    pulls the element a fraction of the pointer offset toward the pointer
 *                          (fine pointers only). Use on elements without their own CSS transform.
 *
 * Content stays visible until GSAP has loaded (the hidden state is gated on html.motion-ready),
 * and nothing is hidden or moved for prefers-reduced-motion users.
 */

const REVEAL_SELECTOR = "[data-reveal]";
const PARALLAX_SELECTOR = "[data-parallax]";
const MAGNETIC_SELECTOR = "[data-magnetic]";
const READY_CLASS = "motion-ready";
// An attribute, not a class: React rewrites the whole class attribute whenever a component's
// className changes, which would silently re-hide an element that was already revealed.
const REVEALED_ATTR = "data-revealed";

type Controller = {
  motion: Motion;
  scan: () => void;
  refresh: () => void;
};

let controllerPromise: Promise<Controller | null> | null = null;

function createController(motion: Motion): Controller {
  const { gsap, ScrollTrigger } = motion;
  const tracked = new WeakSet<Element>();
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  let refreshTimer = 0;

  const reveal = (elements: Element[]) => {
    gsap.to(elements, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: "power2.out",
      stagger: 0.06,
      overwrite: true,
      onComplete() {
        elements.forEach((element) => element.setAttribute(REVEALED_ATTR, ""));
        gsap.set(elements, { clearProps: "opacity,transform" });
      },
    });
  };

  const scan = () => {
    const freshReveals = Array.from(document.querySelectorAll(REVEAL_SELECTOR)).filter(
      (element) => !tracked.has(element)
    );
    if (freshReveals.length > 0) {
      freshReveals.forEach((element) => tracked.add(element));
      ScrollTrigger.batch(freshReveals, {
        start: "top 92%",
        once: true,
        interval: 0.08,
        onEnter: (batch) => reveal(batch),
      });
    }

    Array.from(document.querySelectorAll<HTMLElement>(PARALLAX_SELECTOR))
      .filter((element) => !tracked.has(element))
      .forEach((element) => {
        tracked.add(element);
        const range = Number(element.dataset.parallax) || 8;
        gsap.fromTo(
          element,
          { yPercent: -range },
          {
            yPercent: range,
            ease: "none",
            scrollTrigger: {
              trigger: element.parentElement ?? element,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.2,
            },
          }
        );
      });

    if (!finePointer) return;
    Array.from(document.querySelectorAll<HTMLElement>(MAGNETIC_SELECTOR))
      .filter((element) => !tracked.has(element))
      .forEach((element) => {
        tracked.add(element);
        const strength = Number(element.dataset.magnetic) || 0.2;
        const xTo = gsap.quickTo(element, "x", { duration: 0.45, ease: "power3.out" });
        const yTo = gsap.quickTo(element, "y", { duration: 0.45, ease: "power3.out" });
        element.addEventListener("pointermove", (event) => {
          const rect = element.getBoundingClientRect();
          xTo((event.clientX - rect.left - rect.width / 2) * strength);
          yTo((event.clientY - rect.top - rect.height / 2) * strength);
        });
        element.addEventListener("pointerleave", () => {
          xTo(0);
          yTo(0);
        });
      });
  };

  // Layout keeps moving after mount (images, async lists), so trigger positions are recomputed
  // whenever the document height settles, and triggers of removed elements are dropped.
  const refresh = () => {
    window.clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(() => {
      ScrollTrigger.getAll().forEach((trigger) => {
        const element = trigger.trigger;
        if (element && !element.isConnected) trigger.kill();
      });
      ScrollTrigger.refresh();
    }, 150);
  };

  let scanFrame = 0;
  new MutationObserver(() => {
    cancelAnimationFrame(scanFrame);
    scanFrame = requestAnimationFrame(scan);
  }).observe(document.body, { childList: true, subtree: true });

  // Observe the app root, not <body>: the antd reset pins html/body to height 100%, so the
  // body box never resizes when content above a trigger grows or shrinks.
  new ResizeObserver(refresh).observe(document.getElementById("root") ?? document.body);

  // Whatever the first paint already showed stays put; hiding it now would read as a flicker.
  document.querySelectorAll(REVEAL_SELECTOR).forEach((element) => {
    if (element.getBoundingClientRect().top < window.innerHeight) {
      tracked.add(element);
      element.setAttribute(REVEALED_ATTR, "");
    }
  });
  document.documentElement.classList.add(READY_CLASS);
  scan();

  return { motion, scan, refresh };
}

function getController(): Promise<Controller | null> {
  controllerPromise ??= prefersReducedMotion()
    ? Promise.resolve(null)
    : loadMotion()
        .then(createController)
        .catch(() => null);
  return controllerPromise;
}

export default function MotionProvider() {
  const { pathname } = useLocation();

  useEffect(() => {
    let cancelled = false;
    getController().then((controller) => {
      if (cancelled || !controller) return;
      controller.scan();
      controller.refresh();
    });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return null;
}
