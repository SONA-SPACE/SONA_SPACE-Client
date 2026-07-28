import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";
import { getBannersByPage, type Banner } from "../../api/banner";
import { SkeletonBlock } from "../StateFeedback";

import "swiper/swiper-bundle.css";
import "./styles.scss";

interface BannerSliderProps {
  className?: string;
  page?: string;
}

type BannerFallbackConfig = {
  subtitle: string;
  title: string;
  description: string;
  link: string;
  buttonText: string;
};

const pageBannerFallbacks: Record<string, BannerFallbackConfig> = {
  home: {
    subtitle: "SONA SPACE",
    title: "Thiết Kế Nội Thất Cao Cấp",
    description:
      "Khám phá bộ sưu tập nội thất độc đáo và hiện đại. Tạo nên không gian sống hoàn hảo cho ngôi nhà của bạn.",
    link: "/san-pham",
    buttonText: "Khám Phá Ngay",
  },
  "san-pham": {
    subtitle: "BỘ SƯU TẬP",
    title: "Khám Phá Sản Phẩm Nội Thất",
    description:
      "Lựa chọn những thiết kế phù hợp cho phòng khách, phòng ngủ và không gian sống hiện đại.",
    link: "/san-pham",
    buttonText: "Xem Sản Phẩm",
  },
  "khong-gian": {
    subtitle: "KHÔNG GIAN SỐNG",
    title: "Gợi Ý Bố Trí Nội Thất",
    description:
      "Tham khảo các mô hình không gian để tìm phong cách phù hợp với ngôi nhà của bạn.",
    link: "/khong-gian",
    buttonText: "Khám Phá Không Gian",
  },
  "gio-hang": {
    subtitle: "HOÀN TẤT ĐƠN HÀNG",
    title: "Kiểm Tra Giỏ Hàng Của Bạn",
    description:
      "Xem lại sản phẩm đã chọn, cập nhật số lượng và sẵn sàng cho bước thanh toán.",
    link: "/thanh-toan",
    buttonText: "Tiến Hành Thanh Toán",
  },
  "tai-khoan": {
    subtitle: "TÀI KHOẢN",
    title: "Quản Lý Đơn Hàng Và Ưu Đãi",
    description:
      "Theo dõi đơn hàng, cập nhật thông tin cá nhân và sử dụng các ưu đãi dành cho bạn.",
    link: "/tai-khoan",
    buttonText: "Xem Tài Khoản",
  },
  "tin-tuc": {
    subtitle: "SONA JOURNAL",
    title: "Cập Nhật Tin Tức Nội Thất",
    description:
      "Khám phá xu hướng, kinh nghiệm bố trí và câu chuyện thiết kế mới nhất từ SONA SPACE.",
    link: "/tin-tuc",
    buttonText: "Đọc Tin Mới",
  },
};

const fallbackBannerImage = "/images/hero-banner.png";

const BannerSlider: React.FC<BannerSliderProps> = ({
  className = "",
  page = "home",
}) => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        setError(null);

        const bannerData = await getBannersByPage(page);
        const activeBanners = bannerData
          .filter((banner: Banner) => banner.status === 1)
          .sort((a: Banner, b: Banner) => a.position - b.position);

        setBanners(activeBanners);
      } catch (err) {
        console.error("Error fetching banners:", err);
        setError("Không thể tải banner. Đang hiển thị nội dung dự phòng.");
        setBanners([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, [page]);

  const pageFallback = pageBannerFallbacks[page] ?? pageBannerFallbacks.home;
  const fallbackBanner = {
    ...pageFallback,
    image: fallbackBannerImage,
  };

  const isExternalLink = (link?: string) =>
    Boolean(link && /^https?:\/\//i.test(link));

  const getBannerLink = (banner?: Banner) => banner?.link || pageFallback.link;

  const getBannerButtonText = (banner?: Banner) =>
    banner?.button_text || pageFallback.buttonText;

  const getBannerSubtitle = (banner?: Banner) =>
    banner?.subtitle || pageFallback.subtitle;

  const getBannerDescription = (banner?: Banner) =>
    banner?.description || pageFallback.description;

  if (loading) {
    return (
      <section className={`hero-banner loading ${className}`}>
        <div className="banner-slide">
          <SkeletonBlock className="banner-image" height="100%" />
          <div className="banner-content">
            <div className="container">
              <div className="banner-text banner-text--skeleton">
                <SkeletonBlock className="banner-skeleton__subtitle" />
                <SkeletonBlock className="banner-skeleton__title" />
                <SkeletonBlock className="banner-skeleton__description" />
                <SkeletonBlock className="banner-skeleton__button" />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || banners.length === 0) {
    return (
      <section className={`hero-banner ${className}`}>
        <div className="banner-slide">
          <div className="banner-image">
            <img
              src={fallbackBanner.image}
              alt="SONA SPACE - Thiết kế nội thất cao cấp"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                target.parentElement!.style.background =
                  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
              }}
            />
          </div>
          <div className="banner-content">
            <div className="container">
              <div className="banner-text">
                <p className="banner-subtitle">{fallbackBanner.subtitle}</p>
                <h1 className="banner-title">{fallbackBanner.title}</h1>
                <p className="banner-description">
                  {fallbackBanner.description}
                </p>
                <Link to={fallbackBanner.link} className="banner-button">
                  {fallbackBanner.buttonText}
                  <i className="fas fa-arrow-right" />
                </Link>
              </div>
            </div>
          </div>
        </div>
        {error && (
          <div className="error-notice" role="status">
            <p>{error}</p>
          </div>
        )}
      </section>
    );
  }

  return (
    <section className={`hero-banner ${className}`}>
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        spaceBetween={0}
        slidesPerView={1}
        navigation={{
          nextEl: ".banner-slider-next",
          prevEl: ".banner-slider-prev",
        }}
        pagination={{
          el: ".banner-slider-pagination",
          clickable: true,
          bulletClass: "banner-bullet",
          bulletActiveClass: "banner-bullet-active",
        }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        effect="fade"
        fadeEffect={{
          crossFade: true,
        }}
        loop={banners.length > 1}
        className="banner-swiper"
      >
        {banners.map((banner, index) => {
          const bannerLink = getBannerLink(banner);

          return (
            <SwiperSlide key={banner.id}>
              <div className="banner-slide">
                <div className="banner-image">
                  <img
                    src={banner.image}
                    alt={banner.title}
                    loading={index === 0 ? "eager" : "lazy"}
                    fetchPriority={index === 0 ? "high" : "auto"}
                  />
                </div>
                <div className="banner-content">
                  <div className="container">
                    <div className="banner-text">
                      <p className="banner-subtitle">
                        {getBannerSubtitle(banner)}
                      </p>
                      <h1 className="banner-title">{banner.title}</h1>
                      <p className="banner-description">
                        {getBannerDescription(banner)}
                      </p>
                      {isExternalLink(bannerLink) ? (
                        <a
                          href={bannerLink}
                          className="banner-button"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {getBannerButtonText(banner)}
                          <i className="fas fa-arrow-right" />
                        </a>
                      ) : (
                        <Link to={bannerLink} className="banner-button">
                          {getBannerButtonText(banner)}
                          <i className="fas fa-arrow-right" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </section>
  );
};

export default BannerSlider;
