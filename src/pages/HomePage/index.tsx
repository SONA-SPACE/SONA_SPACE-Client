import { useState, useEffect, useMemo } from "react";
import InteriorDesign from "../../components/interiorDesign";
import GetInTouch from "../../components/getintouch";
import CategorySlider from "../../components/CategorySlider";
import BannerSlider from "../../components/BannerSlider";
import SectionHeading from "../../components/SectionHeading";
import MediaTile from "../../components/MediaTile";
import type { Product as ProductType } from "../../types";
import ProductComponent from "../../components/Product";
import { getNewestProducts } from "../../api/product";
import { formatProductForDisplay } from "../../services/productService";
import {
  EmptyState,
  PageSectionSkeleton,
  RetryState,
} from "../../components/StateFeedback";

const ROOM_FEATURES = [
  { key: "phong-khach", title: "Nội Thất Cho Phòng Khách", to: "/khong-gian/phong-khach", image: "/images/living-room.jpg" },
  { key: "phong-ngu", title: "Nội Thất Cho Phòng Ngủ", to: "/khong-gian/phong-ngu", image: "/images/bedroom.jpg" },
  { key: "phong-an", title: "Nội Thất Cho Phòng Ăn", to: "/khong-gian/phong-an", image: "/images/dining-room.jpg" },
];

const HomePage = () => {
  const [newestProducts, setNewestProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNewestProducts = async () => {
    try {
      setLoading(true);
      const products = await getNewestProducts(8);
      const formattedProducts = products.map((product) =>
        formatProductForDisplay(product)
      );
      const uniqueProducts = formattedProducts.filter(
        (product, index, self) =>
          index === self.findIndex((candidate) => candidate.id === product.id)
      );

      setNewestProducts(uniqueProducts);
      setError(null);
    } catch (error) {
      console.error("Error fetching newest products:", error);
      setError("Không thể tải sản phẩm mới nhất. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewestProducts();
  }, []);

  // Sản phẩm hot - chọn ngẫu nhiên 4 sản phẩm từ danh sách sản phẩm mới
  const getRandomProducts = (count: number) => {
    if (newestProducts.length <= count) return newestProducts;

    // Tạo một mảng các index ngẫu nhiên từ mảng newestProducts
    const shuffledIndices = [...Array(newestProducts.length).keys()]
      .sort(() => 0.5 - Math.random())
      .slice(0, count);

    // Lấy các sản phẩm theo index đã chọn
    return shuffledIndices.map(index => newestProducts[index]);
  };

  const hotProducts = useMemo(() => getRandomProducts(4), [newestProducts]);

  return (
    <div className="homepage">
      <BannerSlider />

      <section className="product-recommendations mt-94">
        <div className="container">
          <SectionHeading
            align="center"
            eyebrow="Gợi ý từ SONA"
            title="Sản Phẩm Được Đề Xuất Cho Bạn"
            description="Thiết kế tinh tế, chất liệu cao cấp và sự thoải mái trong sử dụng - những lựa chọn được khách hàng yêu thích nhất để nâng tầm không gian sống."
          />

          <div className="recommendation-grid">
            {ROOM_FEATURES.map((room, index) => (
              <MediaTile key={room.key} to={room.to} image={room.image} title={room.title} large={index === 0} />
            ))}
          </div>
        </div>
      </section>

      <section className="all-categories-section mt-94">
        <div className="container">
          <SectionHeading
            title="Tất cả danh mục sản phẩm"
            action={{ label: "Xem tất cả", to: "/san-pham" }}
          />
          <CategorySlider />
        </div>
      </section>

      <section className="featured-products mt-94">
        <div className="container">
          <div className="section-box-products">
            <SectionHeading title="Sản Phẩm Mới" action={{ label: "Xem tất cả sản phẩm", to: "/san-pham" }} />
            {loading && <PageSectionSkeleton count={8} />}
            {!loading && error && (
              <RetryState
                message={error}
                onRetry={fetchNewestProducts}
                secondaryActionLabel="Xem tất cả sản phẩm"
                secondaryActionTo="/san-pham"
              />
            )}
            {!loading && !error && newestProducts.length === 0 && (
              <EmptyState
                title="Chưa có sản phẩm mới"
                message="Bạn có thể khám phá toàn bộ bộ sưu tập của SONA SPACE."
                actionLabel="Xem tất cả sản phẩm"
                actionTo="/san-pham"
              />
            )}
            {!loading && !error && newestProducts.length > 0 && (
              <div className="box-products-container">
                {newestProducts.map((product) => (
                  <ProductComponent key={`new-${product.id}`} product={product} slug={product.slug} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="hot-products mt-94">
        <div className="container">
          <div className="section-box-products">
            <SectionHeading title="Sản Phẩm Hot" />
            {loading && <PageSectionSkeleton count={4} />}
            {!loading && !error && hotProducts.length > 0 && (
              <div className="box-products-container">
                {hotProducts.map((product) => (
                  <ProductComponent key={`hot-${product.id}`} product={product} slug={product.slug} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="mt-94">
        <InteriorDesign />
      </div>

      <div className="mt-94">
        <GetInTouch />
      </div>
    </div>
  );
};

export default HomePage;
