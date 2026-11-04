# Spree storefront vs our existing storefront

Date: 2026-11-04. Both trees read locally: `spree/storefront` at `main` (cloned today) and `storefront/` on branch `claude/clever-lovelace-dco39n`. Numbers come from `find`, `wc` and `grep` over `src/`; "ours" excludes the 10,089-line generated GraphQL schema file unless stated.

## 1. Verdict

They are the same architecture at different maturity levels. Both are Next.js 16 App Router, React 19, Tailwind 4, server-only data access, Server Actions for writes, httpOnly cookie sessions, tag-based cache invalidation. The Spree storefront is the finished version of the pattern: typed SDK instead of hand-written GraphQL strings, 290 test cases instead of 22, one-page checkout with payment sessions, real i18n and market routing, Sentry and GA4, Biome, React Compiler. Ours has three things Spree does not: a 48-element Magezon Page Builder renderer, product reviews, and an installable PWA. Everything else we have, Spree has in a more complete form.

Practical consequence: forking Spree and porting our three unique assets costs less than lifting ours to Spree's level, and it is the only path where the backend contract (Store API v3) is already written down.

## 2. By the numbers

| Measure | Spree storefront | Ours | Note |
|---|--:|--:|---|
| TS/TSX files in `src/` | 288 | 189 | |
| Lines, excluding tests | 28,382 | 28,484 | Ours includes 10,089 generated schema lines and 8,926 Magezon lines. Hand-written non-Magezon code is about 9,500 lines. |
| Lines of removable modules | 6,470 | 0 | Spree: wholesale 2,179, card SDK forms 1,245, emails + webhooks 1,913, gift/credit cards + data requests 789, analytics 344. All optional for us. |
| Spree lines after removal | ~21,900 | | Comparable to our hand-written + Magezon total. |
| Unit test files / cases | 44 / 290 | 4 / 22 | Ours were added this week. |
| Unit test lines | 5,827 | 220 | |
| E2E specs | 9 Playwright specs against a Dockerised backend | 1 file, 7 HTTP smoke checks | Spree's cover account, auth, cart, catalog, checkout, split checkout, not-found, order-placed, product. |
| `page.tsx` routes | 28 | 26 | Spree's include 13 wholesale pages; ours include 3 PWA pages. |
| Client components | 88 | 41 | |
| Server Action files | 19 | 11 | |
| `"use cache"` functions | 7 | 0 | Ours uses `fetch` `revalidate` + tags, which this Next build supports but deprecates in favour of `"use cache"`. |
| `aria-*` attributes | 101 | 64 | |
| i18n call sites | 213 | 0 | Spree ships en, de, es, fr, pl message bundles (610 keys). |
| Runtime dependencies | 28 | 4 | Spree: SDK, next-intl, radix, shadcn, lucide, sonner, swiper, Stripe/Adyen/PayPal, Sentry, Resend, react-email, Vercel analytics. Ours: next, react, react-dom, server-only. |
| `any` usages | 0 | 2 | |
| Lint | Biome, zero errors | ESLint, 18 pre-existing errors | Our errors are React Compiler rules in SearchBox and Magezon elements. |
| Lighthouse (their claim) | 98 desktop / 88 mobile, 100 a11y/BP/SEO | not measured | |

## 3. Architecture, side by side

| Concern | Spree storefront | Ours | Gap |
|---|---|---|---|
| Backend contract | `@spree/sdk` 6.0.2 typed client; REST `/api/v3/store`; Zod runtime schemas | 1,063 lines of hand-written GraphQL template strings in `queries.ts`, manual result types in `types.ts`, schema-only codegen | Ours has no compile-time or runtime check that a query matches its type. |
| Transport | SDK handles publishable key, JWT, cart token, locale/currency/country/channel headers, retries, idempotency keys | `magentoFetch` handles bearer token, Store, Content-Currency, X-ReCaptcha | Equivalent in spirit; theirs is tested and shared across projects. |
| Routing | `/{country}/{locale}/…`, edge `proxy.ts` negotiates from cookie, geo header, Accept-Language; real 404 status via `globalNotFound` | Flat routes, `[...slug]` catch-all resolving Magento URL rewrites | Ours cannot add a second locale without a routing rewrite. Theirs cannot resolve legacy `.html` URLs without an addition. |
| Session | Cart token + cart id, JWT + refresh token, country + locale cookies; surface-scoped so DTC and wholesale carts coexist | `guest_cart_id`, `customer_token` (1h, no refresh), `store_code`, `currency_code`, `compare_skus` | Ours loses the session after an hour with no refresh path. |
| Caching | `"use cache: remote"` + `cacheLife` + `cacheTag`, keyed by locale/country/surface/user token; `updateTag` after writes | `fetch` with `revalidate` + tags; `revalidateTag(tag, "max")` helpers; `/api/revalidate` webhook; layout-wide path purge after cart writes | Theirs segments cache per user for B2B pricing. Ours does not need that yet. |
| Checkout | One page: address section with saved-address selector, delivery rate per fulfillment, payment section (Stripe, Adyen, PayPal via payment sessions, or direct payment), discount/gift-card input, policy consent, `carts.complete`; 4,656 lines | Five server-gated steps: email, shipping address, delivery, billing (same-as-shipping or separate), payment (offline), agreements, `placeOrder`; 1,020 lines | Theirs supports multi-shipment, saved addresses, express wallets. Ours supports virtual carts and is a quarter of the size. |
| Account | Profile, orders with returns/claims, addresses, credit cards, gift cards, store credit, data requests (GDPR export/delete) | Profile, email, password, addresses, orders with shipments and invoices, reorder, cancel, saved cards, delete account, guest order lookup | Roughly equal; theirs has GDPR flows, ours has reorder/cancel. |
| Catalog UI | Filter bar with dropdowns, chips, mobile drawer, infinite list, variant picker, media gallery with lightbox, product carousel, custom fields | Sidebar facets, chips, sort select, pagination, gallery, bundle/grouped add-to-cart, tier prices, related/upsell | Theirs has no bundle or grouped concept. Ours has no mobile drawer or lightbox. |
| Content | Policy pages from API; hard-coded hero and featured sections | Magezon Page Builder renderer (48 elements), CMS pages and blocks, CMS-driven home | Ours is far ahead. Portable as an SDK extension. |
| Reviews | None | List, rating badge, write form (pending moderation), ratings metadata | Ours only. |
| Compare | None | Cookie of 4 SKUs, matrix page | Ours only; low value. |
| PWA | None | Manifest, service worker, offline page, file and protocol handlers, notes page | Ours only. |
| SEO | Canonical, OG, Product and Breadcrumb JSON-LD, sitemap with tests, robots, `metadataBase`, per-locale | Same set plus Organization JSON-LD; sitemap untested | Equal. |
| Observability | Sentry server + client with source maps, GTM + GA4 ecommerce events | `console.error` in one place | Ours has none. |
| Payments | Stripe, Adyen, PayPal, Apple/Google Pay via payment sessions | Offline methods only | Theirs assumes Spree payment sessions; none of it works against Magento without the module. |
| B2B | Wholesale surface, companies, PO numbers, quick order, per-customer pricing | None | Not needed; removable. |
| Emails | react-email templates triggered by signed webhooks, Resend | Magento sends its own | Not needed; Magento already covers it. |
| Error handling | `actionResult()` wrapper returning `{ success, error }`; `SpreeError { code, status, details }` | `lib/errors.ts` with `cleanMessage()` mapping Magento text to user copy; `ActionResult { ok, error }` | Equivalent. Different field names (`success` vs `ok`). |
| Tooling | pnpm, Biome, Vitest, Playwright, lefthook pre-commit, locale parity script, Dockerfile standalone output, Vercel config | npm, ESLint, `node --test`, Dockerfile | Theirs is a complete CI story. |

## 4. What each one has that the other lacks

Spree has, ours lacks:

- Typed, versioned backend contract with runtime validation.
- Locale and country routing with negotiation and real 404 statuses.
- Refresh tokens and session recovery.
- One-page checkout with saved-address picker, multi-shipment and wallet payments.
- 290 unit tests and 9 browser e2e specs with a bootstrapped backend.
- Sentry, GA4 ecommerce events, Biome, React Compiler, pre-commit hooks.
- shadcn/radix UI primitives (22 components) with consistent accessibility.
- GDPR data requests, gift cards, store credit, returns and claims (all backend-dependent).

Ours has, Spree lacks:

- Magezon Page Builder renderer and CMS pages/blocks (8,926 lines, the single biggest asset).
- Product reviews.
- Bundle and grouped product purchase flows, tier prices, related/upsell blocks.
- Virtual-cart checkout path (no shipping step).
- Reorder and order cancellation.
- Legacy URL rewrite resolution through Magento's `route` query.
- PWA: installable, offline page, file handlers.
- Network isolation documentation and nginx config (`HEADLESS.md`), which is deployment, not storefront, but travels with us.

## 5. Where ours is better, honestly

- **Smaller surface for the same core job.** Our checkout is a quarter of theirs because Magento's offline payment model needs no payment sessions. Our dependency list is 4 packages, not 28.
- **Content is first-class.** A merchant can build the home page and landing pages in Magento admin. Spree's home is React code.
- **Magento product model is handled.** Six product types, tier prices, custom URL rewrites. Spree's variant-only model will need mapping decisions for bundles and grouped products (see `STOREFRONT_PLAN.md`, section 6).

## 6. Where Spree is better, honestly

- **It is tested.** 5,827 lines of tests against 220. Checkout, cart, auth and account all have browser coverage.
- **It is typed end to end.** We found this week that our hand-written queries drift from their types with no signal; they cannot.
- **It is international by construction.** Adding German to ours means rewriting routing; adding it to theirs means a JSON file.
- **It is observable.** We would not know about a production error unless a customer told us.
- **It is maintained by the vendor.** Store API changes ship with SDK updates; our GraphQL strings are maintained by us alone.

## 7. Cost to converge, either direction

| Path | Work | Estimate |
|---|---|---|
| Lift ours to Spree's level | Add i18n routing, refresh tokens, typed client (operations codegen), 250+ tests, Sentry/GA4, Biome, mobile filter drawer, saved-address picker, one-page checkout, UI primitive library | 10 to 14 weeks, and we still have no shared contract with the backend |
| Fork Spree and port our assets | Remove 6,470 lines of optional modules, add Magezon renderer, reviews extension, PWA, bundle/grouped mapping, virtual-cart path; plus the Store API gateway over Magento GraphQL | 6 weeks on the critical path (see `STOREFRONT_PLAN.md`) |

The fork wins on time, test coverage and the contract. The cost is learning a codebase we did not write and accepting pnpm, Biome and `next-intl` as house tools.

## 8. Recommendation

Fork `spree/storefront`. Keep `storefront/` frozen and deployable as the fallback until the fork reaches parity against `STATUS.md`, then archive it. Port Magezon, reviews and PWA into the fork as the first three porting tasks, since they are the only things we would lose. Treat everything else in our storefront as reference material for the gateway's Magento mappings (`lib/filters.ts`, `lib/checkout-state.ts`, `lib/errors.ts`, `queries.ts`), not as code to carry forward.
