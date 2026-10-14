import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import type { ContactForm as ContactFormData } from "../../types";
import {
  sendContactFormService,
  validateContactForm,
} from "../../services/contactForm";

const initialFormData: ContactFormData = {
  fullName: "",
  email: "",
  phone: "",
  message: "",
  agreeToTerms: false,
};

const ArrowIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
    <path d="M5 12h13M13 6l6 6-6 6" />
  </svg>
);

const ProcessIcon = ({ type }: { type: "listen" | "design" | "build" }) => {
  const paths = {
    listen: [
      "M5 6.5h22v14H12l-7 5v-19Z",
      "M11 13h10",
    ],
    design: [
      "M7 4h18v24H7z",
      "M11 10h10M11 15h10M11 20h6",
    ],
    build: ["M5 26h22M8 26V13h16v13M10 13l6-6 6 6M13 26v-7h6v7"],
  };

  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" focusable="false">
      {paths[type].map((path) => (
        <path d={path} key={path} />
      ))}
    </svg>
  );
};

const projects = [
  {
    title: "Nhà phố Thảo Điền",
    image: "/images/about/project-thao-dien-dining.png",
    alt: "Phòng ăn trong nhà phố Thảo Điền",
  },
  {
    title: "Căn hộ Sunwah Pearl",
    image: "/images/about/project-sunwah-pearl-living.png",
    alt: "Phòng khách căn hộ Sunwah Pearl",
  },
  {
    title: "Biệt thự Hồ Tràm",
    image: "/images/about/project-ho-tram-bedroom.png",
    alt: "Phòng ngủ biệt thự Hồ Tràm",
  },
];

const process = [
  {
    number: "01",
    title: "Lắng nghe",
    description: "Hiểu nhu cầu, thói quen sống và những mong muốn riêng của bạn.",
    icon: "listen" as const,
  },
  {
    number: "02",
    title: "Thiết kế",
    description: "Đề xuất giải pháp bố trí, vật liệu và phong cách phù hợp.",
    icon: "design" as const,
  },
  {
    number: "03",
    title: "Thi công",
    description: "Triển khai đồng bộ, giám sát và hoàn thiện chỉn chu.",
    icon: "build" as const,
  },
];

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, type, value } = event.target;
    const nextValue =
      type === "checkbox" ? (event.target as HTMLInputElement).checked : value;

    setFormData((current) => ({ ...current, [name]: nextValue }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validateContactForm(formData);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toast.error("Vui lòng kiểm tra lại thông tin đã nhập.");
      return;
    }

    setIsLoading(true);
    try {
      await sendContactFormService(formData);
      toast.success("Cảm ơn bạn đã gửi yêu cầu. Chúng tôi sẽ liên hệ sớm nhất có thể!");
      setFormData(initialFormData);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Đã xảy ra lỗi. Vui lòng thử lại sau.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="about-page">
        <section className="about-hero" aria-labelledby="about-hero-title">
          <div className="container about-hero__inner">
            <div className="about-hero__copy">
              <p className="about-eyebrow">VỀ SONA SPACE</p>
              <h1 id="about-hero-title">Không gian có chủ đích</h1>
              <p className="about-hero__description">
                Chúng tôi thiết kế nội thất dựa trên thói quen sống, cảm xúc và lý tưởng
                thẩm mỹ của bạn. Mỗi không gian là một sự phản chiếu riêng biệt và bền vững.
              </p>
              <a className="about-button about-button--primary" href="#contact-form">
                Trao đổi cùng SONA <ArrowIcon />
              </a>
            </div>
            <div className="about-hero__image-wrap">
              <img
                src="/images/about/about-hero-living-room.png"
                alt="Không gian phòng khách hiện đại với gỗ walnut và sofa sáng màu"
              />
            </div>
          </div>
        </section>

        <section className="about-process" aria-labelledby="about-process-title">
          <div className="container about-process__grid">
            <h2 id="about-process-title">Quy trình làm việc</h2>
            <div className="about-process__items">
              {process.map((item) => (
                <article className="about-process__item" key={item.number} data-reveal>
                  <p className="about-process__number">{item.number}</p>
                  <div className="about-process__icon"><ProcessIcon type={item.icon} /></div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="about-projects" aria-labelledby="about-projects-title">
          <div className="container about-projects__grid">
            <div className="about-projects__intro">
              <h2 id="about-projects-title">Dự án tiêu biểu</h2>
              <Link className="about-text-link" to="/khong-gian">
                Xem không gian <ArrowIcon />
              </Link>
            </div>
            <div className="about-projects__list">
              {projects.map((project) => (
                <Link className="about-project-card" to="/khong-gian" key={project.title} data-reveal>
                  <span className="about-project-card__image">
                    <img src={project.image} alt={project.alt} loading="lazy" />
                  </span>
                  <span className="about-project-card__footer">
                    <span>{project.title}</span><ArrowIcon />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="about-contact" id="contact-form" aria-labelledby="about-contact-title">
          <div className="container about-contact__inner">
            <div className="about-contact__intro">
              <p className="about-eyebrow">BẮT ĐẦU TỪ MỘT CUỘC TRÒ CHUYỆN</p>
              <h2 id="about-contact-title">Hãy kể chúng tôi nghe về không gian của bạn.</h2>
              <p>
                Để lại thông tin, đội ngũ SONA SPACE sẽ liên hệ để lắng nghe nhu cầu và
                gợi ý bước đi phù hợp.
              </p>
              <img
                className="about-contact__vase"
                src="/images/about/cta-vase-transparent.png"
                alt="Bình gốm thủ công với cành cây trang trí"
                loading="lazy"
              />
            </div>

            <form className="about-contact__form" onSubmit={handleSubmit} noValidate data-reveal>
              <div className="about-form-field">
                <label htmlFor="fullName">Họ và tên</label>
                <input id="fullName" name="fullName" type="text" value={formData.fullName} onChange={handleChange} />
                {errors.fullName && <p className="about-form-error">{errors.fullName}</p>}
              </div>
              <div className="about-contact__form-row">
                <div className="about-form-field">
                  <label htmlFor="email">Email</label>
                  <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
                  {errors.email && <p className="about-form-error">{errors.email}</p>}
                </div>
                <div className="about-form-field">
                  <label htmlFor="phone">Số điện thoại</label>
                  <input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} />
                  {errors.phone && <p className="about-form-error">{errors.phone}</p>}
                </div>
              </div>
              <div className="about-form-field">
                <label htmlFor="message">Nhu cầu của bạn</label>
                <textarea id="message" name="message" rows={5} value={formData.message} onChange={handleChange} />
                {errors.message && <p className="about-form-error">{errors.message}</p>}
              </div>
              <label className="about-form-consent" htmlFor="agreeToTerms">
                <input id="agreeToTerms" name="agreeToTerms" type="checkbox" checked={formData.agreeToTerms} onChange={handleChange} />
                <span>
                  Tôi đồng ý với <Link to="/dieu-khoan-su-dung" target="_blank">Điều khoản dịch vụ</Link>
                  {" và "}<Link to="/chinh-sach-bao-mat" target="_blank">Chính sách bảo mật</Link>.
                </span>
              </label>
              {errors.agreeToTerms && <p className="about-form-error">{errors.agreeToTerms}</p>}
              <button className="about-button about-button--primary" type="submit" disabled={isLoading}>
                {isLoading ? "Đang gửi..." : "Gửi yêu cầu"} <ArrowIcon />
              </button>
            </form>
          </div>
        </section>
      </div>
    </>
  );
};

export default ContactForm;
