import { useEffect, useState } from "react";
import MediaTile from "../MediaTile";
import { SkeletonBlock } from "../StateFeedback";
import { getFeaturedCategories, formatCategoryForDisplay } from "../../services/categoryService";
import type { Category } from "../../types";

export const PopularCategory = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        // console.log("PopularCategory: Fetching featured categories");
        const data = await getFeaturedCategories(6); // Lấy 6 danh mục nổi bật
        // console.log("PopularCategory: Received categories:", data);
        setCategories(data);
        setError(null);
      } catch (err) {
        console.error("Error loading featured categories:", err);
        setError("Không thể tải danh mục sản phẩm");
        // Sử dụng dữ liệu mặc định nếu API lỗi
        // setCategories(defaultCategories);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  const tiles = categories.map(formatCategoryForDisplay);
  const tile = (category: (typeof tiles)[number]) => (
    <MediaTile key={category.id} to={`/danh-muc/${category.slug}`} image={category.image} title={category.name} />
  );

  return (
    <section className="PopularCategory-full">
      <div className="container">
        <div className="category-of-products">
          <div className="category-of-products-s1">
            <div className="popular-intro" data-reveal>
              <p className="popular-intro__eyebrow">Danh mục</p>
              <h2 className="popular-intro__title">Các danh mục sản phẩm phổ biến nhất</h2>
              <p className="popular-intro__text">
                Khám phá những danh mục sản phẩm được ưa chuộng và lựa chọn nhiều nhất hiện nay
              </p>
            </div>
            {loading
              ? [0, 1].map((key) => <SkeletonBlock key={key} className="popular-skeleton" height="100%" />)
              : tiles.slice(0, 2).map(tile)}
          </div>
          {(loading || tiles.length > 2) && (
            <div className="category-of-products-s2">
              {loading
                ? [0, 1, 2, 3].map((key) => <SkeletonBlock key={key} className="popular-skeleton" height="100%" />)
                : tiles.slice(2).map(tile)}
            </div>
          )}
          {error && !loading && <p className="popular-error" role="status">{error}</p>}
        </div>
      </div>
    </section>
  );
};

export default PopularCategory;

