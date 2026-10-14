import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { EmptyState, PageSectionSkeleton, RetryState } from "../StateFeedback";
import { Link } from "react-router-dom";
import type { NewsArticle } from "../../types";
import { getNewsByCategory } from "../../api/new";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';

type ShowcaseProps = {
      categoryName: string;
      // Render nothing while loading or when there are no projects, instead of a skeleton and an
      // empty state, for pages where the showcase is an optional extra
      hideWhenEmpty?: boolean;
};

export default function Showcase({ categoryName, hideWhenEmpty = false }: ShowcaseProps) {
      const [items, setItems] = useState<NewsArticle[]>([]);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState<string | null>(null);
      const [reloadToken, setReloadToken] = useState(0);

      useEffect(() => {
            const fetchItems = async () => {
                  try {
                        setLoading(true);
                        setError(null);
                        const res = await getNewsByCategory(categoryName);
                        setItems(res || []);
                  } catch (error) {
                        setItems([]);
                        // A missing project category is an empty showcase, not a failure to report.
                        if (!(isAxiosError(error) && error.response?.status === 404)) {
                              setError("Không thể tải danh sách dự án. Vui lòng thử lại.");
                        }
                  } finally {
                        setLoading(false);
                  }
            };
            fetchItems();
      }, [categoryName, reloadToken]);

      if (hideWhenEmpty && !error && (loading || items.length === 0)) return null;

      return (
            <section className="design-showcase-swiper mt-94">
                  <div className="container">
                        <h2 className="section-title">Dự án tiêu biểu</h2>
                        {loading && <PageSectionSkeleton count={3} />}
                        {!loading && error && (
                              <RetryState message={error} onRetry={() => setReloadToken((token) => token + 1)} />
                        )}
                        {!loading && !error && (
                              items.length === 0 ? (
                                    <EmptyState
                                          title="Chưa có dự án nào"
                                          message="Các dự án tiêu biểu sẽ sớm được cập nhật."
                                          actionLabel="Xem không gian mẫu"
                                          actionTo="/khong-gian"
                                    />
                              ) : (
                                    <Swiper
                                          modules={[Autoplay, Navigation]}
                                          spaceBetween={32}
                                          slidesPerView="auto"
                                          navigation
                                          autoplay={{
                                                delay: 3000,
                                                disableOnInteraction: false,
                                                pauseOnMouseEnter: true,
                                          }}
                                          loop={items.length > 1}
                                          className="showcase-swiper"
                                    >
                                          {items.map((item) => (
                                                <SwiperSlide key={item.news_id}>
                                                      <div className="showcase-item">
                                                            <Link to={`/tin-tuc/${item.news_slug}`} className="showcase-thumb-link">
                                                                  <img src={item.news_image} alt={item.news_title} />
                                                            </Link>
                                                            <div className="showcase-content">
                                                                  <h3 className="showcase-title">
                                                                        <Link to={`/tin-tuc/${item.news_slug}`}>{item.news_title}</Link>
                                                                  </h3>
                                                                  <p className="showcase-desc">
                                                                        {item.news_summary?.length > 120
                                                                              ? item.news_summary.slice(0, 120) + "..."
                                                                              : item.news_summary}
                                                                  </p>
                                                                  {item.news_publishDate && (
                                                                        <div className="showcase-date">
                                                                              <span>{item.news_publishDate}</span>
                                                                        </div>
                                                                  )}
                                                            </div>
                                                      </div>
                                                </SwiperSlide>
                                          ))}
                                    </Swiper>
                              )
                        )}
                  </div>
            </section>
      );
}
