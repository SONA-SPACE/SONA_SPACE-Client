export type NavItem = {
  label: string;
  to: string;
  menu?: "categories" | "rooms";
  // Extra path prefixes that belong to this section (e.g. category pages under "Sản Phẩm").
  matches?: string[];
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Trang Chủ", to: "/" },
  { label: "Sản Phẩm", to: "/san-pham", menu: "categories", matches: ["/danh-muc"] },
  { label: "Không Gian", to: "/khong-gian", menu: "rooms" },
  { label: "Tin Tức", to: "/tin-tuc" },
  { label: "Về Chúng Tôi", to: "/lien-he" },
];

function startsWithSegment(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function isNavItemActive(item: NavItem, pathname: string): boolean {
  if (item.to === "/") return pathname === "/";
  return [item.to, ...(item.matches ?? [])].some((prefix) => startsWithSegment(pathname, prefix));
}
