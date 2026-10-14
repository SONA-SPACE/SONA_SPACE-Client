# UI/UX Tracker - Client Hardening and Loading Skeleton

- Project: `SONA_SPACE-Client`
- Tracker purpose: theo dõi tiến độ chỉnh UI/UX, contract alignment và release readiness của frontend.
- Prepared date: `2026-06-28`
- Related docs:
  - `docs/README.md`
  - `docs/quy-trinh-docs-cho-agent.md`
  - `docs/quy-trinh-thuc-thi-ui-ux-va-sua-loi-client.md`
  - `docs/qa-qc-frontend-regression-playbook.md`
  - `docs/sprints/sprint-01-foundation-navigation-contract.md`
  - `docs/sprints/sprint-02-loading-skeleton-empty-error-state.md`
  - `docs/sprints/sprint-03-commerce-account-content-ux-hardening.md`
  - `docs/sprints/sprint-04-performance-accessibility-release-readiness.md`
  - `docs/sprints/sprint-06-ui-modernization-motion-depth.md`
  - `../../SONA_SPACE-Server/docs/migration-tracker.md`
  - `../../SONA_SPACE-Server/docs/db-contract-postgres.md`

## 1. Status Legend

- `Not Started`
- `In Progress`
- `Blocked`
- `Review`
- `Done`

## 2. Sprint Roadmap

| Sprint | Goal | Main Output | Status |
|---|---|---|---|
| Sprint 1 | Foundation, navigation, contract alignment | routing ổn định, auth source thống nhất, API contract không drift | `Done` |
| Sprint 2 | Loading skeleton + empty/error state | skeleton system dùng chung, retry state rõ ràng | `Done` |
| Sprint 3 | Commerce, account, content UX hardening | checkout/account/wishlist/banner UX nhất quán | `In Progress` |
| Sprint 4 | Performance, accessibility, release readiness | code split, smoke checklist, release baseline | `In Progress` |
| Sprint 5 | Staging SPA 404 hardening | Vercel SPA fallback, base-path contract, deep-link verification | `Done` |
| Sprint 6 | UI modernization: depth, hover, motion | elevation/radius/motion tokens, header states, banner timeline, card hover, scroll reveal | `In Progress` |

## 3. Sprint Checklist

### Sprint 1

- [x] Sửa internal navigation dùng `Link`/router thay cho anchor nội bộ.
- [x] Sửa route sai `/phong/:slug` về đúng contract của app.
- [x] Gom auth token/user retrieval về helper/context thống nhất.
- [x] Gỡ bỏ assumption cũ với endpoint test/legacy không còn trên server.
- [x] Chuẩn hóa adapter dữ liệu `products/categories/banners`.
- [x] Chốt smoke build và backend-connected QA.

### Sprint 2

- [x] Tạo thư viện skeleton cơ bản dùng lại được.
- [x] Thêm skeleton cho home, product list, product detail.
- [x] Thêm skeleton cho cart, checkout, wishlist, account.
- [x] Chuẩn hóa empty state có CTA rõ ràng cho product list/detail/cart/wishlist/payment/account.
- [x] Chuẩn hóa error state có retry hoặc hướng quay lại.
- [x] Chốt visual review cho loading/empty/error state trên mobile và desktop.

### Sprint 3

- [x] Sửa semantics và micro UX của cart/checkout.
- [x] Nâng UX account, order detail, wishlist, notification.
- [x] Tận dụng đầy đủ contract banner/content đã ổn định từ server.
- [x] Sửa search/filter state để back-forward không gây trải nghiệm xấu.
- [ ] Kiểm tra responsive cho các màn hình mua hàng và tài khoản.

### Sprint 4

- [x] Code split các route nặng.
- [x] Giảm bundle, dọn font và asset không cần thiết.
- [x] Xử lý cảnh báo Sass deprecated và asset unresolved.
- [x] Chạy pass accessibility cơ bản.
- [ ] Hoàn tất QA matrix và release checklist.

### Sprint 5

- [x] Xác định và xác minh các URL staging từng bị host-level 404.
- [x] Xác nhận deployment root phục vụ đúng SPA tại `https://sona-space.vercel.app/`.
- [x] Thêm SPA rewrite về `index.html` tại deployment root.
- [x] Xác nhận staging chạy ở root path nên không cần Vite `base` hoặc React Router `basename`.
- [x] Kiểm tra deep-link refresh/direct access cho các route chính ở local preview.
- [x] Kiểm tra asset build không bị rewrite nhầm thành HTML ở local preview.
- [x] Ghi nhận browser smoke trực tiếp trên Vercel; `/gio-hang` deep-link tải đúng SPA.

## 4. Module Tracker

| Module | Files | Status | Last Update | Notes |
|---|---|---|---|---|
| App Shell | `src/App.tsx`, `src/components/Header/*`, `src/components/Footer/*` | `Review` | 2026-06-28 | Header dropdowns no longer nest links; cart icon is a semantic link with mobile mini-cart behavior; remaining lower-risk placeholders deferred |
| Navigation/Search | `src/components/Header/index.tsx`, `src/pages/ProductPage/index.tsx` | `Review` | 2026-06-28 | Main nav/search product/category/room links use router navigation; DOM smoke found no `/phong/*` links and no nested anchor warnings |
| Catalog | `src/api/product.ts`, `src/services/productService.ts`, `src/pages/ProductPage/index.tsx` | `In Progress` | 2026-06-28 | Product API/service token reads use `getAuthToken()`; ProductPage loading/empty/error state migrated in Sprint 2 |
| Product Detail | `src/pages/ProductDetailPage/index.tsx` | `Review` | 2026-06-28 | Product detail now uses skeleton/retry/empty state instead of plain loading text or immediate fetch-error redirect |
| Skeleton & State UX | `src/components/StateFeedback/*`, `src/pages/*` | `Review` | 2026-07-28 | Banner skeleton now matches loaded content geometry; home newest/hot product sections use shared skeleton/retry/empty states |
| Commerce | `src/pages/CartPage/index.tsx`, `src/pages/Payment/index.tsx`, `src/pages/OrderComplete/index.tsx` | `Review` | 2026-06-28 | Cart/Payment loading/empty/error states migrated; Cart micro UX now has pending states, delete-all modal, promo/stock helper feedback; Payment checkout CTA is a semantic button with loading/disabled guard |
| Auth/Account | `src/contexts/AuthContext.tsx`, `src/services/loginService.ts`, `src/pages/User/index.tsx`, `src/pages/DetailOrder/index.tsx` | `Review` | 2026-06-28 | Auth token/user reads are centralized; account order loading/empty/error states migrated; DetailOrder now has skeleton/retry error state and no debug/test toast on order detail load/cancel product |
| Wishlist/Content | `src/pages/Wishlist/index.tsx`, `src/components/Wishlist/WishlistSidebar.tsx`, `src/components/MiniNotify/index.tsx`, `src/components/BannerSlider/index.tsx`, `src/api/banner.ts`, `src/pages/News/index.tsx`, `src/pages/NewsDetail/index.tsx`, `src/components/CategoryNews/index.tsx`, `src/components/RecentPosts/index.tsx` | `Review` | 2026-06-29 | Wishlist guest/auth empty states and sidebar pending UX are aligned; MiniNotify has loading/error/empty state, semantic internal/external links, button delete, and pending guards; BannerSlider loading skeleton/fallback migrated; News/NewsDetail/category/recent-post blocks now use skeleton, retry, and empty states with sidebar consistency |
| QA/Performance | `vite.config.ts`, `public/scss/*`, toàn app | `In Progress` | 2026-07-28 | Sass entrypoint and dependent partials migrated from deprecated `@import` to `@use`; build passes without Sass deprecation warnings. The Ant Design chunk-size warning remains open. |
| Deployment Routing | `vercel.json`, `scripts/qa-spa-routing-contract.js`, `src/App.tsx`, `vite.config.ts` | `Done` | 2026-07-28 | Vercel SPA fallback is active on `https://sona-space.vercel.app/`; direct `/gio-hang` navigation loads the SPA. |

## 5. Execution Log

| Date | Owner | Module | Done | Blockers | Next Action |
|---|---|---|---|---|---|
| 2026-06-28 | AI Agent | Planning + Docs Foundation | Audit docs phía server, xác định backlog client theo sprint, tạo bộ docs vận hành mới cho frontend | Chưa có owner thực hiện code theo sprint | Kickoff Sprint 1 với route/auth/contract alignment |
| 2026-06-28 | AI Agent | Sprint 1 - Navigation/Auth/Contract Foundation | Replaced main internal anchors, fixed mobile `/phong/:slug`, removed legacy wishlist path, moved token reads to `getAuthToken()`, preserved banner fields | Auth cleanup and backend-connected smoke were still pending at that point | Continue auth cleanup and backend-connected QA |
| 2026-06-28 | AI Agent | Sprint 1 - Auth Cleanup Continuation | Unified auth access across account, order detail, notification, product-card, cancel-order, cart promo, order services, and order-complete services; `npm run build` passed | Backend was not running during this slice | Run backend-connected QA, then close Sprint 1 |
| 2026-06-28 | AI Agent | Sprint 1 - Backend-Connected QA Closeout | Backend `3501` and Postgres `5432` were available; created controlled QA user, verified login persistence, account/cart/product detail routes, wishlist/cart API add + read with variant `258`; temp token file removed | Existing Sprint 4 issues remain: Sass deprecations, unresolved `arrow-down*.svg`, large JS bundle; client `.env` contains real secrets and should be cleaned before release | Start Sprint 2; move secret cleanup into release-readiness/security task |
| 2026-06-28 | AI Agent | Sprint 2 - Shared State Foundation + Catalog/Detail | Added reusable `StateFeedback` skeleton/empty/retry components; ProductPage now uses grid skeleton, CTA empty state, retry state; ProductDetailPage now uses detail skeleton, retry-on-error, no-data empty state | `npm run build` passed; Chrome smoke passed `/san-pham` and `/san-pham/sofa-amsterdam`; remaining Sprint 2 scope is not done | Continue with `CartPage`, `WishlistSidebar`, `User`, `Payment`, and `BannerSlider` state UX, then run desktop/mobile visual QA |
| 2026-06-28 | AI Agent | Sprint 2 - Cart + Wishlist State UX | Migrated CartPage to shared cart-list skeleton, retry-on-load-error, and empty cart CTA; migrated WishlistSidebar loading/error/empty branches to shared state components | `npm run build` passed; Chrome smoke passed `/gio-hang` and wishlist sidebar open state; existing Header nested-anchor console error and 404 asset logs remain | Continue with `Payment`, `User`, `BannerSlider`, then mobile visual QA |
| 2026-06-28 | AI Agent | Sprint 2 - Payment/User/Banner Completion | Replaced BannerSlider loading text with skeleton; added Payment cart-load skeleton/retry/empty gate; migrated User order loading/error/empty states and fixed unauthenticated skeleton hang | `npm run build` passed; Chrome smoke passed `/`, `/thanh-toan`, `/tai-khoan`; existing Header nested-anchor console error and 404 asset logs remain | Run mobile responsive visual QA, then close Sprint 2 or defer apply-code inline polish to Sprint 3 |
| 2026-06-28 | AI Agent | Sprint 2 - Mobile QA + Inline Promo Polish | Added inline promo validation feedback in CartPage and ran mobile smoke for `/`, `/san-pham`, `/gio-hang`, `/thanh-toan`, `/tai-khoan` at 390x844 | `npm run build` passed; mobile smoke found no old loading text and no framework overlay; existing Header nested-anchor and 404 asset logs remain | Move to Sprint 3: commerce/account/content UX hardening, starting with Header nested-anchor cleanup and checkout/account micro UX |
| 2026-06-28 | AI Agent | Sprint 3 - Header Navigation Semantics | Fixed Header product/room dropdown nested anchors, changed cart icon from `button > Link` to semantic `Link`, and restored desktop hover/focus dropdown behavior with sibling SCSS selectors | `npm run build` passed; Playwright Chrome smoke: `a a = 0`, product/room dropdown visible, desktop cart navigates `/gio-hang`, mobile cart opens mini cart, no DOM nesting errors; existing 404 asset logs remain | Continue Sprint 3 with CartPage/Payment semantic CTA and checkout micro UX hardening |
| 2026-06-28 | AI Agent | Sprint 3 - Cart/Payment Micro UX | Added CartPage pending states for quantity/remove/apply/delete, helper feedback for promo/stock/checkout gating, delete-all modal replacing browser confirm, and Payment semantic checkout button with loading/disabled submit guard | `npm run build` passed; graph search found no `window.confirm` in Cart/Payment and no old `div.checkout-btn` in Payment; Playwright Chrome smoke passed `/gio-hang` and `/thanh-toan` without overlay or relevant runtime errors | Continue Sprint 3 with account/order detail/wishlist/notification UX hardening |
| 2026-06-28 | AI Agent | Sprint 3 - Order Detail UX Hardening | Removed DetailOrder debug/test message noise, cleaned `window.confirm` token/comment, and added skeleton/retry state for failed order-detail loads | `npm run build` passed; graph/static search found no `window.confirm` or debug/test strings in DetailOrder; Playwright Chrome smoke passed `/chi-tiet-don-hang/test-smoke` with retry state and no relevant runtime errors | Continue Sprint 3 with Wishlist page and MiniNotify UX hardening |
| 2026-06-28 | AI Agent | Sprint 3 - Wishlist Page + MiniNotify UX | Replaced Wishlist page text loading/error handling with shared skeleton/retry/empty states; removed unused wishlist state/handlers; hardened MiniNotify loading/error/empty branches, internal `Link` vs external `a`, semantic delete button, and per-notification pending guards | `npm run build` passed; static search only leaves `href` for external notification links; Playwright Chrome smoke passed `/san-pham-yeu-thich` and Home notification dropdown on `127.0.0.1:5174` without page errors | Continue Sprint 3 with `WishlistSidebar` action pending state for remove/add-to-cart, then review banner/news content UX |
| 2026-06-28 | AI Agent | Sprint 3 - Login/Header/Wishlist polish | Removed nested `GoogleOAuthProvider` on SignIn, hardened Google credential handling in `useLogin`, centered header search/cart icon containers, and split Wishlist empty state into guest vs authenticated-empty while restoring shared state font family | `npm run build` passed after patch; Google OAuth env ids are aligned between client/server, so next verification should be browser login smoke against running backend | Re-run browser smoke for Google login and wishlist/account flows, then continue Sprint 3 on banner/news UX and remaining mobile regression |
| 2026-06-29 | AI Agent | Sprint 3 - Wishlist sidebar pending UX | Added per-item pending state for remove/add-to-cart in `WishlistSidebar`, blocked duplicate clicks while a request is in flight, and surfaced clearer inline action feedback in the sidebar | `npm run build` passed after patch; existing global build warnings remain unchanged (`@import`, Sass color deprecations, unresolved arrow icons, large bundle) | Continue with browser smoke for wishlist sidebar interactions, then move to banner/news content UX and mobile account regression |
| 2026-06-29 | AI Agent | Sprint 3 - News/content state UX | Migrated `News`, `NewsDetail`, `CategoryNews`, and `RecentPosts` to shared skeleton/retry/empty patterns, preserved category/recent sidebar structure, and aligned content pages with the same state UX already used in commerce/account flows | `npm run build` passed after patch; browser smoke on `/tin-tuc` shows empty-state/category/recent-post blocks rendering without runtime errors when no articles exist | Continue with mobile regression for account/wishlist/content, then move remaining search/filter history work into the next sprint slice |
| 2026-06-29 | AI Agent | Sprint 3 - Banner CTA fallback + mobile regression slice | Normalized `BannerSlider` fallback CTA/subtitle/description by `page` so `/tai-khoan`, `/tin-tuc`, `/gio-hang`, `/san-pham`, and `/khong-gian` no longer fall back to a generic product CTA when API fields are missing | `npm run build` passed; mobile browser smoke at `390x844` shows no horizontal overflow on `/tai-khoan` and `/tin-tuc`, banner CTA fallback links resolve to `/tai-khoan` and `/tin-tuc`, and console logs stayed clean | Finish remaining responsive/account-wishlist validation and carry performance cleanup into Sprint 4 |
| 2026-06-29 | AI Agent | Sprint 3 - Mobile commerce closeout + Sprint 4 warning reduction | Smoked `/gio-hang` and `/thanh-toan` on mobile, fixed remaining cart helper copy without Vietnamese diacritics, corrected header SCSS asset URLs for arrow icons, and removed a small batch of Sass deprecated calls in cart/payment/product-detail styles | `npm run build` passed after patch; mobile smoke shows cart/payment main content rendering without horizontal overflow or console errors; unresolved `arrow-down*.svg` warnings are gone and repetitive Sass warnings dropped from the prior build snapshot | Continue Sprint 4 with remaining Sass deprecation cleanup (`orderComplete`, `contactForm*`, other pages) and bundle splitting |
| 2026-06-29 | AI Agent | Sprint 4 - Sass warning reduction continuation | Removed additional deprecated `darken()`/`invert()` usage across `orderComplete`, `contactForm`, `contactFormArch`, `contactFormDesign`, auth pages, `forgotPassword`, `User`, `DetailOrder`, and `MiniCart` by replacing them with equivalent static hover/focus colors | `npm run build` passed after each slice; unresolved asset warnings remain closed, and repetitive Sass warnings dropped again with the remaining hot spots now centered in `ChatWidget` and `emailVerified` plus global `@import` usage | Continue with the last page/component-level Sass cleanup, then switch to code splitting / bundle-size work |
| 2026-06-29 | AI Agent | Sprint 4 - Route splitting + chunk rebalance | Converted non-home pages in `App.tsx` to `React.lazy` with a shared route fallback; updated `vite.config.ts` manual chunks so `react-router-dom` no longer creates an empty chunk, moved toast feedback into its own chunk, and rebalanced `antd`-ecosystem packages out of `vendor` | `npm run build` passed; `vendor` dropped from ~551.20 kB to ~261.88 kB, the empty `router` chunk disappeared, and arrow asset warnings stayed closed; remaining build debt is `antd` at ~599.97 kB plus Sass `@import` deprecations | Continue Sprint 4 with targeted `antd` import audit and accessibility keyboard/focus pass |
| 2026-06-29 | AI Agent | Sprint 4 - Antd chunk split follow-up | Removed `antd` usage from `User`, replaced `CategorySlider` skeleton dependency, lazy-mounted order modals, and split the `antd` ecosystem into `antd`, `antd-icons`, `antd-dialog`, `antd-forms`, and `antd-media` chunks | `npm run build` passed; no chunk remains above 500 kB, largest `antd` chunk dropped to ~450.70 kB, and `vendor` stayed ~261.88 kB | Continue with accessibility keyboard/focus pass and remaining Sass `@import` migration planning |
| 2026-07-02 | AI Agent | Sprint 3 - Payment redirect/error hardening | Hardened checkout fallback when `/thanh-toan` is opened without `selectedItems`, added inline checkout error state, cleaned pending redirect data on failure/COD success, kept coupon state through external payment handoff, and made `PaymentResult` redirect failed/cancelled results back to checkout without a crash | `npm run build` passed; Browser desktop smoke rendered `/thanh-toan` retry state without framework overlay; Browser smoke for `/thanh-toan-result?resultCode=1` redirected to `/thanh-toan` and showed no `PaymentResult` errors; backend/chat was not running, so Header fetch errors remain unrelated environmental noise | Run backend-connected authenticated cart smoke for address modal, COD submit, and MoMo success redirect before closing the remaining Payment redirect QA row |
| 2026-07-02 | AI Agent | Sprint 4 - Accessibility pass slice | Added Escape-to-close and accessible dialog labelling for mobile navigation, checkout address editing, and cart delete-all confirmation; decorative icons now use empty alt text when visible text/aria labels already describe the action; focus-visible styles were added for the touched controls | `npm run build` passed; remaining release-readiness warnings are Sass `@import` deprecations and a large JS chunk around 1,079.25 kB | Continue Sprint 4 with bundle/font import audit, then Sass `@import` migration planning |
| 2026-07-06 | AI Agent | Sprint 4 - Bundle/font audit + import cleanup | Lazy-mounted global `ChatBot` and `PopupAd`, split vendor chunks in `vite.config.ts`, and reduced font-face declarations to referenced WOFF2 families only | `npm run build` passed with no chunk-size warning; browser smoke passed `/` and opening ChatBot on `127.0.0.1:5174` without console errors; full desktop/mobile QA playbook not run in this slice | Continue Sprint 4 with Sass `@import` migration planning, then run the full release QA matrix |

## 6. Blocker Log

| ID | Date | Module | Blocker | Severity | Owner | ETA | Status |
|---|---|---|---|---|---|---|---|
| C-001 | 2026-06-28 | Navigation | Internal links còn một số lower-priority placeholders/external-like anchors deferred to later UX hardening | Medium | TBD | Sprint 3 | Review |
| C-002 | 2026-06-28 | Routing | Mobile menu used `/phong/:slug` while app route is `/khong-gian/:slug`; fixed and smoke checked | High | TBD | Sprint 1 | Closed |
| C-003 | 2026-06-28 | Auth | Token/user storage reads were fragmented; code path is centralized in `loginService` and backend-connected smoke passed | High | TBD | Sprint 1 | Closed |
| C-004 | 2026-06-28 | UX State | Thiếu loading skeleton và nhiều màn hình chỉ có text loading/error; shared state system exists and Sprint 2 target surfaces are migrated with desktop/mobile smoke evidence | High | TBD | Sprint 2 | Review |
| C-007 | 2026-06-28 | Header | Header category/room dropdown nested `<a>` fixed by moving dropdowns outside parent links; cart icon interactive nesting also fixed | Medium | AI Agent | Sprint 3 | Closed |
| C-005 | 2026-06-28 | Banner Contract | Client previously ignored some banner fields; adapter now preserves server fields, UI usage still needs Sprint 3 review | Medium | TBD | Sprint 1-3 | Review |
| C-006 | 2026-06-28 | Performance | Bundle chunk-size warning is closed after lazy-mounting global widgets, vendor chunking, and font-face cleanup; remaining build debt is the legacy Sass `@import` architecture and any follow-up visual regression from migrating it | Medium | TBD | Sprint 4 | Open |

## 7. Exit Checklist

- [ ] Internal navigation không còn full reload ngoài external links thật sự.
- [x] Auth/token contract có một nguồn đọc chuẩn hóa.
- [x] `products/categories/banners/wishlists` tiêu thụ đúng contract hiện tại của server ở các luồng đã smoke.
- [x] Màn hình quan trọng có skeleton, empty state, error state, retry UX rõ ràng.
- [ ] Cart/checkout/account flow pass QA trên desktop + mobile.
- [x] `npm run build` pass.
- [x] Có baseline performance được ghi lại.
- [ ] QA matrix và blocker log được cập nhật đầy đủ.
- [x] Docs sprint và handoff được cập nhật tới trạng thái cuối.
