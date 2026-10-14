import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { convertToAdminApiUrl } from "../../utils/url";

const PaymentResult: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Đang xử lý kết quả thanh toán...");

  useEffect(() => {
    const processPaymentResult = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const resultCode = searchParams.get("resultCode");
      const orderInfo = searchParams.get("orderInfo"); 
      const orderHash =
        searchParams.get("orderHash") ||
        orderInfo?.split("#")[1] ||
        "";

      if (resultCode === "0" && orderHash) {
        try {
          setMessage("Đang xác minh đơn hàng...");
          const res = await axios.get(convertToAdminApiUrl(`/orders/hash/${orderHash}`));

          if (res.data.success && res.data.order) {
            localStorage.removeItem("pending_order_data");
            localStorage.removeItem("applycode");
            setMessage("Thanh toán thành công. Đang chuyển đến trang đơn hàng...");
            navigate(`/dat-hang-thanh-cong/${orderHash}`, { replace: true });
          } else {
            localStorage.removeItem("pending_order_data");
            setMessage("Không tìm thấy đơn hàng đã thanh toán. Vui lòng thử lại.");
            navigate("/thanh-toan", { replace: true });
          }
        } catch (error) {
          console.error("Lỗi khi xác minh đơn hàng:", error);
          setMessage("Không thể xác minh thanh toán. Vui lòng thử lại.");
          navigate("/thanh-toan", { replace: true });
        }
      } else {
        localStorage.removeItem("pending_order_data");
        setMessage("Giao dịch thất bại hoặc bị hủy. Vui lòng thử lại.");
        navigate("/thanh-toan", { replace: true });
      }

      setLoading(false);
    };

    processPaymentResult();
  }, [navigate]);

  return (
    <main style={{ padding: "96px 24px", textAlign: "center" }} role="status">
      <p>{loading ? message : "Đang chuyển hướng..."}</p>
    </main>
  );
};

export default PaymentResult;
