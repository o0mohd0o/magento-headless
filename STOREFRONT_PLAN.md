# Storefront plan: Spree storefront + Store API as the reference

Date: 2026-11-04. Status: proposal, awaiting decisions in section 9.

References studied:

- `github.com/spree/storefront` (Next.js 16, React 19, Tailwind 4, `@spree/sdk`), cloned at commit on `main`, 2026-11-04.
- Spree Store API v3, as expressed by the `@spree/sdk` 6.0.2 typings and runtime (the docs site `spreecommerce.org` is not reachable from this environment; the SDK is generated from the API's serializers, so it is the ground truth for shapes and paths).
- Our current storefront (`storefront/`, Magento GraphQL, see `STATUS.md`).

## 1. The one-paragraph plan

Adopt the Spree Store API v3 as the contract between storefront and backend, and the Spree Next.js storefront as the UI and architecture reference. Build a thin **Store API gateway** that implements that contract on top of today's Magento GraphQL, so a fork of the Spree storefront runs against Magento immediately. The gateway's contract tests become the acceptance suite for a native Magento module that later implements the same routes in PHP; resources cut over one at a time behind a per-resource flag until the gateway is empty and retired. The Magento-specific assets worth keeping (Magezon Page Builder renderer, reviews, PWA, network isolation) are ported into the fork as SDK extensions and route additions.

## 2. What the reference actually is

### 2.1 Spree storefront (`spree/storefront`)

| Aspect | What it does | Keep / change for us |
|---|---|---|
| Routing | `/{country}/{locale}/…` via `proxy.ts` edge middleware; route groups `(storefront)`, `(checkout)`, `(wholesale)` | Keep the shape. Start with one market (`/us/en`), so the switcher is inert but the URLs are future-proof. |
| Data access | Server-only. `src/lib/data/*.ts` are Server Actions wrapping `@spree/sdk`; `"use cache: remote"` + `cacheTag` for catalog, `updateTag` after writes | Keep verbatim. This is the same pattern our current storefront uses, done more thoroughly. |
| Session | httpOnly cookies: `_spree_cart_token` + `_spree_cart_token_id`, `_spree_jwt`, `_spree_refresh_token`, `spree_country`, `spree_locale` | Keep. Our `guest_cart_id` / `customer_token` map one-to-one. |
| Checkout | Single page `/checkout/[id]`: address section, delivery rates per fulfillment, payment section (Stripe / Adyen / PayPal payment sessions or direct `payments.create`), policy consent, `carts.complete` | Keep the page. Offline Magento methods go through `payments.create` (no session). Gateways are a later phase. |
| Account | profile, orders, addresses, credit cards, gift cards, data requests (GDPR) | Keep profile, orders, addresses. Hide gift cards, credit cards, data requests behind capability flags until the backend has them. |
| B2B | `(wholesale)` surface, companies, PO numbers, quick order | Out of scope. Leave the code, keep `SPREE_WHOLESALE_CHANNEL` unset so it is hidden. |
| Content | `policies/[slug]` from the API; home is hard-coded sections | Replace home with the Magezon renderer; add `pages/[slug]` for CMS pages. |
| Search | `products.list` with `q`, `products.filters` for facets; optional Meilisearch | Facets come from Magento aggregations through the gateway. |
| Emails | Webhooks (`order.placed`, `order.canceled`, `order.fulfilled`, password reset) → react-email via Resend | Phase 4. Magento already sends emails; webhooks are optional. |
| Quality | Biome, Vitest (44 test files), Playwright e2e (9 specs) against a Dockerised backend, Sentry, GTM/GA4 | Keep all of it. The e2e suite runs against our stack once the gateway is up. |

### 2.2 Store API v3 (from `@spree/sdk` 6.0.2)

Transport conventions the backend must honour:

- Base path `/api/v3/store/<resource>`; JSON, flat resources (not JSON:API). Lists return `{ data: T[], meta: { page, limit, count, pages, from, to, in, previous, next } }`.
- Auth headers: publishable key on every request; customer JWT as bearer `token`; guest cart token as `spreeToken`; optional `locale`, `currency`, `country`, `channel`, `Idempotency-Key`.
- Read shaping: `expand=[...]` for relationships, `fields=[...]` for sparse responses, `q` for filters, `sort`, `page` + `limit`.
- Errors: `{ error: { code, message, details? } }` with an HTTP status; the SDK raises `SpreeError { code, status, details }`.
- IDs are opaque strings; money is a decimal string plus `display_*` and `*_in_cents`.

Resources, grouped by how we will source them:

| Resource (paths) | Phase | Magento source today | Gap to close |
|---|---|---|---|
| `store`, `channel`, `currencies`, `locales`, `countries`, `markets` (+`resolve`) | 1 | `storeConfig`, `currency`, `availableStores`, `countries` | Synthesize one market and one channel. Markets become real only if a second store view is added. |
| `categories` (list, get by id or permalink) | 1 | `categoryList`, `categories` | `permalink` = `url_path`; `depth`, `is_leaf`, `ancestors` computed. |
| `products` (list, get by id or slug, `filters`) | 1 | `products` with aggregations, `sort_fields` | Configurable children → `variants`; simple → one default variant. Bundle and grouped need a mapping decision (section 6). `filters` = aggregations reshaped into price range, availability, option and category filters. |
| `collections` | 3 | none | Map to a Magento category flagged as collection, or omit (SDK tolerates 404 when the UI hides it). |
| `carts` (create, get, update email/addresses, `items`, `discountCodes`, `fulfillments.update`, `payments.create`, `complete`, `associate`) | 1 | `createGuestCart`, `cart`, `addProductsToCart`, `updateCartItems`, `removeItemFromCart`, `applyCouponToCart`, `setShippingAddressesOnCart`, `setBillingAddressOnCart`, `setShippingMethodsOnCart`, `setPaymentMethodOnCart`, `placeOrder`, `mergeCarts` | One Magento shipping address becomes one `fulfillment` whose `delivery_rates` are `available_shipping_methods`; `requirements` and `current_step` derived from cart state. `token` = masked cart id. |
| `carts.paymentSessions`, `carts.giftCards`, `carts.storeCredits` | 4 | none | Not needed for offline methods. Payment sessions map to Braintree/PayPal flows if adopted. |
| `orders.get` (by id, guest-visible with cart token) | 1 | `guestOrderByToken`, `customer.orders` | `fulfillments[].deliveries[]` from shipments + tracking. |
| `orders.returns`, `orders.claims` | later | none (Magento RMA is Commerce-only) | Out of scope. |
| `auth.login/refresh/logout`, `customers.create`, `password_resets` | 1 | `generateCustomerToken`, `revokeCustomerToken`, `createCustomerV2`, `requestPasswordResetEmail`, `resetPassword` | Magento tokens are opaque and expire in ~1h with no refresh. Gateway wraps them in its own JWT + refresh token; the Magento module should implement JWT natively. |
| `customers/me` (+`addresses`, `orders`) | 1 | `customer`, address mutations, `customer.orders` | Direct mapping. |
| `customers/me/credit_cards`, `gift_cards`, `store_credits`, `digital_links`, `data_requests`, `payment_setup_sessions` | 4 or never | `customerPaymentTokens`, `customerDownloadableProducts` | Credit cards and digital links map; the rest have no Magento concept. |
| `wishlists` (+`items`) | 2 | Magento wishlist mutations | Single list per customer; `WishlistItem.variant_id`. |
| `newsletter_subscribers` | 2 | `subscribeEmailToNewsletter` | Verify/unsubscribe need the Magento module. |
| `policies` | 2 | `cmsPage` | Policy = CMS page with a known identifier list. |
| `delivery_methods` (+`pickup_locations`) | 3 | `pickupLocations` | Only if in-store pickup is enabled. |
| `sellers`, `companies`, `company_invitations`, `account/companies` | never | none | Marketplace and B2B. Hidden by flags. |
| **Extensions (not in Spree):** `products/{id}/reviews` (list/create), `reviews/metadata`, `content/{identifier}` (Magezon), `compare` (optional) | 2 | `productReviewRatingsMetadata`, `createProductReview`, `magezonContent` | Added through the SDK's documented extension mechanism; the Magento module ships them under the same `/api/v3/store` prefix. |
| Webhooks: `x-spree-webhook-signature`, `x-spree-webhook-timestamp` (HMAC, replay window) | 4 | Magento events | Module posts `order.placed`, `order.canceled`, `order.fulfilled`, `catalog.updated`, `customer.password_reset_requested`. Replaces our `/api/revalidate` bearer webhook. |

## 3. Architecture

```
Browser ──HTTPS──▶ app nginx :8443
                     │  /                    ──▶ storefront (fork of spree/storefront, :3001)
                     │  /admin /media /static ──▶ Magento php-fpm
                     │  /graphql /rest /soap /api ──▶ 404   (unchanged: nothing public)

storefront ──http──▶ store-api-gateway :4000  /api/v3/store/*   (Phase 1-3, internal only)
                        │  per-resource flag
                        ├─ driver "graphql"  ──▶ app:8181/graphql   (today)
                        └─ driver "native"   ──▶ app:8181/api/v3/store/*   (Magento module, Phase 3)

storefront ──http──▶ app:8181/api/v3/store/*   (Phase 5: gateway retired)
```

Design rules:

1. **The storefront only ever speaks Store API v3** through `@spree/sdk`. `SPREE_API_URL` points at the gateway now and at Magento later. No Magento GraphQL in the storefront.
2. **The gateway is disposable.** It is a stateless Node service (Hono or Next route handlers) with one adapter per resource. Each adapter has a `graphql` driver and a `native` passthrough. Its job is to let UI work start on day one and to pin the contract in executable tests.
3. **The contract tests are the spec.** A Vitest suite calls every endpoint through `@spree/sdk` and validates responses with the SDK's exported Zod schemas (`@spree/sdk/zod`). The same suite runs against the gateway and, later, against the Magento module.
4. **IDs are stable and prefixed** (`prod_`, `var_`, `cat_`, `cart_`, `ord_`, `addr_`): the gateway derives them from Magento `uid`/`sku`; the Magento module must emit the same values so cookies and URLs survive the cutover.
5. **Magento stays the system of record** for catalog, pricing, promotions, customers, orders. No data lives in the gateway.
6. **Network isolation holds** (`HEADLESS.md`): the gateway and the future `/api/v3/store` listener are reachable only on the Docker network.

## 4. Phased roadmap

### Phase 0: Contract and scaffolding (1 week)

- Pin `@spree/sdk` 6.0.2 and write `docs/STORE_API_CONTRACT.md`: in-scope resources, deferred resources, extensions, ID scheme, money mapping, error codes.
- Repo layout: `storefront/` stays frozen as the fallback; add `storefront-spree/` (fork, pnpm) and `store-api-gateway/`. Compose gets both as internal services; nginx keeps routing `/` to whichever `storefront` service is active.
- Contract test harness: Vitest + SDK Zod schemas, parameterised by `SPREE_API_URL`.
- Decide the items in section 9.

### Phase 1: Gateway MVP over Magento GraphQL (3 weeks)

Order of resources, each landing with its contract tests:

1. `store`, `channel`, `currencies`, `locales`, `countries`, `markets` (synthetic single market).
2. `categories`, `products` (list, get, `filters`) with `expand`/`fields` support.
3. `carts` end to end: create with token, items, discount codes, update email and addresses, fulfillments and delivery rates, offline `payments.create`, `complete` → `Order`. Derive `requirements`, `current_step`, `completed_steps`.
4. `auth`, `customers.create`, `password_resets`, `customers/me` with addresses and orders; `carts.associate` on login (Magento `mergeCarts`).
5. `orders.get` for guest (cart token) and customer.
6. Caching: gateway sets `Cache-Control` and `ETag` on catalog reads; the storefront's `"use cache"` layer does the rest.

Exit: `spree/storefront` unmodified, pointed at the gateway, can browse, add to cart, check out with Check/Money Order, and view the order.

### Phase 2: Fork and port (2 to 3 weeks, overlaps Phase 1 from week 2)

- Fork `spree/storefront` into `storefront-spree/`. Strip or flag: wholesale, sellers, gift cards, store credit, data requests, Stripe/Adyen/PayPal SDK bundles.
- Single market config: `NEXT_PUBLIC_DEFAULT_COUNTRY=us`, `NEXT_PUBLIC_DEFAULT_LOCALE=en`; keep `/us/en` URLs.
- Port from the current storefront: Magezon renderer (`lib/magezon`, about 50 element components) as the home page and `/pages/[slug]`; reviews (SDK extension + components); PWA manifest, icons, service worker, offline page; Organization JSON-LD; `/api/revalidate` until webhooks exist.
- Add extensions to the SDK client: `reviews`, `content`, optionally `compare`.
- Brand: replace Luma copy, logo, theme tokens.
- CI: Biome, Vitest, Playwright e2e against `docker compose` (our stack instead of `e2e-backend`).

Exit: feature parity with `STATUS.md` "Done" column except compare (decision pending), plus multi-locale-ready routing, one-page checkout, and the Spree account area.

### Phase 3: Native Magento Store API module (4 to 6 weeks, backend team, parallel from Phase 1 week 2)

Module `Yakart_StoreApi` (PHP, Magento 2.4.9):

- Routing under `/api/v3/store`, JSON serializers mirroring the SDK types, `expand`/`fields`/`q`/`sort`/pagination.
- API keys table with `pk_` publishable and `sk_` secret keys; `X-Spree-Api-Key` validation; channel = store view.
- JWT access + refresh tokens issued from Magento customer auth; cart token = masked quote id.
- Idempotency-Key storage for `carts.complete` and `payments.create`.
- Webhook subscriptions with HMAC signature and timestamp headers.
- Cutover: flip the gateway's per-resource driver to `native` as each resource passes the contract suite. Order: reference data → categories → products → customers → carts → orders → auth.

Exit: contract suite green against Magento directly; gateway flags all `native`.

### Phase 4: Beyond parity (ongoing)

- Payment sessions for Braintree or PayPal through the module; Stripe only if the merchant wants it.
- Webhook-driven emails (react-email) or keep Magento emails.
- Wishlists, newsletter verify/unsubscribe, saved cards, digital links.
- Second store view → real markets, locale message bundles (`messages/*.json` already has de, es, fr, pl).

### Phase 5: Retire the gateway

Point `SPREE_API_URL` at Magento, delete `store-api-gateway/`, archive `storefront/` (legacy).

## 5. Mapping rules the gateway and the module share

| Concept | Spree Store API | Magento | Rule |
|---|---|---|---|
| Product / variant | `Product` with `variants[]`, `default_variant_id`, `option_types`, `option_values` | Simple, configurable (children), bundle, grouped, virtual, downloadable | Configurable → product + child variants. Simple/virtual/downloadable → product with one variant (`id = var_<sku>`). Bundle and grouped: see section 6. |
| Slug / permalink | `product.slug`, `category.permalink` | `url_key`, `url_path` | Identity mapping; the catch-all `route` resolver is replaced by `products.get(slug)` and `categories.get(permalink)` 404s. |
| Money | `"12.50"`, `display_amount`, `amount_in_cents` | `{ value: 12.5, currency }` | Format with the market locale; `display_*` is produced server-side so the UI never formats. |
| Prices | `price`, `original_price`, `compare_at_amount` | `price_range.minimum_price.final_price` / `regular_price` | `original_price` only when discounted. Tier prices → `custom_fields` until a proper field exists. |
| Media | `Media` with sized URLs and `media_type` | `media_gallery[].url` | Emit the same URL for every size (Magento serves cached sizes by path); `primary_media` = first. |
| Cart address | `CartAddressParams` (`address1`, `postal_code`, `state_code`, `country_code`) | `CartAddressInput` (`street[]`, `postcode`, `region_id`/`region`, `country_code`) | `address1/address2` ↔ `street[0..1]`; `state_code` ↔ `region.code`. The gateway owns the `region_id` lookup. |
| Shipping | `fulfillments[].delivery_rates[]`, `fulfillments.update({selected_delivery_rate_id})` | `shipping_addresses[0].available_shipping_methods`, `setShippingMethodsOnCart` | `delivery_rate.id = rate_<carrier>_<method>`. Virtual carts have zero fulfillments. |
| Payment | `payment_methods` via cart, `payments.create({payment_method_id})` | `available_payment_methods`, `setPaymentMethodOnCart` | Offline methods: `session_required=false`, `source_required=false`. |
| Place order | `carts.complete` → `Order` | `placeOrder` → `orderV2{number, token}` | `Order.id = ord_<number>`; guest reads use the cart token as `spreeToken`. |
| Discounts | `discounts[]` (`AppliedPromotion`), `coupon_code`, `discountCodes.apply/remove(code)` | `applied_coupons`, `prices.discounts` | Magento allows one coupon; `remove(code)` ignores the code argument. |
| Taxes | `tax_total`, `included_tax_total`, `additional_tax_total`, `tax_lines` | `applied_taxes` | `included` vs `additional` from `storeConfig` display settings. |
| Auth | JWT + refresh, `AuthTokens.user` | Opaque token, ~1h | Gateway: signed JWT embedding the Magento token, refresh re-issues via stored token. Module: real JWT. |
| Checkout gating | `requirements[]`, `current_step`, `completed_steps` | none | Derived: email → address → delivery → payment → complete. Same logic as our `deriveCheckoutState()`. |
| Errors | `{ error: { code, message, details } }` | GraphQL `errors[].message` + `user_errors` | Map Magento categories to codes: `unauthorized`, `not_found`, `validation_error`, `out_of_stock`, `recaptcha_failed`. |
| Content | `policies` | CMS pages, Magezon profiles | `policies` from CMS pages with configured identifiers; `content/{identifier}` extension for Magezon JSON. |

## 6. Open design questions that need a decision before Phase 1 ends

1. **Bundle and grouped products.** Spree has no bundle. Options: (a) expose each bundle as a product whose `variants` are the fixed configurations, (b) treat bundle options as `custom_fields` and keep a custom add-to-cart extension, (c) drop bundles from the catalog. Recommend (a) for fixed bundles and (c) for dynamic ones, revisit on demand.
2. **Compare.** No Spree equivalent. Keep as a storefront-only cookie feature, or drop. Recommend drop; wishlists cover the intent.
3. **Reviews.** Keep as an extension (`products/{id}/reviews`). The module must implement it; otherwise reviews vanish at cutover.
4. **Markets.** One synthetic market now. If a second store view or currency is planned within a year, the module should model markets from day one.
5. **Payment gateway.** None required for parity. If one is wanted, pick between Braintree (Magento-native) and Stripe (Spree storefront-native). This decides whether `paymentSessions` is in the module's scope.

## 7. What we reuse from the current storefront

- `lib/magezon/*` renderer and the `magezonContent` GraphQL bridge (becomes `content/{identifier}` in the gateway and the module).
- `lib/errors.ts` normalisation rules (as the gateway's error mapper).
- `lib/checkout-state.ts` (as the gateway's `requirements` derivation).
- `lib/filters.ts` (as the gateway's `products.filters` aggregation reshaping).
- Reviews components, PWA assets, `HEADLESS.md` nginx config, the Docker topology.
- `STATUS.md` ledger as the parity checklist for Phase 2.

Everything else in `storefront/` is superseded by the fork.

## 8. Effort and sequencing

| Phase | Owner | Weeks | Depends on |
|---|---|---|---|
| 0 Contract + scaffolding | frontend lead | 1 | decisions in section 9 |
| 1 Gateway MVP | frontend (Node) | 3 | 0 |
| 2 Fork + port | frontend | 2 to 3 | 1 (week 2 onward) |
| 3 Magento module | backend (PHP) | 4 to 6 | 0; cutover needs 1 |
| 4 Beyond parity | both | ongoing | 2, 3 |
| 5 Retire gateway | frontend | 0.5 | 3 complete |

Critical path: Phase 0 → Phase 1 → Phase 2, about 6 weeks to a Spree-shaped storefront running on Magento. Phase 3 runs alongside and finishes around week 8 to 10.

## 9. Decisions needed from you

1. Fork `spree/storefront` (recommended) versus evolving the current storefront to mimic it. Forking is less work and inherits their tests, i18n and checkout; evolving keeps 27k lines of Magento-specific code that the contract makes obsolete.
2. Who builds the Magento module (in-house PHP, or contract), and whether it starts now in parallel or after the gateway proves the contract.
3. Section 6 items 1, 2 and 5 (bundles, compare, payment gateway).
4. Package manager: the fork uses pnpm; the current storefront uses npm. Recommend pnpm for the fork and the gateway.
5. Repo layout: monorepo folders as in section 4 (recommended) versus separate repositories for gateway and storefront.

## 10. Immediate next steps (no decisions needed)

1. Create `docs/STORE_API_CONTRACT.md` from the resource table in section 2.2 with the exact field lists copied from the SDK types.
2. Scaffold `store-api-gateway/` with the `store`, `countries`, `categories`, `products` adapters and the contract test harness; prove `spree/storefront` renders the catalog from Magento data.
3. Open the gap list for bundles, grouped products and reviews as issues on the repository so the backend team can estimate the module.
