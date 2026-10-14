import { useEffect, useSyncExternalStore, type RefObject } from "react";

// A full-bleed hero that sits under the fixed header registers itself here. While it is
// on screen the header stays transparent over it; every other page gets the solid header.
const heroes: HTMLElement[] = [];
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getActiveHero(): HTMLElement | null {
  return heroes[0] ?? null;
}

export function useRegisterHeaderHero(ref: RefObject<HTMLElement | null>, enabled = true) {
  useEffect(() => {
    const element = ref.current;
    if (!enabled || !element) return;

    heroes.push(element);
    notify();
    return () => {
      heroes.splice(heroes.indexOf(element), 1);
      notify();
    };
  }, [ref, enabled]);
}

export function useHeaderHero(): HTMLElement | null {
  return useSyncExternalStore(subscribe, getActiveHero, () => null);
}
