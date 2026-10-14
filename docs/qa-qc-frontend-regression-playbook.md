# QA/QC Frontend Regression Playbook

- Project: `SONA_SPACE-Client`
- Scope: toàn bộ các route/màn hình/component tác động tới trải nghiệm người dùng.
- Prepared date: `2026-06-28`
- Purpose: chuẩn hóa QA/QC cho frontend sau mỗi sprint UI/UX và contract hardening.

## 1. Baseline Inventory

Inventory command:

```bash
rg -n "<Route path=|<Route path =" src/App.tsx
```

Current baseline (`2026-06-28`):

| Metric | Value |
|---|---:|
| App routes | 29 |
| Page folders | 26 |
| Component folders | 32 |
| API files | 15 |
| Service files | 16 |

## 2. QA/QC Levels

### L0 - Runtime Safety

1. `npm run build`
2. TypeScript compile must pass.
3. Không tạo thêm warning/blocker mới ở các file vừa chạm.

Pass criteria:

- Build pass hoàn toàn.
- Không có lỗi TypeScript mới.
- Nếu có warning cũ, phải được ghi rõ trong execution log hoặc blocker log.

### L1 - Screen Contract Validation

Mỗi màn hình hoặc component vừa sửa phải được kiểm tra:

1. Loading state hiển thị đúng.
2. Empty state hiển thị đúng.
3. Error state có message + hướng xử lý.
4. Dữ liệu từ API render đúng field theo contract hiện tại.
5. Navigation nội bộ không reload sai hoặc dẫn sang route không tồn tại.

Pass criteria:

- 100% màn hình touched có ít nhất 1 happy-path check.
- 100% call API touched có ít nhất 1 contract check.
- 100% loading state mới có visual verification hoặc screenshot evidence.

### L2 - Business Flow Regression

1. Trang chủ -> danh mục -> danh sách sản phẩm -> chi tiết sản phẩm.
2. Search/filter/sort và back-forward browser behavior.
3. Wishlist -> cart -> checkout -> order complete.
4. Login/logout -> account -> order history.
5. Banner/content routes (`home`, `product`, `cart`, `news`, `rooms`) render đúng state.

Pass criteria:

- Không còn blocker-level issue ở luồng catalog và commerce.
- Mọi regression medium/low phải nằm trong blocker log hoặc follow-up list.

### L3 - Responsive, Accessibility, Performance

1. Kiểm tra desktop và mobile cho các trang touched.
2. Kiểm tra keyboard focus cho CTA, menu, form và dialog.
3. Kiểm tra skeleton không gây layout jump lớn.
4. Ghi lại bundle/build baseline nếu sprint có động tới performance.

Pass criteria:

- Không có CTA quan trọng bị inaccessible bằng keyboard.
- Không có loading skeleton lệch layout quá xa so với state thật.
- Performance delta được ghi lại nếu bundle thay đổi đáng kể.

## 3. Minimum Test Matrix Per Screen Type

| Screen Type | Required checks |
|---|---|
| Route page | render, loading, empty/error, responsive, internal navigation |
| API-driven section | contract field mapping, no crash on sparse data, retry/fallback |
| Form page | validation, submit disabled/loading, success/failure feedback |
| Drawer/modal/sidebar | open/close, overlay click, escape/focus behavior nếu có |
| Commerce flow | auth state, data persistence, CTA semantics, success/failure path |

## 4. Skeleton-Specific Acceptance Rules

Nếu sprint có loading skeleton, bắt buộc kiểm tra:

1. Skeleton xuất hiện trước khi data xong, không bị trắng màn hình.
2. Skeleton có cấu trúc gần giống layout thật.
3. Không dùng text kiểu `Đang tải...` làm fallback chính cho màn hình quan trọng.
4. Animation không gây khó chịu, nên có phương án tôn trọng `prefers-reduced-motion`.
5. Khi data load xong, transition không bị giật layout lớn.

## 5. Severity Classification

| Severity | Definition | Release impact |
|---|---|---|
| Critical | App crash, route gãy, checkout không hoàn tất, auth state sai | Block release |
| High | Luồng catalog/product/cart/account lỗi rõ ràng | Block release |
| Medium | State UX xấu, contract field lệch nhưng có fallback | Có thể release với fix plan |
| Low | Visual polish, spacing, copy, animation minor | Có thể release |

## 6. Evidence Format

Dùng template này trong sprint docs và execution log:

```md
Evidence:

- Command:
- Result:
- Visual check:
- Files changed:
- Notes:
```

## 7. Execution Cadence

1. Sau mỗi thay đổi frontend:
   - chạy L0 ngay.
2. Mỗi ngày trong sprint:
   - chạy L1 cho màn hình touched.
3. Trước khi close sprint:
   - chạy L2 + L3 cho flow chính.

## 8. Route Coverage Requirement

Mọi sprint phải ghi rõ:

1. Màn hình nào được chạm.
2. Component chia sẻ nào bị ảnh hưởng.
3. API nào bị ảnh hưởng.
4. QA nào đã chạy.
5. Blocker nào còn mở.

Nếu không có entry QA cho phần đã sửa, sprint không được coi là closed.
