import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import BannerSlider from "../../components/BannerSlider";
import NewsCategories from "../../components/CategoryNews";
import PolicyProduct from "../../components/Policy";
import RecentPosts from "../../components/RecentPosts";
import {
  EmptyState,
  RetryState,
  SkeletonBlock,
} from "../../components/StateFeedback";
import { getAllNewsSimple } from "../../api/new";
import type { NewsArticle } from "../../types";

interface NewsProps {
  limit?: number;
}

const News: React.FC<NewsProps> = ({ limit }) => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAllNewsSimple();
        setNews(limit ? data.slice(0, limit) : data);
      } catch (fetchError) {
        setNews([]);
        setError("Không thể tải danh sách tin tức. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [limit]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="news-grid news-grid--loading" aria-label="Đang tải tin tức">
          {Array.from({ length: 6 }).map((_, index) => (
            <div className="news-item news-item--skeleton" key={index}>
              <SkeletonBlock className="news-item__image-skeleton" />
              <SkeletonBlock width="82%" height={24} />
              <SkeletonBlock width="56%" height={18} />
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="news-state-container">
          <RetryState
            message={error}
            onRetry={() => window.location.reload()}
            secondaryActionLabel="Về trang chủ"
            secondaryActionTo="/"
          />
        </div>
      );
    }

    if (news.length === 0) {
      return (
        <div className="news-state-container">
          <EmptyState
            title="Chưa có bài viết nào"
            message="Hiện chưa có nội dung tin tức để hiển thị. Vui lòng quay lại sau."
            actionLabel="Khám phá sản phẩm"
            actionTo="/san-pham"
          />
        </div>
      );
    }

    return (
      <div className="news-grid">
        {news.map((newsItem) => (
          <article className="news-item" key={newsItem.news_id} data-reveal>
            <Link to={`/tin-tuc/${newsItem.news_slug}`}>
              <span className="news-item__media">
                <img
                  src={newsItem.news_image || "/images/hero-banner.png"}
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
              </span>
              <h3>{newsItem.news_title}</h3>
            </Link>
          </article>
        ))}
      </div>
    );
  };

  return (
    <>

      <div className="news-page">
        <BannerSlider page="tin-tuc" />

        <div className="breadcrumb-container">
          <div className="container">
            <div className="breadcrumb">
              <Link to="/">Trang chủ</Link>
              <span>/</span>
              <span className="active">Tin tức</span>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="news-content">
            <div className="content-right">{renderContent()}</div>
            <div className="content-left">
              <NewsCategories limit={5} />
              <RecentPosts limit={4} />
            </div>
          </div>
        </div>

        <section className="policy-product mt-94">
          <PolicyProduct />
        </section>

      </div>
    </>
  );
};

export default News;
