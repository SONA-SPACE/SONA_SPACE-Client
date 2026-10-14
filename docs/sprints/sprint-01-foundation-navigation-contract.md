# Sprint 01 - Foundation, Navigation, Contract Alignment

- Sprint target: ổn định nền tảng frontend trước khi làm visual polish.
- Priority: `P0`
- Status: `Done`
- Prepared date: `2026-06-28`

## 1. Goal

Sprint này giải quyết 3 lớp gốc dễ gây regression:

1. điều hướng nội bộ đang reload cả trang hoặc dẫn sai route,
2. auth/token đang bị đọc phân tán,
3. adapter API phía client còn giữ assumption cũ không còn đúng với server hiện tại.

## 2. In Scope

- `src/App.tsx`
- `src/components/Header/index.tsx`
- `src/components/BannerSlider/index.tsx`
- `src/components/Wishlist/WishlistSidebar.tsx`
- `src/pages/HomePage/index.tsx`
- `src/pages/ProductPage/index.tsx`
- `src/pages/ProductDetailPage/index.tsx`
- `src/contexts/AuthContext.tsx`
- `src/services/loginService.ts`
- `src/api/product.ts`
- `src/api/banner.ts`
- `src/services/productService.ts`

## 3. Out of Scope

- performance optimization sâu,
- đại tu visual design,
- automation test framework đầy đủ.

## 4. Work Checklist

### Route and Link Audit

- [x] Audit toàn bộ internal link đang dùng `<a href>` trên các màn hình chính.
- [x] Chốt danh sách route nội bộ phải chuyển sang `Link` hoặc router API.
- [x] Xác nhận các route public hiện tại trong `src/App.tsx`.

### Navigation Hardening

- [x] Sửa internal link nội bộ trong `Header`.
- [x] Sửa internal link nội bộ trong `HomePage`, `BannerSlider`, `WishlistSidebar`.
- [x] Sửa route sai `/phong/:slug` về `/khong-gian/:slug`.
- [x] Kiểm tra back-forward browser sau khi thay navigation.

### Auth Source Unification

- [ ] Gom `authToken` và `user` retrieval về helper/context chung.
- [ ] Loại dần việc đọc thẳng `sessionStorage` trong page/api/service quan trọng.
- [ ] Chốt behavior thống nhất cho `remember me`.

### Contract Alignment

- [x] Đối chiếu `products/categories/banners/wishlists` với server docs hiện tại.
- [x] Gỡ assumption cũ về endpoint test/legacy.
- [x] Chuẩn hóa adapter dữ liệu sản phẩm và banner.
- [x] Ghi lại field mapping quan trọng nếu có compatibility layer mới.

### Regression and Docs

- [x] Chạy build và smoke flow chính.
- [x] Cập nhật tracker, blocker log, QA matrix.
- [x] Ghi execution evidence.

## 5. QA Matrix

| Flow | Required check | Status |
|---|---|---|
| Home -> category -> product list | không full reload, route đúng | [x] |
| Home -> room detail | không bị route sai `/phong/:slug` | [x] |
| Product detail | load đúng endpoint contract mới | [x] |
| Banner CTA | internal/external link hoạt động đúng | [x] |
| Wishlist sidebar | empty/login state và product link đúng | [x] |
| Login persistence | remember/session behavior nhất quán | [x] |

## 6. Risks to Watch

- `Header` hiện quá lớn, có nguy cơ kéo theo regression ngoài scope.
- `ProductDetailPage` đang phụ thuộc nhiều field compatibility.
- `BannerSlider` đang fallback cứng, cần cẩn thận khi mở field mapping.

## 7. Evidence Template

```md
Evidence:

- Command:
- Result:
- Files changed:
- Contract checked against:
- Notes:
```

## 8. Progress Log

| Date | Scope | Done | Evidence | Next |
|---|---|---|---|---|
| YYYY-MM-DD | TBD | - | - | - |
| 2026-06-28 | Sprint 1 foundation pass | Replaced main internal anchors in `Header`, `Footer`, `HomePage`, `BannerSlider`, and `WishlistSidebar` with router `Link`; fixed mobile room route from `/phong/:slug` to `/khong-gian/:slug`; preserved banner fields `subtitle`, `description`, `link/link_url`, `button_text`; removed `/wishlists/wwww` legacy client path; moved catalog/cart/wishlist/product-detail token reads to `getAuthToken()`; fixed Header nested button and Home SVG prop console noise. | `npm run build` passed; Browser smoke on `http://localhost:5173` verified home renders, nav click to `/san-pham` works, direct `/khong-gian/phong-khach` no longer uses `/phong`, DOM check found `nestedButtons=0` and `phongLinks=[]`. Build still reports existing Sass/bundle/asset warnings tracked for Sprint 4; browser API calls log errors when backend is not running. | Continue auth cleanup in account/order/notification/product-card flows, then run a backend-connected smoke for wishlist/cart/login persistence. |
| 2026-06-28 | Sprint 1 auth cleanup continuation | Unified auth access in account, order detail, notification, product-card, cancel-order, cart promo, order services, and order-complete services through `loginService`; added `updateAuthUser()` so account profile/password updates preserve the active remember/session storage; fixed remaining SVG JSX prop warnings in `RoomDetail`. | `npm run build` passed; code graph scan found no direct auth storage reads outside `loginService`; remaining `sessionStorage.getItem` is only `PopupAd` UI session state. Browser smoke verified `/`, click to `/san-pham`, `/tai-khoan`, `/gio-hang`, and `/chi-tiet-don-hang/test-smoke` render without framework overlay. Backend API failures remain expected because backend was not running. | Run backend-connected QA for product detail, wishlist/cart/login persistence, then close Sprint 1 or move to Sprint 2 skeleton states. |
| 2026-06-28 | Sprint 1 backend-connected QA closeout | Verified backend local on `http://localhost:3501`, Postgres local on `5432`, and client API base `http://localhost:3501/api`; created a controlled local QA user, activated it for smoke, logged in through the real `/dang-nhap` UI with remember enabled, verified authenticated header state, account route, cart route, and product detail route `sofa-amsterdam`; verified wishlist/cart API add + read using variant `258`; removed the temporary token file after smoke. | API smoke: register `201`, login `200`, `GET /products` `200`, `GET /banners?page=home` `200`, `GET /categories` `200`, `GET /rooms` `200`, `POST /wishlists` wishlist `201`, `POST /wishlists` cart `201`, subsequent GET counts `1`; Browser smoke: `/tai-khoan`, `/gio-hang`, `/san-pham/sofa-amsterdam` render without framework overlay and cart UI shows product content. | Sprint 1 can close. Start Sprint 2: shared skeleton/loading/empty/error state system, beginning with product list/detail and cart/account surfaces. |

## 9. Exit Criteria

- Không còn internal anchor cho route nội bộ chính.
- Không còn route nội bộ sai dẫn tới 404 giả.
- Auth source được gom chuẩn ở flow chính.
- `products` và `banners` không còn phụ thuộc endpoint/field legacy đã bỏ.
- Build pass sau thay đổi.
