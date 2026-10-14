"use client";

// Import libraries
import React, { useState, useEffect, useRef } from "react";
import {
  useParams,
  useSearchParams,
  useNavigate,
  Link,
} from "react-router-dom";
import { toast } from "react-toastify";

// import components
import PolicyProduct from "../../components/Policy";
import Comment from "../../components/Comment";
import type { MiniCartHandle } from "../../components/MiniCart";
// import API,
import { getProductBySlug } from "../../api/product";
import { getProductComments } from "../../api/comment";

// import services
import {
  formatProductForDisplay,
  getRelatedProductsByRoom,
} from "../../services/productService";
import { fetchVariantBySlugAndColor } from "../../services/variantService";
import { saveToOrCart } from "../../services/cartService";
import { addToWishlist, removeFromWishlistService, checkVariantInWishlist, fetchWishlistFromDatabase } from "../../services/wishlistService";
import { getAuthToken } from "../../services/loginService";
// import types
import type { Product } from "../../types";
import type { CommentResponse } from "../../types";

import ProductComponent from "../../components/Product";
import {
  EmptyState,
  PageSectionSkeleton,
  RetryState,
} from "../../components/StateFeedback";
const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const miniCartRef = useRef<MiniCartHandle>(null);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<string>("description");
  const [commentData, setCommentData] = useState<CommentResponse | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [cartCount, setCartCount] = useState<number>(0);
  const [isLoadingProduct, setIsLoadingProduct] = useState<boolean>(true);
  const [productError, setProductError] = useState<string | null>(null);
  const [productReloadToken, setProductReloadToken] = useState<number>(0);

  const [wishlist, setWishlist] = useState<boolean>(false);

  const handleColorSelect = async (colorHex: string, colorId: number) => {
    try {
      setSelectedColor(colorHex);
      setSearchParams((prev) => {
        prev.set("color", colorId.toString());
        return prev;
      });
      // console.log("selectedVariant", selectedVariant);
      if (slug) {
        const variant = await fetchVariantBySlugAndColor(slug, colorId);

        if (variant) {
          setSelectedVariant({
            variant_id: variant.variant_id,
            variant_price: variant.price,
            variant_price_sale: variant.priceSale,
            listImage: variant.images.join(","),
            quantity: variant.quantity,
            color_hex: variant.color.hex,
            color_name: variant.color.name,
          });
        }
      }
    } catch (error) {
      // console.error("Error selecting color:", error);
    }
  };
  const imageList = selectedVariant?.listImage
    ? selectedVariant.listImage.split(",")
    : product?.images || [];

  useEffect(() => {
    if (!slug) {
      setIsLoadingProduct(false);
      setProductError("Không tìm thấy đường dẫn sản phẩm.");
      return;
    }
    setIsLoadingProduct(true);
    setProductError(null);
    (async () => {
      try {
        const res = await getProductBySlug(slug);

        // Format lại product
        const formattedProduct = formatProductForDisplay({
          ...res.product,
          price: parseFloat(res.product.defaultPrice),
          price_sale: parseFloat(res.product.defaultPriceSale),
          images: res.product.defaultImages,

          variant_id:
            res.product.variant_id || res.colors?.[0]?.variant_id || 0,

          variants: res.colors.map((c: any) => ({
            color_id: c.colorId,
            color_name: c.colorName,
            color_hex: c.colorHex,
            color_priority: c.colorPriority || 0,
            variant_id: c.variant_id,
          })),
          stock: res.product.defaultQuantity,
          sold: res.product.sold,
          view: res.product.view,
          description: res.product.description,

          material: res.product.materials,
          height: Number(res.product.height),
          width: Number(res.product.width),
          depth: Number(res.product.depth),
          seating_height: Number(res.product.seating_height),
          maxium_weight: Number(res.product.max_weight_load),

          attributes: res.product.attributes || [],
        });
        // console.log("Formatted Product:", formattedProduct);
        setProduct(formattedProduct);
        setRelatedProducts(res.related_products || []);

        const colorIdFromUrl = searchParams.get("color");
        const defaultColor = formattedProduct.variants?.[0];

        const selectedColorId = colorIdFromUrl
          ? parseInt(colorIdFromUrl)
          : defaultColor?.color_id;

        const selectedColorHex = formattedProduct.variants?.find(
          (v) => v.color_id === selectedColorId
        )?.color_hex;

        // Set mặc định selectedColor nếu chưa có
        if (!colorIdFromUrl && selectedColorId && selectedColorHex) {
          setSelectedColor(selectedColorHex);
          setSearchParams((prev) => {
            prev.set("color", selectedColorId.toString());
            return prev;
          });
        }

        if (selectedColorHex && selectedColorId) {
          await handleColorSelect(selectedColorHex, selectedColorId);
        }
        setIsLoadingProduct(false);
      } catch (err) {
        setProduct(null);
        setProductError("Không thể tải thông tin sản phẩm. Vui lòng thử lại.");
        setIsLoadingProduct(false);
        // console.error("Lỗi khi fetch product:", err);
      }
    })();
  }, [slug, productReloadToken]);

  useEffect(() => {
    if (!product?.variants) return;

    const colorId = searchParams.get("color");
    if (colorId) {
      const variant = product.variants.find(
        (v) => v.color_id.toString() === colorId
      );
      if (variant) {
        handleColorSelect(variant.color_hex, variant.color_id);
      }
    }
  }, [product, searchParams]);
  useEffect(() => {
    if (!product?.id) return;

    const fetchComments = async () => {
      try {
        const data = await getProductComments(product.id);
        setCommentData(data);
      } catch (error) {
        // console.error("Error fetching comments:", error);
      }
    };

    fetchComments();
  }, [product?.id]);

  const formatPrice = (price?: number): string => {
    if (typeof price !== "number" || isNaN(price)) return "0";
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleQuantityChange = (amount: number) => {
    const newQuantity = quantity + amount;
    if (newQuantity > 0) setQuantity(newQuantity);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) {
        stars.push(<img key={i} src="/images/detail/star.svg" alt="" />);
      } else if (i - 0.5 === rating) {
        stars.push(
          <img key={i} src="/images/detail/star-half-filled.svg" alt="" />
        );
      } else {
        stars.push(<img key={i} src="/images/detail/star-filled.svg" alt="" />);
      }
    }
    return stars;
  };

  const addToCart = async () => {
    if (!product || !selectedVariant) return;

    const variant_id = selectedVariant?.variant_id;
    if (!variant_id || isNaN(variant_id)) {
      toast.error("Không tìm thấy biến thể sản phẩm");
      return;
    }
    const stock = selectedVariant.quantity ?? product.stock;
    if (stock <= 0) {
      toast.warning("Sản phẩm đã hết hàng, không thể thêm vào giỏ!", {
        position: "top-right",
        autoClose: 1500,
      });
      return;
    }

    const token = getAuthToken();
    if (!token) {
      toast.warning("Vui lòng đăng nhập để thêm vào giỏ hàng", {
        position: "top-right",
        autoClose: 1000,
      });

      setTimeout(() => {
        navigate("/dang-nhap");
      }, 2000);

      return;
    }

    try {
      const response = await saveToOrCart({
        status: 0,
        cartItems: [
          {
            variant_id: Number(selectedVariant.variant_id),
            quantity: Number(quantity),
          },
        ],
      });
      if (miniCartRef.current) {
        miniCartRef.current.notifyCartChanged(); // Cập nhật cart
        miniCartRef.current?.toggleMiniCart();
      }
      if (response.success) {
        toast.success("Đã thêm vào giỏ hàng!", {
          position: "top-right",
          autoClose: 500,
        });
      } else {
        toast.error("Lỗi khi thêm vào giỏ hàng: " + response.message);
      }
    } catch (error: any) {
      // console.error("Add to cart error:", error);
      toast.error("Lỗi khi thêm vào giỏ hàng.");
    }
  };

  useEffect(() => {
    if (!product?.id) return;

    const fetchRelatedProducts = async () => {
      try {
        const related = await getRelatedProductsByRoom(product.id);
        // console.log("AAA", related);
        setRelatedProducts(related);
      } catch (error) {
        // console.error("Lỗi lấy sản phẩm liên quan:", error);
      }
    };

    fetchRelatedProducts();
  }, [product?.id]);

  const toggleWishlist = async () => {
    if (!selectedVariant?.variant_id) return;

    const token = getAuthToken();
    if (!token) {
      toast.warning("Vui lòng đăng nhập để thêm vào yêu thích!", {
        autoClose: 2000,
      });
      navigate("/dang-nhap");
      return;
    }

    try {
      if (wishlist) {
        await removeFromWishlistService(selectedVariant.variant_id);
        setWishlist(false);
        toast.success("Đã xóa khỏi yêu thích", {
          autoClose: 1000,
        });
      } else {
        await addToWishlist(selectedVariant.variant_id, 1);
        setWishlist(true);
        toast.success("Đã thêm vào yêu thích", {
          autoClose: 1000,
        });
      }
    } catch (error) {
      // console.error("Wishlist error:", error);
      toast.error("Lỗi xử lý yêu thích", {
        autoClose: 1000,
      });
    }
  };

  useEffect(() => {
    const fetchWishlistStatus = async () => {
      if (!selectedVariant?.variant_id) return;

      try {
        const token = getAuthToken();
        if (!token) {
          setWishlist(false);
          return;
        }

        const exists = await checkVariantInWishlist(selectedVariant.variant_id);
        setWishlist(exists);
      } catch (error) {
        //  console.error("Error checking wishlist:", error);
        setWishlist(false);
      }
    };

    fetchWishlistStatus();
  }, [selectedVariant?.variant_id]);


  if (isLoadingProduct) {
    return (
      <>
        <PageSectionSkeleton variant="product-detail" />
      </>
    );
  }

  if (productError) {
    return (
      <>
        <RetryState
          message={productError}
          onRetry={() => setProductReloadToken((current) => current + 1)}
          secondaryActionLabel="Xem sản phẩm khác"
          secondaryActionTo="/san-pham"
        />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <EmptyState
          title="Không tìm thấy sản phẩm"
          message="Sản phẩm này có thể đã ngừng bán hoặc đường dẫn không còn hợp lệ."
          actionLabel="Xem sản phẩm khác"
          actionTo="/san-pham"
        />
      </>
    );
  }
  return (
    <>
      <div className="product-details">
        <div className="breadcrumb-container">
          <div className="container">
            <div className="breadcrumb">
              <Link to="/san-pham">Sản phẩm</Link>
              <span>/</span>
              <span className="active">{product.name}</span>
            </div>
          </div>
        </div>

        <div className="details-infomation">
          <div className="container">
            <div className="detail-products">
              <div className="detail-image">
                <div className="image-full">
                  <div
                    className="image1"
                    style={{ display: imageList[0]?.trim() ? "" : "none" }}
                  >
                    <img src={imageList[0]?.trim()} alt="" />
                  </div>

                  <div className="image2">
                    <div
                      className="image2-1"
                      style={{ display: imageList[1]?.trim() ? "" : "none" }}
                    >
                      <img src={imageList[1]?.trim()} alt="" />
                    </div>
                    <div
                      className="image2-2"
                      style={{ display: imageList[2]?.trim() ? "" : "none" }}
                    >
                      <img src={imageList[2]?.trim()} alt="" />
                    </div>
                  </div>

                  <div className="image3">
                    <div
                      className="image3-1"
                      style={{ display: imageList[3]?.trim() ? "" : "none" }}
                    >
                      <img src={imageList[3]?.trim()} alt="" />
                    </div>
                    <div
                      className="image3-2"
                      style={{ display: imageList[4]?.trim() ? "" : "none" }}
                    >
                      <img src={imageList[4]?.trim()} alt="" />
                    </div>
                  </div>

                  <div
                    className="image4"
                    style={{ display: imageList[5]?.trim() ? "" : "none" }}
                  >
                    <img src={imageList[5]?.trim()} alt="" />
                  </div>

                  <div
                    className="image5"
                    style={{ display: imageList[6]?.trim() ? "" : "none" }}
                  >
                    <img src={imageList[6]?.trim()} alt="" />
                  </div>
                </div>
              </div>

              <div className="detail-content">
                <div className="content-name">
                  <h1>{product.name}</h1>
                </div>
                <div className="content-description">
                  <span>
                    {product.category?.name || "Danh mục không xác định"}
                  </span>
                </div>
                <div className="content-price">
                  {selectedVariant?.variant_price_sale > 0 ||
                    product.priceSale > 0 ? (
                    <>
                      <span className="price">
                        {formatPrice(
                          selectedVariant?.variant_price_sale ||
                          product.priceSale
                        )}{" "}
                        đ
                      </span>
                      <span
                        className="price-old"
                        style={{ textDecoration: "line-through" }}
                      >
                        {formatPrice(
                          selectedVariant?.variant_price || product.price
                        )}{" "}
                        đ
                      </span>
                    </>
                  ) : (
                    <span className="price">
                      {formatPrice(
                        selectedVariant?.variant_price || product.price
                      )}{" "}
                      đ
                    </span>
                  )}
                </div>
                <div className="content-rating">
                  <div className="rating-icon">
                    <div className="icon-star">
                      {renderStars(
                        Number(commentData?.stats.average_rating || 0)
                      )}
                    </div>
                    <div className="icon-star-number">
                      <span>{commentData?.stats.average_rating || 0}</span>
                    </div>
                  </div>
                  <div className="rating-evaluate">
                    <span>
                      {commentData?.stats.total_ratings || 0} lượt đánh giá
                    </span>
                  </div>
                </div>
                <div className="content-quantity">
                  <span>
                    Số lượng trong kho:{" "}
                    {selectedVariant?.quantity || product.stock}
                  </span>
                </div>
                <div className="content-view">
                  <span>Lượt xem: {product.view}</span>
                  <span className="view1">
                    {" "}
                    Sản phẩm đã bán: {product.sold}
                  </span>
                </div>
                <div className="content-color">
                  <span>Chọn màu sắc</span>
                  <div className="color-options">
                    {product.variants?.map((v: any) => (
                      <div
                        key={v.color_id}
                        style={{ backgroundColor: v.color_hex }}
                        className={`color-option${selectedColor?.toLowerCase() ===
                          v.color_hex?.toLowerCase()
                          ? " active"
                          : ""
                          }`}
                        onClick={() => {
                          setSelectedColor(v.color_hex); // Đảm bảo cập nhật selectedColor khi click
                          handleColorSelect(v.color_hex, v.color_id);
                        }}
                        title={v.color_name}
                      ></div>
                    ))}
                  </div>
                </div>
                <div className="content-input-quantity">
                  <span>Chọn số lượng</span>
                  <div className="input-options">
                    <button
                      className="quantity-input-"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                    >
                      {" "}
                      <img src="/images/detail/tru.svg" alt="" />
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      max={selectedVariant?.quantity || product.stock}
                      onChange={(e) => {
                        const input = e.target.value;
                        if (input === "") {
                          setQuantity("");
                          return;
                        }
                        const value = parseInt(input, 10);
                        const max = selectedVariant?.quantity || product.stock;
                        if (!isNaN(value)) {
                          const safeValue = Math.max(1, Math.min(value, max));
                          setQuantity(safeValue);
                        }
                      }}
                      onBlur={() => {
                        if (quantity === "") {
                          setQuantity(1);
                        }
                      }}
                      className="quantity-inputt"
                    />


                    <button
                      className="quantity-btn increase"
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= (selectedVariant?.quantity || product.stock)}
                    >
                      <img src="/images/detail/cong.svg" alt="" />
                    </button>

                  </div>
                </div>
                <div className="content-button">
                  <button
                    className={`button-add-cart ${selectedVariant?.quantity === 0 ? "disabled" : ""}`}
                    onClick={addToCart}
                    disabled={selectedVariant?.quantity === 0}
                  >
                    {selectedVariant?.quantity === 0 ? "Hết hàng" : "Thêm vào giỏ"}
                  </button>

                  <div className="button-icon-i">
                    <div className="icon-img">
                      <img
                        key={wishlist ? "heart-red" : "heart"}
                        src={wishlist ? "/images/products/heart-red.svg" : "/images/products/heart.svg"}
                        alt="wishlist"
                        onClick={toggleWishlist}
                      />

                    </div>
                    {/* <div className="icon-img">
                      <img src="/images/detail/share.svg" alt="" />
                    </div> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="detail-decriptionn">
          <div className="container">
            <div className="detail-decription-evaluate">
              <div className="description-avalute-title">
                <div className="tabs-header">
                  <button
                    className={`tab-btn ${activeTab === "description" ? "active" : ""
                      }`}
                    onClick={() => setActiveTab("description")}
                  >
                    Mô tả
                  </button>
                  <button
                    className={`tab-btn ${activeTab === "review" ? "active" : ""
                      }`}
                    onClick={() => setActiveTab("review")}
                  >
                    Đánh giá
                  </button>
                </div>
              </div>
              {activeTab === "description" && (
                <div className="description-avalute-content">
                  <div className="description-avalute-content-text">
                    <p>{product.description || "Đang cập nhật..."}</p>
                  </div>
                  <div className="description-avalute-content-size">
                    {/* Dùng map để duyệt qua mảng `product.attributes` */}
                    {product.attributes && product.attributes.length > 0 ? (
                      product.attributes.map((attr, index) => (
                        <button key={index} className="color-info">
                          <span className="info-ww">{attr.name} </span>
                          <span>
                            {/* Hiển thị giá trị nếu có, nếu không thì "Đang cập nhật" */}
                            {attr.value !== null &&
                              attr.value !== undefined &&
                              attr.value !== ""
                              ? `${attr.value}${attr.unit ? ` ${attr.unit}` : ""
                              }`
                              : "Đang cập nhật"}
                          </span>
                        </button>
                      ))
                    ) : (
                      // Hiển thị thông báo nếu không có thuộc tính nào
                      <p>Thông số kỹ thuật đang cập nhật...</p>
                    )}
                  </div>
                </div>
              )}
              {activeTab === "review" && <Comment commentData={commentData} />}
            </div>
          </div>
        </div>

        <div className="detail-banner-slider">
          <div className="container">
            <div className="detail-banner">
              <img
                src={
                  imageList[6]?.trim() ||
                  imageList[5]?.trim() ||
                  imageList[4]?.trim() ||
                  imageList[3]?.trim() ||
                  imageList[2]?.trim() ||
                  imageList[1]?.trim() ||
                  imageList[0]?.trim() ||
                  "/images/placeholder.jpg"
                }
                alt="banner"
              />
            </div>
          </div>
        </div>


        <PolicyProduct />

        {/* boxsanpham */}
        {relatedProducts.length > 0 && (
          <div className="boxProducts">
            <div className="container">
              <div className="section-box-products">
                <h5>Các sản phẩm tương tự</h5>
                <div className="box-products-container">
                  {relatedProducts.map((relatedProduct) => (
                    <ProductComponent
                      key={relatedProduct.id}
                      product={relatedProduct}
                      slug={relatedProduct.slug}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>



    </>
  );
};

export default ProductDetailPage;  
