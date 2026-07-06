# Sprint 05 - Staging SPA 404 Hardening

- Project: `SONA_SPACE-Client`
- Priority: `P1`
- Status: `In Progress`
- Sprint type: Deployment routing and release hardening

## 1. Goal

Fix the staging-only 404 behavior for the Vite React SPA so valid client routes keep working when users refresh, open a deep link in a new tab, paste a URL directly, or return from external payment/auth redirects.

The expected production behavior is:

- valid SPA navigation routes return `200` with `index.html`;
- real static assets return the real asset with the correct content type;
- missing assets return a real asset 404, not `index.html`;
- backend API paths are never rewritten to client HTML;
- the Vite `base` path and React Router `basename` match the actual staging mount path.

## 2. Skills Checked

- `frontend-patterns`
  - Useful because this issue touches React Router navigation, route-level behavior, and client release checks.
- `documentation-lookup`
  - Useful because the fix depends on current Vite, React Router, and Vercel deployment behavior.

## 3. Current Baseline

- `src/App.tsx` uses `BrowserRouter`.
- Client routes are centralized in `src/App.tsx` and include deep-link routes such as:
  - `/san-pham/:slug`
  - `/danh-muc/:slug`
  - `/khong-gian/:slug`
  - `/tin-tuc/:slug`
  - `/chi-tiet-don-hang/:id`
  - `/dat-hang-thanh-cong/:orderHash`
- `vite.config.ts` does not currently define `base`.
- `BrowserRouter` does not currently define `basename`.
- `.env.staging.example` says the target is Vercel static deployment.
- No client-level `vercel.json` was found in the client root before this sprint.

## 4. Working Diagnosis

The likely root cause is server-level routing, not the React page components.

`BrowserRouter` depends on the hosting layer to serve `index.html` for deep-link HTML requests. Local Vite dev and preview can hide this class of issue because they already provide SPA fallback behavior. A static staging host needs an explicit fallback/rewrite rule.

For the current Vercel staging target, the baseline fix is now implemented in `vercel.json`:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

If staging is deployed under a subpath instead of the domain root, the sprint must also align:

- Vite `base`;
- React Router `basename`;
- deployment rewrite destination;
- public asset references.

## 5. In Scope

- Add the correct Vercel SPA fallback config at the deployment root.
- Confirm whether staging serves the app at `/` or a subpath.
- Add a small base-path contract if staging uses a subpath.
- Verify all known client routes by refresh/direct access.
- Verify JS/CSS/font/image assets are not rewritten as HTML.
- Verify `/api/*` requests still go to the server and are not swallowed by SPA fallback.
- Document the deploy contract for future staging/production builds.

## 6. Out Of Scope

- Replacing `BrowserRouter` with `HashRouter`, unless the host cannot be configured.
- Turning the app into an MPA.
- Changing backend API contracts.
- Redesigning the 404 UI page.
- Solving unrelated Sass or accessibility debt from Sprint 04.

## 7. Task Checklist

### Diagnosis

- [ ] Collect exact staging URLs that return host-level 404.
- [ ] Classify each failing URL as SPA route, asset path, or API path.
- [ ] Confirm Vercel project root and output directory for the client deployment.
- [ ] Confirm whether staging is mounted at `/` or a subpath such as `/app/`.
- [ ] Run header checks for root, deep-link route, asset, and API request.

### Vercel Fallback Contract

- [x] Add `vercel.json` at the effective client deployment root.
- [x] Configure SPA rewrite from `/(.*)` to `/index.html`.
- [x] Confirm client uses an external API base URL in `.env.staging.example`, so `/api/*` should not be served by this client project in the current staging model.
- [ ] Add optional headers if needed:
  - `index.html`: revalidate/no-cache behavior;
  - hashed assets: long cache with immutable behavior.

### Base Path Contract

- [ ] Keep Vite `base` as `/` if staging serves at the domain root.
- [ ] If staging serves under a subpath, set Vite `base` to that subpath.
- [ ] If staging serves under a subpath, pass the same value to `BrowserRouter basename`.
- [ ] Review public asset references that start with `/` and confirm they still resolve under the chosen mount path.

### Local Build Verification

- [x] Run `npm run build`.
- [x] Run `npm run qa:spa-routing`.
- [x] Run `npm run preview`.
- [x] Open or curl several deep links against preview:
  - `/san-pham`
  - `/san-pham/sofa-amsterdam`
  - `/khong-gian/phong-khach`
  - `/tin-tuc/bai-viet-test`
  - `/tai-khoan/don-hang`
- [x] Confirm preview returns `index.html` for valid deep links.
- [x] Confirm real assets return JS/CSS/image content types, not HTML.

### Staging Verification

- [ ] Deploy the client with the SPA fallback config.
- [ ] Hard refresh known deep-link pages on staging.
- [ ] Open known deep-link pages in a new tab.
- [ ] Verify browser console has no MIME errors such as JS loading as `text/html`.
- [ ] Verify external redirects back into the app:
  - email verification;
  - payment result;
  - order complete route.
- [ ] Verify the app's own `*` route renders `NotFoundPage` for unknown client routes after the SPA shell loads.

### Regression Guard

- [x] Add a small `qa:spa-routing` script or documented curl checklist for staging.
- [ ] Include checks for:
  - [x] `200 text/html` on client deep links locally;
  - [x] real asset content type for `/assets/*.js` locally;
  - no accidental rewrite of API paths;
  - no cached host-level 404 after redeploy.
- [ ] Add the routing check to the release-readiness docs.

## 8. Implementation Evidence

- Added `vercel.json` in the client root with:
  - `rewrites: [{ "source": "/(.*)", "destination": "/index.html" }]`;
  - `Cache-Control: no-cache, no-store, must-revalidate` for non-asset HTML routes;
  - immutable cache headers for `/assets/(.*)`.
- Added `scripts/qa-spa-routing-contract.js`.
- Added `npm run qa:spa-routing`.
- Hotfix after staging runtime error:
  - `vite.config.ts` no longer emits a standalone `vendor-rc` chunk.
  - `rc-*` and `@rc-component` packages are bundled with `antd` / `@ant-design` in `vendor-antd`.
  - Reason: splitting Ant Design's rc dependency graph into a separate production chunk can trigger minified TDZ runtime errors such as `Cannot access 'Xi' before initialization`.
  - `scripts/qa-spa-routing-contract.js` now fails if a standalone `vendor-rc-*.js` chunk is emitted again.
- `npm run build` passed.
- `npm run qa:spa-routing` passed:
  - Vercel SPA fallback rewrite exists;
  - Vercel prevents stale HTML shell caching;
  - `BrowserRouter` and app-level `path="*"` route exist;
  - `dist/index.html` references existing built assets.
  - no standalone `vendor-rc` chunk exists.
- Local preview checks passed:
  - `/` -> `200 text/html`;
  - `/san-pham` -> `200 text/html`;
  - `/san-pham/sofa-amsterdam` -> `200 text/html`;
  - `/khong-gian/phong-khach` -> `200 text/html`;
  - `/tin-tuc/bai-viet-test` -> `200 text/html`;
  - `/tai-khoan/don-hang` -> `200 text/html`;
  - built JS asset under `/assets/...js` -> `200 text/javascript`.

## 9. QA Matrix

| Area | Required check | Status |
|---|---|---|
| Deep-link route | direct visit returns SPA shell, not host 404 | [x] local / [ ] staging |
| Refresh route | refresh on route keeps the page bootable | [x] local / [ ] staging |
| Static asset | JS/CSS/image paths return real asset content types | [x] local / [ ] staging |
| API separation | API routes are not rewritten to `index.html` | [ ] |
| Subpath | Vite `base` and router `basename` match deployment mount | [ ] |
| Cache | old 404 or old HTML is not served after redeploy | [ ] |
| External return | payment/email/order redirects boot the correct route | [ ] |

## 10. Risks To Watch

- Putting `vercel.json` in the wrong folder if Vercel project root is not `SONA_SPACE-Client`.
- Rewriting API requests to `index.html` if client and server share a domain without path separation.
- Solving deep links but breaking assets when the app is actually mounted under a subpath.
- Returning HTML for missing JS chunks, which appears as MIME errors or `Unexpected token <`.
- CDN/edge cache preserving an old 404 after the rewrite is fixed.

## 11. Definition Of Done

- [x] Client repo has an explicit SPA fallback contract.
- [ ] Staging has deployed the SPA fallback contract.
- [ ] Known direct deep links return the SPA shell instead of host-level 404 on staging.
- [ ] Real assets are still served as assets on staging.
- API calls are not rewritten into client HTML.
- [x] `npm run build` passes.
- [x] `npm run qa:spa-routing` passes.
- Staging curl/browser smoke evidence is recorded in this sprint doc and the UI/UX tracker.
- [x] The next developer can tell exactly where the deploy routing rule lives.
