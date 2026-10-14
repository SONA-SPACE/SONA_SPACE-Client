"use client";
import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ToastContainer } from "react-toastify";

// Component
import Filter from "../../components/filter";
import ProductComponent from "../../components/Product";
import PolicyProduct from "../../components/Policy";
import GetInTouch from "../../components/getintouch";
import PopularCategory from "../../components/PopularCategory";
import Seemore from "../../components/seemore";
import BannerSlider from "../../components/BannerSlider";
import {
  EmptyState,
  InlineErrorState,
  PageSectionSkeleton,
  RetryState,
} from "../../components/StateFeedback";

// Type
import type { Product } from "../../types";

// Service or API
import { fetchAllProducts } from "../../services/productService";

const DEFAULT_FILTER_LABELS = [
  "Chọn danh mục",
  "Chọn phòng",
  "Chọn giá",
  "Chọn màu",
  "Sắp xếp",
];

type ProductFilters = { [key: string]: string };

const PRODUCT_FILTER_KEYS = ["category", "room", "price", "color", "sort"];

const getFiltersFromSearchParams = (
  searchParams: URLSearchParams
): ProductFilters =>
  PRODUCT_FILTER_KEYS.reduce<ProductFilters>((currentFilters, key) => {
    const value = searchParams.get(key);

    if (value && !DEFAULT_FILTER_LABELS.includes(value)) {
      currentFilters[key] = value;
    }

    return currentFilters;
  }, {});

const getSearchParamsFromFilters = (filters: ProductFilters) => {
  const nextParams = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value && !DEFAULT_FILTER_LABELS.includes(value)) {
      nextParams.set(key, value);
    }
  });

  return nextParams;
};

const ProductPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<ProductFilters>({});
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const searchParamsKey = searchParams.toString();

  const fetchProducts = async (
    pageNumber: number,
    currentFilters = {},
    isLoadMore = false
  ) => {
    if (isLoadMore) {
      setIsLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const { products: newProducts, totalPages } = await fetchAllProducts(
        pageNumber,
        8,
        currentFilters
      );

      if (isLoadMore) {
        setProducts((prevProducts) => [...prevProducts, ...newProducts]);
      } else {
        setProducts(newProducts);
      }

      setTotalPages(totalPages);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Không thể tải danh sách sản phẩm.");
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    const urlFilters = getFiltersFromSearchParams(searchParams);
    setPage(1);
    setFilters(urlFilters);
    fetchProducts(1, urlFilters, false);
  }, [searchParamsKey]);

  const handleFilterChange = (newFilters: ProductFilters) => {
    const nextParams = getSearchParamsFromFilters(newFilters);

    if (nextParams.toString() === searchParamsKey) {
      setPage(1);
      setFilters(newFilters);
      fetchProducts(1, newFilters, false);
      return;
    }

    setSearchParams(nextParams);
  };

  const handleSeeMore = () => {
    if (page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProducts(nextPage, filters, true);
    }
  };

  return (
    <>
      <BannerSlider page="san-pham" />
      <div className="breadcrumb-container">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Trang chủ</Link>
            <span>/</span>
            <span className="active">Sản phẩm</span>
          </div>
        </div>
      </div>

      <section className="product-section mt-94">
        <PopularCategory />
      </section>

      <section className="product-section mt-94">
        <Filter
          initialFilters={filters}
          onFilterChange={handleFilterChange}
        />
        <div className="boxProducts">
          <div className="container">
            <div className="section-box-products">
              {loading && <PageSectionSkeleton count={8} />}
              {!loading && error && (
                <RetryState
                  message={error}
                  onRetry={() => fetchProducts(page, filters, false)}
                  secondaryActionLabel="Về trang chủ"
                  secondaryActionTo="/"
                />
              )}
              {!loading && !error && products.length === 0 && (
                <EmptyState
                  title="Không có sản phẩm phù hợp"
                  message="Hãy thử đổi bộ lọc hoặc quay lại danh sách sản phẩm đầy đủ."
                  actionLabel="Xóa bộ lọc"
                  onAction={() => handleFilterChange({})}
                  secondaryActionLabel="Về trang chủ"
                  secondaryActionTo="/"
                />
              )}
              {!loading && !error && products.length > 0 && (
                <div className="box-products-container">
                  {products.map((product) => (
                    <ProductComponent
                      key={product.id}
                      product={product}
                      slug={product.slug}
                    />
                  ))}
                </div>
              )}
              {isLoadingMore && (
                <InlineErrorState message="Đang tải thêm sản phẩm..." />
              )}
              {!loading && !error && !isLoadingMore && page < totalPages && (
                <Seemore onClick={handleSeeMore} />
              )}
            </div>
          </div>
        </div>
      </section>
      <section className="policy-product mt-94">
        <PolicyProduct />
      </section>
      <section className="get-in-touch mt-94">
        <GetInTouch />
      </section>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        style={{ marginTop: "100px" }}
      />
    </>
  );
};

export default ProductPage;
