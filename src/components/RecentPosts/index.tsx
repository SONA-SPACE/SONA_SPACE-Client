"use client";

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllNewsByView } from "../../api/new";
import type { NewsArticle } from "../../types";
import { EmptyState, InlineErrorState, SkeletonText } from "../StateFeedback";

interface RecentPostsProps {
  limit?: number;
}

const RecentPosts: React.FC<RecentPostsProps> = ({ limit }) => {
  const [newsByView, setNewsByView] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAllNewsByView();
        setNewsByView(data);
      } catch (fetchError) {
        console.error("Lỗi khi lấy dữ liệu:", fetchError);
        setNewsByView([]);
        setError("Không thể tải bài viết nổi bật.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [limit]);

  return (
    <div className="recent-posts">
      <h2>Bài viết nổi bật</h2>
      {loading ? (
        <SkeletonText lines={4} />
      ) : error ? (
        <InlineErrorState message={error} />
      ) : newsByView.length === 0 ? (
        <EmptyState
          title="Chưa có bài viết nổi bật"
          message="Các bài viết được quan tâm sẽ xuất hiện tại đây."
        />
      ) : (
        <ul>
          {newsByView.slice(0, limit || 4).map((item) => (
            <li key={item.news_id}>
              <Link to={`/tin-tuc/${item.news_slug}`} className="recent-post-item">
                <img src={item.news_image || "/fallback-image.jpg"} alt={item.news_title} />
                <div className="post-info">
                  <span className="post-title">{item.news_title}</span>
                  <span className="post-date">lượt xem: {item.news_view}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecentPosts;
