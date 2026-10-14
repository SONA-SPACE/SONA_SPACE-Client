import { useEffect, useRef, type RefObject } from "react";
import { Link, useLocation } from "react-router-dom";
import { NAV_ITEMS, isNavItemActive } from "./navigation";
import { getLastName } from "./AccountMenu";
import type { HeaderCatalog } from "./useHeaderCatalog";

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
  returnFocusRef: RefObject<HTMLElement | null>;
  catalog: HeaderCatalog;
  user: { full_name?: string; email?: string } | null;
  onLogout: () => void;
};

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const scrollY = window.scrollY;
    document.body.classList.add("mobile-menu-open");
    document.body.style.top = `-${scrollY}px`;
    return () => {
      document.body.classList.remove("mobile-menu-open");
      document.body.style.top = "";
      window.scrollTo(0, scrollY);
    };
  }, [locked]);
}

export default function MobileMenu({ open, onClose, returnFocusRef, catalog, user, onLogout }: MobileMenuProps) {
  const { pathname } = useLocation();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useScrollLock(open);

  useEffect(() => {
    if (open) onClose();
    // Close after any navigation, including links outside this menu.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const returnTarget = returnFocusRef.current;
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      returnTarget?.focus();
    };
  }, [open, onClose, returnFocusRef]);

  return (
    <div className={`mobile-menu-overlay${open ? " show" : ""}`} aria-hidden={!open} onClick={onClose}>
      <div
        ref={panelRef}
        className="mobile-menu"
        id="mobile-menu-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Menu điều hướng"
        onClick={(event) => event.stopPropagation()}
        inert={!open}
      >
        <div className="mobile-menu__header">
          <img className="mobile-menu__logo" src="/images/logo@3x.png" alt="SONA Space" width={100} height={27} />
          <button ref={closeButtonRef} type="button" className="mobile-menu__close" onClick={onClose}>
            <span className="sr-only">Đóng menu điều hướng</span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <nav className="mobile-menu__nav" aria-label="Điều hướng chính">
          <ul>
            {NAV_ITEMS.map((item) => {
              const active = isNavItemActive(item, pathname);
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={active ? "active" : undefined}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {[
          {
            title: "Danh mục sản phẩm",
            entries: catalog.categories.map((category) => ({
              key: category.category_id,
              to: `/danh-muc/${category.slug}`,
              label: category.category_name,
              image: category.category_image,
            })),
          },
          {
            title: "Không gian nội thất",
            entries: catalog.rooms.map((room) => ({
              key: room.room_id,
              to: `/khong-gian/${room.slug}`,
              label: room.room_name,
              image: room.room_image,
            })),
          },
        ].map((section) =>
          section.entries.length === 0 ? null : (
            <section className="mobile-menu__section" key={section.title}>
              <h2 className="mobile-menu__heading">{section.title}</h2>
              <div className="mobile-menu__rail">
                {section.entries.map((entry) => (
                  <Link key={entry.key} to={entry.to} className="mobile-menu__tile">
                    <span className="mobile-menu__tile-media">
                      {entry.image && <img src={entry.image} alt="" loading="lazy" />}
                    </span>
                    <span className="mobile-menu__tile-label">{entry.label}</span>
                  </Link>
                ))}
              </div>
            </section>
          )
        )}

        <div className="mobile-menu__account">
          {user ? (
            <>
              <p className="mobile-menu__greeting">Chào, {getLastName(user.full_name)}</p>
              {user.email && <p className="mobile-menu__email">{user.email}</p>}
              <div className="mobile-menu__actions">
                <Link to="/tai-khoan" className="mobile-menu__action">Tài khoản</Link>
                <Link to="/tai-khoan/don-hang" className="mobile-menu__action">Đơn hàng</Link>
                <Link to="/san-pham-yeu-thich" className="mobile-menu__action">Yêu thích</Link>
                <Link to="/gio-hang" className="mobile-menu__action">Giỏ hàng</Link>
              </div>
              <button
                type="button"
                className="mobile-menu__logout"
                onClick={() => {
                  onLogout();
                  onClose();
                }}
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <p className="mobile-menu__greeting">Đăng nhập để trải nghiệm tốt hơn</p>
              <p className="mobile-menu__email">Xem đơn hàng và nhận ưu đãi đặc biệt</p>
              <div className="mobile-menu__auth">
                <Link to="/dang-nhap" className="mobile-menu__signin">Đăng nhập</Link>
                <Link to="/dang-ky" className="mobile-menu__signup">Đăng ký</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
