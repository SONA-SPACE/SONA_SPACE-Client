# Quy Trinh Docs Cho Agent

- Project: `SONA_SPACE-Client`
- Purpose: buộc AI agent và dev hỗ trợ cập nhật docs theo cùng một chuẩn, tránh sửa code xong nhưng tracker bị lệch.

## 1. Thu tu doc bat buoc phai doc

Truoc khi sua code, agent phai doc theo thu tu sau:

1. `docs/README.md`
2. `docs/ui-ux-tracker.md`
3. sprint doc dang active
4. `docs/qa-qc-frontend-regression-playbook.md`
5. server docs lien quan neu task co API contract

## 2. Nguyen tac cap nhat docs

1. Khi bat dau mot task lon:
   - kiem tra sprint active.
   - neu task chua nam trong sprint, them vao sprint doc hoac blocker log.
2. Khi sua code xong:
   - cap nhat checklist trong sprint doc.
   - cap nhat `Execution Log`.
   - neu co blocker moi, them vao `Blocker Log`.
3. Khi task can evidence:
   - ghi command da chay.
   - ghi ket qua build/test/smoke.
   - ghi file chinh da chinh.

## 3. Contract Source of Truth

Agent khong duoc tu suy dien field API o client neu khong doi chieu:

1. `../../SONA_SPACE-Server/docs/migration-tracker.md`
2. `../../SONA_SPACE-Server/docs/db-contract-postgres.md`
3. route/backend code hien tai neu can xac minh sau cung

## 4. Quy tac sprint

1. Moi task phai map vao mot sprint.
2. Khong dong sprint neu:
   - blocker high/cong viec chinh chua xu ly,
   - QA matrix chua du,
   - docs chua cap nhat.
3. Neu phat hien viec nam ngoai sprint hien tai:
   - dua vao sprint tiep theo hoac blocker log,
   - khong chen vao execution log mot cach mo ho.

## 5. Quy tac handoff

Moi handoff phai tra loi duoc 5 cau hoi:

1. Da sua cai gi.
2. Tai sao sua.
3. File nao bi anh huong.
4. Da verify bang gi.
5. Viec gi con mo tiep theo.

Template:

```md
Handoff:

- Scope:
- Reason:
- Files:
- Evidence:
- Open follow-up:
```

## 6. Khi nao phai mo blocker

Mo blocker ngay neu gap mot trong cac truong hop:

1. route contract tu server va client dang mau thuan,
2. UX bug khien flow mua hang/chi tiet san pham khong dung duoc,
3. loading skeleton/error state khong the dat trong sprint hien tai,
4. bundle/performance vuot baseline ma chua co phuong an xu ly.

## 7. Definition of Good Docs Update

Mot lan cap nhat docs duoc coi la tot khi:

1. tracker, sprint, blocker, evidence khop nhau,
2. nguoi khac nhin vao biet ngay viec tiep theo la gi,
3. co the tiep tuc lam ma khong can hoi lai tac gia cu.
