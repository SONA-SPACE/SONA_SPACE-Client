import { useRef } from "react";
import { useLocation } from "react-router-dom";
import PageHero from "../components/PageHero";
import { useRegisterHeaderHero } from "../hooks/useHeaderHero";

type ShellKind = "banner-full" | "banner-compact" | "page-hero" | "order" | "plain";

declare global {
  interface Window {
    /** Defined in index.html; maps a path to the top area its page starts with */
    __sonaShellKind?: (pathname: string) => ShellKind;
  }
}

// Shown while a route's code loads. It draws the same dark top area the page will have (banner,
// page hero, order screen), so a reload or navigation never flashes light between dark screens.
export default function RouteFallback() {
  const { pathname } = useLocation();
  const kind = window.__sonaShellKind?.(pathname) ?? "plain";
  const bannerRef = useRef<HTMLElement>(null);
  // Banner pages start with the header in its glass state, as the loaded banner does
  useRegisterHeaderHero(bannerRef);

  return (
    <div className={`route-fallback route-fallback--${kind}`} role="status">
      {kind === "banner-full" || kind === "banner-compact" ? (
        <section
          ref={bannerRef}
          className={`hero-banner hero-banner--${kind === "banner-full" ? "full" : "compact"} loading`}
          aria-hidden="true"
        />
      ) : null}
      {kind === "page-hero" ? <PageHero title="" loading /> : null}
      {kind === "order" ? <div className="order-Complete-context" aria-hidden="true" /> : null}
      <span className="route-fallback__bar" aria-hidden="true" />
      <span className="sr-only">Đang tải nội dung...</span>
    </div>
  );
}
