import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Link } from 'react-router-dom';
import { loadCartService, removeFromCartService } from '../../services/cartService';

interface CartItem {
  id: number;
  name: string;
  price: number;
  priceSale?: number;
  quantity: number;
  color: string;
  image: string;
}
interface MiniCartProps {
  userId?: number;
  onCartUpdated?: (count: number) => void;
}

export interface MiniCartHandle {
  toggleMiniCart: () => void;
  closeMiniCart: () => void;
  isVisible: boolean;
  refreshCart: () => void;
  notifyCartChanged: (newItem?: CartItem) => void;
  getCartCount: () => number;
}

const MiniCart = forwardRef<MiniCartHandle, MiniCartProps>(({ userId, onCartUpdated }, ref) => {
  const [isVisible, setIsVisible] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartChanged, setCartChanged] = useState(false);

  useEffect(() => {
    refreshCart();
  }, []);




  useEffect(() => {
    if (isVisible) {
      refreshCart();
    }
  }, [isVisible]);
  useEffect(() => {
    if (!isVisible) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsVisible(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isVisible]);
  useEffect(() => {
    const count = cartItems.reduce((total, item) => total + item.quantity, 0);
    onCartUpdated?.(count);
  }, [cartItems]);



  const refreshCart = async () => {
    try {
      const { success, wishlistItems } = await loadCartService();
      if (success && wishlistItems) {
        const formatted = wishlistItems.map((item: any, index: number) => ({
          id: item.wishlist_id || index,
          name: item.product_name,
          price: item.price,
          priceSale: item.price_sale,
          quantity: item.quantity,
          color: item.color_hex || '',
          image: item.image?.split(',')[0] || '/images/default.jpg',
        }));
        setCartItems(formatted);
        console.log("Đã tải MiniCart:", formatted);
      }
    } catch (error) {
      console.error("Lỗi khi tải MiniCart:", error);
    }
  };


  useImperativeHandle(ref, () => ({
    toggleMiniCart: () => setIsVisible((prev) => !prev),
    closeMiniCart: () => setIsVisible(false),
    isVisible,
    refreshCart,
    notifyCartChanged: async () => {
      await refreshCart();
      // setIsVisible(true);
    },
    getCartCount: () =>
      cartItems.reduce((total, item) => total + item.quantity, 0),
  }));


  const removeItem = async (id: number) => {
    try {
      await removeFromCartService(id);
      // await refreshCart();
      const updatedItems = cartItems.filter((item) => item.id !== id);
      setCartItems(updatedItems);

    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm:", error);
    }
  };


  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    })
      .format(price)
      .replace("₫", "đ");

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div
      className={`mini-cart ${isVisible ? "show" : ""}`}
      id="mini-cart-panel"
      role="dialog"
      aria-modal="false"
      aria-label="Giỏ hàng thu gọn"
    >
      <div className="mini-cart-content">
        <div className="mini-cart-header">
          <h3>Giỏ hàng của bạn ({cartItems.length})</h3>
          <button
            className="close-mini-cart"
            type="button"
            aria-label="Đóng giỏ hàng thu gọn"
            onClick={() => setIsVisible(false)}
          >
            <img src="/images/icons/close.svg" alt="Đóng" />
          </button>
        </div>

        <div className="mini-cart-items">
          {cartItems.length > 0 ? (
            cartItems.map(item => (
              <div key={item.id} className="mini-cart-item">
                <div className="item-image">
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="item-info">
                  <h4 className="item-name">{item.name}</h4>
                  <div className="item-details">
                    <div className="items-tt">
                      <div className="item-coloss">
                        <span>Màu:</span>
                        <div
                          className="item-color"
                          style={{ backgroundColor: item.color }}
                        ></div>
                      </div>
                      <div className="item-quantity">
                        <span>SL: {item.quantity}</span>
                      </div>
                    </div>
                    <div className="item-remove" onClick={() => removeItem(item.id)} title='Xóa sản phẩm'>
                      <img src="/images/icons/close.svg" alt="Xóa" />
                    </div>
                  </div>

                  <div className="item-price">
                    {Number(item.priceSale) > 0 && Number(item.priceSale) < Number(item.price)
                      ? formatPrice(Number(item.priceSale))
                      : formatPrice(Number(item.price))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-cart">
              <div className="empty-cart-icon">
                <img src="/images/icons/handbag.svg" alt="Giỏ hàng trống" />
              </div>
              <p>Giỏ hàng của bạn đang trống</p>
              <Link to="/san-pham" className="btn-browse">
                Mua sắm ngay
              </Link>
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="mini-cart-footer">
            <div className="mini-cart-total">
              <span>Tổng tiền:</span>
              <span className="total-amount">{formatPrice(totalAmount)}</span>
            </div>
            <div className="mini-cart-actions">
              <Link to="/gio-hang" className="view-cart-btn">
                Xem giỏ hàng
              </Link>
              <Link to="/gio-hang" className="checkout-btn">
                Thanh toán
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default MiniCart;
