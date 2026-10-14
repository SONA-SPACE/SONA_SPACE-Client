import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { loadCartService } from "../../services/cartService";
import { useHeaderHero } from "../../hooks/useHeaderHero";
import WishlistSidebar from "../Wishlist/WishlistSidebar";
import MiniCart, { type MiniCartHandle } from "../MiniCart";
import MiniNotification, { type MiniNotificationHandle } from "../MiniNotify";
import AccountMenu from "./AccountMenu";
import DesktopNav from "./DesktopNav";
import HeaderSearch from "./HeaderSearch";
import MobileMenu from "./MobileMenu";
import { useHeaderCatalog } from "./useHeaderCatalog";

const MOBILE_QUERY = "(max-width: 767px)";

// Transparent while a registered hero is under the header, solid brand-dark otherwise.
function useHeaderSurface(headerRef: React.RefObject<HTMLElement | null>) {
  const hero = useHeaderHero();
  const [overHero, setOverHero] = useState(false);
  // Colour changes only animate once the user scrolls, so a page that mounts its hero
  // after the header does not flash from solid to transparent.
  const [animated, setAnimated] = useState(false);

  useLayoutEffect(() => {
    if (!hero) {
      setOverHero(false);
      return;
    }
    const headerHeight = headerRef.current?.offsetHeight ?? 80;
    setOverHero(hero.getBoundingClientRect().bottom > headerHeight);

    const observer = new IntersectionObserver(([entry]) => setOverHero(entry.isIntersecting), {
      rootMargin: `-${headerHeight}px 0px 0px 0px`,
    });
    observer.observe(hero);
    return () => observer.disconnect();
  }, [hero, headerRef]);

  useEffect(() => {
    const enable = () => setAnimated(true);
    window.addEventListener("scroll", enable, { once: true, passive: true });
    return () => window.removeEventListener("scroll", enable);
  }, []);

  return { overHero, animated };
}

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const catalog = useHeaderCatalog();
  const headerRef = useRef<HTMLElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const notificationRootRef = useRef<HTMLDivElement>(null);
  const cartRootRef = useRef<HTMLDivElement>(null);
  const miniCartRef = useRef<MiniCartHandle>(null);
  const miniNotificationRef = useRef<MiniNotificationHandle>(null);

  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const { overHero, animated } = useHeaderSurface(headerRef);

  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);

  useEffect(() => {
    const refreshCartCount = async () => {
      try {
        const cartData = await loadCartService();
        const total =
          cartData.wishlistItems?.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0) || 0;
        setCartCount(total);
      } catch (error) {
        console.error("Lỗi khi cập nhật giỏ hàng:", error);
      }
    };

    refreshCartCount();
    window.addEventListener("cart-updated", refreshCartCount);
    return () => window.removeEventListener("cart-updated", refreshCartCount);
  }, []);

  // Notification and cart panels close on Escape or on any press outside their own corner.
  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!notificationRootRef.current?.contains(target)) miniNotificationRef.current?.closeMiniNotification();
      if (!cartRootRef.current?.contains(target)) miniCartRef.current?.closeMiniCart();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      miniNotificationRef.current?.closeMiniNotification();
      miniCartRef.current?.closeMiniCart();
      setIsWishlistOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const isDesktopPointer = () => !window.matchMedia(MOBILE_QUERY).matches;

  const headerClassName = [
    "header",
    overHero ? "header--overlay" : "header--solid",
    animated ? "header--animated" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <header ref={headerRef} className={headerClassName}>
        <div className="container">
          <div className="header-wrapper">
            <Link to="/" className="logo" aria-label="SONA Space - Trang chủ">
              <img src="/images/logo@3x.png" alt="SONA Space" width={100} height={27} />
            </Link>

            <DesktopNav catalog={catalog} />

            <div className="header-actions">
              <div className="header-actions-icons">
                <HeaderSearch catalog={catalog} />

                <div className="notifycation-container" ref={notificationRootRef}>
                  <button
                    className="btn-icon notification-btn"
                    type="button"
                    onClick={() => miniNotificationRef.current?.toggleMiniNotification()}
                    aria-label={
                      notificationCount > 0 ? `Thông báo, ${notificationCount} mục chưa đọc` : "Thông báo"
                    }
                  >
                    <img src="/images/icons/bell.svg" alt="" />
                    {notificationCount > 0 && <span className="header-badge">{notificationCount}</span>}
                  </button>
                  <MiniNotification
                    ref={miniNotificationRef}
                    onNotificationCountChange={(count) => setNotificationCount(count)}
                  />
                </div>

                <div
                  className="cart-container"
                  ref={cartRootRef}
                  onMouseEnter={() => {
                    if (isDesktopPointer() && !miniCartRef.current?.isVisible) miniCartRef.current?.toggleMiniCart();
                  }}
                  onMouseLeave={() => isDesktopPointer() && miniCartRef.current?.closeMiniCart()}
                >
                  <Link
                    to="/gio-hang"
                    className="btn-icon cart-btn"
                    aria-label={cartCount > 0 ? `Giỏ hàng, ${cartCount} sản phẩm` : "Giỏ hàng"}
                    onClick={(event) => {
                      // On phones the icon opens the mini cart; the cart page is one tap further.
                      if (isDesktopPointer()) return;
                      event.preventDefault();
                      miniCartRef.current?.toggleMiniCart();
                    }}
                  >
                    <img src="/images/icons/cart.svg" alt="" />
                    {cartCount > 0 && <span className="header-badge">{cartCount}</span>}
                  </Link>
                  <MiniCart ref={miniCartRef} onCartUpdated={(count) => setCartCount(count)} />
                </div>

                <button
                  className="btn-icon wishlist-btn"
                  type="button"
                  onClick={() => setIsWishlistOpen((open) => !open)}
                  aria-label={isWishlistOpen ? "Đóng danh sách yêu thích" : "Mở danh sách yêu thích"}
                  aria-controls="wishlist-sidebar"
                  aria-expanded={isWishlistOpen}
                >
                  <img src="/images/icons/wishlist.svg" alt="" />
                </button>
              </div>

              <span className="header-actions-separator" aria-hidden="true"></span>

              <div className="header-actions-buttons">
                {isAuthenticated && user ? (
                  <AccountMenu fullName={user.full_name} onLogout={logout} />
                ) : (
                  <>
                    <Link to="/dang-ky" className="btn sign-up">
                      Đăng Ký
                    </Link>
                    <Link to="/dang-nhap" className="btn sign-in">
                      Đăng Nhập
                    </Link>
                  </>
                )}
              </div>

              <div className="header-hamburger">
                <button
                  ref={hamburgerRef}
                  className="btn-icon hamburger-btn"
                  type="button"
                  onClick={() => setIsMobileMenuOpen(true)}
                  aria-label="Mở menu điều hướng"
                  aria-controls="mobile-menu-dialog"
                  aria-expanded={isMobileMenuOpen}
                >
                  <img src="/images/icons/Hamburger_MD.svg" alt="" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <WishlistSidebar isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />

      <MobileMenu
        open={isMobileMenuOpen}
        onClose={closeMobileMenu}
        returnFocusRef={hamburgerRef}
        catalog={catalog}
        user={isAuthenticated && user ? user : null}
        onLogout={logout}
      />
    </>
  );
};

export default Header;
