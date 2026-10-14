import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProductComponent from "../../components/Product";
import { isAuthenticated as hasAuthSession } from "../../services/loginService";
import { loadWishlistService } from "../../services/wishlistService";
import type { Product } from "../../types";
import PolicyProduct from "../../components/Policy";
import {
  EmptyState,
  PageSectionSkeleton,
  RetryState,
} from "../../components/StateFeedback";

const Wishlist: React.FC = () => {
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isGuestWishlistView, setIsGuestWishlistView] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!hasAuthSession()) {
      setWishlistProducts([]);
      setLoadError(null);
      setIsGuestWishlistView(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError(null);
    setIsGuestWishlistView(false);

    const res = await loadWishlistService();
    if (res.success) {
      setWishlistProducts(Array.isArray(res.wishlistItems) ? res.wishlistItems : []);
    } else {
      setWishlistProducts([]);
      setLoadError(res.message || "Không thể tải danh sách yêu thích.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  return (
    <>
      <div className="wishlist-pages">
        {/* Breadcrumb */}
        <div className="breadcrumb-container">
          <div className="container">
            <div className="breadcrumb">
              <Link to="/san-pham">Sản phẩm</Link>
              <span>/</span>
              <span className="active">Yêu thích</span>
            </div>
          </div>
        </div>

        {/* Wishlist Content */}
        <section className="wishlist-content">
          {loading ? (
            <div className="wishlist-state-container">
              <PageSectionSkeleton variant="product-grid" count={8} />
            </div>
          ) : isGuestWishlistView ? (
            <div className="wishlist-state-container">
              <EmptyState
                title="Bạn chưa có sản phẩm trong danh sách yêu thích"
                message="Hãy đăng nhập để xem danh sách yêu thích của bạn."
                actionLabel="Đăng nhập"
                actionTo="/dang-nhap"
                secondaryActionLabel="Khám phá sản phẩm"
                secondaryActionTo="/san-pham"
              />
            </div>
          ) : loadError ? (
            <div className="wishlist-state-container">
              <RetryState
                message={loadError}
                onRetry={fetchWishlist}
                secondaryActionLabel="Khám phá sản phẩm"
                secondaryActionTo="/san-pham"
              />
            </div>
          ) : wishlistProducts.length > 0 ? (
            <>
              <div className="wishlist-title">
                <h4>Sản Phẩm Yêu Thích - Lưu giữ những món đồ bạn ấn tượng</h4>
                <p>
                  Lưu lại những sản phẩm bạn yêu thích để dễ dàng tìm lại và mua sắm
                  khi bạn sẵn sàng,
                  <br />
                  giúp việc mua sắm trở nên tiện lợi và nhanh chóng hơn bao giờ hết.
                </p>
              </div>

              <section className="boxProducts">
                <div className="container">
                  <section className="section-box-products">
                    <div className="box-products-container">
                      {wishlistProducts.map((product) => (
                        <ProductComponent
                          key={product.id}
                          product={product}
                          slug={product.slug}
                        />
                      ))}
                    </div>
                  </section>
                </div>
              </section>
            </>
          ) : (
            <div className="wishlist-state-container">
              <EmptyState
                title="Danh sách yêu thích của bạn đang trống"
                message="Hãy thêm sản phẩm vào danh sách yêu thích để dễ dàng theo dõi và mua sắm sau này."
                actionLabel="Khám phá sản phẩm ngay"
                actionTo="/san-pham"
              />
            </div>
          )}
        </section>
      </div>
      <section className="policy-product mt-94">
        <PolicyProduct />
      </section>
    </>
  );
};

export default Wishlist;
