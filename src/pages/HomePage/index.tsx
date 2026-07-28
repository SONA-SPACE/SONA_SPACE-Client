import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import InteriorDesign from "../../components/interiorDesign";
import GetInTouch from "../../components/getintouch";
import CategorySlider from "../../components/CategorySlider";
import BannerSlider from "../../components/BannerSlider";
import type { Product as ProductType } from "../../types";
import ProductComponent from "../../components/Product";
import { getNewestProducts } from "../../api/product";
import { formatProductForDisplay } from "../../services/productService";
import {
  EmptyState,
  PageSectionSkeleton,
  RetryState,
} from "../../components/StateFeedback";

// Định nghĩa kiểu dữ liệu phù hợp với component Product


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
    <>
      <Header />
      <div className="homepage">
        {/* Hero Banner Slider */}
        <BannerSlider />

        {/* Product Recommendations */}
        <section className="product-recommendations mt-94">
          <div className="container">
            <h2 className="section-title">Sản Phẩm Được Đề Xuất Cho Bạn</h2>
            <p className="section-description">
              Khám phá sản phẩm được yêu thích và đánh giá cao nhất bởi khách
              hàng của chúng tôi.
              <br />
              Với thiết kế tinh tế, chất liệu cao cấp và sự thoải mái trong sử
              dụng — đây là lựa chọn hoàn hảo để nâng tầm không gian sống của
              bạn
            </p>

            <div className="recommendation-grid">
              <div className="grid-item large">
                <div className="product-card">
                  <img src="/images/living-room.jpg" alt="Phòng Khách" />
                  <div className="card-content">
                    <h3>Nội Thất Cho Phòng Khách</h3>
                    <Link to="/khong-gian/phong-khach" className="btn btn-outline">
                      Xem Sản Phẩm{" "}
                      <i>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="currentColor"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M8.64645 2.64645C8.84171 2.45118 9.15829 2.45118 9.35355 2.64645L14.3536 7.64645C14.5488 7.84171 14.5488 8.15829 14.3536 8.35355L9.35355 13.3536C9.15829 13.5488 8.84171 13.5488 8.64645 13.3536C8.45118 13.1583 8.45118 12.8417 8.64645 12.6464L12.7929 8.5H2C1.72386 8.5 1.5 8.27614 1.5 8C1.5 7.72386 1.72386 7.5 2 7.5H12.7929L8.64645 3.35355C8.45118 3.15829 8.45118 2.84171 8.64645 2.64645Z"
                          />
                        </svg>
                      </i>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="grid-item">
                <div className="product-card">
                  <img src="/images/bedroom.jpg" alt="Phòng Ngủ" />
                  <div className="card-content">
                    <h3>Nội Thất Cho Phòng Ngủ</h3>
                    <Link to="/khong-gian/phong-ngu" className="btn btn-outline">
                      Xem Sản Phẩm{" "}
                      <i>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="currentColor"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M8.64645 2.64645C8.84171 2.45118 9.15829 2.45118 9.35355 2.64645L14.3536 7.64645C14.5488 7.84171 14.5488 8.15829 14.3536 8.35355L9.35355 13.3536C9.15829 13.5488 8.84171 13.5488 8.64645 13.3536C8.45118 13.1583 8.45118 12.8417 8.64645 12.6464L12.7929 8.5H2C1.72386 8.5 1.5 8.27614 1.5 8C1.5 7.72386 1.72386 7.5 2 7.5H12.7929L8.64645 3.35355C8.45118 3.15829 8.45118 2.84171 8.64645 2.64645Z"
                          />
                        </svg>
                      </i>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="grid-item">
                <div className="product-card">
                  <img src="/images/dining-room.jpg" alt="Phòng Ăn" />
                  <div className="card-content">
                    <h3>Nội Thất Cho Phòng Ăn</h3>
                    <Link to="/khong-gian/phong-an" className="btn btn-outline">
                      Xem Sản Phẩm{" "}
                      <i>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="currentColor"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M8.64645 2.64645C8.84171 2.45118 9.15829 2.45118 9.35355 2.64645L14.3536 7.64645C14.5488 7.84171 14.5488 8.15829 14.3536 8.35355L9.35355 13.3536C9.15829 13.5488 8.84171 13.5488 8.64645 13.3536C8.45118 13.1583 8.45118 12.8417 8.64645 12.6464L12.7929 8.5H2C1.72386 8.5 1.5 8.27614 1.5 8C1.5 7.72386 1.72386 7.5 2 7.5H12.7929L8.64645 3.35355C8.45118 3.15829 8.45118 2.84171 8.64645 2.64645Z"
                          />
                        </svg>
                      </i>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* All Categories - Hiển thị tất cả danh mục */}
        <section className="all-categories-section mt-94">
          <div className="container">
            <h2 className="section-title">Tất cả danh mục sản phẩm</h2>
            <CategorySlider />
          </div>
        </section>

        {/* Featured Products */}
        <section className="featured-products mt-94">
          <div className="container">
            <div className="section-box-products">
              <h5>Sản Phẩm Mới</h5>
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
                    <ProductComponent
                      key={`new-${product.id}`}
                      product={product}
                      slug={product.slug}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Hot Products */}
        <section className="hot-products mt-94">
          <div className="container">
            <div className="section-box-products">
              <h5>Sản Phẩm Hot</h5>
              {loading && <PageSectionSkeleton count={4} />}
              {!loading && !error && hotProducts.length > 0 && (
                <div className="box-products-container">
                  {hotProducts.map((product) => (
                    <ProductComponent
                      key={`hot-${product.id}`}
                      product={product}
                      slug={product.slug}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Interior Design */}
        <section className="interior-design mt-94">
          <InteriorDesign />
        </section>

        {/* Contact Section */}
        <section className="contact-section mt-94">
          <GetInTouch />
        </section>
      </div>
      <Footer />
    </>
  );
};

export default HomePage;
