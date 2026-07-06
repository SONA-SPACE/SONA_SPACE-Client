# Sprint 04 - Performance, Accessibility, Release Readiness

- Sprint target: chốt chất lượng trước khi coi client đã sẵn sàng cho vòng ổn định tiếp theo.
- Priority: `P2`
- Status: `In Progress`
- Prepared date: `2026-06-28`

## 1. Goal

Sprint này xử lý nợ kỹ thuật còn lại sau khi UX chính đã ổn:

1. bundle size,
2. CSS/tooling warning,
3. keyboard/accessibility,
4. regression checklist trước release.

## 2. In Scope

- `src/App.tsx`
- các route page nặng như:
  - `src/pages/ProductDetailPage/index.tsx`
  - `src/pages/Payment/index.tsx`
  - `src/pages/User/index.tsx`
  - `src/pages/DetailOrder/index.tsx`
- `vite.config.ts`
- `public/scss/*`
- assets/fonts/icons liên quan

## 3. Current Baseline

Theo build ngày `2026-06-28`:

- JS bundle: `2199.21 kB`
- CSS bundle: `427.95 kB`
- Sass warnings:
  - `@import` deprecated
  - `darken()` deprecated
  - một số asset icon unresolved ở build time

Cập nhật sau build ngày `2026-06-29`:

- Route pages ngoài trang chủ đã được lazy load trong `src/App.tsx`.
- Chunk `router` rỗng đã được loại bỏ sau khi gộp `react-router-dom` về `react-vendor`.
- `vendor` chunk giảm còn khoảng `261.88 kB`.
- Hệ `antd` đã được tách thành nhiều chunk nhỏ hơn:
  - `antd` khoảng `450.70 kB`
  - `antd-forms` khoảng `63.77 kB`
  - `antd-dialog` khoảng `37.10 kB`
  - `antd-media` khoảng `27.32 kB`
  - `antd-icons` khoảng `23.25 kB`
- CSS chính còn khoảng `383.43 kB`.
- Cảnh báo asset `arrow-down*.svg` unresolved đã được xử lý xong.
- Cảnh báo còn lại tập trung ở Sass `@import` deprecated.

Update after build on `2026-07-06`:

- Pre-work regression snapshot showed the entry JS chunk had grown again to `1079.55 kB` gzip `311.14 kB`.
- `ChatBot` and `PopupAd` are now lazy-mounted from `src/main.tsx`, so chat/socket/markdown and popup/swiper are no longer in the initial entry path.
- `vite.config.ts` now splits React, Ant Design, rc, HTTP, socket, markdown, Swiper, and residual vendor chunks.
- Largest JS chunk is now `vendor-react-BfwqDmAP.js` at `441.60 kB` gzip `135.01 kB`; no Vite chunk-size warning remains.
- Main CSS is now `380.17 kB` gzip `44.70 kB`.
- Font build output now emits `11` WOFF2 files, about `803.28 kB` total, instead of the previous broad WOFF/WOFF2 font set.
- Remaining build debt is Sass `@import` deprecation; this needs a separate migration plan because `public/scss/style.scss` still imports the legacy Sass tree globally.

## 4. Work Checklist

### Route-Level Performance Audit

- [x] Xác định route/component nặng cần lazy load.
- [x] Chốt plan chunking cho page-level code split.
- [x] Ghi baseline trước khi tối ưu.

### Bundle and Asset Optimization

- [x] Lazy load route nặng.
- [x] Rà font imports và asset duplication.
- [x] Giảm các import không cần render ban đầu.

### CSS and Build Cleanup

- [ ] Bắt đầu thay `@import` sang hướng module mới nếu khả thi trong scope.
- [x] Xử lý các warning rõ ràng nhất liên quan Sass function deprecated.
- [x] Kiểm tra asset path cho icon unresolved.

### Accessibility Pass

- [ ] Kiểm tra keyboard navigation cho menu, sidebar, modal, form, CTA.
- [ ] Kiểm tra alt text và aria label cho button/icon chính.
- [ ] Kiểm tra focus visible trên các CTA quan trọng.

### Release Gate

- [x] Chạy build final.
- [ ] Chạy QA flow chính theo playbook.
- [x] Cập nhật tracker, blocker, execution log, baseline mới.

## 5. QA Matrix

| Area | Required check | Status |
|---|---|---|
| Bundle | build baseline before/after | [x] |
| Route performance | lazy-loaded pages vẫn hoạt động đúng | [x] |
| CSS | warning chính được giảm hoặc ghi nhận rõ | [x] |
| Accessibility | keyboard/focus/label pass cơ bản | [ ] |
| Responsive | desktop + mobile flow chính | [ ] |

## 6. Risks to Watch

- Tối ưu bundle có thể chạm nhiều import path và side effect.
- CSS cleanup có thể phát sinh visual regression.
- Lazy load route phải đi kèm fallback loading tốt từ Sprint 2.

## 7. Progress Log

| Date | Scope | Done | Evidence | Next |
|---|---|---|---|---|
| 2026-06-29 | Sass warning reduction | Replaced a broad batch of deprecated `darken()`/`invert()` calls with static values across commerce, account, contact, and auth styles; fixed unresolved header arrow asset URLs | `npm run build` passed; unresolved `arrow-down*.svg` warnings no longer appear and repetitive Sass warnings dropped to the remaining global `@import` path | Continue with route-level splitting and chunk rebalance |
| 2026-06-29 | Route splitting + chunk rebalance | Converted non-home routes in `src/App.tsx` to `React.lazy` with a shared loading fallback; updated `vite.config.ts` manual chunks to remove the empty `router` chunk, split toast feedback, and move `antd` ecosystem packages out of `vendor` | `npm run build` passed; `vendor` fell from ~551.20 kB to ~261.88 kB, `router` empty chunk disappeared, and `antd` became the main remaining heavy chunk at ~599.97 kB | Continue with targeted `antd` import audit, font cleanup, and accessibility pass |
| 2026-06-29 | Antd chunk split follow-up | Removed `antd` usage from `src/pages/User/index.tsx`, replaced `CategorySlider` skeleton dependency, lazy-mounted order modals in `DetailOrder`/`User`, and split `antd` internals into forms/dialog/media/icons chunks | `npm run build` passed; no chunk remains above 500 kB, `antd` main chunk reduced to ~450.70 kB, and `vendor` stayed ~261.88 kB | Continue with keyboard/focus accessibility pass and Sass `@import` migration planning |
| 2026-07-02 | Accessibility pass slice | Added Escape-to-close and dialog labelling for mobile menu, checkout address modal, and cart delete-all modal; normalized decorative icon alt text where text/aria labels already exist; added focus-visible styles for header controls, checkout modal controls, and cart confirm buttons | `npm run build` passed; remaining warnings are global Sass `@import` deprecations and a large JS chunk (`index-hxZPvHbb.js` ~1,079.25 kB, gzip ~311.04 kB) | Continue with bundle/font audit to explain the new large chunk, then migrate Sass `@import` or document release blocker |
| 2026-07-06 | Bundle/font audit + initial import cleanup | Lazy-mounted global `ChatBot` and `PopupAd`, split vendor chunks in `vite.config.ts`, and reduced `public/fonts/stylesheet.css` to the font families actually referenced by current styles using WOFF2 only | `npm run build` passed with no chunk-size warning; largest JS chunk is `vendor-react-BfwqDmAP.js` ~441.60 kB gzip ~135.01 kB; main CSS is ~380.17 kB gzip ~44.70 kB; font assets are 11 WOFF2 files totaling ~803.28 kB; browser smoke passed `/` and opening ChatBot on `127.0.0.1:5174` with no console errors | Continue Sass `@import` module migration planning and full desktop/mobile QA playbook |

## 8. Exit Criteria

- Có baseline build trước/sau để so sánh.
- Route nặng đã được tách hợp lý hoặc có plan rõ ràng nếu chưa làm hết.
- Warning build chính đã giảm hoặc được ghi vào blocker log.
- Accessibility pass cơ bản hoàn tất.
- Release checklist cho frontend đã được điền đủ evidence.
