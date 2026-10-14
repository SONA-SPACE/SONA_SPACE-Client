import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import type { ContactFormDesign, Room } from "../../types";
import {
  sendContactFormDesignService,
  validateFormContactDesign,
} from "../../services/contactService";
import { fetchRoomSimilar } from "../../services/roomService";
import Showcase from "../../components/ShowCase/ShowCase";

const CUSTOM_ROOM = "__custom";

const initialFormData: ContactFormDesign = {
  name: "",
  email: "",
  phone: "",
  room_name: "",
  custom_room_name: "",
  design_description: "",
  require_design: "",
  style_design: "",
  budget: "",
  different_information: "",
};

const STATS = [
  { value: "400+", label: "Dự án đã hoàn thành" },
  { value: "200+", label: "Khách hàng hài lòng" },
  { value: "100+", label: "Phong cách thiết kế" },
];

const SERVICES = [
  {
    title: "Lighting Design",
    icon: "/images/ContactFormDesign/Lightingdesignicon.jpg",
    body: "Thiết kế ánh sáng cho không gian sống của bạn, phối hợp ánh sáng tự nhiên và bổ sung nhân tạo.",
  },
  {
    title: "Interior Design",
    icon: "/images/ContactFormDesign/Interiordesignicon.jpg",
    body: "Kiến tạo nội thất hài hòa thẩm mỹ và công năng, mỗi không gian kể câu chuyện sống của bạn.",
  },
  {
    title: "Outdoor Design",
    icon: "/images/ContactFormDesign/Outdoordesignicon.jpg",
    body: "Biến không gian ngoài vườn thành nơi thư giãn và nghỉ ngơi, sống xanh theo phong cách của bạn.",
  },
];

const PROCESS = [
  {
    title: "Tiếp nhận yêu cầu",
    body: "Trong 24 giờ làm việc, đội ngũ liên hệ xác nhận nhu cầu và gợi ý phong cách phù hợp.",
  },
  {
    title: "Chốt lịch khảo sát",
    body: "Thống nhất địa chỉ, ngày giờ khảo sát và gửi checklist những gì cần chuẩn bị.",
  },
  {
    title: "Khảo sát hiện trạng",
    body: "Đo đạc, chụp ảnh, ghi nhận điện nước và kết cấu; lập mặt bằng hiện trạng 2D.",
  },
  {
    title: "Concept & wireframe",
    body: "Xây dựng moodboard và bố trí 2D sơ bộ, chỉnh sửa cùng bạn tới khi ưng ý.",
  },
  {
    title: "Bàn giao & quyết toán",
    body: "Bàn giao file CAD, PDF, ảnh 3D, bảng khối lượng và báo giá thi công.",
  },
];

const TERMS = [
  {
    title: "Thanh toán theo tiến độ",
    body: "Chi phí thiết kế được chia theo từng giai đoạn: bạn thanh toán khi đã duyệt ý tưởng, phần còn lại khi nhận đủ hồ sơ.",
  },
  {
    title: "Chỉnh sửa đến khi ưng ý",
    body: "Ở giai đoạn ý tưởng, nhà thiết kế điều chỉnh cùng bạn qua từng vòng góp ý. Mọi thay đổi sau khi chốt hồ sơ đều được trao đổi rõ trước khi thực hiện.",
  },
];

const BUDGETS = [
  { value: "30000000", label: "Dưới 30 triệu" },
  { value: "50000000", label: "30 - 50 triệu" },
  { value: "100000000", label: "50 - 100 triệu" },
  { value: "200000000", label: "100 - 200 triệu" },
  { value: "300000000", label: "Trên 200 triệu" },
];

const ArrowIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
    <path d="M5 12h13M13 6l6 6-6 6" />
  </svg>
);

const ContactFormDesignPage: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormDesign>(initialFormData);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchRoomSimilar().then(setRooms);
  }, []);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = event.target;
    if (type === "checkbox") {
      setAgreeToTerms((event.target as HTMLInputElement).checked);
    } else {
      setFormData((current) => ({ ...current, [name]: value }));
    }
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateFormContactDesign({ ...formData, agreeToTerms });
    if (!agreeToTerms)
      nextErrors.agreeToTerms = "Bạn phải đồng ý với điều khoản và chính sách";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error("Vui lòng kiểm tra lại thông tin đã nhập.");
      return;
    }

    const { custom_room_name, ...rest } = formData;
    const payload = {
      ...rest,
      room_name:
        formData.room_name === CUSTOM_ROOM
          ? custom_room_name || ""
          : formData.room_name,
    };

    setIsLoading(true);
    try {
      const response = await sendContactFormDesignService(payload);
      if (response) {
        toast.success(
          "Cảm ơn bạn đã gửi yêu cầu. Chúng tôi sẽ liên hệ với bạn sớm nhất có thể!",
        );
        setFormData(initialFormData);
        setAgreeToTerms(false);
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error ||
          error?.message ||
          "Gửi yêu cầu thất bại",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fieldError = (name: string) =>
    errors[name] ? <p className="design-form__error">{errors[name]}</p> : null;

  return (
    <div className="design-service-page">
      <section className="design-hero" aria-labelledby="design-hero-title">
        <div className="container design-hero__inner">
          <div className="design-hero__copy">
            <p className="design-eyebrow">Dịch vụ thiết kế nội thất</p>
            <h1 id="design-hero-title">
              Thiết kế không gian sống theo đúng cách bạn sống
            </h1>
            <p className="design-hero__lead">
              Kết nối với nhà thiết kế phù hợp, cùng tạo nên không gian vừa đáp
              ứng công năng vừa có tính thẩm mỹ cao.
            </p>
            <div className="design-hero__actions">
              <a
                className="design-button design-button--primary"
                href="#design-form"
              >
                Đặt lịch tư vấn <ArrowIcon />
              </a>
              <a
                className="design-button design-button--ghost"
                href="#design-process"
              >
                Xem quy trình
              </a>
            </div>
            <dl className="design-hero__stats">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <dt>{stat.label}</dt>
                  <dd>{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="design-hero__media">
            <img
              src="/images/ContactFormDesign/connect_01.jpg"
              alt="Phòng ăn, phòng ngủ và phòng khách do SONA SPACE thiết kế"
              width={2880}
              height={1632}
              fetchPriority="high"
              decoding="async"
            />
          </div>
        </div>
      </section>

      <section
        className="design-services"
        aria-labelledby="design-services-title"
      >
        <div className="container">
          <p className="design-eyebrow">Dịch vụ</p>
          <h2 id="design-services-title">Dịch vụ của chúng tôi</h2>
          <div className="design-services__grid">
            {SERVICES.map((service) => (
              <article
                className="design-service-card"
                key={service.title}
                data-reveal
              >
                <div className="design-service-card__icon">
                  <img
                    src={service.icon}
                    alt=""
                    width={64}
                    height={64}
                    loading="lazy"
                  />
                </div>
                <div className="design-service-card__body">
                  <h3>{service.title}</h3>
                  <p>{service.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className="design-process"
        id="design-process"
        aria-labelledby="design-process-title"
      >
        <div className="container">
          <p className="design-eyebrow">Quy trình</p>
          <h2 id="design-process-title">
            5 bước từ ý tưởng tới hồ sơ thiết kế
          </h2>
          <ol className="design-process__list">
            {PROCESS.map((step, index) => (
              <li className="design-process__step" key={step.title} data-reveal>
                <span className="design-process__dot" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="design-terms" aria-label="Thanh toán và chỉnh sửa">
        <div className="container design-terms__grid">
          {TERMS.map((term) => (
            <article className="design-term" key={term.title} data-reveal>
              <h3>{term.title}</h3>
              <p>{term.body}</p>
            </article>
          ))}
        </div>
      </section>

      <Showcase categoryName="tu-van-va-thiet-ke" hideWhenEmpty />

      <section
        className="design-cta"
        id="design-form"
        aria-labelledby="design-form-title"
      >
        <div className="container design-cta__inner">
          <div className="design-cta__intro">
            <p className="design-eyebrow">Bắt đầu dự án</p>
            <h2 id="design-form-title">Bắt đầu hành trình thiết kế của bạn</h2>
            <p>
              Cho chúng tôi biết về dự án, đội ngũ thiết kế sẽ liên hệ để thảo
              luận chi tiết và giúp bạn tạo nên không gian sống lý tưởng.
            </p>
          </div>

          <form className="design-form" onSubmit={handleSubmit} noValidate>
            <div className="design-form__row">
              <div className="design-form__field">
                <label htmlFor="name">Họ và tên *</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                />
                {fieldError("name")}
              </div>
              <div className="design-form__field">
                <label htmlFor="phone">Số điện thoại *</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={handleChange}
                />
                {fieldError("phone")}
              </div>
            </div>

            <div className="design-form__row">
              <div className="design-form__field">
                <label htmlFor="email">Email *</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                />
                {fieldError("email")}
              </div>
              <div className="design-form__field">
                <label htmlFor="style_design">Phong cách bạn muốn *</label>
                <input
                  id="style_design"
                  name="style_design"
                  type="text"
                  value={formData.style_design}
                  onChange={handleChange}
                />
                {fieldError("style_design")}
              </div>
            </div>

            <fieldset className="design-form__field">
              <legend>Không gian *</legend>
              <div className="design-chips">
                {[
                  ...rooms.map((room) => ({
                    value: room.room_name,
                    label: room.room_name,
                  })),
                  { value: CUSTOM_ROOM, label: "Khác" },
                ].map((option) => (
                  <label className="design-chip" key={option.value}>
                    <input
                      type="radio"
                      name="room_name"
                      value={option.value}
                      checked={formData.room_name === option.value}
                      onChange={handleChange}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
              {fieldError("room_name")}
              {formData.room_name === CUSTOM_ROOM && (
                <>
                  <input
                    className="design-form__custom"
                    name="custom_room_name"
                    type="text"
                    aria-label="Tên không gian khác"
                    placeholder="Nhập không gian khác..."
                    value={formData.custom_room_name || ""}
                    onChange={handleChange}
                  />
                  {fieldError("custom_room_name")}
                </>
              )}
            </fieldset>

            <fieldset className="design-form__field">
              <legend>Ngân sách *</legend>
              <div className="design-chips">
                {BUDGETS.map((option) => (
                  <label className="design-chip" key={option.value}>
                    <input
                      type="radio"
                      name="budget"
                      value={option.value}
                      checked={formData.budget === option.value}
                      onChange={handleChange}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
              {fieldError("budget")}
            </fieldset>

            <div className="design-form__field">
              <label htmlFor="design_description">
                Mô tả sơ lược về yêu cầu thiết kế *
              </label>
              <textarea
                id="design_description"
                name="design_description"
                rows={4}
                value={formData.design_description}
                onChange={handleChange}
              />
              {fieldError("design_description")}
            </div>

            <div className="design-form__row">
              <div className="design-form__field">
                <label htmlFor="require_design">Yêu cầu khác *</label>
                <input
                  id="require_design"
                  name="require_design"
                  type="text"
                  value={formData.require_design}
                  onChange={handleChange}
                />
                {fieldError("require_design")}
              </div>
              <div className="design-form__field">
                <label htmlFor="different_information">Lưu ý khác</label>
                <input
                  id="different_information"
                  name="different_information"
                  type="text"
                  value={formData.different_information}
                  onChange={handleChange}
                />
              </div>
            </div>

            <label className="design-form__consent" htmlFor="agreeToTerms">
              <input
                id="agreeToTerms"
                name="agreeToTerms"
                type="checkbox"
                checked={agreeToTerms}
                onChange={handleChange}
              />
              <span>
                Tôi đồng ý với{" "}
                <Link to="/dieu-khoan-su-dung" target="_blank">
                  Điều khoản dịch vụ
                </Link>
                {" và "}
                <Link to="/chinh-sach-bao-mat" target="_blank">
                  Chính sách bảo mật
                </Link>
                .
              </span>
            </label>
            {fieldError("agreeToTerms")}

            <button
              className="design-button design-button--primary"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Đang gửi..." : "Gửi yêu cầu"} <ArrowIcon />
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default ContactFormDesignPage;
