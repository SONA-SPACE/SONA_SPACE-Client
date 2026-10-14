import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useDismiss } from "../../hooks/useDismiss";

export const ACCOUNT_LINKS = [
  { to: "/tai-khoan", label: "Tài khoản" },
  { to: "/tai-khoan/thong-tin", label: "Thông tin cá nhân" },
  { to: "/tai-khoan/ma-giam-gia", label: "Quản lý mã giảm giá" },
  { to: "/tai-khoan/don-hang", label: "Quản lý đơn hàng" },
  { to: "/san-pham-yeu-thich", label: "Danh sách yêu thích" },
  { to: "/gio-hang", label: "Giỏ hàng" },
];

export function getLastName(fullName: string | undefined) {
  if (!fullName) return "";
  const parts = fullName.trim().split(" ");
  return parts[parts.length - 1];
}

export default function AccountMenu({ fullName, onLogout }: { fullName?: string; onLogout: () => void }) {
  const { pathname } = useLocation();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  useDismiss(rootRef, open, close);
  useEffect(close, [pathname, close]);

  return (
    <div className={`account-menu${open ? " is-open" : ""}`} ref={rootRef}>
      <button
        type="button"
        className="account-menu__trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="account-menu-list"
        onClick={() => setOpen((value) => !value)}
      >
        <span>Chào, {getLastName(fullName)}</span>
        <svg className="account-menu__chevron" viewBox="0 0 12 12" aria-hidden="true">
          <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
      <ul className="account-menu__list" id="account-menu-list" role="menu">
        {ACCOUNT_LINKS.map((link) => (
          <li key={link.to} role="none">
            <Link role="menuitem" to={link.to}>
              {link.label}
            </Link>
          </li>
        ))}
        <li role="none">
          <button
            type="button"
            role="menuitem"
            className="account-menu__logout"
            onClick={() => {
              close();
              onLogout();
            }}
          >
            Đăng xuất
          </button>
        </li>
      </ul>
    </div>
  );
}
