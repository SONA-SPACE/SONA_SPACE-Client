import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import RouteFallback from "./RouteFallback";

// Header and footer stay mounted across navigations; only the routed page swaps.
export default function SiteLayout() {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Bỏ qua điều hướng
      </a>
      <Header />
      <main id="main-content" className="site-main" tabIndex={-1}>
        <Suspense fallback={<RouteFallback />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
