"use client";

import React, { useEffect, useState } from "react";
import { getAllNewsCategories } from "../../api/new";
import type { NewsCategory } from "../../types";
import { EmptyState, InlineErrorState, SkeletonText } from "../StateFeedback";

interface NewsProps {
  limit?: number;
}

const NewsCategories: React.FC<NewsProps> = ({ limit }) => {
  const [news, setNews] = useState<NewsCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAllNewsCategories();
        setNews(limit ? data.slice(0, limit) : data);
      } catch (fetchError) {
        console.error("Lỗi khi lấy dữ liệu:", fetchError);
        setNews([]);
        setError("Không thể tải danh mục tin tức.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [limit]);

  return (
    <div className="news-categories">
      <h2>Danh mục tin tức</h2>
      {loading ? (
        <SkeletonText lines={4} />
      ) : error ? (
        <InlineErrorState message={error} />
      ) : news.length === 0 ? (
        <EmptyState
          title="Chưa có danh mục"
          message="Danh mục tin tức sẽ xuất hiện khi có nội dung mới."
        />
      ) : (
        <ul>
          {news.map((category, idx) => (
            <li key={category.news_category_id || idx}>
              <div className="category-item">
                <span className="category-name">{category.name}</span>
                <span className="post-count">{category.news_count}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NewsCategories;
