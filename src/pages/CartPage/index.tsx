import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GetInTouch from "../../components/getintouch";
import PolicyProduct from "../../components/Policy";
import { toast } from "react-toastify";
import {
  clearCartService,
  loadCartService,
  removeFromCartService,
  updateCartQuantityService,
} from "../../services/cartService";
import { validateCouponService } from "../../services/conpcodeService";
import PageHero from "../../components/PageHero";
import { getAuthToken } from "../../services/loginService";
import {
  EmptyState,
  InlineErrorState,
  PageSectionSkeleton,
  RetryState,
} from "../../components/StateFeedback";

interface CartItemProps {
  id: number;
  variant_id: string;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  color: string;
  quantity: number;
  category_name: string;
  availableStock: number;
}

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItemProps[]>([]);
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [isCheckingOut] = useState(false);
  const [isCartLoading, setIsCartLoading] = useState(true);
  const [cartError, setCartError] = useState<string | null>(null);
  const [promoInlineError, setPromoInlineError] = useState<string | null>(null);
  const [updatingItemIds, setUpdatingItemIds] = useState<number[]>([]);
  const [removingItemIds, setRemovingItemIds] = useState<number[]>([]);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [isDeleteAllConfirmOpen, setIsDeleteAllConfirmOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [cartSummary, setCartSummary] = useState({
    subtotal: 0,
    shipping: 30000,
    discount: 0,
    total: 0,
  });

  useEffect(() => {
    if (!isDeleteAllConfirmOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isDeletingAll) {
        setIsDeleteAllConfirmOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isDeleteAllConfirmOpen, isDeletingAll]);

  const recalculateSummary = (
    items: CartItemProps[],
    appliedDiscountAmount = 0
  ) => {
    const filteredItems = items.filter((item) => selectedItems.includes(item.id));

    const subtotal = filteredItems.reduce((total, item) => {
      const effectivePrice =
        item.oldPrice && item.oldPrice > 0 ? item.oldPrice : item.price;
      return total + effectivePrice * item.quantity;
    }, 0);

    const shipping = filteredItems.length > 0 ? 30000 : 0;
    const discount = appliedDiscountAmount;
    const total = subtotal + shipping - discount;

    setCartSummary({ subtotal, shipping, discount, total });
  };

  useEffect(() => {
    recalculateSummary(cartItems, appliedDiscount);
  }, [selectedItems, cartItems]);

  const loadWishlist = async () => {
    setIsCartLoading(true);
    setCartError(null);

    try {
      const { success, wishlistItems, message } = await loadCartService();

      if (success && wishlistItems) {
        const formattedItems = wishlistItems.map((item: any) => ({
          id: item.wishlist_id,
          variant_id: item.variant_id,
          name: item.product_name,
          price: item.price,
          oldPrice: item.price_sale || "",
          image: item.image?.split(",")[0] || "/images/default.jpg",
          color: item.color_hex || "#ccc",
          quantity: item.quantity,
          category_name: item.category_name || "Chưa phân loại",
          availableStock: item.variant_product_quantity || 0,
        }));

        setCartItems(formattedItems);
        recalculateSummary(formattedItems, appliedDiscount);
      } else {
        setCartItems([]);
        setSelectedItems([]);
        setCartError(message || "Không thể tải giỏ hàng. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Lỗi khi load cart:", error);
      setCartItems([]);
      setSelectedItems([]);
      setCartError("Không thể tải giỏ hàng. Vui lòng thử lại.");
    } finally {
      setIsCartLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const formatPrice = (price: number): string => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const updateQuantity = async (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    const currentItem = cartItems.find((item) => item.id === id);
    if (!currentItem) return;

    if (newQuantity > currentItem.availableStock) {
      toast.error("Sản phẩm không còn đủ tồn kho.");
      return;
    }

    setUpdatingItemIds((prev) => [...prev, id]);
    try {
      await updateCartQuantityService(id, newQuantity);
      setCartItems((prev) => {
        const updatedItems = prev.map((item) =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        );
        recalculateSummary(updatedItems, appliedDiscount);
        return updatedItems;
      });
      setUpdatingItemIds((prev) => prev.filter((itemId) => itemId !== id));
    } catch (error) {
      setUpdatingItemIds((prev) => prev.filter((itemId) => itemId !== id));
      console.error("Lỗi khi cập nhật số lượng:", error);
      toast.error("Không thể cập nhật số lượng. Vui lòng thử lại.");
    }
  };

  const removeItem = async (id: number) => {
    setRemovingItemIds((prev) => [...prev, id]);
    try {
      await removeFromCartService(id);
      const updatedItems = cartItems.filter((item) => item.id !== id);
      setCartItems(updatedItems);
      setSelectedItems((prev) => prev.filter((itemId) => itemId !== id));
      recalculateSummary(updatedItems, appliedDiscount);
      setRemovingItemIds((prev) => prev.filter((itemId) => itemId !== id));

      toast.success("Đã xóa sản phẩm khỏi giỏ hàng!");
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm:", error);
      toast.error("Không thể xóa sản phẩm. Vui lòng thử lại.");
    }
    setRemovingItemIds((prev) => prev.filter((itemId) => itemId !== id));
  };

  const handleDeleteAll = async () => {
    setIsDeletingAll(true);

    try {
      const result = await clearCartService();
      if (result.success !== false) {
        await loadWishlist();
        setIsDeleteAllConfirmOpen(false);
        toast.success("Đã xóa toàn bộ giỏ hàng!");
      } else {
        toast.error(result.message || "Không thể xóa giỏ hàng.");
      }
    } catch (error) {
      toast.error("Lỗi khi xóa giỏ hàng.");
    }
    setIsDeletingAll(false);
  };

  const handleApplyPromoCode = async () => {
    setPromoInlineError(null);
    if (selectedItems.length === 0) {
      setPromoInlineError("Vui lòng chọn sản phẩm trước khi áp dụng mã.");
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setPromoInlineError("Vui lòng đăng nhập để sử dụng mã giảm giá.");
      toast.error("Vui lòng đăng nhập để sử dụng mã giảm giá.");
      return;
    }

    if (!promoCodeInput.trim()) {
      setPromoInlineError("Vui lòng nhập mã giảm giá.");
      toast.error("Vui lòng nhập mã giảm giá.");
      return;
    }

    setIsApplyingPromo(true);
    try {
      const result = await validateCouponService(
        promoCodeInput,
        cartSummary.subtotal,
        token
      );

      if (result.success) {
        const { discount_type, value_price } = result.data.coupon;

        let discount_amount = 0;
        if (discount_type === "percentage") {
          discount_amount = Math.round(
            (cartSummary.subtotal * value_price) / 100
          );
        } else if (discount_type === "fixed") {
          discount_amount = Math.min(value_price, cartSummary.subtotal);
        }

        localStorage.setItem(
          "applycode",
          JSON.stringify({
            couponcode_id: result.data.coupon.couponcode_id,
            code: promoCodeInput,
            discount: discount_amount,
          })
        );

        setAppliedDiscount(discount_amount);
        setCartSummary((prev) => ({
          ...prev,
          discount: discount_amount,
          total: prev.subtotal + prev.shipping - discount_amount,
        }));
        recalculateSummary(cartItems, discount_amount);
        setPromoInlineError(null);
        toast.success("Mã giảm giá đã được áp dụng!");
      } else {
        toast.error(result.error || "Mã giảm giá không hợp lệ.");
      }
    } catch (error) {
      console.error("Lỗi khi kiểm tra mã giảm giá:", error);
      toast.error("Đã xảy ra lỗi khi áp dụng mã giảm giá.");
    }
    setIsApplyingPromo(false);
  };

  const handleSelectItem = (id: number, checked: boolean) => {
    setSelectedItems((prevSelected) => {
      if (checked) {
        return [...prevSelected, id];
      }

      return prevSelected.filter((itemId) => itemId !== id);
    });
  };

  useEffect(() => {
    localStorage.removeItem("applycode");
    setAppliedDiscount(0);
    setPromoCodeInput("");
  }, []);

  const formatPrice1 = (value: number | string): string => {
    if (!value) return "0";

    const cleaned = String(value).replace(/[^\d]/g, "");
    const result = Math.floor(Number(cleaned) / 100);

    return result.toLocaleString("vi-VN");
  };

  const selectedOutOfStockItems = cartItems.filter(
    (item) =>
      selectedItems.includes(item.id) && item.quantity > item.availableStock
  );
  const checkoutDisabled =
    isCheckingOut ||
    selectedItems.length === 0 ||
    selectedOutOfStockItems.length > 0;

  return (
    <>
      <div className="cart-page">
        <PageHero
          title="Giỏ hàng của bạn"
          breadcrumbs={[{ label: "Trang chủ", to: "/" }, { label: "Giỏ hàng" }]}
        />

        <section className="cart-content mt-94">
          <div className="container">
            <div className="page-title">
              <h2>Giỏ hàng</h2>
              <p className="items-count">{cartItems.length} sản phẩm</p>
            </div>

            {!isCartLoading && !cartError && cartItems.length > 0 ? (
              <div className="page-select">
                <button
                  className="selectt-1"
                  type="button"
                  onClick={() => setSelectedItems(cartItems.map((item) => item.id))}
                >
                  Chọn tất cả
                </button>
                <button
                  className="selectt-2"
                  type="button"
                  onClick={() => setSelectedItems([])}
                >
                  Bỏ chọn
                </button>
              </div>
            ) : null}

            {/* A guest is known at render time: show the sign-in prompt straight away instead of
                flashing the list skeleton first */}
            {!getAuthToken() ? (
              <EmptyState
                title="Đăng nhập để xem giỏ hàng"
                message="Giỏ hàng được lưu theo tài khoản, để bạn tiếp tục mua sắm trên mọi thiết bị."
                actionLabel="Đăng nhập"
                actionTo="/dang-nhap"
                secondaryActionLabel="Tiếp tục mua sắm"
                secondaryActionTo="/san-pham"
              />
            ) : isCartLoading ? (
              <PageSectionSkeleton variant="cart-list" count={3} />
            ) : cartError ? (
              <RetryState
                message={cartError}
                onRetry={loadWishlist}
                secondaryActionLabel="Tiếp tục mua sắm"
                secondaryActionTo="/san-pham"
              />
            ) : cartItems.length > 0 ? (
              <div className="cart-grid">
                <div className="cart-items">
                  {cartItems.map((item) => (
                    <div key={item.id} className="cart-item">
                      <div className="item-select">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          disabled={removingItemIds.includes(item.id)}
                          onChange={(e) =>
                            handleSelectItem(item.id, e.target.checked)
                          }
                        />
                      </div>

                      <div className="item-image">
                        <img src={item.image} alt={item.name} />
                      </div>

                      <div className="item-details">
                        <div className="item-info">
                          <h3 className="item-name">{item.name}</h3>
                          <div className="item-category">
                            Phân loại: {item.category_name}
                          </div>
                          <div className="item-color">
                            <span className="color-label">Màu:</span>
                            <span
                              className="color-dot"
                              style={{ backgroundColor: item.color }}
                            />
                          </div>
                        </div>
                        <div className="item-price">
                          {item.oldPrice &&
                          item.oldPrice < item.price &&
                          item.oldPrice > 0 ? (
                            <>
                              <div className="current-price">
                                {formatPrice1(item.oldPrice)} đ
                              </div>
                              <div className="old-price">
                                {formatPrice1(item.price)} đ
                              </div>
                            </>
                          ) : (
                            <div className="current-price">
                              {formatPrice1(item.price)} đ
                            </div>
                          )}
                        </div>

                        <div className="item-actions">
                          <div className="quantity-selector">
                            <button
                              className="quantity-btn decrease"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              disabled={
                                item.quantity <= 1 ||
                                updatingItemIds.includes(item.id) ||
                                removingItemIds.includes(item.id)
                              }
                            >
                              -
                            </button>
                            <input
                              type="text"
                              value={
                                updatingItemIds.includes(item.id)
                                  ? "..."
                                  : item.quantity
                              }
                              readOnly
                              className="quantity-input"
                            />
                            <button
                              className="quantity-btn increase"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              disabled={
                                item.quantity >= item.availableStock ||
                                updatingItemIds.includes(item.id) ||
                                removingItemIds.includes(item.id)
                              }
                            >
                              +
                            </button>
                          </div>
                          {item.quantity >= item.availableStock && (
                            <p className="cart-helper-text">Đã đạt tối đa tồn kho.</p>
                          )}
                          <button
                            className="remove-btn"
                            onClick={() => removeItem(item.id)}
                            disabled={removingItemIds.includes(item.id)}
                            aria-busy={removingItemIds.includes(item.id)}
                            aria-label="Xóa sản phẩm khỏi giỏ hàng"
                          >
                            <img src="/images/icons/trash.png" alt="" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    className="delete-all"
                    type="button"
                    onClick={() => setIsDeleteAllConfirmOpen(true)}
                    disabled={isDeletingAll}
                  >
                    Xóa toàn bộ
                  </button>
                  {selectedItems.length === 0 && (
                    <p className="cart-helper-text">Chọn ít nhất một sản phẩm để thanh toán.</p>
                  )}
                  {selectedOutOfStockItems.length > 0 && (
                    <p className="cart-helper-text error">Cập nhật số lượng trước khi thanh toán.</p>
                  )}
                </div>

                <div className="cart-summary">
                  <div className="summary-title">Đơn hàng</div>
                  <div className="summary-row">
                    <span className="label">Tổng tiền:</span>
                    <span className="value">
                      {formatPrice(cartSummary.subtotal)} đ
                    </span>
                  </div>
                  <div className="summary-row">
                    <span className="label">Vận chuyển:</span>
                    <span className="value">
                      {formatPrice(cartSummary.shipping)} đ
                    </span>
                  </div>
                  <div className="summary-row discount">
                    <span className="label">Giảm giá:</span>
                    <span className="value">
                      -{formatPrice(cartSummary.discount)} đ
                    </span>
                  </div>

                  <div className="summary-row promo-code">
                    <span className="label">Mã giảm giá:</span>
                    <div className="promo-input">
                      <input
                        type="text"
                        value={promoCodeInput}
                        onChange={(e) => {
                          setPromoCodeInput(e.target.value);
                          setPromoInlineError(null);
                        }}
                        placeholder="Nhập mã giảm giá"
                        disabled={selectedItems.length === 0 || isApplyingPromo}
                      />
                      <button
                        className="apply-btn"
                        onClick={handleApplyPromoCode}
                        disabled={selectedItems.length === 0 || isApplyingPromo}
                      >
                        Áp dụng
                      </button>
                    </div>
                    {selectedItems.length === 0 && (
                      <p className="cart-helper-text">Chọn sản phẩm để áp dụng mã.</p>
                    )}
                    {promoInlineError && (
                      <InlineErrorState
                        message={promoInlineError}
                        onRetry={handleApplyPromoCode}
                      />
                    )}
                  </div>
                  <div className="summary-total">
                    <span className="label">Tổng cộng</span>
                    <span className="value">
                      {formatPrice(cartSummary.total)} đ
                    </span>
                  </div>
                  <button
                    className="checkout-btn"
                    type="button"
                    disabled={checkoutDisabled}
                    onClick={(e) => {
                      e.preventDefault();
                      if (isCheckingOut) return;

                      if (selectedItems.length === 0) {
                        toast.error(
                          "Vui lòng chọn ít nhất một sản phẩm để thanh toán."
                        );
                        return;
                      }

                      const outOfStock = cartItems.filter(
                        (item) =>
                          selectedItems.includes(item.id) &&
                          item.quantity > item.availableStock
                      );

                      if (outOfStock.length > 0) {
                        toast.error("Sản phẩm đã hết hàng trong kho.");
                        return;
                      }
                      navigate("/thanh-toan", { state: { selectedItems } });
                    }}
                  >
                    Tiến hành thanh toán
                  </button>
                </div>
              </div>
            ) : (
              <EmptyState
                title="Giỏ hàng của bạn đang trống"
                message="Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm."
                actionLabel="Khám phá sản phẩm"
                actionTo="/san-pham"
              />
            )}
          </div>
        </section>

        <section className="policy-product mt-94">
          <PolicyProduct />
        </section>

        <section className="get-in-touch mt-94">
          <GetInTouch />
        </section>
      </div>
      {isDeleteAllConfirmOpen && (
        <div className="cart-confirm-overlay">
          <div
            className="cart-confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-confirm-title"
            aria-describedby="cart-confirm-description"
          >
            <h3 id="cart-confirm-title">Xác nhận xóa giỏ hàng</h3>
            <p id="cart-confirm-description">Thao tác này sẽ xóa toàn bộ sản phẩm trong giỏ hàng.</p>
            <div className="cart-confirm-actions">
              <button
                type="button"
                className="cart-confirm-secondary"
                onClick={() => setIsDeleteAllConfirmOpen(false)}
                disabled={isDeletingAll}
              >
                Hủy
              </button>
              <button
                type="button"
                className="cart-confirm-danger"
                onClick={handleDeleteAll}
                disabled={isDeletingAll}
              >
                {isDeletingAll ? "Đang xóa..." : "Xóa toàn bộ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CartPage;
