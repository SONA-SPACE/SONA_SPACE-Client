# Sprint 02 - Loading Skeleton, Empty State, Error State

- Sprint target: thay loading text rời rạc bằng skeleton/state system nhất quán.
- Priority: `P0`
- Status: `Review`
- Prepared date: `2026-06-28`

## 1. Goal

Sprint này tạo trải nghiệm tải dữ liệu tốt hơn trên các màn hình quan trọng:

1. không còn màn hình trắng hoặc text loading trơ,
2. có skeleton đúng layout,
3. empty state và error state có CTA rõ ràng,
4. state UX đồng nhất giữa catalog, detail và commerce.

## 2. In Scope

- `src/components/*` cho shared skeleton/state blocks mới
- `src/pages/HomePage/index.tsx`
- `src/pages/ProductPage/index.tsx`
- `src/pages/ProductDetailPage/index.tsx`
- `src/pages/CartPage/index.tsx`
- `src/pages/Payment/index.tsx`
- `src/pages/User/index.tsx`
- `src/components/Wishlist/WishlistSidebar.tsx`
- `src/components/BannerSlider/index.tsx`

## 3. Deliverables

- shared skeleton primitives:
  - `SkeletonBlock`
  - `SkeletonText`
  - `SkeletonCard`
  - `PageSectionSkeleton`
- shared state components:
  - `EmptyState`
  - `InlineErrorState`
  - `RetryState`

## 4. Work Checklist

### Shared Foundation

- [x] Chốt visual rules cho skeleton.
- [x] Tạo shared skeleton components.
- [x] Tạo style token cho shimmer/background/radius/spacing.
- [x] Hỗ trợ `prefers-reduced-motion` nếu animation dùng shimmer.

### Catalog Skeleton

- [ ] Thêm skeleton cho `HomePage` phần banner/product section. BannerSlider loading skeleton done; product section pending.
- [x] Thêm skeleton cho `ProductPage` grid/filter state.
- [x] Thêm empty state có CTA cho danh sách sản phẩm.

### Product Detail State UX

- [x] Thêm skeleton cho `ProductDetailPage`.
- [x] Thay text loading hiện tại bằng skeleton thật.
- [x] Tách not-found, error fetch và no-data thành state riêng.
- [x] Có CTA retry hoặc quay lại danh sách khi phù hợp.

### Commerce and Account State UX

- [x] Thêm skeleton cho `CartPage`, `Payment`, `WishlistSidebar`, `User`.
- [x] Chuẩn hóa empty cart, empty wishlist, empty order sections.
- [x] Chuẩn hóa inline error cho apply code, load cart, load account data.

### Consistency and Visual QA

- [x] Kiểm tra skeleton trên mobile và desktop.
- [x] Kiểm tra transition skeleton -> content thật không giật layout.
- [x] Cập nhật docs evidence và open issues nếu còn.

## 5. Acceptance Criteria

- Không còn plain text loading là state chính trên các màn hình trong scope.
- Skeleton có layout gần đúng với content cuối.
- Empty state luôn có thông điệp và CTA phù hợp.
- Error state luôn có hướng xử lý: retry, quay lại, hoặc login.
- Không tạo layout shift lớn khi data xuất hiện.

## 6. QA Matrix

| Screen | Loading skeleton | Empty state | Error/retry | Responsive |
|---|---|---|---|---|
| HomePage | [x] | n/a | [ ] | [x] |
| ProductPage | [x] | [x] | [x] | [x] |
| ProductDetailPage | [x] | [x] | [x] | [x] |
| CartPage | [x] | [x] | [x] | [x] |
| Payment | [x] | [x] | [x] | [x] |
| User | [x] | [x] | [x] | [x] |
| WishlistSidebar | [x] | [x] | [x] | [x] |
| BannerSlider | [x] | fallback | [x] | [x] |

## 7. Risks to Watch

- Skeleton quá generic sẽ lệch layout thật và nhìn giả.
- Nếu state component không dùng chung chuẩn, UX sẽ lại phân mảnh.
- Commerce screens cần đặc biệt cẩn thận để không làm mờ trạng thái thao tác thật.

## 8. Progress Log

| Date | Scope | Done | Evidence | Next |
|---|---|---|---|---|
| 2026-06-28 | Shared foundation + ProductPage/ProductDetailPage | Added `src/components/StateFeedback` with `SkeletonBlock`, `SkeletonText`, `SkeletonCard`, `PageSectionSkeleton`, `EmptyState`, `InlineErrorState`, `RetryState`; replaced ProductPage text loading/empty with skeleton/empty/retry; replaced ProductDetail initial text loading and fetch redirect with skeleton/retry/empty states | `npm run build` passed; Chrome smoke passed `/san-pham` and `/san-pham/sofa-amsterdam` with no old loading text after data load | Continue Sprint 2 on `CartPage`, `WishlistSidebar`, `User`, `Payment`, `BannerSlider`, then mobile visual QA |
| 2026-06-28 | CartPage + WishlistSidebar | Migrated `CartPage` load flow to `PageSectionSkeleton`, `RetryState`, and `EmptyState`; migrated `WishlistSidebar` loading/error/empty branches to shared state components | `npm run build` passed; Chrome smoke passed `/gio-hang` and header wishlist sidebar open state; existing Header nested-anchor console error and 404 asset logs remain outside this patch | Continue Sprint 2 on `Payment`, `User`, `BannerSlider`, and mobile visual QA |
| 2026-06-28 | Payment + User + BannerSlider | Replaced BannerSlider spinner/text with skeleton; added Payment checkout loading/empty/retry gate; replaced User order loading/error/empty states with shared components and fixed unauthenticated skeleton hang | `npm run build` passed; Chrome smoke passed `/`, `/thanh-toan`, `/tai-khoan`; no old loading text after settle | Finish mobile responsive visual QA and close remaining apply-code inline error polish or move it to Sprint 3 |
| 2026-06-28 | Inline promo + mobile QA | Added inline promo validation feedback in `CartPage`; ran mobile smoke for `/`, `/san-pham`, `/gio-hang`, `/thanh-toan`, `/tai-khoan` at 390x844 | `npm run build` passed; mobile smoke found no old loading text and no framework overlay; existing Header nested-anchor and 404 asset console logs remain tracked outside Sprint 2 | Move Sprint 2 to review and start Sprint 3 commerce/account/content UX hardening |

## 9. Exit Criteria

- Shared skeleton/state system đã tồn tại và dùng được ở các trang chính.
- `ProductDetailPage` không còn chỉ hiện `Đang tải sản phẩm...`.
- `CartPage`, `WishlistSidebar`, `ProductPage` có empty/error UX rõ ràng.
- Visual QA desktop/mobile đã được ghi evidence.
