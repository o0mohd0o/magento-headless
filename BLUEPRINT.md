# Headless Magento 2.4.9 Storefront — Feature Blueprint

> **Historical design record (June 2026).** The status counts and "current
> state" below describe the storefront at its initial commit and are no longer
> accurate. Current feature status lives in [STATUS.md](STATUS.md); the
> regrade that retired the old matrix is in
> [BLUEPRINT_ANALYSIS.md](BLUEPRINT_ANALYSIS.md). Sections 1 to 7 are kept
> because the architecture, cross-cutting concerns, risks and recommendations
> still describe how the codebase is built.

> Implementation blueprint for completing the Next.js headless storefront over Magento Open Source 2.4.9.
> Generated from a feature-by-feature analysis of the live GraphQL surface (34 queries, 69 mutations) across 14 domains.

**Feature completeness:** 204 features tracked — **2 done, 31 partial, 171 missing** (~9% weighted).

Status legend: ✅ done · 🟡 partial · ⬜ missing  |  Priority: **P0** core-commerce (transactable) · **P1** high-value · **P2** engagement · **P3** nice-to-have  |  Effort: S/M/L/XL

## 1. Executive summary

This is a well-architected headless Magento 2.4.9 + Next.js 16 storefront whose foundations (server-only GraphQL transport, RSC reads with fetch caching, Server Actions for writes, httpOnly cookie session model, guest/customer cart abstraction) are production-shaped, but it is only browse-and-cart complete: a shopper can navigate the catalog, configure simple/configurable products, and build a cart, yet cannot place an order because the entire checkout->payment->order-confirmation pipeline does not exist. Across 14 domains the counts are 2 done, 31 partial, 171 missing (204 tracked) — roughly 15% of features at least partially addressed, but the completed slice is the hardest plumbing, so remaining work is mostly additive against proven patterns. The single biggest gap, and the entire critical path, is checkout + payments: a guest order has been verified to place end-to-end against the live instance using offline `checkmo`, so a transactable store is achievable quickly without any payment-gateway/SDK work. The recommended path is a tightly-scoped P0 "make it transactable" epic (richer cart prices breakdown -> checkout state machine -> address/shipping/offline-payment steps -> placeOrder with the 2.4.9 orderV2 shape -> order confirmation), landing on top of a small set of P0/P1 cross-cutting enablers (typed checkout cart query, countries/regions reference data, error boundaries, tag-scoped revalidation) that everything else also needs. Online gateways (Braintree/PayPal), engagement/loyalty surfaces (wishlist, compare, reviews), search/layered-nav, CMS, account self-service, and SEO completeness then follow as parallelizable phases.

### Current state

Production-shaped today: the GraphQL transport (`magentoFetch`, server-only, Store-header aware, cache-or-no-store branching); catalog reads (home, PLP by category, PDP) as cached RSC with `revalidate`+`['catalog']` tags; SimpleProduct and ConfigurableProduct add-to-cart via the unified `addProductsToCart` + `selected_options` UID path; the dual guest/customer cart model (`guest_cart_id` + `customer_token` httpOnly cookies) with a `getWritableCart()` write resolver and login-time `mergeCarts`; auth (register/login/logout/profile-view) with React 19 `useActionState` forms and a `cleanMessage()` error helper; basic keyword search; a single global loading skeleton; and money formatting. Demo-only / thin: the cart reads just `subtotal_excluding_tax` + `grand_total` (no discounts/tax/coupon UI), the "Checkout" button is a disabled stub, PDP omits custom options/tiers/related/reviews and only handles 2 of 6 product types, search has zero aggregations/filters/sort, the home page and footer are hardcoded, metadata is static with a hardcoded `lang="en"` and single en-US/USD currency. Entirely absent: checkout, payments, order detail/reorder/cancel, customer addresses + account self-service (password reset, email confirm), wishlist, compare, reviews, CMS rendering, newsletter/contact/share, SEO (canonical/OG/JSON-LD/sitemap/robots), reCAPTCHA, error/not-found boundaries, GraphQL codegen, and tests.

### Top gaps (ranked)

- Checkout state machine: no /checkout route at all — email, shipping address, shipping method, billing, payment, review, and placeOrder steps are 100% missing. This is the sole blocker to a transactable store.
- Payments: only offline checkmo is actually enabled in the instance (verified live with a real placed guest order #000000003); selecting/placing an order is unbuilt. All online gateways exist in schema but are unconfigured in admin.
- placeOrder 2.4.9 shape: returns { orderV2 (CustomerOrder), errors } not the legacy order_number string — building against the old shape would silently break.
- Cart money depth: only subtotal + grand_total are read; no discounts, applied_taxes, coupons, per-item availability/errors, or clearCart — all needed before a credible checkout review step.
- Countries/regions reference data: a single cacheable `countries` read is the most-reused missing dependency, blocking both account address book and every checkout address form.
- Customer addresses + account self-service: no address book CRUD, no password reset / email confirmation; /account is a flat single page that must become a hub with guarded sub-routes.
- Order lifecycle post-purchase: no order detail, reorder, cancel (order_cancellation_enabled is currently false in admin), guest order lookup, or downloadable library.
- Engagement surfaces entirely missing: wishlist (customer-only, single CE list), product compare (GUID-cookie subsystem), and reviews/ratings (note rating_summary is 0-100 percent, /20 for stars; new reviews are Pending/moderated).
- Search/layered navigation: no aggregations, multi-select attribute filters, price filter, sort UI, or filter-aware pagination — a shared filterable/sortable PLP+search engine is the biggest discoverability win.
- SEO is high-value and absent: no canonical/metadataBase, OG/Twitter, Product/Breadcrumb/Organization JSON-LD, sitemap.xml, or robots.txt; meta fields are NULL in Luma data so fallback chains are mandatory.
- CMS rendering: home/footer hardcoded, no CMS page/block routes; CMS HTML ships absolute magento.test links + needs PageBuilder CSS self-hosted and link rewriting before dangerouslySetInnerHTML.
- Cross-cutting quality debt: zero error.tsx/not-found.tsx/global-error.tsx, over-broad revalidatePath('/','layout'), no GraphQL codegen, no tests, magentoFetch cannot inject the X-ReCaptcha header.

## 2. Completeness by domain

| Domain | ✅ | 🟡 | ⬜ | Total |
|---|--:|--:|--:|--:|
| Catalog & Product Types | 2 | 5 | 10 | 17 |
| Search, Filtering & Layered Navigation | 0 | 5 | 10 | 15 |
| Cart, Coupons & Cart Types | 0 | 3 | 14 | 17 |
| Checkout Flow | 0 | 2 | 15 | 17 |
| Payments & Vault | 0 | 0 | 13 | 13 |
| Customer Account & Addresses | 0 | 1 | 16 | 17 |
| Orders: Detail, Reorder, Cancel, Guest | 0 | 1 | 13 | 14 |
| Wishlist | 0 | 0 | 14 | 14 |
| Product Compare | 0 | 0 | 12 | 12 |
| Reviews & Ratings | 0 | 0 | 11 | 11 |
| CMS & Content (PageBuilder) | 0 | 2 | 9 | 11 |
| Newsletter, Contact & Share | 0 | 0 | 9 | 9 |
| Store, i18n, Currency, SEO & Routing | 0 | 6 | 13 | 19 |
| Security, reCAPTCHA & Cross-cutting Quality | 0 | 6 | 12 | 18 |
| **Total** | **2** | **31** | **171** | **204** |

## 3. Phased roadmap

### Phase 1: P0 — Make the store transactable (Checkout + Offline Payment epic)

**Goal:** A guest or logged-in shopper can complete a real end-to-end order with offline payment (checkmo), landing on a confirmation page — turning a browse-and-cart demo into a working store.

**Rough effort:** ~3-4 weeks

**Why now:** Checkout+payments is the explicit critical path and the only thing blocking revenue; a live offline order is already proven, so this is achievable with zero gateway/SDK work. The cart-prices, countries, address-form, and error-boundary pieces are prerequisites that every later phase also reuses, so doing them here pays compound interest.

Features:
- Enrich the cart read first: add prices { discounts{amount,label}, applied_taxes{amount,label}, grand_total_excluding_tax, subtotal_with_discount } + per-item is_available/not_available_message/errors, and a CHECKOUT_CART query (email, shipping_addresses{available/selected_shipping_method, full address}, available/selected_payment_methods, is_virtual).
- Countries/regions reference data (cached) + RegionField + reusable AddressForm with region_id-vs-region rule, String[] street, CountryCodeEnum.
- Checkout route shell + multi-step state machine (server-driven gating, client step islands, redirect to /cart when empty, enable the cart->checkout Link, guest-vs-login branch).
- setGuestEmailOnCart (guest) -> setShippingAddressesOnCart (list input) -> setShippingMethodsOnCart (radio from available_shipping_methods) -> setBillingAddressOnCart (same_as_shipping toggle).
- Read available_payment_methods + setPaymentMethodOnCart for offline checkmo; order review/summary with live totals; placeOrder via the 2.4.9 orderV2{number,token,total}+errors shape with place-order error handling/idempotency.
- On success: clear guest_cart_id cookie, targeted revalidate, redirect to /checkout/success; build the confirmation page (render from placeOrder result + guestOrderByToken/customer.orders).
- Checkout segment error.tsx + standardized { ok, errors } across every checkout action.
- Global error.tsx/global-error.tsx/not-found.tsx and notFound() on empty product/category results (lands here because checkout must not crash blank).

### Phase 2: P1 — Account completeness, order lifecycle, conversion plumbing & catalog buyability

**Goal:** Close the loop around a transactable store: customers manage identity/addresses, view/reorder past orders, recover passwords, use coupons, see full PDP buying surfaces, and the store handles errors/SEO basics — making it credibly production-grade.

**Rough effort:** ~4-6 weeks

**Why now:** These are the features a real shopper and merchant expect immediately after they can buy: managing their account, reordering, applying promo codes, and buying every product type, plus the SEO/error/a11y baseline that makes the site indexable and non-fragile. Most reuse P0's address form, order components, and cart-prices work, so they parallelize across a small team.

Features:
- Account hub restructure (layout + AccountNav + single token guard) and address book CRUD (createCustomerAddress/updateCustomerAddressV2/deleteCustomerAddressV2, set defaults) reusing the P0 AddressForm; saved-address picker wired back into checkout.
- Self-service auth: forgot/reset password, change password, edit profile/email, email confirmation guard for registerAction (public reset/confirm routes need Magento base-URL config).
- Order detail (/account/orders/[number]) with line items + per-item fulfillment + totals + shipments/tracking + invoices/credit_memos; reorder (reorderItems with partial-success userInputErrors); order history list with links/pagination/sort/filter.
- Guest order lookup (guestOrder) + view-by-token (guestOrderByToken) reusing the shared order-detail component kit.
- Coupons: applyCouponToCart/removeCouponFromCart + multi-coupon display, shared between /cart and /checkout; clearCart; cart-token/session resilience (self-heal stale guest_cart_id).
- Remaining product types so every PDP is buyable: Bundle, Grouped, Downloadable, Virtual + custom (customizable) options on PDP, driven by a __typename-aware PDP CTA switch.
- Cross-cutting P1: error normalization helper + try/catch on update/remove cart actions; tag-based revalidation taxonomy + /api/revalidate webhook; SEO core (storeConfig provider, dynamic per-page metadata with fallbacks, canonical+metadataBase, OG/Twitter, Product JSON-LD, sitemap.ts, robots.ts); accessibility pass.

### Phase 3: P2 — Discovery, content, engagement & online payments

**Goal:** Drive findability, merchandising, and loyalty: real layered navigation/search, CMS-driven content, wishlist/compare/reviews engagement, and at least one online card gateway.

**Rough effort:** ~6-8 weeks

**Why now:** Once the store transacts and accounts work, the next levers are getting found (search/SEO/CMS) and increasing engagement/AOV (wishlist, compare, reviews, online cards). These are largely independent feature tracks that can run in parallel and are individually shippable, so they form a broad P2 rather than a strict sequence.

Features:
- Shared filterable/sortable PLP+search engine: PLP_QUERY with aggregations + buildProductFilter, layered-nav facet sidebar, multi-select attribute filters, price filter, sort_fields-driven sort UI, filter-aware pagination, active-filter chips, no-results state, autosuggest, mobile filter drawer.
- CMS: CmsContent renderer (link-rewrite + sanitize + PageBuilder CSS) -> CMS page routes (/page/[identifier]), CMS blocks, category description rendering, footer links from CMS, 404/no-route page; universal route() catch-all resolver.
- Wishlist (customer-only): data layer + /wishlist page + PDP/PLP hearts + move-to-cart/clear + login-redirect gating + count badge.
- Product compare: GUID-cookie subsystem, add-to-compare on PDP/cards, /compare matrix, remove/clear, assign-to-customer-on-login, header count.
- Reviews & ratings: PDP rating badge + reviews list (rating_summary/20!), ratings metadata fetch, write-review form + createProductReview (guest-capable, Pending-moderation UX), card star ratings, My Reviews.
- Newsletter signup (footer), Contact Us form+route, email-a-friend (needs numeric product id added to PRODUCT_DETAIL).
- Braintree hosted-fields + nonce/3DS/vault (gated on admin config presence in available_payment_methods); manage-saved-cards account page. reCAPTCHA infrastructure (config fetch, client token minting, X-ReCaptcha plumbing) and gating on login/register/contact/review/newsletter/place-order.
- GraphQL codegen introduction; richer catalog reads (related/upsell/crosssell, tier prices, media gallery video, breadcrumbs/category tree depth).

### Phase 4: P3 — Multi-store readiness, advanced payments & polish

**Goal:** Handle scenarios that are architecturally valid but currently no-ops or niche on this single-store/USD/en_US instance, plus deep polish and hardening.

**Rough effort:** ~4-6 weeks (config-dependent)

**Why now:** These items are either functionally inert on the current instance (multi-store/currency, cancellation, pickup, multiple wishlists) until admin configuration changes, or they are advanced/optional integrations and final polish. Sequencing them last avoids building speculative UI against features that can't yet be exercised, while keeping the architecture ready for them.

Features:
- Internationalization: html lang from storeConfig now; locale-segment routing, store/website switcher, multi-currency switcher with cache-key scoping, hreflang — all gated on additional store views/currencies being configured in admin.
- Advanced payments only if a merchant adopts them: PayPal Express redirect flow, PayPal Payment Services suite (createPaymentOrder/syncPaymentOrder/completeOrder deferred path), Payflow family.
- Order cancellation (single + two-step email confirm + guest cancel) — inert until order_cancellation_enabled is turned on in admin; build UI gated on the storeConfig flag.
- In-store pickup (pickupLocations) — conditional on MSI/in-store-delivery being enabled.
- Customer downloadable library, multiple named wishlists (Adobe Commerce only — do not build on CE), wishlist filled-heart state via route handler, account newsletter preference, customerGroup display.
- Widget directive ({{widget}}/{{store}}/{{media}}) handling and PageBuilder interactive hydration (sliders/tabs/accordion).
- Production hardening: TLS for prod (drop NODE_EXTRA_CA_CERTS), CSP/security headers + middleware, image optimization flip, PPR/'use cache' adoption, manifest/PWA icons, e2e + perf budgets in CI, on-demand CMS revalidation webhook.

## 4. Architecture additions

New modules, patterns, and primitives the roadmap introduces:

- Checkout state machine driven by server-side cart state: a /checkout RSC that gates steps from cart fields (no email->step1, address-but-no-method->step3), with `use client` step islands calling Server Actions + router.refresh(), all reusing resolveCartContext()/getWritableCart().
- New src/lib/checkout.ts (reads/helpers) + checkout-actions.ts (setGuestEmail/setShippingAddress/setShippingMethod/setBillingAddress/setPaymentMethod/placeOrder), each returning the established { ok, errors } shape.
- A richer CHECKOUT_CART query (email, shipping_addresses{available/selected methods, full address}, available/selected_payment_methods, full prices breakdown, is_virtual) distinct from the lightweight cart read.
- Shared countries/regions reference module (src/lib/store-config.ts getCountries, cached revalidate:86400 tags:['countries']) + a RegionField client component that swaps select vs free-text on available_regions; consumed by both account and checkout address forms.
- Reusable AddressForm + CartAddressInput/CustomerAddressInput builders handling the region_id-vs-region rule, String[] street, and CountryCodeEnum — written once for account address book and reused for checkout (and saved-address picker via customer_address_uid).
- Account hub: src/app/account/layout.tsx + AccountNav with a single token guard, plus sub-routes (/account/edit, /account/address[/new|/[uid]], /account/orders[/[number]], /account/downloads, /account/payment, /account/reviews).
- Order-detail component kit (OrderItemsTable, OrderTotals, OrderAddressCard, OrderShipments) shared across customer detail, guest-by-token view, and the checkout success page; plus a SKU->image cached lookup since OrderItem has no image field.
- Extend magentoFetch with optional per-request headers (recaptchaToken -> X-ReCaptcha, and Content-Currency/Store passthrough) — a prerequisite for all reCAPTCHA gating and any future currency/store switching.
- Shared PLP/search data layer: a single parameterized PLP_QUERY (search|category + ProductAttributeFilterInput + sort + aggregations + sort_fields) with a buildProductFilter(searchParams) helper, consumed by both the category and search routes with all state in the URL.
- CmsContent renderer primitive: server component that link-rewrites absolute magento.test/.html URLs to storefront routes, sanitizes (allowing data-*/style for PageBuilder), and renders under a .cms-content typography scope; self-hosted PageBuilder CSS.
- Guest-list GUID cookie subsystems mirroring the cart: compare_list_uid cookie + resolveCompareContext + assignCompareListToCustomer-on-login; wishlist is customer-token-only (no guest list).
- On-demand revalidation: a tag taxonomy (catalog, product:<urlKey>, category:<uid>, cms, cart) + an authenticated /api/revalidate route handler callable from a Magento webhook, replacing revalidatePath('/','layout') with targeted invalidation.
- GraphQL codegen (@graphql-codegen client-preset) introspecting the live schema into src/lib/gql/, with magentoFetch accepting TypedDocumentNode for end-to-end inference, migrating the hand-written template strings/types incrementally.
- Universal route() resolver as a lowest-precedence app/[...slug] catch-all to map Magento .html/CMS/legacy URLs to entities and honor 301/302 redirect_code.

## 5. Cross-cutting concerns

- Caching correctness: catalog/storeConfig/countries/CMS/recaptcha reads are cacheable (revalidate+tags); cart, customer, order, wishlist, and compare reads are per-user and MUST be cache:'no-store' (no Next tags) to avoid cross-shopper data leaks. Replace over-broad revalidatePath('/','layout') with tag-scoped invalidation and add an /api/revalidate webhook endpoint.
- SEO + structured data: metadataBase from a public NEXT_PUBLIC_SITE_URL (never magento.test); per-page meta with NULL-safe fallback chains; canonical/OG/Twitter; server-rendered Product/Breadcrumb/Organization/WebSite JSON-LD; dynamic sitemap.ts + robots.ts; noindex on cart/account/auth/thin-search pages; paginated-PLP canonical to page 1.
- i18n/currency: single store/en_US/USD today, so switchers/hreflang/locale-routing are P3 no-ops — but fix the hardcoded html lang from storeConfig.locale now, de-hardcode format.ts locale, and fold Store/Content-Currency into cache keys before any multi-store work to prevent cache bleed.
- Accessibility: associate form errors via aria-describedby + role=alert/aria-live; convert swatches to <button> with aria-pressed + focus-visible; aria-labels on icon-only cart/qty controls; skip-to-content link; axe/Lighthouse as the acceptance gate.
- Performance: gate next.config images.unoptimized behind NODE_ENV (optimize in prod with public Magento domain in remotePatterns); move the per-request Header session query into a Suspense hole so the shell is PPR-eligible; per-route loading.tsx skeletons; verify PPR/'use cache' APIs against node_modules/next/dist/docs.
- Testing: Vitest for format.ts + Server Action branching (guest-vs-customer cart, merge, error mapping) with mocked magentoFetch; Playwright e2e for browse->add->cart->checkout->place-order, register/login/merge, and reCAPTCHA-gated happy/blocked paths.
- Security: build reCAPTCHA config-driven so is_enabled:false is a transparent no-op (it's currently off); thread token client->action->X-ReCaptcha header; production TLS (drop NODE_EXTRA_CA_CERTS dev crutch), secure-cookie correctness (already gated), CSP allowlisting google/gstatic for reCAPTCHA, lightweight rate-limiting on auth/order actions.
- Error normalization: centralize GraphQL/user_errors mapping (auth/validation/recaptcha/network) into safe user copy; wrap currently-unguarded updateItemQtyAction/removeItemAction in try/catch returning typed results; never leak raw Magento internals.
- Observability: log full error detail server-side while showing generic messages; treat the non-standard Next.js 16 build (AGENTS.md) as a standing constraint — check node_modules/next/dist/docs before using metadata/caching/image APIs.
- Type safety: hand-written queries.ts strings + types.ts interfaces are unguarded against drift; introduce GraphQL codegen and migrate incrementally, anticipating it for all new (checkout, orders, wishlist) operations.

## 6. Risks

- placeOrder shape drift: tutorials/training data still show the legacy order.order_number string; building against it instead of orderV2{...}+errors silently breaks order success/confirmation. Must query orderV2 and check errors[] explicitly.
- Admin-config dependence: many features are inert until an admin toggles them — only checkmo payment is enabled (all online gateways unconfigured), order_cancellation_enabled is false, reCAPTCHA is_enabled is false, pickup/MSI off, single store/USD/en_US. Build these config-driven (self-hiding) or they ship broken; some (Braintree, PayPal) cannot be validated end-to-end without sandbox credentials.
- Cache-leak hazard: per-user reads (cart, customer, orders, wishlist, compare) must be no-store with no Next tags; accidentally caching/tagging them leaks one shopper's data to another. Any future store/currency switch must fold into cache keys or prices/localized names bleed across contexts.
- Checkout statefulness: available_shipping_methods only populate after the address is set and payment methods/grand_total only finalize after shipping — mutations must be correctly ordered and the cart re-read (no-store) between steps; caching the cart breaks the flow.
- Token expiry mid-checkout: customer_token is ~1h; a long checkout can outlive it. Must detect unauthorized, fall back to guest or re-login, and not lose the cart.
- Non-standard Next.js 16 build (per AGENTS.md): metadata, caching, PPR, and image APIs may differ from trained knowledge; assuming stock Next 14/15 semantics will produce subtly wrong code. Verify against node_modules/next/dist/docs.
- CMS/PageBuilder fidelity: GraphQL does not return PageBuilder CSS and ships absolute magento.test/.html links; naive dangerouslySetInnerHTML leaks backend links and renders unstyled. The Luma seed data is classic HTML (no data-content-type), so the PageBuilder path cannot be validated against seed data.
- Schema arg-name quirks that fail silently: clearCart uses {uid} not {cart_id}; removeProductsFromWishlist uses misspelled wishlistItemsIds; compare/wishlist use product UIDs not SKUs; bundle option UIDs are opaque base64; grouped products have no dedicated mutation. Getting these wrong yields confusing validation errors.
- Type drift: hand-written query strings + manual types with an unchecked magentoFetch<T> generic mean result-shape mismatches surface only at runtime until codegen lands.
- Magento email delivery in dev: password reset, email confirmation, contact, and share all require working SMTP/Mailhog and correct storefront base-URL config to test — easy to overlook and block QA.

## 7. Recommendations

- Treat P0 as one indivisible epic and ship offline checkmo only; gate every online gateway behind presence in available_payment_methods so they light up automatically when an admin adds credentials. Do not block a transactable store on gateway integration.
- Build the cart-prices breakdown and countries/regions reference data FIRST inside P0 — they are prerequisites for the checkout review step and address forms and are reused by coupons, account addresses, and order detail.
- Write the AddressForm + region handling and the order-detail component kit once and share them across checkout, account address book, saved-address picker, order detail, guest order view, and checkout success — this is the highest-leverage reuse in the roadmap.
- Standardize on the existing { ok, errors } Server Action return shape and the cleanMessage() helper for ALL new mutations; centralize error classification in src/lib/errors.ts and retrofit the unguarded updateItemQtyAction/removeItemAction.
- Extend magentoFetch with per-request headers early (X-ReCaptcha + Content-Currency/Store) — it unblocks reCAPTCHA and any future currency/store switching and is a tiny, low-risk change.
- Replace revalidatePath('/','layout') with a tag taxonomy (cart, catalog, product:<urlKey>, category:<uid>, cms) and add an authenticated /api/revalidate webhook; this fixes the over-broad header-busting on every qty change and enables instant catalog publishing.
- Add GraphQL codegen during P2 and adopt it for all new operations (checkout/orders/wishlist) from creation, migrating existing strings incrementally rather than in a big-bang.
- Implement reCAPTCHA, store/currency switchers, order cancellation, and pickup as config-driven no-ops that self-hide when their admin flag is off, so the code is correct now and activates without redeploys.
- For SEO, anchor everything to a new public NEXT_PUBLIC_SITE_URL (never storeConfig.base_url/magento.test) and implement NULL-safe fallback chains (meta_title->name, meta_description->stripped description, canonical->composed) since Luma meta fields are null.
- Establish the testing harness (Vitest + mocked magentoFetch for action branching; Playwright for the buy/login/merge flows) alongside P0 so the critical path is regression-protected as the surface grows, and add a11y/perf gates to CI.
- Before writing any Next-specific metadata/caching/image/PPR code, read the relevant node_modules/next/dist/docs guide — this build has documented breaking changes versus standard Next.js 16.

## 8. Feature matrix & build notes by domain

Retired on 2026-11-04. The per-feature matrix (about 1,500 lines) was a
point-in-time snapshot that drifted from the code within weeks. The live
ledger is [STATUS.md](STATUS.md).
