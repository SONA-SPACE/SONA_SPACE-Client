# Sprint 06 - UI Modernization: Depth, Hover and Motion

- Project: `SONA_SPACE-Client`
- Priority: `P1`
- Status: `In Progress`
- Branch: `feat/client-ui-modernization`
- Sprint type: Visual modernization (keep the existing color palette)

## 1. Goal

Bring the client UI up to current e-commerce standards without changing the brand palette:

- a shared elevation (shadow), radius, motion and z-index scale used by every component;
- a header that is transparent over a hero and solid with a shadow once scrolled or on light pages;
- a hero banner with a choreographed text entrance, slow image zoom and visible slide controls;
- consistent hover zoom and lift on product, room, category and news cards;
- scroll reveal and grid stagger on browsing pages, restrained motion on transaction pages;
- every menu reachable by click and keyboard, not hover only;
- no new layout shift (CLS < 0.1 on every audited route).

## 2. Skills Used

- `ui-ux-pro-max`
  - design-system query `furniture interior e-commerce premium minimal` (motion 5, density 3);
  - domain queries: card hover zoom, hover vs tap, sticky header, motion duration/easing, scroll reveal stagger, hero timeline, image parallax.
  - Palette and font suggestions from the tool are intentionally ignored: the owner keeps the current palette and the Montserrat / Be Vietnam pairing.
- `gsap-core`, `gsap-scrolltrigger`, `gsap-timeline`, `gsap-performance` - reveal, stagger, banner timeline, transform/opacity only.
- `cinematic-gsap-lenis-motion-system` - parallax and magnetic CTA, home and about pages only. Lenis is not adopted.
- `vercel-composition-patterns`, `vercel-react-best-practices` - split `Header`, shared `Layout`, lazy GSAP.
- `ux`, `webapp-testing`, `qa` - verification after each phase.

## 3. Baseline (audit 2026-10-13, Playwright, 1440x900 and 390x844)

- 189 distinct hex colors, 63 font sizes, 56 distinct `box-shadow`, 25 `border-radius`, 18 `z-index` values (-1 to 11000).
- `body` font is `ir`, which is never declared, so unstyled text falls back to the browser default.
- `section p { color: $dark-cl }` in `_components.scss` turns the banner description `#221D00` on a dark glass panel.
- Header is always `rgba(0,0,0,.45)` + blur, never changes on scroll; looks like a grey band on light pages.
- Account menu and notifications open on hover only; notification bell has no `onClick`.
- Banner: no rendered navigation/pagination, two `<h1>` per page, panel hidden under the header on mobile (panel top 0, header bottom 80).
- No scroll reveal; 83 `transition: all`; 6 copies of `@keyframes spin`.
- CLS: `/san-pham/:slug` desktop 1.0, `/san-pham` mobile 0.143. Home mobile is 12,414px tall (one product per row).

## 4. Design Decisions

### Tokens (`src/styles/imports/core/_variables.scss`, CSS custom properties)

| Group | Tokens |
|---|---|
| Elevation | `--shadow-xs`, `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-xl`, warm-tinted from `$dark-cl` (`rgba(34,29,0,a)`) |
| Radius | `--radius-xs` 4, `--radius-sm` 8, `--radius-md` 12, `--radius-lg` 16, `--radius-xl` 24, `--radius-pill` 999 |
| Motion | `--dur-fast` 160ms, `--dur-base` 240ms, `--dur-slow` 420ms, `--dur-image` 700ms; `--ease-out` `cubic-bezier(.22,1,.36,1)`, `--ease-in-out` `cubic-bezier(.65,0,.35,1)` |
| Z-index | `--z-dropdown` 100, `--z-chat` 900, `--z-header` 1000, `--z-overlay` 1100, `--z-drawer` 1200, `--z-modal` 1300, `--z-toast` 1400 |

### Motion rules

- Hover, focus and shadow changes: CSS only, named properties (never `transition: all`).
- Card hover: image `scale(1.06)` over `--dur-image`, card lifts `translateY(-4px)` and goes `--shadow-sm` to `--shadow-lg`. Hover styles live under `@media (hover: hover)` so touch devices do not get sticky hover.
- Scroll reveal: GSAP + ScrollTrigger, `y: 16`, `opacity 0 -> 1`, 0.6s, `power2.out`, stagger 0.06s, `start: top 88%`, play once.
- Content is visible without JS; elements are hidden only after GSAP has loaded (`html.motion-ready`).
- `prefers-reduced-motion: reduce` gets no reveal, no zoom, no parallax, and banner autoplay stops.
- GSAP is imported dynamically so it stays out of the entry chunk.

## 5. Phases

### Phase 0 - Foundation

- [x] Add elevation, radius, motion and z-index tokens.
- [x] Fix the body font (`ir` -> `Be-R`) and the undefined `ib` / `SVN-Gilroy` references.
- [x] ~~Scope the global `section p` rule~~ Dropped: lowering it let the later antd `p` reset win. The banner sets its own text colors instead.
- [x] Add shared motion utilities: `src/motion/MotionProvider.tsx` (`data-reveal`, `data-parallax`, `data-magnetic`), reduced-motion handling.
- [x] Install `gsap` (3.13.0, own lazy chunk `vendor-gsap`).

### Phase 1 - Shared components

- [x] Header: transparent over hero, solid + `--shadow-sm` after scroll and on pages without a hero; active state from the router location.
- [x] Header: account menu, notifications and mini-cart open by click and keyboard; `aria-expanded`; Escape closes.
- [x] Header: split into smaller components.
- [x] BannerSlider: GSAP entrance timeline per slide, slow zoom, visible prev/next + pagination, one `<h1>`, readable description, header offset on mobile.
- [x] Product card: hover zoom, lift, shadow, CTA reveal, keyboard-reachable wishlist button.
- [x] Mini-cart, wishlist sidebar, popup: shared overlay, shadow and slide-in timing.
- [x] Footer: link/icon hover, spacing.

### Phase 2 - Shopping pages

- [x] Home: section reveal, product grid stagger, category/room cards hover zoom, light parallax.
- [x] `/san-pham`, `/danh-muc/:slug`: stagger, 2 columns on mobile.
- [x] `/san-pham/:slug`: gallery hover zoom, smooth image switch, fix CLS 1.0.
- [x] `/khong-gian`, `/khong-gian/:slug`: hover zoom, reveal.

### Phase 3 - Content pages

- [x] `/tin-tuc`, `/tin-tuc/:slug`: card hover, reveal, article typography.
- [x] `/lien-he` (about), `/dich-vu-thiet-ke`, `/ho-so-kien-truc`, 404: reveal, card depth.

### Phase 4 - Transaction flows (restrained motion)

- [x] `/gio-hang`, `/thanh-toan`, `/dat-hang-thanh-cong/:orderHash`, `/tai-khoan/*`, `/chi-tiet-don-hang/:id`, auth pages: compact page header instead of the full-screen hero, elevation tokens, focus and button states. No scroll reveal.

## 6. Out Of Scope

- Changing the color palette or the font pairing.
- Smooth-scroll libraries (Lenis) site-wide.
- Backend changes. The `/api/news-categories/news/tu-van-va-thiet-ke` 404 and the Google OAuth origin are logged as blockers, not fixed here.

## 7. QA Matrix

| Area | Required check | Status |
|---|---|---|
| Layout shift | CLS < 0.1 on the 13 audited routes, desktop and mobile | [ ] |
| Overflow | no horizontal scroll at 390 / 768 / 1440 | [ ] |
| Keyboard | header menus, banner controls, card wishlist reachable and visible focus | [ ] |
| Touch | no hover-only feature at 390 | [ ] |
| Reduced motion | no reveal, zoom, parallax or autoplay | [ ] |
| Contrast | banner text and header text >= 4.5:1 | [ ] |
| Bundle | GSAP not in the entry chunk | [ ] |
| Existing contracts | `qa:banner-stability`, `qa:home-product-state`, `qa:sass-modules`, `qa:public-asset-paths`, `qa:spa-routing` | [ ] |

## 8. Risks

- Global SCSS selectors (`section p`, `bootstrap_mini` `!important`) override new component styles; scope new styles with component class prefixes.
- Hiding content before reveal can create blank sections if GSAP fails to load; the `motion-ready` gate prevents this.
- Header state change must not resize the header (no CLS); only background, shadow and color change.
- Banner contract scripts pin class names and the absence of CSS entrance keyframes; the GSAP timeline keeps those contracts valid.

## 9. Revision 1 - owner review (2026-10-14)

Status: `In Progress` - owner decisions recorded below; banner typeface still waiting for a choice (`public/__mockups/banner-fonts.html`).

### Feedback

1. Header color is wrong: it reads brown. The owner wants black, as it was before.
2. The SONA logo looks broken.

### Root causes (measured)

- **Header color.** Sprint 06 replaced the original black glass header (`rgba(0,0,0,.45)` + `blur(5px)`) with `$dark-cl` `#221D00` at 92%, which renders as dark olive-brown. The palette was meant to stay unchanged; the header surface was not part of the palette decision and should not have been recolored. The same brown tint (`rgba(34,29,0,a)`) was also introduced on: banner and `PageHero` scrims, `PageHero` background, product tile "Xem chi tiết" overlay, the first policy card, mobile menu header, header badge ring, drawer/popup backdrops, and all shadow tokens.
- **Logo.** `public/images/logo.png` is a 100x27 raster shown at 100x27 CSS px. On the owner's Windows display (150%, DPR 1.5) the browser upscales it 1.5x, so the strokes blur and show a halo. The mobile menu scales it to 88.88x24 (fractional), which is worse. `public/images/logo.svg` embeds a 331x90 PNG of the same artwork, which stays sharp up to DPR 3.

### Fixes that need no choice

- Logo: serve the 331x90 artwork (`logo@3x.png` extracted from `logo.svg`) at a fixed 100x27 box in the header and the mobile menu; no fractional scaling.
- `OrderComplete` (QA finding, High): on a MoMo return the order is created by `saveOrderIfNeeded` while `fetchOrder` runs in parallel, so a paying customer can see "Không tìm thấy đơn hàng". `fetchOrder` must wait for the save step (or retry) before declaring the order missing.

### Decisions for the owner (mockup page `public/__mockups/ui-concepts.html`, local only)

| ID | Section | Pages | Options |
|---|---|---|---|
| D1 | Dark tone for overlays, scrims, backdrops, shadows | all | black (as before) / current brown |
| H1 | Header surface | all | A: original black glass everywhere / B: transparent over banner, solid black elsewhere / C: solid black everywhere |
| B1 | Home and listing banner | `/`, `/san-pham`, `/khong-gian`, `/tin-tuc` | A: current left-aligned copy on scrim / B: original glass panel, readable text / C: centered minimal |
| P1 | Compact page header | `/danh-muc/:slug`, `/khong-gian/:slug`, `/gio-hang`, `/tai-khoan`, `/dang-nhap`, `/dang-ky` | A: current image header / B: plain title band with breadcrumb / C: image strip + title below |
| C1 | Product card | every product grid | A: current tile with hover overlay / B: borderless minimal / C: bordered card with visible "Xem chi tiết" (closest to the original) |
| T1 | Photo tiles (rooms, popular categories) | `/`, `/san-pham`, `/khong-gian` | A: white button CTA (current) / B: text link with arrow |
| S1 | Policy cards | `/san-pham`, `/gio-hang` | A: dark lead card / B: all light cards |

### Owner decisions (2026-10-14) and what was done

| Item | Decision | Done |
|---|---|---|
| Logo | Use the sharp artwork | `public/images/logo@3x.png` (331x90) at a fixed 100x27 in header and mobile menu |
| D1 dark tone | Less brown, lighter overlays | Every `rgba(34,29,0,a)` overlay, backdrop, border and shadow tint is now neutral black; banner scrim lowered (left 0.78 -> 0.5, bottom 0.55 -> 0.35, mobile 0.9 -> 0.72) with a soft text-shadow; `PageHero` scrim 0.86 -> 0.62 |
| H1 header | Black glass over banners | Over a hero: original `rgba(0,0,0,.45)` + `blur(5px)`; light pages / after scrolling: `rgba(0,0,0,.92)` |
| B1 banner | Keep layout, new typeface | Typeface options A-D on the mockup page; waiting for choice |
| P1 page header | Low image, title bottom-left, less text | Eyebrow and description removed from `PageHero` (props deleted); breadcrumb + title only |
| C1 product card | Keep, fewer effects | Hover: `--shadow-sm`, image zoom 1.04, quick-view bar; no lift, no name recolor |
| T1 photo tiles | Keep, less zoom, horizontal expand | `TileStrip`: first tile wide by default, the last tile entered by pointer or keyboard expands (state, so crossing a gap does not snap back); zoom 1.03; stacked below 992px. Popular categories: heading + rows of three. Superseded by Revision 2 |
| S1 policy cards | All light, text lead, less shadow | Lead is a text heading; cards have a hairline border, no resting shadow |

Found and fixed while doing it:

- Reveal marker moved from a class to `data-revealed`: React rewrote `className` on hover and re-hid revealed tiles.
- Stacked tiles collapsed to 0px height on phones (`flex-basis: 0` in a column); `flex: none` when stacked.
- Vite served a stale transform of `HomePage` after a write; touching the file recompiled it.

Verification (2026-10-14): 39-pair audit (13 routes x 1440/768/390) max CLS 0.015, no overflow, one `<h1>` per page, all reveals visible; tiles measured at 390/768/1024 and through default / hover / gap / leave / keyboard focus; `qa:banner-stability`, `qa:home-product-state`, `qa:sass-modules` passed; logo checked at DPR 1.5.

### Revision 2 - owner review (2026-10-14, second round)

| Item | Decision | Done |
|---|---|---|
| B1 banner | No big title: magazine caption (N3 on `banner-fonts.html`) | `BannerSlider` shows a yellow subtitle and one underlined caption link at the bottom left; the caption is the page `<h1>`; description and button removed; scrim only along the bottom; controls bottom right |
| Leading dashes | Remove every "--" before titles | SectionHeading eyebrow `::before` and category slider name `::after` removed; banner subtitle has no dash |
| T1 photo tiles | Back to the previous layout | `TileStrip` deleted; static `MediaTile` grid with the white "Xem Sản Phẩm" button always visible; zoom 1.03, `--shadow-md` on hover |
| Softer hovers | Category slider, "Nội Thất Theo Yêu Cầu", footer tip boxes | Category slider `--shadow-sm` + zoom 1.03; interior cards `--shadow-md`; footer tips `--shadow-md`, zoom 1.03, no lift |
| New pages | `/lien-he`: L2 (story + contact). `/dich-vu-thiet-ke`: DA (service landing), banner image must stay sharp | Mockups on `public/__mockups/pages-concepts.html` (local only). `/lien-he`: eyebrow instead of the yellow rule, process steps as hairline cards, project hover `--shadow-sm` + zoom 1.03, form in a rounded card, heading no longer squeezed by the vase. `/dich-vu-thiet-ke`: rebuilt page (hero with real text and stats, 3 service cards, 5-step timeline, payment and revision terms written as short descriptions, form with chip pickers for space and budget); `Showcase` takes `hideWhenEmpty` so the empty projects block is hidden |
| Header shadow | Remove it | No `box-shadow` on either header surface; dropdown panels keep theirs to separate from the page |
| Footer tip strip | TB from `public/__mockups/footer-concepts.html` (local only); main footer unchanged for now | The three photo cards became one row of compact shortcuts (72px thumbnail, title, note, arrow; 56px thumbnail at 992-1199px), about 98px tall instead of about 380px; stacked below 992px |
| Product gallery CLS (found during the check) | Fix | `.image3-2`, `.image4`, `.image5` photos reserve a 16:9 box before loading; mobile product page CLS went from 0-0.015 per run to 0.0003 |

Hero image check: `connect_02.jpg` (the mockup's choice) is a 2880px upscale of a small photo with an edge score of 201, the softest on the page; `connect_01.jpg` scores 2053 and is shown whole (`object-fit` not needed, `height: auto`) at 0.32-0.39 source pixels per device pixel at DPR 1.5.

Verification (2026-10-14, final tree): `npm run build` passed (pre-existing `vendor-antd` 599 kB warning); `qa:spa-routing`, `qa:about-page` (19), `qa:public-asset-paths`, `qa:banner-stability` (6), `qa:product-filter-history` (7), `qa:home-product-state` (5), `qa:sass-modules` (3) passed; 39-pair audit max CLS 0.015 with no overflow, h1 or reveal findings; both new pages screenshotted at 1440 and 1920 (DPR 1.5), 768 and 390 (DPR 2); the design form's empty-submit errors and chip selection were exercised in the browser.

### Order of work after the choice

1. D1 + H1 + logo (header and every surface that uses the dark tone).
2. B1 and P1 (hero areas).
3. C1, T1, S1 (cards).
4. `OrderComplete` race.
5. Re-run: 39-pair audit (CLS, overflow, reveal, h1), `npm run build`, 7 QA contracts, logo check at DPR 1, 1.5 and 2.

## 10. Blocker Log

| Date | Blocker | Owner |
|---|---|---|
| 2026-10-13 | `/dich-vu-thiet-ke` calls `/api/news-categories/news/tu-van-va-thiet-ke` -> 404 | Server |
| 2026-10-13 | Google Sign-In: `The given origin is not allowed for the given client ID` on `localhost:5173` | Google Cloud config |

## 11. Implementation Evidence

- 2026-10-13 audit (Playwright, 13 routes x 1440/768/390): max CLS 0.059 (was 1.162 on `/san-pham/:slug`), no horizontal overflow on `html` or `body`, no runtime errors, no broken images, one `<h1>` per page, all reveals visible after a full scroll, reduced motion leaves nothing hidden and stops banner autoplay.
- 2026-10-14 `npm run build` passed (tsc + vite). Open, pre-existing: `vendor-antd` chunk 599 kB warning.
- 2026-10-14 QA contracts: `qa:spa-routing`, `qa:about-page` (19), `qa:public-asset-paths`, `qa:banner-stability` (6), `qa:product-filter-history` (7), `qa:home-product-state` (5), `qa:sass-modules` (3) all passed.
- `vendor-markdown` no longer preloaded on every page (manualChunks matched `react-markdown` as React).

## 12. Definition Of Done

- [ ] All phase checklists complete.
- [ ] QA matrix complete with evidence.
- [ ] `npm run build` passes.
- [ ] Tracker updated.
