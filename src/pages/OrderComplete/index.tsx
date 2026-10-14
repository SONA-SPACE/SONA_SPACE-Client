  import React, { useEffect, useState } from "react";
  import { Link, useParams } from "react-router-dom";
  import { getOrderByHash } from "../../services/ordersCompleteService";
  import { createOrderService } from "../../services/ordersService"; // ADD

  import { clearCartServiceid } from "../../services/cartService";
  import { EmptyState, SkeletonBlock } from "../../components/StateFeedback";
  interface OrderSummaryProps {
    orderId: string;
    orderDate: string;
    itemCount: number;
    total: number;
  }

  const OrderComplete: React.FC = () => {
    const { orderHash } = useParams(); // assuming route: /dat-hang-thanh-cong/:orderId
    const [orderSummary, setOrderSummary] = useState<OrderSummaryProps | null>(null);
    const [orderMissing, setOrderMissing] = useState(false);

    useEffect(() => {
      const saveOrderIfNeeded = async () => {
        const params = new URLSearchParams(window.location.search);
        const resultCode = params.get("resultCode");
        const momoOrderId = params.get("orderId");
        const momoOrderHash = params.get("requestId"); 

        if (resultCode === "0" && momoOrderId && momoOrderHash) {
          const data = JSON.parse(localStorage.getItem("pending_order_data") || "{}");

          if (!data?.order_id || data.order_id !== momoOrderHash) return;

          const res = await getOrderByHash(data.order_id);
          if (res?.success && res.order) {
            // console.log("Đơn đã tồn tại. Không cần tạo lại.");
            return;
          }

          const payload = {
            ...data,
            momo_transaction_code: momoOrderId,
            fromRedirect: true
          };

          try {
            const result = await createOrderService(payload);
            if (result?.success || result?.order_id) {
              // console.log("Đã tạo đơn hàng sau redirect MoMo");
              localStorage.removeItem("pending_order_data");
            }
          } catch (err) {
            console.error("Lỗi tạo đơn MoMo sau redirect:", err);
          }
        }
      };

      saveOrderIfNeeded();
    }, []);


    useEffect(() => {
      const fetchOrder = async () => {
        if (!orderHash) {
          setOrderMissing(true);
          return;
        }
        const res = await getOrderByHash(orderHash).catch(() => null);
        // console.log("Order data:", res);
        // console.log("Order hash:", orderHash);
        if (res?.success && res.order) {
          setOrderSummary({ 
            orderId: res.order.order_hash,
            orderDate: new Date(res.order.created_at).toLocaleString(),
            itemCount: res.order.total_quantity,
            total: res.order.order_total_final,
          });
        } else {
          setOrderMissing(true);
        }
      };

      fetchOrder();
    }, [orderHash]);

    // useEffect(() => {
    //   if (orderSummary) {
    //     clearCartService()
    //       .then(() => console.log("Đã xóa giỏ hàng sau khi thanh toán thành công"))
    //       .catch((err) => console.error("Lỗi khi xóa giỏ hàng:", err));
    //   }
    // }, [orderSummary]);

    useEffect(() => {
      const tryClearSelectedItems = async () => {
        const params = new URLSearchParams(window.location.search);
        const resultCode = params.get("resultCode");

        if (orderSummary && resultCode === "0") {
          const data = JSON.parse(localStorage.getItem("pending_order_data") || "{}");
          const selectedItemIds = data?.selectedItemIds || [];

          if (Array.isArray(selectedItemIds) && selectedItemIds.length > 0) {
            try {
              await clearCartServiceid(selectedItemIds);
              // console.log(" Đã xóa các sản phẩm đã chọn khỏi giỏ hàng (sau thanh toán MoMo)");
            } catch (err) {
              // console.error(" Lỗi khi xóa sản phẩm đã chọn:", err);
            }
          }

          // Cleanup localStorage
          localStorage.removeItem("pending_order_data");
        }
      };

      tryClearSelectedItems();
    }, [orderSummary]);



    const formatPrice = (price: number): string => {
      return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };
    if (orderMissing) {
      return (
        <div className="order-complete-state">
          <EmptyState
            title="Không tìm thấy đơn hàng"
            message="Liên kết đơn hàng không hợp lệ hoặc đã hết hạn. Bạn có thể xem lại đơn trong tài khoản."
            actionLabel="Xem đơn hàng của tôi"
            actionTo="/tai-khoan/don-hang"
            secondaryActionLabel="Tiếp tục mua sắm"
            secondaryActionTo="/san-pham"
          />
        </div>
      );
    }

    if (!orderSummary) {
      return (
        <div className="order-complete-state" role="status" aria-label="Đang tải thông tin đơn hàng">
          <SkeletonBlock width="min(480px, 100%)" height={220} />
        </div>
      );
    }

    return (
      <>
        <div className="order-Complete-context">
          <div className="order-Complete-text1">
            <img src="/images/Order-Completed/sonaspace.png" alt="" />
          </div>
          <div className="order-Complete-text2">
            <div className="Complete-text2-1">
              <h5>Cảm ơn bạn đã mua hàng</h5>
            </div>
            <div className="Complete-text2-2">
              <img src="/images/Order-Completed/Mahalo.png" alt="" />
            </div>
          </div>
          <div className="order-Complete-text3">
            <p className="text3-1">
              Bạn sẽ sớm nhận được email xác nhận với thông tin chi tiết về đơn hàng của bạn.
            </p>
            <p className="text3-2">
              Nếu không nhận được email, vui lòng kiểm tra thư mục thư rác hoặc liên hệ với chúng tôi.
            </p>
          </div>
        </div>

        <div className="Order-Complete-Bill">
          <div className="container">
            <div className="Order-complete-right">
              <div className="complete-right-bill">
                <h4>Tóm tắt đơn hàng</h4>
                <div className="complete-right-bill-voucher">
                  <span className="voucher1">Mã đơn hàng</span>
                  <span className="voucher2">{orderSummary.orderId}</span>
                </div>
                <div className="complete-right-bill-shipping">
                  <span className="shipping1">Thời gian thanh toán</span>
                  <span className="shipping2">{orderSummary.orderDate}</span>
                </div>
                <div className="complete-right-bill-discount">
                  <span className="discount1">Sản phẩm đã mua</span>
                  <span className="discount2">{orderSummary.itemCount} sản phẩm</span>
                </div>
                <div className="complete-right-bill-total">
                  <span className="total1">Tổng giá</span>
                  <span className="stotal2">{formatPrice(orderSummary.total)} đ</span>
                </div>
                <div className="complete-right-bill-button">
                  <Link to={`/chi-tiet-don-hang/${orderSummary.orderId}`}>
                    <button className="cart-button">Xem chi tiết đơn hàng</button>
                  </Link>
                </div>
              </div>
            </div>

            <div className="Order-complete-center">
              <span>
                Cảm ơn bạn đã mua sắm với chúng tôi! Nếu bạn có bất kỳ câu hỏi hoặc thắc mắc nào, vui lòng liên hệ:
              </span>
              <div className="center-text">
                <span>Email: sona.furniture@gmail.com</span>
                <span>Số điện thoại: 0900909090</span>
              </div>
            </div>
          </div>
        </div>

      </>
    );
  };

  export default OrderComplete;
