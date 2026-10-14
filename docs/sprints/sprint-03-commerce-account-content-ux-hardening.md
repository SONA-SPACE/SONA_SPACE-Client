# Sprint 03 - Commerce, Account, Content UX Hardening

- Sprint target: làm mượt các flow người dùng chính sau khi foundation và skeleton đã ổn định.
- Priority: `P1`
- Status: `In Progress`
- Prepared date: `2026-06-28`

## 1. Goal

Sprint này tập trung vào các flow tạo doanh thu hoặc ảnh hưởng trực tiếp tới cảm giác dùng app:

1. giỏ hàng,
2. thanh toán,
3. tài khoản,
4. wishlist,
5. banner/content blocks.

## 2. In Scope

- `src/pages/CartPage/index.tsx`
- `src/pages/Payment/index.tsx`
- `src/pages/OrderComplete/index.tsx`
- `src/pages/User/index.tsx`
- `src/pages/DetailOrder/index.tsx`
- `src/components/Wishlist/WishlistSidebar.tsx`
- `src/components/MiniNotify/index.tsx`
- `src/components/BannerSlider/index.tsx`
- `src/pages/News/index.tsx`
- `src/pages/NewsDetail/index.tsx`

## 3. Work Checklist

### Cart UX Hardening

- [x] Đổi các anchor giả button thành button/link semantic.
- [x] Rà lại select all, remove all, quantity change, out-of-stock feedback.
- [x] Chuẩn hóa confirm flow thay cho `window.confirm` nếu cần.

### Checkout and Payment UX

- [x] Chuẩn hóa CTA thanh toán, disabled/loading state và error feedback.
- [ ] Kiểm tra address modal flow và payment redirect flow.
- [ ] Chuẩn hóa thông điệp lỗi cho promo code và order submit.

### Account and Wishlist UX

- [x] Chuẩn hóa trạng thái account tabs và data load.
- [x] Sửa login gate cho wishlist/cart/account.
- [x] Kiểm tra order detail, cancel order, profile update feedback.

### Banner and Content UX

- [x] Tận dụng đầy đủ field content của banner từ API nếu có.
- [x] Rà lại CTA banner theo page type.
- [x] Kiểm tra news/content pages về loading, empty, navigation.

### Responsive and Regression

- [x] Kiểm tra Header dropdown/cart flow trên desktop và mobile.
- [x] Kiểm tra flow mua hàng trên mobile.
- [x] Kiểm tra account/wishlist/banner trên mobile.
- [ ] Ghi lại issue còn tồn tại cho Sprint 4 nếu cần.

## 4. QA Matrix

| Flow | Checks | Status |
|---|---|---|
| Cart select/update/remove | semantic CTA, feedback, stock check | [x] |
| Checkout submit | validation, loading, success/failure | [x] |
| Payment redirect | pending state, return state, cleanup | [ ] |
| Account tabs | data load, empty/error, auth persistence | [x] |
| Wishlist -> add to cart | login gate, success feedback, mini cart sync | [x] |
| Banner CTA | page mapping, content mapping, fallback | [x] |
| News/content pages | loading, empty, retry, sidebar consistency | [x] |

## 5. Risks to Watch

- Checkout flow có side effect với local storage và redirect.
- Account page đang đọc storage trực tiếp ở nhiều nhánh.
- Banner/content UX dễ bị “đắp thêm text” thay vì đúng contract data.

## 6. Progress Log

| Date | Scope | Done | Evidence | Next |
|---|---|---|---|---|
| 2026-06-28 | Header navigation semantics | Tách dropdown Sản phẩm/Không gian khỏi `Link` cha để loại bỏ nested anchor; đổi cart từ `button > Link` thành một `Link` semantic, mobile vẫn mở mini cart còn desktop đi `/gio-hang`; cập nhật SCSS hover/focus cho dropdown sibling | `npm run build` pass; Playwright Chrome smoke: `a a = 0`, product/room dropdown visible, desktop cart URL `/gio-hang`, mobile cart giữ trang và mở mini cart, `nestingErrorCount = 0` | Tiếp tục Sprint 3 với semantic CTA và micro UX trong `CartPage`/`Payment`: rà remove/select/quantity/checkout disabled-loading-error flow |
| 2026-06-28 | Cart/Payment micro UX | CartPage có pending state cho quantity/remove/apply promo/delete all, helper text cho promo/tồn kho, modal xác nhận xóa toàn bộ thay `window.confirm`; Payment checkout CTA đổi từ `div onClick` sang `button` có disabled/loading và submit guard | `npm run build` pass; graph search: no `window.confirm` trong Cart/Payment, no `<div className="checkout-btn">` trong Payment; Playwright Chrome smoke `/gio-hang`, `/thanh-toan`: no overlay, no relevant runtime errors | Tiếp tục Sprint 3 với account/order detail/wishlist/notification UX hardening |
| 2026-06-28 | Order detail UX hardening | DetailOrder bỏ toast/log test khi vào trang và khi mở hủy sản phẩm; dọn token/comment `window.confirm`; thêm loading skeleton và retry state khi không tải được chi tiết đơn hàng thay vì kẹt ở text loading | `npm run build` pass; graph/static search: no `window.confirm` trong DetailOrder, no debug/test strings; Playwright Chrome smoke `/chi-tiet-don-hang/test-smoke`: retry state visible, no overlay, no relevant runtime errors | Tiếp tục Sprint 3 với Wishlist page và MiniNotify UX: pending/delete/read feedback, empty/error consistency |

| 2026-06-28 | Wishlist page + MiniNotify UX | Wishlist page bo state/handler cu khong dung, chuyen loading sang `PageSectionSkeleton`, them `RetryState` khi chua dang nhap/API loi va `EmptyState` co CTA; MiniNotify them loading/error state, dung `Link` cho internal navigation, `a` chi cho external link, `button` cho xoa thong bao, va chan double request khi mark-read/delete | `npm run build` pass; static search chi con `href` cho external notification link; Playwright Chrome smoke `/san-pham-yeu-thich` va Home notification dropdown tren `127.0.0.1:5174` khong co page error, Wishlist hien thi retry state, MiniNotify hien thi empty state | Tiep tuc Sprint 3 voi `WishlistSidebar` action pending state cho remove/add-to-cart va sau do review banner/news content UX |
| 2026-06-28 | Google login + Header icon alignment + Wishlist state polish | Bo `GoogleOAuthProvider` long nhau o `SignIn`, them guard khi Google credential rong trong `useLogin`, can giua `search-btn`/`cart-container` trong Header, va tach ro Wishlist guest-empty / authenticated-empty; state feedback duoc dat lai font family theo he thong client | `npm run build` pass; can verify bang browser smoke voi backend dang chay de chot Google login flow that su | Tiep tuc Sprint 3 voi browser smoke cho Google login, sau do quay lai banner/news content UX va mobile regression cho account/wishlist |
| 2026-06-29 | WishlistSidebar action pending UX | Them `pendingRemoveId` va `pendingAddVariantId` cho `WishlistSidebar`, khoa nut khi dang xu ly de tranh double click, va hien thi text trang thai ngan ngay tai action button | `npm run build` pass; chua co browser smoke moi cho remove/add-to-cart trong sidebar | Tiep tuc smoke sidebar, sau do chuyen sang banner/news content UX va responsive regression |
| 2026-06-29 | News/content state UX | Chuyen `News`, `NewsDetail`, `CategoryNews`, va `RecentPosts` sang shared skeleton/retry/empty state; giu sidebar danh muc/bai viet gan day nhat quan voi phan con lai cua client | `npm run build` pass; browser smoke `/tin-tuc` khong co runtime error va render dung empty-state khi backend khong co bai viet | Tiep tuc responsive regression cho account/wishlist/content va tach phan search/filter history vao sprint ke tiep |
| 2026-06-29 | Banner CTA fallback + mobile regression slice | Chuan hoa fallback CTA/subtitle/description trong `BannerSlider` theo `page`, tranh banner account/news/cart/room roi ve CTA generic `/san-pham` khi API thieu field; smoke mobile `390x844` cho `/tai-khoan`, `/tin-tuc`, va `/san-pham-yeu-thich` khong co overflow va console error | `npm run build` pass; mobile browser smoke xac nhan CTA fallback den `/tai-khoan` va `/tin-tuc`, wishlist page render content khong vo layout, logs rong | Chuyen issue hieu nang/warning sang Sprint 4 va giu rieng muc mua hang mobile end-to-end de smoke tiep khi can |
| 2026-06-29 | Mobile commerce closeout | Smoke mobile `390x844` cho `/gio-hang` va `/thanh-toan`; xac nhan cart/payment main content khong overflow, helper/CTA chinh render dung, va khong co console error; sua cac helper text khong dau con sot trong `CartPage` | `npm run build` pass; browser snapshot cho thay cart co CTA disabled/pending state dung trong mobile, payment empty-state render dung CTA quay lai gio hang/kham pha san pham | Dua cac viec giam warning build va giam bundle sang Sprint 4 |
| 2026-07-02 | Payment redirect/error hardening | Hardened `Payment` checkout fallback when `selectedItems` route state is missing, added inline checkout errors beside the payment CTA, preserved applied coupon during external payment redirect, cleared pending payment data on COD success/fail redirect, and made `PaymentResult` handle failed/cancelled redirect without crashing | `npm run build` pass; Browser desktop smoke on `http://127.0.0.1:5174/thanh-toan` rendered checkout retry state without framework overlay; Browser smoke `/thanh-toan-result?resultCode=1` redirected back to `/thanh-toan` with no `PaymentResult` errors; remaining console errors were existing Header fetch failures because backend/chat server was not running | Run backend-connected authenticated cart smoke for address modal, COD submit, and MoMo success redirect before ticking Payment redirect QA fully |

## 7. Exit Criteria

- Cart/checkout/account/wishlist flow không còn CTA giả semantic.
- User feedback rõ ràng ở success/failure path.
- Banner/content block dùng được contract thực tế của backend.
- Mobile QA cho commerce flow đã được ghi evidence.
