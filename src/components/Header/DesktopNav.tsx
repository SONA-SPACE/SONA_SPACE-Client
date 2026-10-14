import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { NAV_ITEMS, isNavItemActive, type NavItem } from "./navigation";
import type { HeaderCatalog } from "./useHeaderCatalog";

type MegaMenuEntry = { key: string | number; label: string; to: string; image?: string };

function MegaMenu({
  title,
  entries,
  loading,
  loadingLabel,
}: {
  title: string;
  entries: MegaMenuEntry[];
  loading: boolean;
  loadingLabel: string;
}) {
  return (
    <div className="mega-menu">
      <div className="container mega-menu__inner">
        <ul className="mega-menu__list">
          {loading ? (
            <li className="mega-menu__status">{loadingLabel}</li>
          ) : (
            entries.slice(0, 10).map((entry) => (
              <li key={`list-${entry.key}`}>
                <Link to={entry.to}>{entry.label}</Link>
              </li>
            ))
          )}
        </ul>
        <div className="mega-menu__showcase">
          <p className="mega-menu__title">{title}</p>
          {loading ? (
            <p className="mega-menu__status">{loadingLabel}</p>
          ) : (
            <div className="mega-menu__grid">
              {entries.map((entry) => (
                <Link key={`card-${entry.key}`} to={entry.to} className="mega-menu__card" tabIndex={-1}>
                  <span className="mega-menu__media">
                    {entry.image && <img src={entry.image} alt="" loading="lazy" decoding="async" />}
                  </span>
                  <span className="mega-menu__label">{entry.label}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DesktopNav({ catalog }: { catalog: HeaderCatalog }) {
  const { pathname } = useLocation();
  const navRef = useRef<HTMLElement>(null);
  // After a menu link is used the pointer is still over the panel; keep it shut until it leaves.
  const [suppressed, setSuppressed] = useState(false);

  useEffect(() => {
    setSuppressed(true);
    const active = document.activeElement;
    if (active instanceof HTMLElement && navRef.current?.contains(active)) active.blur();
  }, [pathname]);

  const menuFor = (item: NavItem) => {
    if (item.menu === "categories") {
      return (
        <MegaMenu
          title="Sản phẩm nội thất HOT"
          loading={catalog.loadingCategories}
          loadingLabel="Đang tải danh mục..."
          entries={catalog.categories.map((category) => ({
            key: category.category_id,
            label: category.category_name,
            to: `/danh-muc/${category.slug}`,
            image: category.category_image,
          }))}
        />
      );
    }
    if (item.menu === "rooms") {
      return (
        <MegaMenu
          title="Không gian nội thất"
          loading={catalog.loadingRooms}
          loadingLabel="Đang tải không gian..."
          entries={catalog.rooms.map((room) => ({
            key: room.room_id,
            label: room.room_name,
            to: `/khong-gian/${room.slug}`,
            image: room.room_image,
          }))}
        />
      );
    }
    return null;
  };

  return (
    <nav
      ref={navRef}
      className={`main-nav${suppressed ? " main-nav--suppressed" : ""}`}
      aria-label="Điều hướng chính"
      onMouseEnter={() => setSuppressed(false)}
      onMouseLeave={() => setSuppressed(false)}
      onFocus={() => setSuppressed(false)}
      onKeyDown={(event) => {
        if (event.key === "Escape" && document.activeElement instanceof HTMLElement) {
          setSuppressed(true);
        }
      }}
    >
      <ul className="main-nav__list">
        {NAV_ITEMS.map((item) => {
          const active = isNavItemActive(item, pathname);
          return (
            <li key={item.to} className={`main-nav__item${item.menu ? " has-menu" : ""}`}>
              <Link
                to={item.to}
                className={`main-nav__link${active ? " active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
                {item.menu && (
                  <svg className="main-nav__chevron" viewBox="0 0 12 12" aria-hidden="true">
                    <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                )}
              </Link>
              {menuFor(item)}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
