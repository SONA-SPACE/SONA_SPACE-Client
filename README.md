# SONA SPACE Client

SONA SPACE Client is the customer-facing web application for the SONA SPACE commerce platform. It presents furniture products, room inspirations, design services, news content, account management, wishlist, cart, checkout, and order tracking in a React single-page application.

The client is part of a two-application workspace:

- `SONA_SPACE-Client`: React/Vite frontend for customers.
- `SONA_SPACE-Server`: Express/PostgreSQL backend, API layer, and EJS admin dashboard.

The client depends on the server API and should normally be developed with the backend running locally at `http://localhost:3501/api`.

## Product Overview

SONA SPACE is a furniture and space-design commerce experience. The frontend supports the full customer journey:

1. Discover products, categories, spaces, banners, and editorial content.
2. Search and filter catalog items.
3. Inspect product details, colors, variants, stock, and related products.
4. Save items to wishlist or cart.
5. Complete checkout and payment handoff.
6. Track order status, order detail, cancellation, and return flows.
7. Manage account information, vouchers, notifications, and order history.
8. Submit contact, architecture profile, and design service forms.
9. Interact with chatbot and promotional popup experiences.

## Core Features

- Home page with banner, category, product, space, showcase, and promotional sections.
- Catalog pages for all products, categories, rooms/spaces, and product detail.
- Wishlist and mini wishlist sidebar interactions.
- Cart with quantity updates, delete flows, promo validation, and checkout gating.
- Checkout flow with customer information, address editing, coupons, COD/payment handoff, and payment result handling.
- Account area for profile, orders, vouchers, wishlist/reviews-related data, and notifications.
- Order detail flow with status progress, cancellation, product cancellation, and return UI.
- News list and news detail pages with category/recent-post sidebars.
- Contact and service request forms.
- Google OAuth entry point and email verification result route.
- Shared loading, empty, error, retry, and skeleton feedback components.
- Route-level lazy loading for non-home pages.

## Tech Stack

- React 19
- TypeScript
- Vite
- React Router
- Axios and Fetch
- Sass
- Ant Design
- React Toastify
- Swiper
- Socket.IO Client
- Google OAuth provider
- DOMPurify, React Markdown, Remark GFM, and `he` for content rendering/sanitization

## Requirements

- Node.js 18 or newer
- npm 8 or newer
- Running `SONA_SPACE-Server`
- Running PostgreSQL database used by the server

## Project Structure

```text
SONA_SPACE-Client/
+-- src/
|   +-- api/          Direct API wrappers.
|   +-- assets/       Frontend static assets imported by React.
|   +-- components/   Shared UI components.
|   +-- contexts/     React context providers such as auth state.
|   +-- features/     Feature-specific modules.
|   +-- hooks/        Shared custom hooks.
|   +-- layouts/      Layout-level components.
|   +-- pages/        Route-level screens.
|   +-- services/     Higher-level service calls.
|   +-- store/        Client-side state helpers.
|   +-- utils/        Shared utilities such as API URL building.
|   +-- App.tsx       Route tree and app shell.
|   +-- main.tsx      React entrypoint and global providers.
+-- public/
|   +-- fonts/
|   +-- images/
|   +-- scss/
+-- docs/             Frontend tracker, QA, and sprint docs.
+-- package.json
+-- vite.config.ts
+-- tsconfig.json
+-- README.md
```

## Main Routes

| Route | Purpose |
|---|---|
| `/` | Home page |
| `/san-pham` | Product listing |
| `/danh-muc/:slug` | Products by category |
| `/san-pham/:slug` | Product detail |
| `/san-pham-yeu-thich` | Wishlist page |
| `/gio-hang` | Cart |
| `/thanh-toan` | Checkout |
| `/thanh-toan-result` | External payment result handler |
| `/dat-hang-thanh-cong/:orderHash` | Order completion page |
| `/khong-gian` | Room/space listing |
| `/khong-gian/:slug` | Room/space detail |
| `/dich-vu-thiet-ke` | Design service form |
| `/ho-so-kien-truc` | Architecture profile form |
| `/lien-he` | Contact form |
| `/dang-ky` | Registration |
| `/dang-nhap` | Login |
| `/quen-mat-khau` | Forgot password |
| `/xac-thuc-email` | Email verification result |
| `/tai-khoan/*` | Account area |
| `/chi-tiet-don-hang/:id` | Order detail |
| `/tin-tuc` | News listing |
| `/tin-tuc/:slug` | News detail |
| `/dieu-khoan-su-dung` | Terms/privacy content |
| `/chinh-sach-bao-mat` | Policy content |

## Environment Variables

Create or verify:

```text
SONA_SPACE-Client/.env
```

Recommended local values:

```env
VITE_API_BASE_URL=http://localhost:3501/api
VITE_GOOGLE_CLIENT_ID=
```

`VITE_API_BASE_URL` is required. API helpers use `src/utils/url.tsx` to build backend URLs.

Do not commit production secrets. Configure staging/production values in the hosting provider environment settings.

## Backend Dependency

Start the backend before running the client:

```bash
cd ../SONA_SPACE-Server
docker compose up -d
npm run dev
```

Expected backend endpoints:

```text
API base:     http://localhost:3501/api
Health check: http://localhost:3501/health
Admin login:  http://localhost:3501
```

The admin dashboard is served by the backend, not by the Vite frontend.

## Installation

From `SONA_SPACE-Client`:

```bash
npm install
```

## Development

Start the dev server:

```bash
npm run dev
```

Default local URL:

```text
http://localhost:5173
```

After changing `.env`, restart the Vite dev server.

## Build And Preview

Create a production build:

```bash
npm run build
```

Preview the built output:

```bash
npm run preview
```

## Local Review Accounts

Customer-facing login uses backend user data. If seeded local data is reset, confirm the customer account password in the server seed or current local database.

Backend admin review accounts:

```text
Admin dashboard
URL: http://localhost:3501
Email: admin@sonaspace.com
Password: Voanhphi12@

Staff dashboard
URL: http://localhost:3501
Email: staff@sonaspace.com
Password: Voanhphi12@
```

## Development Workflow

Recommended local flow:

1. Start PostgreSQL and backend from `SONA_SPACE-Server`.
2. Check `http://localhost:3501/health`.
3. Set `VITE_API_BASE_URL=http://localhost:3501/api`.
4. Run `npm install` if dependencies changed.
5. Run `npm run dev`.
6. Work on the relevant page/component/service.
7. Smoke test the affected route in desktop and mobile widths.
8. Run `npm run build`.
9. Update the frontend tracker/sprint docs if the task changes QA status or release readiness.

## Quality Gates

Before handoff, run:

```bash
npm run build
```

Recommended manual smoke routes:

```text
/
/san-pham
/san-pham/:slug
/gio-hang
/thanh-toan
/tai-khoan
/san-pham-yeu-thich
/tin-tuc
```

When the change touches checkout/account/order flows, test with a backend-connected local session.

## Known Build Warnings

The current build can pass while still printing warnings for:

- Sass `@import` deprecation from the legacy SCSS entry.
- Large generated chunks, especially the current large application chunk.
- Heavy font assets emitted from the public font set.

These are tracked as frontend hardening/release-readiness work in:

```text
docs/ui-ux-tracker.md
docs/sprints/sprint-04-performance-accessibility-release-readiness.md
```

## Troubleshooting

### API calls fail

Verify backend health:

```text
http://localhost:3501/health
```

Verify client `.env`:

```env
VITE_API_BASE_URL=http://localhost:3501/api
```

Restart Vite after changing `.env`.

### `VITE_API_BASE_URL` is undefined

Vite only exposes variables prefixed with `VITE_`. The name must be exactly:

```env
VITE_API_BASE_URL=http://localhost:3501/api
```

### Login or account pages fail

Check that:

- The backend is running.
- PostgreSQL is running and seeded.
- Browser storage does not contain stale auth data.
- `VITE_API_BASE_URL` points to the same backend you are testing.

### Google login does not work

Set:

```env
VITE_GOOGLE_CLIENT_ID=<google-oauth-client-id>
```

The backend must also have matching Google OAuth configuration.

### Chatbot does not connect

The chatbot depends on the backend Socket.IO/chatbot setup. Confirm the backend is running and that any required AI keys are configured on the server.

### Build passes with warnings

Warnings are currently documented in the frontend Sprint 4 release-readiness docs. Treat new warnings as regressions and record them in the tracker.

## Documentation

Frontend planning, QA, and sprint status are documented in:

```text
docs/
docs/sprints/
```

Important docs:

- `docs/README.md`
- `docs/ui-ux-tracker.md`
- `docs/qa-qc-frontend-regression-playbook.md`
- `docs/quy-trinh-docs-cho-agent.md`
- `docs/quy-trinh-thuc-thi-ui-ux-va-sua-loi-client.md`
- `docs/sprints/sprint-01-foundation-navigation-contract.md`
- `docs/sprints/sprint-02-loading-skeleton-empty-error-state.md`
- `docs/sprints/sprint-03-commerce-account-content-ux-hardening.md`
- `docs/sprints/sprint-04-performance-accessibility-release-readiness.md`

When changing API-dependent UI, cross-check backend docs in:

```text
../SONA_SPACE-Server/docs/
```
