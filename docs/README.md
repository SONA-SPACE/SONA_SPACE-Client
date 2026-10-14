# Client UI/UX Sprint Docs

- Project: `SONA_SPACE-Client`
- Prepared date: `2026-06-28`
- Purpose: gom toàn bộ kế hoạch chỉnh UI/UX, hardening frontend, loading skeleton, QA/QC và handoff để AI/dev/designer làm việc chung theo một quy trình thống nhất.

## 1. Cách đọc bộ docs này

1. Đọc `docs/ui-ux-tracker.md` để biết toàn cảnh sprint, blocker và trạng thái hiện tại.
2. Đọc `docs/sprints/<active-sprint>.md` trước khi sửa code.
3. Đối chiếu contract với server docs trước khi chạm vào API/UI phụ thuộc dữ liệu backend.
4. Sau mỗi lần làm việc, cập nhật lại tracker + sprint doc + execution log.

## 2. Bộ tài liệu chính

- `docs/ui-ux-tracker.md`
  - tracker tổng cho toàn bộ client.
- `docs/qa-qc-frontend-regression-playbook.md`
  - playbook QA/QC chuẩn cho frontend.
- `docs/quy-trinh-docs-cho-agent.md`
  - quy ước bắt buộc cho AI agent khi đọc/sửa/cập nhật docs.
- `docs/quy-trinh-thuc-thi-ui-ux-va-sua-loi-client.md`
  - quy trình thực thi theo pha để dev/AI/designer làm việc cùng nhau.
- `docs/sprints/sprint-01-foundation-navigation-contract.md`
  - nền tảng routing, auth storage, contract alignment.
- `docs/sprints/sprint-02-loading-skeleton-empty-error-state.md`
  - loading skeleton, empty state, error state, retry UX.
- `docs/sprints/sprint-03-commerce-account-content-ux-hardening.md`
  - cart, checkout, account, wishlist, content UX.
- `docs/sprints/sprint-04-performance-accessibility-release-readiness.md`
  - performance, accessibility, regression và release readiness.
- `docs/sprints/sprint-05-staging-spa-404-hardening.md`
  - staging SPA fallback, Vercel rewrite, base path, and deep-link 404 verification.
- `docs/sprints/sprint-06-ui-modernization-motion-depth.md`
  - elevation/radius/motion tokens, header states, banner timeline, card hover, scroll reveal.

## 3. Source of Truth cần đối chiếu

Frontend không tự suy diễn contract. Khi màn hình phụ thuộc dữ liệu backend, phải đối chiếu với các tài liệu sau:

- [Server migration tracker](../../SONA_SPACE-Server/docs/migration-tracker.md)
- [Server DB contract](../../SONA_SPACE-Server/docs/db-contract-postgres.md)
- [Server QA/QC route regression playbook](../../SONA_SPACE-Server/docs/qa-qc-route-regression-playbook.md)

## 4. Trọng tâm hiện tại

- Ổn định điều hướng SPA và loại bỏ internal link gây full reload.
- Thống nhất auth/token source thay vì đọc rải rác `sessionStorage`.
- Đồng bộ client với backend contract mới cho `products`, `categories`, `banners`, `wishlists`.
- Tạo hệ thống loading skeleton dùng chung thay cho text loading rời rạc.
- Chuẩn hóa empty/error/retry state trên các màn hình quan trọng.
- Chốt baseline performance, responsive và accessibility trước khi coi là done.

## 5. Quy tắc cập nhật

- Mỗi task hoàn thành phải có evidence ngắn: command, build/test, ảnh hưởng chính.
- Không đánh dấu sprint `Done` nếu chưa cập nhật tracker và QA matrix.
- Nếu phát hiện bug/blocker mới, thêm vào `Blocker Log` ngay trong cùng lượt làm việc.
