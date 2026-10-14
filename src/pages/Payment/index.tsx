import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getAuthToken } from "../../services/loginService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { loadCartService, clearCartServiceid } from "../../services/cartService";
import { createOrderService } from "../../services/ordersService";
import {
  EmptyState,
  InlineErrorState,
  PageSectionSkeleton,
  RetryState,
} from "../../components/StateFeedback";

interface OrderSummaryProps {
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
}

interface CartItemProps {
  id: number;
  variant_id: string;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  color: string;
  quantity: number;
  category: string;
}

const Payment: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [cartItems, setCartItems] = useState<CartItemProps[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("transfer");
  const [prevAddress, setPrevAddress] = useState("");
  const [prevPhone, setPrevPhone] = useState("");
  const [prevName, setPrevName] = useState("");
  const [prevEmail, setPrevEmail] = useState("");
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCartLoading, setIsCartLoading] = useState(true);
  const [cartLoadError, setCartLoadError] = useState<string | null>(null);
  const [checkoutInlineError, setCheckoutInlineError] = useState<string | null>(null);
  const [paymentReloadToken, setPaymentReloadToken] = useState(0);
  const location = useLocation();
  const selectedItems: number[] | undefined = location.state?.selectedItems;
  const [formErrors, setFormErrors] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
  });

  const validateForm = () => {
    const errors: any = {};

    if (!formData.fullName.trim()) {
      errors.fullName = "Họ và tên không được để trống.";
    }

    if (!formData.phone.trim()) {
      errors.phone = "Số điện thoại không được để trống.";
    } else if (!/^(0|\+84)[0-9]{9}$/.test(formData.phone.trim())) {
      errors.phone = "Số điện thoại không hợp lệ.";
    }

    if (!formData.email.trim()) {
      errors.email = "Email không được để trống.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email.trim())) {
      errors.email = "Email không hợp lệ.";
    }

    if (!formData.address.trim()) {
      errors.address = "Địa chỉ không được để trống.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateField = (name: string, value: string) => {
    let error = "";

    switch (name) {
      case "fullName":
        if (!value.trim()) {
          error = "Họ và tên không được để trống.";
        }
        break;
      case "phone":
        if (!value.trim()) {
          error = "Số điện thoại không được để trống.";
        } else if (!/^(0|\+84)[0-9]{9}$/.test(value.trim())) {
          error = "Số điện thoại không hợp lệ.";
        }
        break;
      case "email":
        if (!value.trim()) {
          error = "Email không được để trống.";
        } else if (!/\S+@\S+\.\S+/.test(value.trim())) {
          error = "Email không hợp lệ.";
        }
        break;
      case "address":
        if (!value.trim()) {
          error = "Địa chỉ không được để trống.";
        }
        break;
    }

    setFormErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const [orderSummary, setOrderSummary] = useState<OrderSummaryProps>({
    subtotal: 0,
    shipping: 30000,
    discount: 0,
    total: 30000,
  });

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    cardName: "",
    cardNumber: "",
    cvv: "",
    expiryDate: "",
    promoCode: "",
  });

  const formatPrice = (price: number): string =>
    price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handlePaymentMethodChange = (method: string) => {
    setPaymentMethod(method);
  };

  const showCheckoutError = (message: string) => {
    setCheckoutInlineError(message);
    toast.error(message, {
      position: "top-right",
      autoClose: 1800,
    });
  };

  const getOrderErrorMessage = (error: any) => {
    return (
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "Không thể xử lý đơn hàng. Vui lòng thử lại."
    );
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const resultCode = params.get("resultCode");
    const orderId = params.get("orderId");

    if (resultCode === "0" && orderId) {
      const pending = localStorage.getItem("pending_order_data");
      if (!pending) {
        showCheckoutError("Không tìm thấy đơn hàng chờ. Vui lòng đặt hàng lại.");
        navigate("/thanh-toan", { replace: true });
        return;
      }

      let parsed: any;
      try {
        parsed = JSON.parse(pending);
      } catch {
        localStorage.removeItem("pending_order_data");
        showCheckoutError("Dữ liệu thanh toán chờ không hợp lệ. Vui lòng đặt hàng lại.");
        navigate("/thanh-toan", { replace: true });
        return;
      }
      // console.log("Đang xóa cart với ID:", parsed.selectedItemIds);
      const confirmOrder = async () => {
        setIsLoading(true);
        try {
          const response = await createOrderService({
            ...parsed,
            order_status: "PAID",
            order_id: orderId,
          });

          await clearCartServiceid(parsed.selectedItemIds || []);
          localStorage.removeItem("pending_order_data");

          toast.success("🎉 Thanh toán thành công!");
          navigate(`/dat-hang-thanh-cong/${response.order_hash}`, { replace: true });
        } catch (error) {
          showCheckoutError(getOrderErrorMessage(error));
        } finally {
          setIsLoading(false);
        }
      };

      confirmOrder();
    }

    if (resultCode && resultCode !== "0") {
      localStorage.removeItem("pending_order_data");
      showCheckoutError("Giao dịch thất bại hoặc bị hủy. Đơn hàng chưa được xác nhận.");
      navigate("/thanh-toan", { replace: true });
    }
  }, []);

  useEffect(() => {
    if (user && isAuthenticated) {
      const defaultAddress = user.address || "";
      const defaultPhone = user.phone || "";
      const defaultName = user.full_name || "";
      const defaultEmail = user.email || "";

      setFormData((prev) => ({
        ...prev,
        fullName: defaultName,
        email: defaultEmail,
        phone: defaultPhone,
        address: defaultAddress,
      }));

      setPrevAddress(defaultAddress);
      setPrevPhone(defaultPhone);
      setPrevName(defaultName);
      setPrevEmail(defaultEmail);
    }
  }, [user, isAuthenticated]);

  useEffect(() => {
    const loadCartFromDatabase = async () => {
      setIsCartLoading(true);
      setCartLoadError(null);
      try {
        const { success, wishlistItems, message } = await loadCartService();
        if (success && wishlistItems) {
          const formatted = wishlistItems.map((item: any, index: number) => ({
            id: item.wishlist_id,
            variant_id: item.variant_id,
            name: item.product_name,
            price: item.price,
            oldPrice: item.price_sale && item.price_sale > 0 ? item.price_sale : null,

            image: item.image?.split(",")[0] || "/images/default.jpg",
            color: item.color_hex || "#ccc",
            quantity: item.quantity,
            category: item.category || "Chưa phân loại",
          }));
          // console.log(" Items để xóa:", cartItems.map(i => i.id));

          //  Chỉ giữ lại những item được chọn (nếu có selectedItems)
          const filteredItems = selectedItems?.length
            ? formatted.filter((item: any) => selectedItems.includes(item.id))
            : formatted;


          setCartItems(filteredItems);

          const subtotal = filteredItems.reduce(
            (total: number, item: CartItemProps) => {
              const unitPrice = item.oldPrice || item.price;
              return total + unitPrice * item.quantity;
            },
            0
          );


          const shipping = 30000;
          const stored = localStorage.getItem("applycode");
          let discount = 0;
          let code = "";

          if (stored) {
            const parsed = JSON.parse(stored);
            discount = parsed.discount || 0;
            code = parsed.code || "";
          }

          setPromoCodeInput(code);
          const total = subtotal + shipping - discount;
          setOrderSummary({ subtotal, shipping, discount, total });
        } else {
          setCartItems([]);
          setCartLoadError(message || "Không thể tải giỏ hàng để thanh toán.");
        }
      } catch (error) {
        console.error("Lỗi khi load giỏ hàng:", error);
        setCartItems([]);
        setCartLoadError("Không thể tải giỏ hàng để thanh toán. Vui lòng thử lại.");
      }
    };

    loadCartFromDatabase().finally(() => setIsCartLoading(false));
  }, [selectedItems, paymentReloadToken]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoading) return;

    if (!validateForm()) {
      showCheckoutError("Vui lòng kiểm tra lại thông tin giao hàng.");
      return;
    };

    if (cartItems.length === 0) {
      showCheckoutError("Giỏ hàng đang trống. Không thể thanh toán.");
      return;
    };
    if (!agreeToTerms) {
      showCheckoutError("Vui lòng đồng ý với điều khoản và điều kiện.");
      return;
    };

    setIsLoading(true);
    setCheckoutInlineError(null);

    const orderId = "SN" + Math.floor(10000000 + Math.random() * 90000000);
    const method =
      paymentMethod === "card" ? "MOMO" :
        paymentMethod === "VNpay" ? "VNPAY" : "COD";
    const appliedCode = JSON.parse(localStorage.getItem("applycode") || "{}");
    const selectedItemIdsForCheckout = selectedItems?.length
      ? selectedItems
      : cartItems.map((item) => item.id);
    try {
      const payload: any = {
        order_id: orderId,
        order_total: orderSummary.subtotal,
        order_total_final: orderSummary.total,
        order_status: "PENDING",
        method,
        couponcode_id: appliedCode?.couponcode_id || null,
        order_discount: orderSummary.discount || 0,
        shipping_fee: orderSummary.shipping || 0,
        amount: orderSummary.total,
        cart_items: cartItems.map(item => ({
          ...item,
          price: item.oldPrice || item.price
        })),

        fromRedirect: true
      };
      // console.log("Payload gửi lên:", payload);

      // console.log(" Coupon gửi đi:", appliedCode);

      if (formData.address.trim() !== prevAddress.trim()) {
        payload.order_address_new = formData.address.trim();
      }

      if (formData.phone.trim() !== prevPhone.trim()) {
        payload.order_number2 = formData.phone.trim();
      }

      if (formData.fullName.trim() !== prevName.trim()) {
        payload.order_name_new = formData.fullName.trim();
      }


      if (formData.email.trim() !== prevEmail.trim()) {
        payload.order_email_new = formData.email.trim();
      }

      const res = await createOrderService(payload);
      if (paymentMethod === "transfer" && !res?.order_id) {
        showCheckoutError("Không thể tạo đơn hàng. Vui lòng thử lại.");
        return;
      }
      if (res?.payUrl) {
        localStorage.setItem("pending_order_data", JSON.stringify({
          ...payload,
          selectedItemIds: selectedItemIdsForCheckout,
        }));

        window.location.href = res.payUrl;
        return;
      }
      // console.log("Response from createOrderService:", res);

      if (!res.payUrl) {
        await clearCartServiceid(selectedItemIdsForCheckout);
        localStorage.removeItem("applycode");
        localStorage.removeItem("pending_order_data");

        toast.success("🎉 Đặt hàng thành công. Đang chuyển hướng...", { autoClose: 2000 });
        setTimeout(() => {
          navigate(`/dat-hang-thanh-cong/${res.order_hash}`);
        }, 2000);
      } else {
        window.location.href = res.payUrl;
      }
    } catch (error) {
      showCheckoutError(getOrderErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };
  // --- Open API v2 (đặt trong Payment) ---
  const OPEN_API = "https://provinces.open-api.vn/api/v2/";
  type Province = { code: number; name: string };
  type Ward = { code: number; name: string; division_type?: string; codename?: string; province_code?: number };

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  // chọn trong modal (string cho chắc)
  const [provinceCode, setProvinceCode] = useState<string>('');
  const [wardCode, setWardCode] = useState<string>('');
  const [street, setStreet] = useState<string>('');

  // prefill ward sau khi wards load xong
  const [pendingWardCandidates, setPendingWardCandidates] = useState<string[]>([]);

  useEffect(() => {
    if (!showAddressModal) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowAddressModal(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [showAddressModal]);

  const vnNormalize = (s?: string) =>
    (s || "")
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d").replace(/Đ/g, "D")
      .toLowerCase().trim();

  const stripAdminWords = (s?: string) =>
    (vnNormalize(s) || "")
      .replace(/\./g, " ")
      .replace(/\b(tinh|thanh pho|tp|quan|qh|huyen|thi xa|tx|thi tran|tt)\b/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  // mở modal -> load provinces + tách địa chỉ hiện tại để prefill
  useEffect(() => {
    if (!showAddressModal) return;

    let abort = false;

    // 2.1) Prefill "thô" ngay lập tức để input không bị trống
    const addrStr = formData.address || "";
    if (addrStr) {
      const partsRough = addrStr.split(",").map(s => s.trim()).filter(Boolean);
      // đoán thô: street = tất cả trừ 2 phần cuối (thường là ward + province)
      const roughStreet = partsRough.length >= 3
        ? partsRough.slice(0, -2).join(", ")
        : partsRough[0] || "";
      setStreet(roughStreet);
    } else {
      setStreet("");
    }

    // 2.2) Tải provinces, rồi prefill "chuẩn"
    (async () => {
      try {
        const r = await fetch(`${OPEN_API}p`);
        const arr = await r.json();
        if (abort) return;

        const list: Province[] = Array.isArray(arr)
          ? arr.map((p: any) => ({ code: p.code, name: p.name }))
          : [];
        setProvinces(list);

        if (!addrStr) {
          setProvinceCode('');
          setWardCode('');
          setWards([]);
          return;
        }

        // tách chuẩn
        const parts = addrStr.split(",").map(s => s.trim()).filter(Boolean);
        if (!parts.length) {
          setProvinceCode('');
          setWardCode('');
          setWards([]);
          return;
        }

        // Tìm tỉnh theo so khớp "mềm"
        let pFound: Province | undefined;
        let provinceIndex = parts.length - 1;

        for (let i = parts.length - 1; i >= 0; i--) {
          const seg = parts[i];
          const match = list.find(p => {
            const a = stripAdminWords(p.name);
            const b = stripAdminWords(seg);
            return a === b || a.includes(b) || b.includes(a);
          });
          if (match) {
            pFound = match;
            provinceIndex = i;
            break;
          }
        }

        const beforeProvince = parts.slice(0, provinceIndex);
        // Lấy tối đa 3 khúc trước tỉnh để dò ward
        const wardCandidates = beforeProvince.slice(-3);

        // Street = phần còn lại trước wardCandidates
        const streetGuess =
          wardCandidates.length > 0
            ? beforeProvince.slice(0, -wardCandidates.length).join(", ")
            : beforeProvince.join(", ");

        // Fallback nếu streetGuess rỗng: giữ prefill "thô" ở trên
        if (streetGuess) setStreet(streetGuess);

        if (pFound) {
          setProvinceCode(String(pFound.code));
          // tạm lưu candidates vào state để lát nữa match với wards khi load xong
          setPendingWardCandidates(wardCandidates);
        } else {
          // Không đoán được tỉnh -> để user chọn lại nhưng vẫn giữ street
          setProvinceCode('');
          setWardCode('');
          setWards([]);
          setPendingWardCandidates([]);
        }
      } catch {
        setProvinces([]);
      }
    })();

    return () => { abort = true; };
  }, [showAddressModal]);

  useEffect(() => {
    if (!provinceCode) { setWards([]); setWardCode(''); return; }

    const ac = new AbortController();
    (async () => {
      try {
        const r = await fetch(`${OPEN_API}p/${provinceCode}?depth=2`, { signal: ac.signal });
        const data = await r.json();

        let list: Ward[] = Array.isArray(data?.wards) ? data.wards : [];

        // fallback nếu thiếu
        if ((!list || list.length === 0) && Array.isArray(data?.districts)) {
          const wardBatches = await Promise.all(
            data.districts.map((d: any) =>
              fetch(`${OPEN_API}d/${d.code}`, { signal: ac.signal })
                .then(x => x.json())
                .catch(() => null)
            )
          );
          list = wardBatches.flatMap((d: any) =>
            Array.isArray(d?.wards) ? d.wards : []
          );
        }

        list = list.filter(w => {
          const t = (w.division_type || '').toLowerCase();
          return t === 'phường' || t === 'xã' || t === 'thị trấn';
        });

        setWards(list);
        setWardCode(''); // reset khi đổi tỉnh; ward sẽ được set lại ở bước dưới nếu có candidates
      } catch {
        setWards([]); setWardCode('');
      }
    })();

    return () => ac.abort();
  }, [provinceCode]);

  useEffect(() => {
    if (!wards.length || !pendingWardCandidates.length) return;

    // Ưu tiên phần gần Tỉnh nhất (cuối mảng)
    let found: Ward | undefined;
    for (let i = pendingWardCandidates.length - 1; i >= 0; i--) {
      const cand = stripAdminWords(pendingWardCandidates[i]);
      found = wards.find(w => {
        const wn = stripAdminWords(w.name);
        return wn === cand || wn.includes(cand) || cand.includes(wn);
      });
      if (found) break;
    }

    if (found) setWardCode(String(found.code));
    setPendingWardCandidates([]); // dọn dẹp
  }, [wards, pendingWardCandidates]);

  // Save modal -> ghép địa chỉ lại và set vào form
  const handleSaveAddress = () => {
    const pName = provinces.find(p => String(p.code) === provinceCode)?.name;
    const wName = wards.find(w => String(w.code) === wardCode)?.name;
    const combined = [street.trim(), wName, pName].filter(Boolean).join(', ');
    setFormData(prev => ({ ...prev, address: combined }));
    validateField("address", combined);

    setShowAddressModal(false);
  };


  return (
    <>
      <div className="bill-payment">

        {/* Breadcrumb */}
        <div className="breadcrumb-container">
          <div className="container">
            <div className="breadcrumb">
              <Link to="/">Trang chủ</Link>
              <span>/</span>
              <span className="active">Thanh toán</span>
            </div>
          </div>
        </div>

        <div className="pay-cart">
          <div className="container">
            <h3>Thanh toán</h3>
          </div>
        </div>

        <div className="Pay-billment">
          <div className="container">
            {isCartLoading ? (
              <PageSectionSkeleton variant="cart-list" count={3} />
            ) : !getAuthToken() ? (
              <EmptyState
                title="Đăng nhập để thanh toán"
                message="Vui lòng đăng nhập để xem giỏ hàng và hoàn tất đơn hàng của bạn."
                actionLabel="Đăng nhập"
                actionTo="/dang-nhap"
                secondaryActionLabel="Quay lại giỏ hàng"
                secondaryActionTo="/gio-hang"
              />
            ) : cartLoadError ? (
              <RetryState
                message={cartLoadError}
                onRetry={() => setPaymentReloadToken((current) => current + 1)}
                secondaryActionLabel="Quay lại giỏ hàng"
                secondaryActionTo="/gio-hang"
              />
            ) : cartItems.length === 0 ? (
              <EmptyState
                title="Chưa có sản phẩm để thanh toán"
                message="Hãy chọn sản phẩm trong giỏ hàng trước khi tiếp tục thanh toán."
                actionLabel="Quay lại giỏ hàng"
                actionTo="/gio-hang"
                secondaryActionLabel="Khám phá sản phẩm"
                secondaryActionTo="/san-pham"
              />
            ) : (
            <div className="pay-info">
              <form onSubmit={handleSubmit} className="pay-info-left">
                <div className="info-left-title">
                  <h5>THÔNG TIN GIAO HÀNG</h5>
                </div>
                <div className="info-left-form">
                  <div className="form-info">
                    <label htmlFor="fullName" >Họ và tên</label><br />
                    <input type="text"
                      id="fullName"
                      name="fullName"
                      placeholder="Nhập họ và tên"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      onBlur={(e) => validateField("fullName", e.target.value)}
                      required />
                    {formErrors.fullName && <small className="text-error">{formErrors.fullName}  </small>}
                  </div>
                  <div className="form-info">
                    <label htmlFor="phone" >Số điện thoại</label><br />
                    <input type="tel"
                      id="phone"
                      name="phone"
                      placeholder="Nhập số điện thoại"
                      value={formData.phone}
                      onChange={handleInputChange}
                      onBlur={(e) => validateField("phone", e.target.value)}
                      required />
                    {formErrors.phone && <small className="text-error">{formErrors.phone}  </small>}
                  </div>
                  <div className="form-info">
                    <label htmlFor="email">Email</label><br />
                    <input type="email"
                      id="email"
                      name="email"
                      placeholder="Nhập email"
                      value={formData.email}
                      onChange={handleInputChange}
                      onBlur={(e) => validateField("email", e.target.value)}
                      required />
                    {formErrors.email && <small className="text-error">{formErrors.email}  </small>}
                  </div>
                  <div className="form-info">
                    <label htmlFor="address">Địa chỉ</label><br />
                    <div className="address-input-wrapper">
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        readOnly
                        placeholder="Nhập địa chỉ"
                        onClick={() => setShowAddressModal(true)}
                        onBlur={(e) => validateField("address", e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="edit-addr-btn"
                        aria-label="Chỉnh sửa địa chỉ"
                        onClick={() => setShowAddressModal(true)}
                        title="Chỉnh sửa địa chỉ"
                      >
                        {/* Pencil (feather-like) */}
                        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"
                          width="18" height="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12.3 5.3l6.4 6.4M4 20l4.5-1 10.8-10.8a2 2 0 0 0 0-2.8l-1.7-1.7a2 2 0 0 0-2.8 0L4 15.2V20z" />
                        </svg>
                      </button>

                    </div>
                    {formErrors.address && <small className="text-error">{formErrors.address}</small>}
                  </div>

                </div>


                <div className="info-left-title-2">
                  <h5>PHƯƠNG THỨC THANH TOÁN</h5>
                  <div className={`payment-option ${paymentMethod === 'transfer' ? 'active' : ''}`}>
                    <div className="method-option">
                      <input
                        className="input-radio"
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'transfer'}
                        onChange={() => handlePaymentMethodChange('transfer')}
                      />
                      <img src="/images/icons/cod.svg" alt="" width={30} height={30} />
                      <span className="radio-label">Thanh toán khi nhận hàng</span>
                    </div>
                  </div>
                  <div className={`payment-option ${paymentMethod === 'card' ? 'active' : ''}`}>
                    <div className="method-option">
                      <input
                        className="input-radio"
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'card'}
                        onChange={() => handlePaymentMethodChange('card')}
                      />
                      <img src="/images/icons/momo.svg" alt="" width={30} height={30} />
                      <span className="radio-label">Thanh toán qua ví momo</span>
                    </div>
                  </div>
                </div>
                <div className="info-left-clause">
                  <input type="checkbox" id="clause" checked={agreeToTerms} onChange={(e) => setAgreeToTerms(e.target.checked)} required />
                  <span>Tôi đồng ý với <Link to={`/dieu-khoan-su-dung`}>điều khoản và điều kiện</Link> của SONA SPACE</span>
                </div>

              </form>
              <div className="cart-summary">
                <div className="summary-title">Đơn hàng</div>
                <div className="summary-row">
                  <span className="label">Tổng tiền:</span>
                  <span className="value">
                    {formatPrice(orderSummary.subtotal)} đ
                  </span>
                </div>
                <div className="summary-row">
                  <span className="label">Vận chuyển:</span>
                  <span className="value">
                    {formatPrice(orderSummary.shipping)} đ
                  </span>
                </div>
                <div className="summary-row discount">
                  <span className="label">Giảm giá:</span>
                  <span className="value">-{formatPrice(orderSummary.discount)} đ</span>
                </div>
                <div className="summary-row promo-code">
                  <span className="label">Mã giảm giá:</span>
                  <div className="promo-input">
                    <input
                      type="text"
                      value={promoCodeInput}
                      readOnly
                      placeholder="Chưa áp dụng mã"
                    />
                    {/* <button className="apply-btn" >Áp dụng</button> */}
                  </div>
                </div>

                <div className="summary-total">
                  <span className="label">Tổng cộng</span>
                  <span className="value">
                    {formatPrice(orderSummary.total)} đ
                  </span>
                </div>
                {checkoutInlineError && (
                  <InlineErrorState message={checkoutInlineError} />
                )}
                <button
                  type="button"
                  className={`checkout-btn ${isLoading ? "loading" : ""}`}
                  onClick={handleSubmit}
                  disabled={isLoading || cartItems.length === 0}
                  aria-busy={isLoading}
                >
                  {isLoading ? "Đang xử lý..." : "Tiến hành thanh toán"}
                </button>
              </div>


            </div>
            )}

          </div>
        </div>
      </div>
      {isLoading && (
        <div className="fullscreen-loading">
          <div className="spinner" />
        </div>
      )}

      {showAddressModal && (
        <div className="address-edit-overlay" onClick={() => setShowAddressModal(false)}>
          <div
            className="address-edit-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="address-edit-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aem-header">
              <h3 id="address-edit-title">Cập nhật địa chỉ giao hàng</h3>
              <button
                type="button"
                className="aem-close"
                onClick={() => setShowAddressModal(false)}
                aria-label="Đóng hộp thoại địa chỉ"
              >
                ×
              </button>
            </div>

            <div className="aem-body">
              <div className="form-row">
                <label htmlFor="address-province">Tỉnh/Thành phố</label>
                <select
                  id="address-province"
                  value={provinceCode}
                  onChange={e => setProvinceCode(e.target.value)}
                  className="select-field"
                >
                  <option value="">-- Chọn Tỉnh/Thành --</option>
                  {provinces.map(p => (
                    <option key={p.code} value={p.code}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <label htmlFor="address-ward">Phường/Xã</label>
                <select
                  id="address-ward"
                  value={wardCode}
                  onChange={e => setWardCode(e.target.value)}
                  disabled={!provinceCode}
                  className="select-field"
                >
                  <option value="">-- Chọn Phường/Xã --</option>
                  {wards.map(w => (
                    <option key={w.code} value={w.code}>{w.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <label htmlFor="address-street">Số nhà, Tên đường</label>
                <input
                  id="address-street"
                  type="text"
                  value={street}
                  onChange={e => setStreet(e.target.value)}
                  placeholder="VD: 123 Lê Lợi"
                />
              </div>
            </div>

            <div className="aem-footer">
              <button type="button" className="btn-secondary" onClick={() => setShowAddressModal(false)}>Hủy</button>
              <button type="button" className="btn-primary" onClick={handleSaveAddress}>Lưu</button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer position="top-right"
        autoClose={3000}
        style={{ marginTop: "100px" }} />
    </>
  );
};

export default Payment;
