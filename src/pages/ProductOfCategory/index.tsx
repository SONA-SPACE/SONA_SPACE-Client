import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import Filter from "../../components/filter";
import Seemore from "../../components/seemore";
import CategorySlider from "../../components/CategorySlider";
import ProductComponent from "../../components/Product";
import {
  fetchCategoryBySlug,
  fetchProductsByCategoryUsingTest,
} from "../../services/categoryService";
import type { Category, Product } from "../../types";
import { formatProductForDisplay } from "../../services/productService";
import PageHero from "../../components/PageHero";

const PAGE_SIZE = 8;

const ProductOfCategory = () => {
  const { slug } = useParams();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]); // products hiển thị
  const [allProducts, setAllProducts] = useState<Product[]>([]); // toàn bộ sản phẩm đã tải
  const [filteredAll, setFilteredAll] = useState<Product[]>([]); // kết quả sau khi lọc
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [currentFilters, setCurrentFilters] = useState<{
    [key: string]: string;
  }>({});

  const applyFilters = (
    source: Product[],
    filters: { [key: string]: string }
  ): Product[] => {
    let data = [...source];

    // price
    if (filters.price) {
      data = data.filter((p) => {
        const base = typeof p.price === "number" ? p.price : 0;
        const sale =
          typeof p.price_sale === "number" && p.price_sale > 0
            ? p.price_sale
            : undefined;
        const actualPrice = sale ?? base;
        if (filters.price === "Dưới 10 triệu") return actualPrice < 10_000_000;
        if (filters.price === "10 - 30 triệu")
          return actualPrice >= 10_000_000 && actualPrice <= 30_000_000;
        if (filters.price === "Trên 30 triệu") return actualPrice > 30_000_000;
        return true;
      });
    }

    // room (client-side using rooms[] slug)
    if (filters.roomSlug) {
      data = data.filter(
        (p) => Array.isArray(p.rooms) && p.rooms.includes(filters.roomSlug)
      );
    }

    // color (hex)
    if (filters.color) {
      data = data.filter(
        (p) => Array.isArray(p.colors) && p.colors.includes(filters.color)
      );
    }

    // sort
    if (filters.sort) {
      const getActualPrice = (p: Product) => {
        const base = typeof p.price === "number" ? p.price : 0;
        const sale =
          typeof p.price_sale === "number" && p.price_sale > 0
            ? p.price_sale
            : undefined;
        return sale ?? base;
      };
      if (filters.sort === "Giá tăng dần") {
        data.sort((a, b) => getActualPrice(a) - getActualPrice(b));
      } else if (filters.sort === "Giá giảm dần") {
        data.sort((a, b) => getActualPrice(b) - getActualPrice(a));
      } else if (filters.sort === "Mới nhất") {
        data.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      } else if (filters.sort === "Giảm giá") {
        const disc = (p: Product) => {
          if (
            typeof p.price === "number" &&
            typeof p.price_sale === "number" &&
            p.price_sale > 0 &&
            p.price > 0
          ) {
            return ((p.price - p.price_sale) / p.price) * 100;
          }
          return 0;
        };
        data.sort((a, b) => disc(b) - disc(a));
      }
    }

    return data;
  };

  const handleSeeMore = () => {
    const page = parseInt(searchParams.get("page") || "1", 10);
    const next = page + 1;
    // Chỉ hiển thị page trong URL khi page > 1
    if (next > 1) {
      setSearchParams({ page: next.toString() });
    } else {
      setSearchParams({});
    }
    setProducts(filteredAll.slice(0, next * PAGE_SIZE));
  };

  const handleFilterChange = (newFilters: { [key: string]: string }) => {
    // console.log("[Category] onFilterChange (client)", newFilters);
    const filtered = applyFilters(allProducts, newFilters);
    setFilteredAll(filtered);
    setSearchParams({}); // Không set page khi reset về trang 1
    setProducts(filtered.slice(0, PAGE_SIZE));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!slug) return;

        // 1. Lấy category từ slug
        const categoryData = await fetchCategoryBySlug(slug);
        setCategory(categoryData);
        if (!categoryData) {
          navigate("/not-found");
        }

        // 2. Gọi API /products/test theo categorySlug, lấy nhiều sản phẩm
        const result = await fetchProductsByCategoryUsingTest(slug, {
          page: 1,
          pageSize: 200,
        });

        const formatted = (result?.products || []).map(formatProductForDisplay);
        setAllProducts(formatted);
        const initial = applyFilters(formatted, {});
        setFilteredAll(initial);
        setSearchParams({}); // Không set page khi khởi tạo
        setProducts(initial.slice(0, PAGE_SIZE));
      } catch (err) {
        console.error("Lỗi lấy sản phẩm theo danh mục:", err);
        setError("Đã xảy ra lỗi khi tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    navigate("/not-found");
  }

  const shouldShowSeeMore =
    !loading && filteredAll.length > 12 && products.length < filteredAll.length;

  return (
    <>
      <div className="product-of-category">
        <PageHero
          title={category?.category_name ?? ""}
          image={category?.category_banner || undefined}
          breadcrumbs={[
            { label: "Trang chủ", to: "/" },
            { label: "Sản phẩm", to: "/san-pham" },
            { label: category?.category_name ?? "" },
          ]}
        />

        <section className="product-listing">
          <Filter
            onFilterChange={handleFilterChange}
            hideCategoryFilter={true}
            colorMode="hex"
            roomSlugMode={true}
          />
          <div className="boxProducts">
            <div className="container">
              <div className="section-box-products">
                {products.length === 0 && (
                  <p className="empty-text">
                    Không có sản phẩm phù hợp với bộ lọc.
                  </p>
                )}
                <div className="box-products-container">
                  {products.map((product) => (
                    <ProductComponent
                      key={product.id}
                      product={product}
                      slug={product.slug}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
        {shouldShowSeeMore && <Seemore onClick={handleSeeMore} />}

        <section className="product-categories">
          <div className="container">
            <h2 className="section-title">Danh Mục Sản Phẩm</h2>

            <CategorySlider />
          </div>
        </section>
      </div>
    </>
  );
};

export default ProductOfCategory;
