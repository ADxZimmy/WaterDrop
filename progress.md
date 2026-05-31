# WaterDrop Remediation Progress

Last updated: 2026-05-31
Owner: Codex

## Current Focus

Status: **Phase 2 in progress with analytics broad-read observability strengthened; Phase 1 authenticated desktop QA complete and 390px protected QA still open**

The current execution track is **UX/performance first, Supabase migration second**. The working MVP remains Firebase-backed while Phases 1 and 2 stabilize the user experience and current data access. Firebase removal begins after the Supabase foundation is in place.

Project documentation rule: [`AGENTS.md`](AGENTS.md) now records the durable project instruction to update all progress-like Markdown files before committing or pushing WaterDrop work, even in a fresh conversation. It also records the durable project instruction to commit and push every Codex-made local project change to GitHub before ending the turn unless the user's latest instruction explicitly says not to push. Treat [`progress.md`](progress.md), [`handover.md`](handover.md), [`docs/assessment.md`](docs/assessment.md), and any future tracker/handover/status/assessment/roadmap/changelog Markdown file as progress-like when project state changes.

## Stack Decision

Selected target stack:
- Next.js App Router
- Supabase Postgres, Auth, Storage, and Realtime
- Tailwind CSS and shadcn/ui
- Vitest for unit and business-logic coverage

Decision notes:
- Supabase is selected because it replaces the current Firebase Auth, Firestore, Storage, and realtime needs with one managed Postgres-backed platform.
- Public route paths and API response shapes should stay stable during migration unless this file explicitly marks a route for deprecation.
- Firebase remains temporary infrastructure through Phases 1 and 2 only.
- Supabase migrations must include explicit table and sequence `GRANT` statements for every table exposed through Supabase Data API clients. New Supabase projects begin moving to explicit grants by default on 2026-05-30, and existing projects are scheduled for enforcement on 2026-10-30.

Reference sources:
- Supabase Next.js Auth: https://supabase.com/docs/guides/auth/quickstarts/nextjs
- Supabase platform features: https://supabase.com/docs/guides/getting-started/features
- Prisma Next.js alternative: https://www.prisma.io/docs/guides/frameworks/nextjs
- Next.js authentication guidance: https://nextjs.org/docs/app/guides/authentication
- Supabase Data API grants breaking change: https://github.com/orgs/supabase/discussions/45329

## Phase Tracker

| Phase | Status | Priority | Owner / Notes | Purpose | Exit Criteria |
| --- | --- | --- | --- | --- | --- |
| Phase 0 - Tracking and decision lock | Completed | P0 | Codex; docs-only tracker setup | Create this tracker, update handover, lock Supabase decision | `progress.md` exists, `handover.md` references it, no product behavior changes |
| Phase 1 - UX and perceived performance | Implemented; authenticated desktop QA complete; 390px protected QA pending | P0 | Codex; automated gates passed | Make the existing MVP feel fast and coherent | Mobile hero fixed, skeleton loading added, customer shell added, profile/marketplace navigation cleaned up, cart access added, homepage fetch churn reduced |
| Phase 2 - Current data access stabilization | In progress; customer order reads now index-resilient and analytics broad reads are measurable | P0 | Codex; avoid deep Firestore redesign | Keep Firebase-backed MVP usable until migration | Worst Firestore bottlenecks limited or paginated: `/api/vendors`, latest order, customer/vendor order lists, dashboard broad reads |
| Phase 3 - Supabase foundation | Pending | P1 | Backend migration owner | Add replacement backend foundation | Supabase env, clients, SQL schema, migrations, DTO mapping, Auth path, and Storage buckets defined |
| Phase 4 - Firebase removal | Pending | P1 | Backend migration owner | Move app behavior off Firebase | Firebase auth/db helpers, env checks, docs, apphosting config, and packages removed after feature parity |
| Phase 5 - Flow fine-tuning | Partially started for customer checkout/profile UX | P2 | Product/UX owner after core stability | Improve customer/vendor/driver journeys | Checkout address capture, vendor document review, driver invite/link, dispatch, proof-of-delivery, and notifications improved |
| Phase 6 - Production hardening | Pending | P2 | Release owner | Prepare for production operations | E2E role tests, visual checks, Supabase RLS, rate limiting, audit logging, deployment docs, seeds, monitoring |

## Phase Details

### Phase 0 - Tracking and Decision Lock

Status: Completed

Tasks:
- [x] Select Supabase as the Firebase replacement.
- [x] Set first execution track to UX/performance before backend migration.
- [x] Add `progress.md` as the canonical remediation tracker.
- [x] Update `handover.md` to point future agents here.
- [x] Keep product behavior unchanged.

Verification:
- Docs-only change.
- Reviewed `handover.md` with `git diff -- handover.md` and confirmed `progress.md` is a new untracked tracker with `git status --short --branch -- progress.md handover.md`.
- Product test suite not run because Phase 0 did not change app behavior.

### Phase 1 - UX and Perceived Performance

Status: Implemented; authenticated desktop QA complete and protected 390px QA pending

Tasks:
- [x] Fix homepage mobile hero clipping at 390px width.
- [x] Replace plain loading text with skeletons on cart, catalog, customer, vendor, driver, and admin pages.
- [x] Add a role-appropriate customer shell.
- [x] Stop global customer mobile navigation from appearing on admin and unrelated protected surfaces.
- [x] Tighten cart and checkout empty/error states.
- [x] Reduce homepage client fetch churn by consolidating initial data loading into one coordinated bootstrap path.
- [x] Keep logged-in customer brand navigation inside the customer workspace instead of briefly routing through the public homepage.
- [x] Improve homepage perceived speed by rendering the real public hero immediately and limiting skeletons to async auth/catalog regions.
- [x] Add a dedicated customer marketplace route at `/dashboard/customer/marketplace` so Marketplace navigation no longer loads the public homepage first.
- [x] Rework customer Overview, Orders, Track, and Settings pages from narrow mobile-style containers into desktop-friendly dashboard grids.
- [x] Audit desktop/mobile navigation for leftover `/` session links and replace role-session navigation with protected destinations.
- [x] Add real protected session landing pages for customer, vendor, and driver sessions.
- [x] Change the customer notification bell from route navigation to an in-place popover.
- [x] Rename customer "Overview" navigation to "Profile".
- [x] Route customer post-login/post-registration fallback to Marketplace first.
- [x] Add persistent customer cart access with live cart count in the customer shell.
- [x] Remove duplicate browse CTA from the empty customer orders state.
- [x] Restrict the WaterDrop install prompt to the public homepage only.
- [x] Make customer notification badge data-driven: no badge at zero, count badges for one to nine, and `9+` above nine.
- [x] Move public footer Quick Links into the admin overview and remove them from the public homepage footer.
- [x] Make Join Us registration links preselect vendor or driver roles.
- [x] Route the public rider/truck icon to rider sign-in instead of customer order tracking.
- [x] Add password-auth REST fallback for Chrome cases where Firebase client auth reports `auth/network-request-failed`.

Verification:
- [x] `npm test` passed on 2026-05-05: 6 files / 37 tests.
- [x] `npm run lint` passed on 2026-05-05.
- [x] `npm run typecheck` passed on 2026-05-05.
- [x] `npm run build` passed on 2026-05-05 and generated 95 static pages.
- [x] `git diff --check` passed on 2026-05-05.
- [x] Local dev server verified on 2026-05-05 with `GET / -> 200` at `http://127.0.0.1:3000`.
- [x] Public 390px mobile and desktop screenshot spot-checks captured for homepage and cart on 2026-05-05.
- [x] Chrome-authenticated desktop checks passed on 2026-05-28 for customer orders, vendor orders, driver dashboard, and admin overview.
- [x] Authenticated desktop visual checks for customer orders, vendor orders, driver dashboard, and admin overview in Chrome.
- [x] 2026-05-31 Water Drop feedback follow-up gates passed: `npm test`, `npm run lint`, and `npm run typecheck`.
- [ ] Authenticated 390px mobile visual checks for customer orders, vendor orders, driver dashboard, and admin overview.

Implementation notes:
- Added shared skeleton primitives and route-level loading fallbacks for cart, vendor catalog, customer, vendor, driver, and admin surfaces.
- Added route-aware app chrome so public mobile navigation no longer appears on admin or role dashboards.
- Added a customer shell with desktop sidebar, mobile sheet navigation, and customer-specific bottom navigation.
- Refined homepage mobile hero sizing and removed the full-hero startup skeleton so guests see meaningful above-the-fold content immediately.
- Updated customer shell and homepage brand links so customer sessions resolve to the customer workspace instead of flashing through `/`; customer auth fallback now lands on `/dashboard/customer/marketplace`.
- Updated customer Marketplace links to resolve to `/dashboard/customer/marketplace` from the customer shell and homepage customer nav.
- Widened customer Overview, Orders, Track, and Settings to `max-w-7xl` layouts with multi-column desktop grids while preserving mobile behavior.
- Added `/dashboard/session` as a role-aware protected session router.
- Added `/dashboard/customer/session`, `/dashboard/vendor/session`, and `/dashboard/driver/session` as real role landing pages.
- Updated legacy public mobile nav, cart, vendor-detail back links, vendor shell brand links, and driver shell brand links so logged-in session navigation no longer falls through `/`.
- Repo-wide root-link audit now leaves only the public homepage footer `/#vendors` anchor as an intentional public-page link.
- Customer header notifications now open in a popover and no longer navigate directly to `/dashboard/customer/track-order`.
- Customer notification badge is driven by current active-order/cart notification items and hides completely when there are no notifications.
- Customer shell now exposes a persistent cart icon with a live item-count badge.
- Customer navigation now labels `/dashboard/customer` as "Profile" while keeping the route path stable.
- Empty customer orders view now has a single marketplace CTA instead of duplicate browse actions.
- `PwaInstallPrompt` is still globally available through app chrome, but only renders when `pathname === "/"`.
- Public homepage Quick Links are no longer exposed in the footer; admin overview now has an admin-only Quick Links card.
- `/auth/register?role=vendor` and `/auth/register?role=driver` preselect the correct account type.
- The public header rider/truck icon now links to `/auth/login?role=driver` unless the active session is already a driver.
- Sign-in now falls back to Firebase password REST auth when the Firebase client SDK reports a browser/network transport failure, then continues through the existing `/api/auth/session` route.
- Chrome-authenticated desktop QA passed for customer orders, vendor orders, driver dashboard, and admin overview at a 1536px viewport: protected pages loaded, no app-origin console errors, no horizontal overflow, and no account/internal-server error states.
- Chrome extension tooling did not expose viewport emulation, and the available browser window resize path did not affect the controlled tab viewport; 390px protected QA remains open until a real narrow Chrome viewport or equivalent browser viewport control is available.
- Improved cart empty state and checkout address-missing guidance without changing cart/order API shapes.
- Protected-route screenshots captured without a session only verify auth redirects; role-page visual QA still needs a logged-in browser context.

### Phase 2 - Current Data Access Stabilization

Status: In progress; core customer/vendor order reads now bounded, customer order reads are resilient to missing Firestore composite indexes, and admin/vendor analytics broad reads now log document counts plus threshold warnings

Tasks:
- [x] Optimize `/api/vendors` to avoid per-vendor product collection scans.
- [x] Optimize customer latest-order lookup with ordered/limited access.
- [x] Make customer overview account loading tolerant of optional preference/order-summary read failures.
- [x] Add safer pagination or limits to customer and vendor order lists.
- [x] Add fallback customer order reads so My Orders/latest-order/account summary can still surface real orders if the `customerUid + createdAt` composite index is missing.
- [x] Add Firestore composite index definitions for `orders.customerUid + createdAt` and `orders.vendorId + createdAt`.
- [x] Keep admin/vendor analytics broad reads measurable until Supabase migration.
- [ ] Avoid deep Firestore-specific redesign that will be discarded in Phase 4.

Verification:
- Existing unit tests pass.
- 2026-05-28 Phase 2 customer/vendor order pagination gates passed: `npm test`, `npm run lint`, `npm run typecheck`, `npm run build`, and `git diff --check`.
- 2026-05-31 Water Drop feedback follow-up gates passed: `npm test`, `npm run lint`, and `npm run typecheck`.
- 2026-05-31 Phase 2 analytics observability gates passed: `npm.cmd test`, `npm.cmd run lint`, `npm.cmd run typecheck`, `npm.cmd run build`, and `git diff --check`. Initial `npm` PowerShell invocations failed because `npm.ps1` is blocked by the local execution policy; `npm.cmd` was used instead.
- Local dev server verified on 2026-05-28 with `GET / -> 200` at `http://127.0.0.1:3000`.
- Local dev server verified on 2026-05-31 at `http://localhost:3000/auth/register?role=customer`; default port `9002` was unavailable with `EACCES`, so the smoke test used port `3000`.
- Manual timing comparison for `/api/vendors`, customer latest order, vendor orders, admin analytics, and vendor summary before/after changes.

Implementation notes:
- Customer orders now read most-recent first with cursor pagination for the customer orders page, using a bounded unordered fallback if the ordered Firestore query requires an undeployed composite index.
- Customer latest-order now uses the shared customer order reader with a 10-order limit before selecting an active order, so tracking and notifications do not go blank solely because an index is missing.
- Customer overview now returns the authenticated customer profile even if optional preferences or order-summary reads fail, and `/api/customer/account` no longer reports non-auth data failures as `401`.
- `/api/orders` now supports bounded cursor pagination with `limit` and `cursor`, preserving the existing `orders` response array and adding `pageInfo.nextCursor`.
- [`src/lib/orders/customer-order.ts`](src/lib/orders/customer-order.ts) centralizes customer order pagination/fallback parsing for `/api/orders` and `/api/orders/latest`.
- `/api/vendor/orders` now uses a paginated route helper with `limit` and `cursor`, preserving legacy `listVendorOrders()` for internal payout/driver flows that still expect an array.
- Customer and vendor order pages now load the first 20 records and expose a "Load more orders" action when another cursor is available.
- Vendor revenue now requests a bounded recent 50-order window instead of relying on an unbounded vendor order response.
- Public vendors now fetch active products once and group them by vendor instead of running one product query per approved vendor.
- [`firestore.indexes.json`](firestore.indexes.json) now includes `orders` composite indexes for customer and vendor chronological order feeds.
- [`src/lib/observability/perf.ts`](src/lib/observability/perf.ts) now supports dynamic measurement metadata and broad-read threshold warnings.
- Admin analytics load logs now include customer, vendor, driver, order, product, and total document counts, with warnings above 500 documents per collection or 2,000 total documents.
- Vendor summary product/order loads now log per-vendor document counts, with warnings above 250 products or 500 orders for a single vendor summary request.

### Phase 3 - Supabase Foundation

Status: Pending

Tasks:
- [ ] Add Supabase environment variables to `.env.example`.
- [ ] Add server/client Supabase helpers.
- [ ] Define SQL migrations for users, vendors, drivers, products, carts, orders, order items, order events, customer preferences, compensation configs, payout requests, payout request orders, payout ledger entries, and vendor documents.
- [ ] Add explicit `GRANT` statements for required table and sequence access in the same migration as each exposed Supabase table.
- [ ] Map current Zod schemas to stable DTOs for API responses.
- [ ] Add Storage buckets for vendor documents and product/vendor images.
- [ ] Build an auth/session path using Supabase Auth while preserving role paths.

Verification:
- Migration applies cleanly on an empty Supabase project.
- Data API access is verified after migrations by checking grants for `anon`, `authenticated`, and `service_role` where each role is intentionally used.
- Seed or fixture data can load enough records to exercise customer, vendor, driver, and admin surfaces.

### Phase 4 - Firebase Removal

Status: Pending

Tasks:
- [ ] Replace Firebase client auth in login, register, and sign-out flows.
- [ ] Replace `getFirebaseAdminDb` and `getFirebaseAdminAuth` usage across API routes and business logic.
- [ ] Remove Firebase environment checks from admin system surfaces.
- [ ] Remove Firebase dependencies and app hosting config after parity.
- [ ] Update README and handover references from Firebase to Supabase.

Verification:
- No `firebase`, `firebase-admin`, `getFirebase`, or Firestore collection API usage remains.
- `npm test`, `npm run lint`, `npm run typecheck`, and `npm run build` pass.

### Phase 5 - Flow Fine-Tuning

Status: Partially started for customer checkout/profile UX

Tasks:
- [x] Add inline checkout address capture so customers can complete purchase without leaving cart.
- [x] Collect delivery address and preferred payment method during customer registration.
- [x] Add customer profile avatar upload/remove support in the Profile settings page.
- [ ] Persist vendor onboarding documents and expose admin document review.
- [ ] Replace raw driver vendor ID onboarding with a safer invite/link flow.
- [ ] Improve vendor dispatch flow around driver assignment, failed attempts, and reschedule/return decisions.
- [ ] Expand proof-of-delivery toward OTP/photo evidence if required.
- [ ] Build notification foundations for customer, vendor, driver, and admin events.

Verification:
- 2026-05-31 customer registration page smoke-tested at `http://localhost:3000/auth/register?role=customer`; delivery setup and payment method controls rendered without browser console errors.
- Role-flow tests still need to cover customer checkout/tracking, vendor onboarding/product/order dispatch, driver delivery/payout, and admin review.

Implementation notes:
- Customer registration now writes initial `customerPreferences` for delivery address and preferred payment method through `/api/auth/register-profile`.
- Cart checkout can add and save a delivery address in place through the existing `/api/customer/preferences` API.
- Customer profile schema and account API now support a lightweight `avatarUrl`; the Profile settings page accepts small local image uploads and can remove the avatar.
- Driver order visibility still depends on vendor assignment. A customer order should appear in vendor/admin/customer surfaces first; it appears in a driver's workspace only after the vendor assigns an active driver.

### Phase 6 - Production Hardening

Status: Pending

Tasks:
- [ ] Add Supabase RLS policies for all user-owned and role-owned data.
- [ ] Add rate limiting to public and authenticated API routes.
- [ ] Add audit logging for admin review, payout review, order status changes, and auth-sensitive operations.
- [ ] Add deployment, migration, seed, rollback, and monitoring docs.
- [ ] Add browser visual checks for critical pages.

Verification:
- E2E smoke tests pass for all roles.
- RLS tests confirm unauthorized cross-role reads/writes fail.
- Production deployment checklist is complete.

## Public Interface Commitments

- Preserve `/dashboard/customer`, `/dashboard/vendor`, `/dashboard/driver`, and `/admin`.
- Preserve existing API route paths during migration unless explicitly marked deprecated here.
- Keep API response shapes stable where practical.
- Target Supabase env names: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `SUPABASE_SECRET_KEY`.

## Open Risks

- Firebase is deeply coupled into auth, database access, admin health checks, tests, docs, and deployment config.
- Current UI performance issues should be fixed before migration to avoid mixing user-facing regressions with backend replacement risk.
- Admin/vendor analytics are still broad Firestore aggregations, but the temporary paths now emit document-count metadata and warnings so production-like logs can identify the worst remaining bottlenecks before Supabase work starts.
- Supabase schema design needs careful treatment of embedded Firestore arrays, especially order items, execution events, delivery proof, exceptions, and payout ledger records.
- Supabase's 2026 Data API default-grant change means missing migration grants can break `supabase-js`, REST, and GraphQL access even when RLS policies are correct.
- Existing `.env.local` may contain Firebase credentials; review git history and rotate credentials if exposure is suspected.
- Water Drop feedback order-flow verification still needs an authenticated end-to-end role smoke test: customer places an order, vendor accepts/assigns a driver, driver sees the assigned order, driver marks delivered, and customer sees status/history.
