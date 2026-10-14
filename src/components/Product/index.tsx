import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import type { Product } from "../../types";
import { removeFromWishlistService } from "../../services/wishlistService";
import { saveToOrCart } from "../../services/cartService";
import { convertToAdminApiUrl } from "../../utils/url";
import { getAuthToken } from "../../services/loginService";

const NEW_PRODUCT_DAYS = 3;

const formatPrice = (value: number): string =>
  Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");

const getDiscountPercent = (price: number, priceSale?: number): number => {
  // A sale price at or below 1.000đ, or not below the list price, is treated as no sale.
  if (priceSale === undefined || priceSale <= 1000 || priceSale >= price) return 0;
  return Math.round(((price - priceSale) / price) * 100);
};

const isRecent = (createdAt?: string) => {
  if (!createdAt) return false;
  const created = new Date(createdAt);
  const now = new Date();
  const threshold = new Date();
  threshold.setDate(now.getDate() - NEW_PRODUCT_DAYS);
  return created >= threshold && created <= now;
};

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 20.5s-7.5-4.6-9.3-9.2C1.6 8.4 3.3 5 6.6 4.6c2-.3 3.9.8 5.4 2.7 1.5-1.9 3.4-3 5.4-2.7 3.3.4 5 3.8 3.9 6.7-1.8 4.6-9.3 9.2-9.3 9.2Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const ProductComponent = ({ product }: { product: Product; slug: string }) => {
  const [wishlist, setWishlist] = useState<boolean>(product.isWishlist || false);
  const [pending, setPending] = useState(false);
  const navigate = useNavigate();
  const detailUrl = `/san-pham/${product.slug}`;

  useEffect(() => {
    setWishlist(product.isWishlist || false);
  }, [product.isWishlist]);

  useEffect(() => {
    const handleWishlistChange = (event: Event) => {
      const removedVariantId = (event as CustomEvent).detail?.variantId;

      if (removedVariantId !== undefined && removedVariantId === product.variant_id) {
        setWishlist(false);
        return;
      }

      // Without a detail payload, re-read the wishlist to learn this card's state
      const token = getAuthToken();
      if (!token) return;

      fetch(convertToAdminApiUrl(`/wishlists?status=1`), {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          setWishlist(data.some((item: { variant_id: number }) => item.variant_id === product.variant_id));
        })
        .catch((err) => {
          console.error("Lỗi khi kiểm tra wishlist:", err);
        });
    };

    window.addEventListener("wishlist-changed", handleWishlistChange);
    return () => window.removeEventListener("wishlist-changed", handleWishlistChange);
  }, [product.variant_id]);

  const addItemToWishlist = async () => {
    if (!getAuthToken()) {
      toast.warning("Vui lòng đăng nhập để thêm vào wishlist!", { position: "top-right", autoClose: 1000 });
      setTimeout(() => navigate("/dang-nhap"), 1000);
      return;
    }

    try {
      const response = await saveToOrCart({
        status: 1,
        cartItems: [{ variant_id: product.variant_id, quantity: 1 }],
      });

      if (response.success) {
        setWishlist(true);
        toast.success("Đã thêm vào wishlist!", { position: "top-right", autoClose: 2000 });
        window.dispatchEvent(new Event("wishlist-changed"));
      } else {
        toast.error("Thêm vào wishlist thất bại: " + response.message);
      }
    } catch (error) {
      console.error("Lỗi khi thêm vào wishlist:", error);
      toast.error("Có lỗi khi thêm vào wishlist.");
    }
  };

  const removeItemFromWishlist = async () => {
    try {
      if (!product.variant_id) {
        toast.error("Không tìm thấy ID sản phẩm trong wishlist.");
        return;
      }

      await removeFromWishlistService(product.variant_id);
      setWishlist(false);
      toast.success("Đã xóa khỏi wishlist!", { position: "top-right", autoClose: 2000 });
      window.dispatchEvent(new Event("wishlist-changed"));
    } catch (error) {
      console.error("Lỗi khi xoá khỏi wishlist:", error);
      toast.error("Có lỗi khi xoá khỏi wishlist.");
    }
  };

  const toggleWishlist = async () => {
    if (!product.variant_id || pending) return;
    setPending(true);
    try {
      if (wishlist) {
        await removeItemFromWishlist();
      } else {
        await addItemToWishlist();
      }
    } finally {
      setPending(false);
    }
  };

  const price = Number(product.price);
  const priceSale = product.priceSale !== undefined ? Number(product.priceSale) : undefined;
  const discountPercent = getDiscountPercent(price || 0, priceSale);
  const hasValidSale = discountPercent > 0;
  const isNew = isRecent(product.created_at);

  const findColorName = (hexColor: string): string =>
    product.variants?.find((v) => v.color_hex && v.color_hex.toLowerCase() === hexColor.toLowerCase())
      ?.color_name || "";

  const swatches = ((product.color_hex ? [product.color_hex] : product.colors) ?? []) as unknown as string[];

  return (
    <article className="product-tile" data-reveal>
      <div className="product-tile__media">
        <Link to={detailUrl} className="product-tile__image-link" tabIndex={-1} aria-hidden="true">
          <img
            src={product.image}
            alt=""
            width={480}
            height={480}
            loading="lazy"
            decoding="async"
          />
        </Link>

        {(isNew || hasValidSale) && (
          <div className="product-tile__badges">
            {isNew && <span className="product-tile__badge product-tile__badge--new">Mới</span>}
            {hasValidSale && (
              <span className="product-tile__badge product-tile__badge--sale">-{discountPercent}%</span>
            )}
          </div>
        )}

        <button
          type="button"
          className={`product-tile__wishlist${wishlist ? " is-active" : ""}`}
          onClick={toggleWishlist}
          aria-pressed={wishlist}
          aria-label={wishlist ? `Bỏ ${product.name} khỏi yêu thích` : `Thêm ${product.name} vào yêu thích`}
          disabled={pending}
        >
          <HeartIcon filled={wishlist} />
        </button>

        <span className="product-tile__quick" aria-hidden="true">
          Xem chi tiết
        </span>
      </div>

      <div className="product-tile__body">
        {product.category?.name && <p className="product-tile__category">{product.category.name}</p>}
        <h3 className="product-tile__name">
          <Link to={detailUrl} className="product-tile__link">
            {product.name}
          </Link>
        </h3>

        {swatches.length > 0 && (
          <ul className="product-tile__swatches" aria-label="Màu sắc">
            {swatches.map((color, index) => {
              const colorName =
                (product.color_hex as unknown as string) === color && product.color_name
                  ? product.color_name
                  : findColorName(color);
              return (
                <li key={`${color}-${index}`} title={colorName || undefined}>
                  <span style={{ backgroundColor: color }} />
                  {colorName && <span className="sr-only">{colorName}</span>}
                </li>
              );
            })}
          </ul>
        )}

        <p className="product-tile__price">
          {hasValidSale ? (
            <>
              <span className="product-tile__price-current">{formatPrice(priceSale!)} đ</span>
              <del className="product-tile__price-old">{formatPrice(price)} đ</del>
            </>
          ) : (
            <span className="product-tile__price-current">{formatPrice(price)} đ</span>
          )}
        </p>
      </div>
    </article>
  );
};

export default ProductComponent;
