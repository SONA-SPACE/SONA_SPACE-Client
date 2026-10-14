import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import RoomSlider from "../../components/RoomSlider";
import Filter from "../../components/filter";
import ProductComponent from "../../components/Product";
import {
  fetchRoomBySlug,
  fetchProductsByRoomWithFilters,
} from "../../services/roomService";
import type { Room, Product } from "../../types";
import Seemore from "../../components/seemore";
import PageHero from "../../components/PageHero";
import ListingPageSkeleton from "../../components/ListingPageSkeleton";
import { RetryState } from "../../components/StateFeedback";

const PAGE_SIZE = 8;

const RoomDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [room, setRoom] = useState<Room | null>(null);
  const [products, setProducts] = useState<Product[]>([]); // products hiển thị
  const [allProducts, setAllProducts] = useState<Product[]>([]); // toàn bộ sản phẩm đã tải
  const [filteredAll, setFilteredAll] = useState<Product[]>([]); // kết quả sau khi lọc
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentFilters, setCurrentFilters] = useState<{
    [key: string]: string;
  }>({});

  const applyFilters = (
    source: Product[],
    filters: { [key: string]: string }
  ): Product[] => {
    let data = [...source];

    // category (so khớp theo tên)
    if (filters.category) {
      data = data.filter((p) => p.category?.name === filters.category);
    }

    // price (dựa vào actualPrice: ưu tiên price_sale nếu hợp lệ)
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

    // color (ở trang này dùng color hex)
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

  const handleFilterChange = (newFilters: { [key: string]: string }) => {
    setCurrentFilters(newFilters);
    // Lọc trên client, không gọi API
    const filtered = applyFilters(allProducts, newFilters);
    setFilteredAll(filtered);
    setPage(1);
    setTotalPages(Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
    setProducts(filtered.slice(0, PAGE_SIZE));
  };

  useEffect(() => {
    if (!slug) {
      setError("Không gian không tồn tại");
      setLoading(false);
      return;
    }

    const fetchRoomAndProducts = async () => {
      try {
        // console.log(
        //   `🏠 [RoomDetail] Fetching room and products for slug:`,
        //   slug
        // );

        const roomData = await fetchRoomBySlug(slug);
        // console.log(`🏠 [RoomDetail] Room data received:`, roomData);
        setRoom(roomData[0] || roomData);

        // Chỉ gọi API 1 lần để lấy nhiều sản phẩm, sau đó lọc client
        // console.log(`🛍️ [RoomDetail] Fetching products with roomSlug:`, slug);
        const { products: initialProducts } =
          await fetchProductsByRoomWithFilters(
            slug,
            1,
            200, // tải nhiều sản phẩm để lọc cục bộ
            {}
          );

        // console.log(`🛍️ [RoomDetail] Initial products received:`, {
        //   count: initialProducts.length,
        //   firstProduct: initialProducts[0]
        //     ? {
        //         id: initialProducts[0].id,
        //         name: initialProducts[0].name,
        //         category: initialProducts[0].category,
        //       }
        //     : null,
        // });

        setAllProducts(initialProducts);
        // Khởi tạo filteredAll và products hiển thị
        const initialFiltered = applyFilters(initialProducts, {});
        // console.log(`🔍 [RoomDetail] Initial filtered products:`, {
        //   count: initialFiltered.length,
        // });

        setFilteredAll(initialFiltered);
        setTotalPages(
          Math.max(1, Math.ceil(initialFiltered.length / PAGE_SIZE))
        );
        setProducts(initialFiltered.slice(0, PAGE_SIZE));

        // console.log(`✅ [RoomDetail] State updated successfully`);
      } catch (error) {
        console.error(`❌ [RoomDetail] Error fetching data:`, error);
        setError("Không tìm thấy không gian");
      } finally {
        setLoading(false);
      }
    };

    fetchRoomAndProducts();
  }, [slug]);

  if (loading && page === 1) {
    return <ListingPageSkeleton pageClassName="room-detail-page" sectionClassName="product-section mt-94" />;
  }

  if (error) {
    return (
      <div className="room-detail-page">
        <PageHero title="Không gian" />
        <div className="container">
          <RetryState
            message={error}
            onRetry={() => window.location.reload()}
            secondaryActionLabel="Xem các không gian khác"
            secondaryActionTo="/khong-gian"
          />
        </div>
      </div>
    );
  }

  const handleSeeMore = () => {
    if (page < totalPages && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      setProducts(filteredAll.slice(0, nextPage * PAGE_SIZE));
    }
  };

  return (
    <>
      <div className="room-detail-page">
        <PageHero
          title={room?.room_name ?? ""}
          image={room?.room_banner || undefined}
          breadcrumbs={[
            { label: "Trang chủ", to: "/" },
            { label: "Không gian", to: "/khong-gian" },
            { label: room?.room_name ?? "" },
          ]}
        />

        {/* Product Section */}
        <section className="product-section mt-94">
          <Filter
            onFilterChange={handleFilterChange}
            hideRoomFilter={true}
            colorMode="hex"
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

                {!loading &&
                  filteredAll &&
                  filteredAll.length > 12 &&
                  products.length < filteredAll.length && (
                    <Seemore onClick={handleSeeMore} />
                  )}
              </div>
            </div>
          </div>
        </section>

        {/* Inspiration Section */}
        <section className="inspiration-section mt-94">
          <div className="container">
            <div className="inspiration-content">
              <div className="inspiration-text">
                <h2>Thiết kế không gian sống theo phong cách của bạn</h2>
                <p>
                  SONA SPACE cung cấp dịch vụ thiết kế nội thất chuyên nghiệp,
                  giúp bạn tạo ra không gian sống lý tưởng phù hợp với phong
                  cách và nhu cầu cá nhân. Đội ngũ thiết kế của chúng tôi sẽ làm
                  việc chặt chẽ với bạn để hiểu rõ mong muốn và đưa ra giải pháp
                  tối ưu cho không gian của bạn.
                </p>
                <a href="/lien-he" className="discover-btn">
                  Liên hệ ngay
                  <i className="icon">
                    <svg
                      width="14"
                      height="8"
                      viewBox="0 0 14 8"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M13.9128 4L9.8048 1M13.9128 4L9.8048 7M13.9128 4H1.12402"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </i>
                </a>
              </div>

              <div className="inspiration-image">
                <img
                  src="/images/rooms/room-detail/image-banner.jpg"
                  alt="Thiết kế nội thất chuyên nghiệp"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="categories-section mt-94">
          <div className="container">
            <h2 className="section-title">Khám phá thêm các căn phòng</h2>
            <RoomSlider />
          </div>
        </section>
      </div>
    </>
  );
};

export default RoomDetail;
