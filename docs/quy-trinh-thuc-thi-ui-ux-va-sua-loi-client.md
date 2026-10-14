# Quy Trinh Thuc Thi UI UX Va Sua Loi Client

- Project: `SONA_SPACE-Client`
- Prepared date: `2026-06-28`
- Purpose: chuan hoa cach phan tich, sua, verify va handoff cac thay doi frontend.

## 1. Workflow Tong Quan

| Phase | Muc tieu | Input | Hanh dong bat buoc | Output |
|---|---|---|---|---|
| P0 - Intake | Xac dinh dung pham vi sprint | bug report, UX request, server docs | map task vao sprint, doc tracker va sprint doc | task scope ro rang |
| P1 - Contract Check | Tranh sua UI sai du lieu backend | server docs, client api/service | doi chieu route, field, auth behavior | contract note |
| P2 - UX Audit | Xac dinh diem gay trai nghiem | page/component hien tai | check loading, empty, error, navigation, CTA | audit note + backlog item |
| P3 - Implementation | Sua code theo muc tieu sprint | task scope + contract note | patch code, giu logic co chu y effect den flow lien quan | code change |
| P4 - Verification | Chan regression co ban | changed files + active flow | build, smoke, responsive, contract check | evidence |
| P5 - Docs Closeout | Ban giao cho nguoi tiep theo | code change + evidence | cap nhat sprint/tracker/blocker/handoff | docs synced |

## 2. Bang Quyet Dinh Truoc Khi Sua

| Cau hoi | Neu Co | Neu Khong |
|---|---|---|
| Task co dung vao API contract khong | doi chieu server docs truoc | di tiep sang UX audit |
| Task co doi route/navigation khong | kiem tra `src/App.tsx` va link noi bo | giu nguyen routing scope |
| Task co loading state khong | bat buoc xet skeleton/empty/error state | chi can state UX toi thieu |
| Task co lien quan checkout/auth khong | uu tien regression manual L2 | chi can L1 + L3 tuy scope |

## 3. Bang Cong Viec Chuan Theo Loai Task

| Task type | Bieu hien code | Checklist |
|---|---|---|
| Navigation fix | `a href`, `window.location.pathname`, route mismatch | doi sang router API, check back-forward, check mobile |
| Contract alignment | api/service adapter, field alias, endpoint path | doi chieu server docs, patch adapter, test sparse state |
| Skeleton/loading | `loading`, spinner, plain text loading | tao skeleton, map layout, them reduced motion consideration |
| Error/empty UX | `error`, empty array, null data | them CTA, retry, message ro rang |
| Commerce UX | cart/payment/order/account | check validation, CTA semantic, auth state, persistence |
| Performance/a11y | bundle, CSS, keyboard flow | build baseline, chunking, focus state, responsive |

## 4. Exit Gate Truoc Khi Mark Done

Task chi duoc coi la done khi:

1. code da sua xong theo dung scope,
2. khong mo them regression ro rang,
3. build pass hoac ly do khong pass da duoc ghi ro,
4. sprint doc da duoc tick/check,
5. tracker da co execution log va blocker status moi nhat.

## 5. Template Bao Cao Sau Moi Luot Lam

```md
Update:

- Scope:
- Touched files:
- Contract checked against:
- Verification:
- Remaining risk:
- Next step:
```

## 6. Cac Nguyen Tac Quan Trong

1. Khong vua sua UI vua thay contract backend neu chua co source of truth.
2. Khong dong bug bang fallback xau hon nhu redirect not-found vo dieu kien.
3. Khong de plain text loading tren man hinh quan trong neu sprint da chua skeleton.
4. Khong close sprint neu blocker high con mo.
5. Moi thay doi dung den catalog, cart, payment, account phai co smoke check toi thieu.
