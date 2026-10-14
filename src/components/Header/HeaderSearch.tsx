import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { convertToAdminApiUrl } from "../../utils/url";
import { useDismiss } from "../../hooks/useDismiss";
import type { HeaderCatalog } from "./useHeaderCatalog";

type SearchProduct = { id: number; name: string; slug: string; image?: string; price?: number | string };

const SEARCH_DELAY_MS = 250;

async function fetchJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(convertToAdminApiUrl(path), { signal });
  return response.json();
}

function formatPrice(price: SearchProduct["price"]) {
  return price ? Number(price).toLocaleString("vi-VN", { style: "currency", currency: "VND" }) : "";
}

export default function HeaderSearch({ catalog }: { catalog: HeaderCatalog }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<SearchProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [latest, setLatest] = useState<SearchProduct[] | null>(null);

  const close = useCallback(() => setOpen(false), []);
  useDismiss(rootRef, open, close);

  useEffect(close, [pathname, close]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    if (latest === null) {
      fetchJson<SearchProduct[]>("/products/newest?limit=6")
        .then((data) => setLatest(Array.isArray(data) ? data : []))
        .catch(() => setLatest([]));
    }
  }, [open, latest]);

  const query = term.trim();

  useEffect(() => {
    if (!query) {
      setResults([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    const timer = window.setTimeout(() => {
      fetchJson<{ results?: SearchProduct[] }>(
        `/products/search?q=${encodeURIComponent(query)}`,
        controller.signal
      )
        .then((data) => setResults(data.results ?? []))
        .catch((error) => {
          if (error.name !== "AbortError") setResults([]);
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, SEARCH_DELAY_MS);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const suggestions = (query && results.length > 0 ? results : latest ?? []).slice(0, 5);

  return (
    <div className={`header-search${open ? " is-open" : ""}`} ref={rootRef}>
      <button
        type="button"
        className="btn-icon search-btn"
        aria-label={open ? "Đóng tìm kiếm" : "Mở tìm kiếm sản phẩm"}
        aria-expanded={open}
        aria-controls="header-search-panel"
        onClick={() => setOpen((value) => !value)}
      >
        <img src="/images/icons/magnifier.svg" alt="" />
      </button>

      <div className="header-search__panel" id="header-search-panel" role="dialog" aria-label="Tìm kiếm sản phẩm">
        <div className="container">
          <form
            className="header-search__field"
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
              if (results[0]) navigate(`/san-pham/${encodeURIComponent(results[0].slug)}`);
            }}
          >
            <img src="/images/icons/magnifier-gray.svg" alt="" />
            <input
              ref={inputRef}
              type="search"
              placeholder="Tìm kiếm sản phẩm"
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              aria-label="Tìm kiếm sản phẩm"
            />
          </form>

          <div className="header-search__body">
            <aside className="header-search__aside">
              <p className="header-search__heading">{query ? "Gợi ý" : "Sản phẩm mới"}</p>
              <ul className="header-search__links">
                {suggestions.map((product) =>
                  query ? (
                    <li key={product.id}>
                      <button type="button" onClick={() => setTerm(product.name)}>
                        {product.name}
                      </button>
                    </li>
                  ) : (
                    <li key={product.id}>
                      <Link to={`/san-pham/${encodeURIComponent(product.slug)}`}>{product.name}</Link>
                    </li>
                  )
                )}
              </ul>
            </aside>

            <div className="header-search__main">
              {query ? (
                <>
                  <p className="header-search__heading">Kết quả tìm kiếm</p>
                  {loading ? (
                    <p className="header-search__status">Đang tìm kiếm...</p>
                  ) : results.length === 0 ? (
                    <p className="header-search__status">Không tìm thấy sản phẩm phù hợp.</p>
                  ) : (
                    <div className="header-search__grid">
                      {results.slice(0, 10).map((product) => (
                        <Link key={product.id} to={`/san-pham/${product.slug}`} className="header-search__card">
                          <span className="header-search__media">
                            {product.image && <img src={product.image} alt="" loading="lazy" />}
                          </span>
                          <span className="header-search__name">{product.name}</span>
                          <span className="header-search__price">{formatPrice(product.price)}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <p className="header-search__heading">Danh mục sản phẩm</p>
                  <div className="header-search__grid">
                    {catalog.categories.slice(0, 5).map((category) => (
                      <Link
                        key={category.category_id}
                        to={`/danh-muc/${category.slug}`}
                        className="header-search__card"
                      >
                        <span className="header-search__media">
                          <img src={category.category_image} alt="" loading="lazy" />
                        </span>
                        <span className="header-search__name">{category.category_name}</span>
                      </Link>
                    ))}
                  </div>
                  <p className="header-search__heading">Không gian</p>
                  <div className="header-search__grid">
                    {catalog.rooms.slice(0, 5).map((room) => (
                      <Link key={room.room_id} to={`/khong-gian/${room.slug}`} className="header-search__card">
                        <span className="header-search__media">
                          <img src={room.room_image} alt="" loading="lazy" />
                        </span>
                        <span className="header-search__name">{room.room_name}</span>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
