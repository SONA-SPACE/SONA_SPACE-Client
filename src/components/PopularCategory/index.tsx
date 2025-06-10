import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getFeaturedCategories, formatCategoryForDisplay } from "../../services/categoryService";
import type { Category } from "../../types";
import "./styles.css";

const PopularCategory = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        console.log("PopularCategory: Fetching featured categories");
        const data = await getFeaturedCategories(6); // Lấy 6 danh mục nổi bật
        console.log("PopularCategory: Received categories:", data);
        setCategories(data);
        setError(null);
      } catch (err) {
        console.error("Error loading featured categories:", err);
        setError("Không thể tải danh mục sản phẩm");
        // Sử dụng dữ liệu mặc định nếu API lỗi
        setCategories(defaultCategories);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Dữ liệu mặc định nếu API lỗi
  const defaultCategories = [
    {
      category_id: 1,
      category_name: "Ghế",
      category_slug: "ghe",
      category_image: "/images/productsCategory/ghe.jpg",
      category_priority: 1,
      category_status: 1,
      updated_at: "",
      created_at: "",
      deleted_at: null,
      product_count: 10
    },
    {
      category_id: 2,
      category_name: "Bàn",
      category_slug: "ban",
      category_image: "/images/productsCategory/ban.jpg",
      category_priority: 2,
      category_status: 1,
      updated_at: "",
      created_at: "",
      deleted_at: null,
      product_count: 15
    },
    {
      category_id: 3,
      category_name: "Tủ",
      category_slug: "tu",
      category_image: "/images/productsCategory/tu.jpg",
      category_priority: 3,
      category_status: 1,
      updated_at: "",
      created_at: "",
      deleted_at: null,
      product_count: 8
    },
    {
      category_id: 4,
      category_name: "Sofa",
      category_slug: "sofa",
      category_image: "/images/productsCategory/sofa.jpg",
      category_priority: 4,
      category_status: 1,
      updated_at: "",
      created_at: "",
      deleted_at: null,
      product_count: 12
    },
    {
      category_id: 5,
      category_name: "Đèn",
      category_slug: "den",
      category_image: "/images/productsCategory/den.jpg",
      category_priority: 5,
      category_status: 1,
      updated_at: "",
      created_at: "",
      deleted_at: null,
      product_count: 20
    },
    {
      category_id: 6,
      category_name: "Tranh",
      category_slug: "tranh",
      category_image: "/images/productsCategory/tranh.jpg",
      category_priority: 6,
      category_status: 1,
      updated_at: "",
      created_at: "",
      deleted_at: null,
      product_count: 7
    }
  ];

  if (loading) {
    return (
      <div className="popular-category-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải danh mục sản phẩm...</p>
      </div>
    );
  }

  // Chia danh mục thành 2 nhóm: 2 danh mục đầu và các danh mục còn lại
  const topCategories = categories.slice(0, 2);
  const remainingCategories = categories.slice(2);

  return (
    <section className="PopularCategory-full">
      <div className="container">
        <div className="category-of-products">
          <div className="category-of-products-s1">
            <div className="products-s1-frame-1">
              <div className="frame-1-text">
                <a className="frame-1-text1">Các danh mục sản phẩm phổ biến nhất</a>
                <a className="frame-1-text2">
                  Khám phá những danh mục sản phẩm được ưa chuộng và lựa chọn nhiều nhất hiện nay
                </a>
              </div>
            </div>

            {topCategories.map((category) => {
              const formattedCategory = formatCategoryForDisplay(category);
              return (
                <div className="products-s1-frame-2" key={formattedCategory.id}>
                  <img 
                    src={formattedCategory.image} 
                    alt={formattedCategory.name}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = "/images/placeholder.jpg";
                    }}
                  />
                  <div className="frame-2-t">
                    <h3>{formattedCategory.name}</h3>
                    <Link className="btn btn-primary" to={`/danh-muc/${formattedCategory.slug}`}>
                      Xem Sản Phẩm
                      <i className="icon">
                        <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M13.9128 4L9.8048 1M13.9128 4L9.8048 7M13.9128 4H1.12402"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </i>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="category-of-products-s2">
            {remainingCategories.map((category) => {
              const formattedCategory = formatCategoryForDisplay(category);
              return (
                <div className="products-s2-frame-1" key={formattedCategory.id}>
                  <img 
                    src={formattedCategory.image} 
                    alt={formattedCategory.name}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = "/images/placeholder.jpg";
                    }}
                  />
                  <div className="frame-2-t">
                    <h3>{formattedCategory.name}</h3>
                    <Link className="btn btn-cate" to={`/danh-muc/${formattedCategory.slug}`}>
                      Xem Sản Phẩm
                      <i className="icon">
                        <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M13.9128 4L9.8048 1M13.9128 4L9.8048 7M13.9128 4H1.12402"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </i>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PopularCategory;

