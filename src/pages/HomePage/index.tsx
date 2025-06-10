import React from 'react';
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import InteriorDesign from "../../components/InteriorDesign";
import ProductSlider from "../../components/ProductSlider";
import GetInTouch from "../../components/GetInTouch";
import PopularCategory from "../../components/PopularCategory";
import CategoryList from '../../components/CategoryList';

const HomePage = () => {
  return (
    <>
      <Header />
      <div className="homepage">
        {/* Hero Banner */}
        <section className="hero-banner">
          <div className="container-fluid">
            <div className="banner-image">
              <img src="/images/hero-banner.png" alt="SONA Space Interior" />
            </div>
          </div>
        </section>

        {/* Popular Categories - Hiển thị các danh mục phổ biến */}
        <PopularCategory />

        {/* All Categories - Hiển thị tất cả danh mục */}
        <section className="all-categories-section">
          <div className="container">
            <h2 className="section-title">Tất cả danh mục sản phẩm</h2>
            <CategoryList limit={6} showProductCount={true} />
            <div className="view-all-categories">
              <a href="/san-pham" className="btn btn-outline">
                Xem tất cả danh mục
                <img src="/images/icons/arrow-right-1.svg" alt="" />
              </a>
            </div>
          </div>
        </section>

        {/* Product Recommendations */}
        <section className="product-recommendations">
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
                    <a href="/phong-khach" className="btn btn-outline">
                      Xem Sản Phẩm{" "}
                      <img src="/images/icons/arrow-right-1.svg" alt="" />
                    </a>
                  </div>
                </div>
              </div>
              <div className="grid-item">
                <div className="product-card">
                  <img src="/images/bedroom.jpg" alt="Phòng Ngủ" />
                  <div className="card-content">
                    <h3>Nội Thất Cho Phòng Ngủ</h3>
                    <a href="/phong-ngu" className="btn btn-outline">
                      Xem Sản Phẩm{" "}
                      <img src="/images/icons/arrow-right-1.svg" alt="" />
                    </a>
                  </div>
                </div>
              </div>
              <div className="grid-item">
                <div className="product-card">
                  <img src="/images/dining-room.jpg" alt="Phòng Ăn" />
                  <div className="card-content">
                    <h3>Nội Thất Cho Phòng Ăn</h3>
                    <a href="/phong-an" className="btn btn-outline">
                      Xem Sản Phẩm{" "}
                      <img src="/images/icons/arrow-right-1.svg" alt="" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="featured-products">
          <div className="container">
            <h2 className="section-title">Sản Phẩm Mới</h2>
            <ProductSlider />
          </div>
        </section>

        {/* Hot Products */}
        <section className="hot-products">
          <div className="container">
            <h2 className="section-title">Sản Phẩm Hot</h2>
            <ProductSlider />
          </div>
        </section>

        {/* Interior Design */}
        <InteriorDesign />

        {/* Contact Section */}
        <GetInTouch />
      </div>
      <Footer />
    </>
  );
};

export default HomePage;
