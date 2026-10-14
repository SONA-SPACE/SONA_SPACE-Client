import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import NewsCategories from "../../components/CategoryNews";
import RecentPosts from "../../components/RecentPosts";
import {
  EmptyState,
  RetryState,
  SkeletonBlock,
  SkeletonText,
} from "../../components/StateFeedback";
import { getNewsBySlugDetail } from "../../api/new";
import type { NewsArticle } from "../../types";

const NewsDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [newsDetailItem, setNewsDetail] = useState<NewsArticle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getNewsBySlugDetail(slug || "");
        setNewsDetail(data);
      } catch (fetchError) {
        console.error("Lỗi lấy dữ liệu:", fetchError);
        setNewsDetail(null);
        setError("Không thể tải bài viết này. Vui lòng thử lại.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  const formatDate = (dateString: string): string | undefined => {
    const date = new Date(dateString);
    const DD = ("0" + date.getDate()).slice(-2);
    const MM = ("0" + (date.getMonth() + 1)).slice(-2);
    const YYYY = date.getFullYear();
    const HH = ("0" + date.getHours()).slice(-2);
    const mm = ("0" + date.getMinutes()).slice(-2);
    const ss = ("0" + date.getSeconds()).slice(-2);

    return `${DD}/${MM}/${YYYY} ${HH}:${mm}:${ss}`;
  };

  if (isLoading) {
    return (
      <>
        <div className="news-detail-page">
          <div className="container">
            <div className="news-detail-wrapper">
              <div className="news-main-content news-main-content--loading">
                <SkeletonBlock width="48%" height={18} />
                <SkeletonBlock width="88%" height={40} />
                <SkeletonText lines={8} />
              </div>
              <div className="news-sidebar">
                <div className="news-sidebar-card">
                  <SkeletonBlock width="60%" height={24} />
                  <SkeletonText lines={4} />
                </div>
                <div className="news-sidebar-card">
                  <SkeletonBlock width="55%" height={24} />
                  <SkeletonText lines={4} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="news-detail-page">
          <div className="container">
            <RetryState
              title="Không thể tải bài viết"
              message={error}
              onRetry={() => window.location.reload()}
              secondaryActionLabel="Xem tất cả tin tức"
              secondaryActionTo="/tin-tuc"
            />
          </div>
        </div>
      </>
    );
  }

  if (!newsDetailItem) {
    return (
      <>
        <div className="news-detail-page">
          <div className="container">
            <EmptyState
              title="Không tìm thấy bài viết"
              message="Bài viết bạn đang tìm có thể đã bị gỡ hoặc đường dẫn không còn hợp lệ."
              actionLabel="Xem tất cả tin tức"
              actionTo="/tin-tuc"
              secondaryActionLabel="Về trang chủ"
              secondaryActionTo="/"
            />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="news-detail-page">
        <div className="container">
          <div className="news-detail-wrapper">
            <div className="news-main-content">
              <div className="breadcrumb">
                <Link to="/tin-tuc">Tin tức</Link>
                <span>/</span>
                <span className="active">{newsDetailItem.news_title}</span>
              </div>
              <h1 className="news-title">{newsDetailItem.news_title}</h1>
              <div className="news-meta">
                <span className="date">
                  {formatDate(
                    newsDetailItem.created_at
                      ? newsDetailItem.created_at.toString()
                      : ""
                  )}
                </span>
                <span className="views">
                  <img src="../images/news/eye.svg" alt="" />
                  {newsDetailItem.news_view} lượt xem
                </span>
              </div>
              <div
                className="news-body"
                dangerouslySetInnerHTML={{ __html: newsDetailItem.news_content }}
              />
            </div>
            <div className="news-sidebar">
              <NewsCategories limit={5} />
              <RecentPosts limit={4} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NewsDetail;
