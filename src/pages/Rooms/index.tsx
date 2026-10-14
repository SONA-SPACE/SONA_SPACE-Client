import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Product as ProductType } from "../../types";
import PopularCategory from "../../components/PopularCategory";
import InteriorDesign from "../../components/interiorDesign";
import ProductSlider from "../../components/ProductSlider";
import CategorySlider from "../../components/RoomSlider";
import Product from "../../components/Product";
import BannerSlider from "../../components/BannerSlider";
import { getNewestProducts } from "../../api/product";
import { formatProductForDisplay } from "../../services/productService";
import { InlineErrorState, PageSectionSkeleton } from "../../components/StateFeedback";

const Rooms: React.FC = () => {
  // Lấy danh sách sản phẩm mới nhất khi component mount
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newestProducts, setNewestProducts] = useState<ProductType[]>([]);
  useEffect(() => {
    const fetchNewestProducts = async () => {
      try {
        setLoading(true);
        const products = await getNewestProducts(8); // Lấy 8 sản phẩm mới nhất
        // console.log("Fetched newest products:", products);

        // Format sản phẩm để phù hợp với component Product
        const formattedProducts = products.map((product, index) => {
          return formatProductForDisplay(product);
        });

        // Đảm bảo các id là duy nhất
        const uniqueProducts = formattedProducts.filter((product, index, self) =>
          index === self.findIndex(p => p.id === product.id)
        );

        // console.log("Formatted products:", uniqueProducts);
        setNewestProducts(uniqueProducts);
        setError(null);
      } catch (error) {
        console.error("Error fetching newest products:", error);
        setError("Không thể tải sản phẩm mới nhất. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchNewestProducts();
  }, []);
  return (
    <>
      <div className="rooms-page">

        {/* Banner */}
        <BannerSlider page="khong-gian" />

        {/* Breadcrumb */}
        <div className="breadcrumb-container">
          <div className="container">
            <div className="breadcrumb">
              <Link to="/">Trang chủ</Link>
              <span>/</span>
              <span className="active">Không gian</span>
            </div>
          </div>
        </div>

        {/* Room Categories */}
        <section className="room-categories mt-94">
          <div className="container">
            <h2 className="section-title">Khám phá thêm các căn phòng</h2>
            <CategorySlider />
          </div>
        </section>

        {/* Featured Products */}
        <section className="featured-products mt-94">
          <div className="container">
            <div className="section-box-products">
              <h5>Sản Phẩm Mới</h5>
              {loading && <PageSectionSkeleton count={8} />}
              {error && <InlineErrorState message={error} />}
              <div className="box-products-container">
                {newestProducts.map((product) => (
                  <Product
                    key={`new-${product.id}`}
                    product={{
                      id: product.id,
                      name: product.name,
                      price: product.price || 0,
                      image: product.image,
                      colors: product.colors || [],
                      isNew: true,
                      isSale: product.price_sale !== null && product.price_sale !== undefined && product.price_sale > 0,
                      created_at: product.created_at,
                      priceSale: product.price_sale || undefined,
                      slug: product.slug,
                      isWishlist: product.isWishlist,
                      category: product.category
                    }}
                    slug={product.slug}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Interior Design */}
        <InteriorDesign />

      </div>
    </>
  );
};

export default Rooms;
