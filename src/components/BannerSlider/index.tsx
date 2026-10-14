import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper";
import { Autoplay, EffectFade } from "swiper/modules";
import { getBannersByPage, type Banner } from "../../api/banner";
import { useRegisterHeaderHero } from "../../hooks/useHeaderHero";
import { loadMotion, prefersReducedMotion } from "../../motion/gsap";
import { SkeletonBlock } from "../StateFeedback";

import "swiper/css";
import "swiper/css/effect-fade";
import "./styles.scss";

interface BannerSliderProps {
  className?: string;
  page?: string;
}

type BannerFallbackConfig = {
  subtitle: string;
  title: string;
  link: string;
};

const pageBannerFallbacks: Record<string, BannerFallbackConfig> = {
  home: { subtitle: "SONA SPACE", title: "Thiết Kế Nội Thất Cao Cấp", link: "/san-pham" },
  "san-pham": { subtitle: "BỘ SƯU TẬP", title: "Khám Phá Sản Phẩm Nội Thất", link: "/san-pham" },
  "khong-gian": { subtitle: "KHÔNG GIAN SỐNG", title: "Gợi Ý Bố Trí Nội Thất", link: "/khong-gian" },
  "gio-hang": { subtitle: "HOÀN TẤT ĐƠN HÀNG", title: "Kiểm Tra Giỏ Hàng Của Bạn", link: "/thanh-toan" },
  "tai-khoan": { subtitle: "TÀI KHOẢN", title: "Quản Lý Đơn Hàng Và Ưu Đãi", link: "/tai-khoan" },
  "tin-tuc": { subtitle: "SONA JOURNAL", title: "Cập Nhật Tin Tức Nội Thất", link: "/tin-tuc" },
};

const fallbackBannerImage = "/images/hero-banner.png";
const AUTOPLAY_DELAY_MS = 6000;

type SlideContent = {
  key: string | number;
  image: string;
  imageAlt: string;
  subtitle: string;
  title: string;
  link: string;
};

const isExternalLink = (link: string) => /^https?:\/\//i.test(link);

function ArrowIcon({ direction = "right" }: { direction?: "left" | "right" }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className={`banner-arrow-icon banner-arrow-icon--${direction}`}>
      <path d="M4 10h12m-5-5 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Editorial caption: the photo carries the banner, a single underlined line names it and links on.
// The caption text is the page heading, so it is announced once.
function SlideBody({ slide, isFirst }: { slide: SlideContent; isFirst: boolean }) {
  // Only the first slide carries the page <h1>; the others are secondary headings.
  const Heading = isFirst ? "h1" : "h2";
  const caption = (
    <>
      <span className="banner-subtitle" data-banner-anim>
        {slide.subtitle}
      </span>
      <Heading className="banner-title" data-banner-anim>
        {slide.title}
        <ArrowIcon />
      </Heading>
    </>
  );

  return (
    <div className="banner-slide">
      <div className="banner-image">
        <img
          src={slide.image}
          alt={slide.imageAlt}
          loading={isFirst ? "eager" : "lazy"}
          fetchPriority={isFirst ? "high" : "auto"}
          decoding="async"
          onError={(event) => {
            const image = event.currentTarget;
            if (!image.src.endsWith(fallbackBannerImage)) image.src = fallbackBannerImage;
          }}
        />
      </div>
      <div className="banner-content">
        <div className="container">
          {isExternalLink(slide.link) ? (
            <a href={slide.link} className="banner-caption" target="_blank" rel="noopener noreferrer">
              {caption}
            </a>
          ) : (
            <Link to={slide.link} className="banner-caption">
              {caption}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// Text of the active slide rises in as a short sequence each time the slide changes.
function playSlideEntrance(slideElement: Element | null | undefined) {
  if (!slideElement || prefersReducedMotion()) return;
  const parts = slideElement.querySelectorAll("[data-banner-anim]");
  if (parts.length === 0) return;

  loadMotion().then(({ gsap }) => {
    gsap.fromTo(
      parts,
      { opacity: 0, y: 28 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.09,
        overwrite: true,
        clearProps: "opacity,transform",
      }
    );
  });
}

const BannerSlider: React.FC<BannerSliderProps> = ({ className = "", page = "home" }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [swiper, setSwiper] = useState<SwiperInstance | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useRegisterHeaderHero(sectionRef);

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
  const variant = page === "home" ? "full" : "compact";
  const sectionClassName = `hero-banner hero-banner--${variant} ${className}`.trim();

  const slides: SlideContent[] =
    banners.length > 0
      ? banners.map((banner) => ({
          key: banner.id,
          image: banner.image,
          imageAlt: banner.title,
          subtitle: banner.subtitle || pageFallback.subtitle,
          title: banner.title,
          link: banner.link || pageFallback.link,
        }))
      : [
          {
            key: "fallback",
            image: fallbackBannerImage,
            imageAlt: "SONA SPACE - Thiết kế nội thất cao cấp",
            ...pageFallback,
          },
        ];

  const handleSwiper = useCallback((instance: SwiperInstance) => {
    setSwiper(instance);
    playSlideEntrance(instance.slides[instance.activeIndex]);
  }, []);

  useEffect(() => {
    if (swiper && prefersReducedMotion()) swiper.autoplay?.stop();
  }, [swiper]);

  if (loading) {
    return (
      <section ref={sectionRef} className={`${sectionClassName} loading`} aria-busy="true">
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

  const hasMultipleSlides = slides.length > 1;

  return (
    <section ref={sectionRef} className={sectionClassName} aria-roledescription="carousel" aria-label="Banner">
      {hasMultipleSlides ? (
        <Swiper
          modules={[Autoplay, EffectFade]}
          slidesPerView={1}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          speed={900}
          loop
          autoplay={{ delay: AUTOPLAY_DELAY_MS, disableOnInteraction: false, pauseOnMouseEnter: true }}
          className="banner-swiper"
          onSwiper={handleSwiper}
          onSlideChange={(instance) => setActiveIndex(instance.realIndex)}
          onSlideChangeTransitionStart={(instance) => playSlideEntrance(instance.slides[instance.activeIndex])}
          onAutoplayTimeLeft={(_instance, _timeLeft, progress) => {
            progressRef.current?.style.setProperty("--banner-progress", String(1 - progress));
          }}
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={slide.key}>
              <SlideBody slide={slide} isFirst={index === 0} />
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <div className="banner-static swiper-slide-active">
          <SlideBody slide={slides[0]} isFirst />
        </div>
      )}

      {hasMultipleSlides && (
        <div className="banner-controls">
          <div className="container banner-controls__inner">
            <div className="banner-controls__counter" aria-live="polite">
              <span className="banner-controls__current">{String(activeIndex + 1).padStart(2, "0")}</span>
              <span className="banner-controls__track" aria-hidden="true">
                <span ref={progressRef} className="banner-controls__progress" />
              </span>
              <span className="banner-controls__total">{String(slides.length).padStart(2, "0")}</span>
            </div>
            <div className="banner-controls__buttons">
              <button
                type="button"
                className="banner-nav-arrow banner-slider-prev"
                aria-label="Banner trước"
                onClick={() => swiper?.slidePrev()}
              >
                <ArrowIcon direction="left" />
              </button>
              <button
                type="button"
                className="banner-nav-arrow banner-slider-next"
                aria-label="Banner tiếp theo"
                onClick={() => swiper?.slideNext()}
              >
                <ArrowIcon />
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="error-notice" role="status">
          {error}
        </p>
      )}
    </section>
  );
};

export default BannerSlider;
