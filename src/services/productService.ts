import type { PaginatedResponse, Product, Variant } from "../types";
import { getProductBySlug, getAllProducts } from "../api/product";
import { getProductsByRoom } from "../api/room";
import { convertToAdminApiUrl } from "../utils/url";
import { getAuthToken } from "./loginService";

/**
 * Format raw product from API to usable Product type
 */
export const formatProductForDisplay = (product: any): Product => {
  // Xử lý mảng màu sắc

  let colorHexArray: string[] = [];
  let variant_id = product.variant_id || product.defaultVariantId;
  if (
    !variant_id &&
    Array.isArray(product.variants) &&
    product.variants.length > 0
  ) {
    variant_id = product.variants[0].variant_id;
  }
  // Trường hợp 1: Lấy màu từ variants nếu có
  if (Array.isArray(product.variants) && product.variants.length > 0) {
    // Lấy các màu không trùng lặp từ variants
    const uniqueColors = new Map<
      number,
      {
        color_hex: string;
        color_name: string;
        color_id: number;
        color_priority: number;
        variant_id: number;
      }
    >();
    product.variants.forEach(
      (variant: {
        variant_id?: number;
        color_hex?: string;
        color_id?: number;
        color_name?: string;
        color_priority?: number;
      }) => {
        if (variant.color_hex && variant.color_id && variant.variant_id) {
          uniqueColors.set(variant.color_id, {
            color_hex: variant.color_hex,
            color_name: variant.color_name || "",
            color_id: variant.color_id,
            color_priority: variant.color_priority || 0,
            variant_id: variant.variant_id,
          });
        }
      }
    );

    // Chuyển Map thành mảng và sắp xếp theo priority
    const sortedColors = Array.from(uniqueColors.values()).sort(
      (a, b) => a.color_priority - b.color_priority
    );

    // Lấy ra mảng các mã màu
    colorHexArray = sortedColors.map((color) => color.color_hex);
  }
  // Trường hợp 2: product.color_hex là mảng
  else if (Array.isArray(product.color_hex)) {
    colorHexArray = product.color_hex;
  }
  // Trường hợp 3: product.colors là mảng
  else if (Array.isArray(product.colors)) {
    colorHexArray = product.colors;
  }
  // Trường hợp 4: Mặc định một số màu cơ bản
  else {
    colorHexArray = ["#3C5838", "#D9A13B", "#DDC8A6"];
  }

  // Xử lý giá và giá khuyến mãi, đảm bảo là số
  let price = 0;
  if (product.price !== undefined && product.price !== null) {
    price = Number(product.price);
  } else if (
    product.variant_price !== undefined &&
    product.variant_price !== null
  ) {
    price = Number(product.variant_price);
  }

  // Nếu không có giá, sử dụng giá mặc định
  if (isNaN(price) || price <= 0) {
    price = 5000000; // Giá mặc định
  }

  // Xử lý giá khuyến mãi
  let priceSale: number | undefined = undefined;
  if (product.price_sale !== undefined && product.price_sale !== null) {
    priceSale = Number(product.price_sale);
  } else if (
    product.variant_price_sale !== undefined &&
    product.variant_price_sale !== null
  ) {
    priceSale = Number(product.variant_price_sale);
  }

  // Kiểm tra giá khuyến mãi hợp lệ
  if (
    priceSale !== undefined &&
    (isNaN(priceSale) || priceSale <= 0 || priceSale >= price)
  ) {
    priceSale = undefined; // Không có khuyến mãi nếu giá không hợp lệ
  }

  const isSale = priceSale !== undefined && priceSale > 0;

  // Kiểm tra sản phẩm mới
  const createdDate = new Date(product.created_at);
  const today = new Date();
  const threeDaysAgo = new Date(today);
  threeDaysAgo.setDate(today.getDate() - 3);

  const isNew =
    createdDate >= new Date(threeDaysAgo.setHours(0, 0, 0, 0)) &&
    createdDate <= new Date(today.setHours(23, 59, 59, 999));

  // Xử lý thông tin danh mục
  const category = {
    id: product.category_id || 0,
    name: product.category_name || "",
  };

  // Xử lý hình ảnh - kiểm tra các định dạng URL khác nhau
  let image = product.product_image || product.main_image || product.image || "";

  // Xử lý trường hợp URL ảnh có chứa dấu phẩy
  if (image && image.includes(",")) {
    const imageArray = image.split(",");
    image = imageArray[0].trim();
  }

  // Xử lý trường hợp URL ảnh có chứa \n
  if (image && image.includes("\\n")) {
    const imageArray = image.split("\\n");
    image = imageArray[0].trim();
  }

  // Xử lý trường hợp URL ảnh có chứa \r\n
  if (image && image.includes("\\r\\n")) {
    const imageArray = image.split("\\r\\n");
    image = imageArray[0].trim();
  }

  // Xử lý trường hợp URL ảnh có chứa newline literal
  if (image && image.includes("\n")) {
    const imageArray = image.split("\n");
    image = imageArray[0].trim();
  }

  // Nếu không có ảnh, sử dụng ảnh mặc định
  if (!image) {
    image = "/images/placeholder.jpg";
  }

  const attributes = Array.isArray(product.attributes)
    ? product.attributes.map((attr: any) => {
        const value =
          attr.value_display !== undefined && attr.value_display !== null
            ? attr.value_display
            : attr.value;

        return {
          ...attr,
          id: attr.attribute_id || attr.id,
          name: attr.name || attr.attribute_name || "",
          value,
          unit: attr.unit || "",
          is_required: attr.is_required === true || attr.is_required === 1,
        };
      })
    : [];

  return {
    id: product.product_id || product.id,
    product_id: product.product_id || product.id,
    name: product.product_name || product.name || "",
    slug: product.product_slug || product.slug || "",
    product_slug: product.product_slug || product.slug || "",
    price: price,
    price_sale: priceSale,
    priceSale: priceSale,
    image: image,
    isNew,
    isSale,
    isWishlist: product.isWishlist === true || product.isWishlist === 1,
    created_at: product.created_at,
    updated_at: product.updated_at,
    category: category,
    colors: colorHexArray,
    specifications: attributes,
    description: product.product_description || product.description || "",
    sold: product.product_sold || product.sold || 0,
    view: product.product_view || product.view || 0,
    stock: product.product_stock || product.stock || 0,
    images: product.images || [],
    variants: product.variants || [],
    variant_id: product.variant_id || 0,
    attributes,
    rooms: product.rooms || [],
  };
};

/**
 * Fetch all products and format them
 */
export const fetchAllProducts = async (
  page: number = 1,
  limit: number = 8,
  filters: {
    category?: string;
    room?: string;
    price?: string;
    color?: string;
    sort?: string;
  } = {}
): Promise<{ products: Product[]; totalPages: number }> => {
  try {
    const rawProducts = await getAllProducts(page, limit, filters);
    const formatted = rawProducts.items.map(formatProductForDisplay);
    // console.log("formatted", formatted);
    return {
      products: formatted,
      totalPages: rawProducts.totalPages,
    };
  } catch (error) {
    // console.error("Error in fetchAllProducts:", error);
    return { products: [], totalPages: 1 };
  }
};

/**
 * Fetch a product by its slug
 */
export const fetchProductBySlug = async (
  slug: string
): Promise<{
  product: Product | null;
  colors: string[];
  relatedProducts: {
    id: number;
    name: string;
    slug: string;
  }[];
}> => {
  try {
    const {
      product,
      colors = [],
      related_products = [],
    } = await getProductBySlug(slug);

    const formatted = formatProductForDisplay({
      ...product,
      price: parseFloat(product.defaultPrice),
      price_sale: parseFloat(product.defaultPriceSale),
      image: product.defaultImage,
      color_hex: colors.map((c) => c.colorHex),
    });

    return {
      product: formatted,
      colors: colors.map((c) => c.colorName),
      relatedProducts: related_products,
    };
  } catch (error) {
    // console.error("Error in fetchProductBySlug:", error);
    return {
      product: null,
      colors: [],
      relatedProducts: [],
    };
  }
};

export const getRelatedProductsByRoom = async (
  productId: number
): Promise<Product[]> => {
  try {
    const token = getAuthToken();
    const res = await fetch(
      convertToAdminApiUrl(`/products/related/by-room/${productId}`),
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    if (!Array.isArray(data.related_products)) {
      // console.error("API không trả đúng định dạng: ", data);
      return [];
    }

    const formatted = data.related_products.map((item: any) =>
      formatProductForDisplay({
        ...item,
        price: parseFloat(item.price),
        price_sale: parseFloat(item.price_sale),
        images: item.images || [],
        variant_id: item.variant_id || 0,
        variants: item.variants || [],
        stock: item.stock || item.quantity || 0,
        sold: item.sold || 0,
        view: item.view || 0,
        description: item.description || "",
        isWishlist: item.isWishlist === true || item.isWishlist === 1,
      })
    );

    return formatted;
  } catch (error) {
    // console.error("Lỗi khi lấy sản phẩm liên quan:", error);
    return [];
  }
};
