# Headless Magento 2.4.9 Storefront — Feature Blueprint

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

Each domain lists a scannable matrix, then per-feature implementation notes (for partial/missing items).

### 8.1 Catalog & Product Types

This domain covers product retrieval and rendering (PDP/PLP/home), the six Magento product types and their add-to-cart paths, rich PDP fields (media gallery, custom options, tier prices, related/upsell/crosssell, reviews), category browsing, and URL/route resolution. In the headless stack, all catalog reads are React Server Components calling magentoFetch() server-to-server with Next fetch caching (revalidate + ["catalog"] tag); all cart writes are Server Actions in actions.ts that resolve a writable cart (guest_cart_id cookie or customer_token) and call addProductsToCart with the unified CartItemInput { sku, quantity, selected_options, entered_options, parent_sku }. The current build handles only SimpleProduct and ConfigurableProduct end-to-end; the other four types (Virtual, Downloadable, Bundle, Grouped) are unimplemented, and the PDP omits many high-value fields (custom options, tier prices, related/upsell/crosssell, reviews, short_description, stock badges like only_x_left_in_stock). I verified against the live endpoint that all six types implement ProductInterface, that addProductsToCart accepts selected_options/entered_options for every type (bundle options return base64 uids), grouped products add via their child simple SKUs, and the route query returns EntityUrl { type, relative_url, entity_uid } for canonical URL resolution.

| Feature | Status | Pri | Eff | GraphQL ops |
|---|---|:--:|:--:|---|
| Simple product add-to-cart | ✅ done | P0 | S | `products` `addProductsToCart` |
| Configurable product add-to-cart (swatches) | ✅ done | P1 | M | `products` `addProductsToCart` `addConfigurableProductsToCart` |
| Virtual product support | ⬜ missing | P3 | S | `products` `addProductsToCart` `addVirtualProductsToCart` |
| Downloadable product support | ⬜ missing | P2 | L | `products` `addProductsToCart` `addDownloadableProductsToCart` `customerDownloadableProducts` |
| Bundle product support | ⬜ missing | P2 | XL | `products` `addProductsToCart` `addBundleProductsToCart` |
| Grouped product support | ⬜ missing | P2 | L | `products` `addProductsToCart` |
| Custom (customizable) options on PDP | ⬜ missing | P2 | L | `products` `addProductsToCart` |
| Tier (quantity) pricing display | ⬜ missing | P3 | S | `products` |
| Related / Upsell / Cross-sell products | ⬜ missing | P2 | M | `products` |
| Full media gallery (multi-image + video) | 🟡 partial | P3 | S | `products` |
| Product reviews display + ratings metadata | ⬜ missing | P2 | M | `products` `productReviewRatingsMetadata` |
| Stock signals (only_x_left, qty) | 🟡 partial | P3 | S | `products` |
| Product extended attributes (short_description, custom_attributesV2) | 🟡 partial | P3 | M | `products` `customAttributeMetadataV2` `attributesList` |
| Canonical URL / route resolution (catch-all routing) | ⬜ missing | P2 | M | `route` `products` `categories` |
| Category tree / navigation depth | 🟡 partial | P2 | M | `categories` `categoryList` |
| Category product sorting | ⬜ missing | P2 | M | `categoryList` `products` |
| Product type-aware PDP routing/CTA | 🟡 partial | P1 | M | `products` `addProductsToCart` |

<details><summary><strong>Build notes</strong> (15 items)</summary>

- **Virtual product support** — ⬜ missing · P3 · S
  - _Gap:_ VirtualProduct implements ProductInterface and is fully addable through the existing addProductsToCart { sku, quantity } path. The only reason it is 'missing' is that PDP/AddToCart make no behavioral distinction; functionally it already works for simple-shaped virtual SKUs. No custom-options handling.
  - _Build:_ Mostly free: existing addToCartAction works. Add a branch on product.__typename === 'VirtualProduct' to hide shipping-implying copy and route any custom options. Pure RSC render + existing Server Action.
  - _Artifacts:_ `src/app/product/[slug]/page.tsx`, `src/components/AddToCart.tsx`
  - _Depends on:_ Custom options (customizable_options) on PDP
- **Downloadable product support** — ⬜ missing · P2 · L
  - _Gap:_ Not built. DownloadableProduct exposes downloadable_product_links { uid title price sample_url }, downloadable_product_samples, links_purchased_separately, links_title. Add-to-cart uses CartItemInput.entered_options OR the dedicated DownloadableProductCartItemInput.downloadable_product_links (array of link uids). Customer 'My Downloads' page (customerDownloadableProducts) also unbuilt.
  - _Build:_ Extend PRODUCT_DETAIL with a `... on DownloadableProduct` fragment. New client component DownloadableOptions.tsx (checkbox list of links; required if links_purchased_separately). Extend addToCartAction to pass downloadable link uids via selected_options/entered_options. Add a /account/downloads RSC route querying customerDownloadableProducts with the customer_token.
  - _Artifacts:_ `src/lib/queries.ts`, `src/lib/types.ts`, `src/app/product/[slug]/page.tsx`, `src/components/DownloadableOptions.tsx`, `src/lib/actions.ts`, `src/app/account/downloads/page.tsx`
  - _Depends on:_ Customer auth (exists)
- **Bundle product support** — ⬜ missing · P2 · XL
  - _Gap:_ Not built. Verified live: BundleProduct.items[] { title required type(radio/checkbox/select/multi) options[] { uid label quantity can_change_quantity is_default price product{sku name} } }, plus price_range with min/max and dynamic_price/dynamic_sku/ship_bundle_items. Add-to-cart works through unified addProductsToCart with selected_options = chosen bundle option base64 uids (e.g. 'YnVuZGxlLzEvMS8x'); quantities via entered_options or BundleProductCartItemInput.bundle_options.
  - _Build:_ Add `... on BundleProduct { items { ... } dynamic_price price_range }` fragment to PRODUCT_DETAIL. New client component BundleOptions.tsx rendering each item as radio/checkbox/select per `type`, enforcing `required`, allowing qty when can_change_quantity, computing a running 'from' price. Submit selected option uids via existing selected_options in addToCartAction (entered_options for qty). Cart display needs a `... on BundleCartItem { bundle_options { label values { label quantity } } }` fragment added to CART_QUERY.
  - _Artifacts:_ `src/lib/queries.ts`, `src/lib/types.ts`, `src/app/product/[slug]/page.tsx`, `src/components/BundleOptions.tsx`, `src/lib/actions.ts`, `src/lib/cart-data.ts`
- **Grouped product support** — ⬜ missing · P2 · L
  - _Gap:_ Not built. GroupedProduct.items[] { qty position product { sku name stock_status price_range small_image } }. There is NO GroupedProductCartItemInput (confirmed null on the live schema): you add a grouped product by sending its child simple SKUs as multiple CartItemInput entries to addProductsToCart.
  - _Build:_ Add `... on GroupedProduct { items { qty position product { sku name stock_status price_range { minimum_price { final_price { value currency } } } small_image { url label } } } }` to PRODUCT_DETAIL. New client component GroupedOptions.tsx with a qty input per child. Extend addToCartAction to accept an array of { sku, quantity } so one click adds all selected children in a single addProductsToCart call.
  - _Artifacts:_ `src/lib/queries.ts`, `src/lib/types.ts`, `src/app/product/[slug]/page.tsx`, `src/components/GroupedOptions.tsx`, `src/lib/actions.ts`
- **Custom (customizable) options on PDP** — ⬜ missing · P2 · L
  - _Gap:_ Not built. Confirmed SimpleProduct/VirtualProduct/Downloadable/Bundle all expose `options` (CustomizableOptionInterface: uid, title, required, sort_order) with concrete subtypes CustomizableFieldOption/DropDownOption/CheckboxOption/etc carrying value { uid price_type price }. Cart submission uses selected_options uids (dropdowns/checkbox) and entered_options { uid, value } (text/date/file).
  - _Build:_ Add an `options { __typename uid title required sort_order ... on CustomizableDropDownOption { value { uid title price } } ... on CustomizableFieldOption { value { uid price } } ... }` block to PRODUCT_DETAIL. New CustomOptions.tsx client component that builds selected_options (uids) and entered_options ({uid,value}). Extend AddToCartInput/addToCartAction to carry enteredOptions.
  - _Artifacts:_ `src/lib/queries.ts`, `src/lib/types.ts`, `src/components/CustomOptions.tsx`, `src/components/AddToCart.tsx`, `src/lib/actions.ts`
- **Tier (quantity) pricing display** — ⬜ missing · P3 · S
  - _Gap:_ Not queried. ProductInterface exposes price_tiers { quantity final_price { value currency } discount { amount_off percent_off } } (live-confirmed via TierPrice fields). Pure read/display, no mutation.
  - _Build:_ Add price_tiers { quantity final_price { value currency } discount { percent_off } } to PRODUCT_DETAIL and render a small table under Price in the PDP. RSC-only.
  - _Artifacts:_ `src/lib/queries.ts`, `src/lib/types.ts`, `src/app/product/[slug]/page.tsx`, `src/components/Price.tsx`
- **Related / Upsell / Cross-sell products** — ⬜ missing · P2 · M
  - _Gap:_ Not queried. ProductInterface exposes related_products, upsell_products, crosssell_products (each returning ProductInterface[]). These are plain product-card lists; crosssell typically rendered on the cart page.
  - _Build:_ Add related_products { ...PRODUCT_CARD_FIELDS } and upsell_products { ... } to PRODUCT_DETAIL; render with existing ProductGrid/ProductCard under the PDP. For crosssell, add crosssell_products to CART_QUERY product nodes and render on /cart. RSC-only, reuses ProductCard.
  - _Artifacts:_ `src/lib/queries.ts`, `src/lib/types.ts`, `src/app/product/[slug]/page.tsx`, `src/components/ProductGrid.tsx`, `src/app/cart/page.tsx`
- **Full media gallery (multi-image + video)** — 🟡 partial · P3 · S
  - _Gap:_ media_gallery { url label } is queried and rendered by Gallery.tsx, but the query omits the MediaGalleryEntry video fields. ProductInterface.media_gallery items can be `... on ProductVideo { video_content { video_url video_title } }` and also expose position/disabled.
  - _Build:_ Extend media_gallery to `{ url label position disabled ... on ProductVideo { video_content { media_type video_provider video_url } } }` in PRODUCT_DETAIL and teach Gallery.tsx to embed videos. Read-side only.
  - _Artifacts:_ `src/lib/queries.ts`, `src/lib/types.ts`, `src/components/Gallery.tsx`
- **Product reviews display + ratings metadata** — ⬜ missing · P2 · M
  - _Gap:_ Not built. ProductInterface exposes reviews(pageSize,currentPage) { items { nickname summary text average_rating created_at ratings_breakdown { name value } } page_info }, plus rating_summary and review_count. productReviewRatingsMetadata supplies the rating dimensions for a write form. (Write/createProductReview belongs to the Reviews/Engagement domain.)
  - _Build:_ Add reviews { items { nickname summary text average_rating created_at } page_info { total_pages } }, rating_summary, review_count to PRODUCT_DETAIL. New Reviews.tsx server component rendering stars (rating_summary/20) and the list. productReviewRatingsMetadata only needed when building the submit form. RSC-only for display.
  - _Artifacts:_ `src/lib/queries.ts`, `src/lib/types.ts`, `src/app/product/[slug]/page.tsx`, `src/components/Reviews.tsx`
- **Stock signals (only_x_left, qty)** — 🟡 partial · P3 · S
  - _Gap:_ stock_status is used for a binary in/out badge on PDP and cards. only_x_left_in_stock (ProductInterface) is not queried, so low-stock urgency is missing.
  - _Build:_ Add only_x_left_in_stock to PRODUCT_DETAIL (and optionally PRODUCT_CARD_FIELDS) and render a low-stock badge. RSC-only.
  - _Artifacts:_ `src/lib/queries.ts`, `src/lib/types.ts`, `src/app/product/[slug]/page.tsx`, `src/components/ProductCard.tsx`
- **Product extended attributes (short_description, custom_attributesV2)** — 🟡 partial · P3 · M
  - _Gap:_ Only description.html is shown. short_description.html, country_of_manufacture, and arbitrary custom_attributesV2 { items { code value } } are available but unqueried. customAttributeMetadataV2/attributesList give labels/option-mappings for a specs table.
  - _Build:_ Add short_description { html } and custom_attributesV2(filters:{...}) { items { code selected_options { label } ... } } to PRODUCT_DETAIL; render a 'Specifications' table. Use customAttributeMetadataV2 to map attribute codes to display labels (cached RSC read). Read-only.
  - _Artifacts:_ `src/lib/queries.ts`, `src/lib/types.ts`, `src/app/product/[slug]/page.tsx`
- **Canonical URL / route resolution (catch-all routing)** — ⬜ missing · P2 · M
  - _Gap:_ Not built. The app hardcodes /product/[slug] and /category/[slug] by url_key. The live `route(url)` query returns EntityUrl { type, relative_url, entity_uid, redirectCode } and inline fragments (... on ProductInterface / CategoryTree / CmsPage), enabling a single resolver. Magento url_suffix (e.g. .html) and url_rewrites are currently ignored, so canonical store URLs 404.
  - _Build:_ Add a `route` query to queries.ts and an optional app/[...path]/page.tsx catch-all RSC that calls route(url:fullPath), then renders the PDP/PLP/CMS component by `type` (or issues a 301 via redirectCode). Alternatively use generateMetadata to emit canonical_url. Keep existing pretty routes; add this as a fallback resolver. RSC-only.
  - _Artifacts:_ `src/lib/queries.ts`, `src/app/[...path]/page.tsx`, `src/lib/types.ts`
- **Category tree / navigation depth** — 🟡 partial · P2 · M
  - _Gap:_ TOP_NAV fetches only direct children of root (id 2); CATEGORY_PAGE fetches one level of children. No nested mega-menu, no category image/cms_block, and breadcrumbs are reconstructed only from product.categories (last item) rather than a true path. categories() (the newer paginated query) is unused.
  - _Build:_ Extend TOP_NAV to recurse children { children { ... } } for a Header mega-menu (cached RSC read, ['nav'] tag). Add image, description, and breadcrumbs { category_name category_url_key } to CATEGORY_PAGE for richer PLPs. Header is a server component reading once per layout.
  - _Artifacts:_ `src/lib/queries.ts`, `src/lib/types.ts`, `src/components/Header.tsx`, `src/app/category/[slug]/page.tsx`
- **Category product sorting** — ⬜ missing · P2 · M
  - _Gap:_ Not built. CATEGORY_PAGE.products takes no sort. products()/category products accept sort: ProductAttributeSortInput { price, name, position, relevance } and the available options come from products.sort_fields { options { value label } }.
  - _Build:_ Add a `sort` variable to CATEGORY_PAGE and a client sort dropdown that updates ?sort= searchParam; the RSC re-fetches with the chosen ProductAttributeSortInput. Pairs naturally with layered navigation (separate Filters/Search domain).
  - _Artifacts:_ `src/lib/queries.ts`, `src/app/category/[slug]/page.tsx`, `src/components/SortSelect.tsx`
  - _Depends on:_ Category tree / navigation depth
- **Product type-aware PDP routing/CTA** — 🟡 partial · P1 · M
  - _Gap:_ PDP currently only branches implicitly on configurable_options. There is no switch on __typename, so Bundle/Grouped/Downloadable/Virtual render as a bare simple add-to-cart and either fail or add incorrectly. This is the integrating feature tying the type-specific components together.
  - _Build:_ Refactor product/[slug]/page.tsx to switch on product.__typename and mount the matching options component (ConfigurableSwatches / BundleOptions / GroupedOptions / DownloadableOptions / CustomOptions). Keep one addToCartAction that accepts sku + selected_options + entered_options + (for grouped) an items[] array. RSC selects component; mutation stays a Server Action.
  - _Artifacts:_ `src/app/product/[slug]/page.tsx`, `src/components/AddToCart.tsx`, `src/lib/actions.ts`, `src/lib/types.ts`
  - _Depends on:_ Bundle product support; Grouped product support; Downloadable product support; Custom (customizable) options on PDP

</details>

**Domain gotchas:**
- Grouped products have NO GroupedProductCartItemInput (verified null on the live schema): you add them by sending each associated simple child SKU as separate CartItemInput entries to addProductsToCart in one call.
- Prefer the single unified addProductsToCart over the per-type mutations (addBundle/Configurable/Downloadable/Virtual/SimpleProductsToCart). The existing addToCartAction already uses it; bundle/custom/downloadable selections all flow through selected_options (uids) + entered_options ({uid,value}).
- Bundle option uids are opaque base64 strings (e.g. 'YnVuZGxlLzEvMS8x' = 'bundle/1/1/1'); pass them verbatim in selected_options — do not parse or reconstruct them.
- Bundle pricing is a RANGE: dynamic_price bundles show a 'from' price and price_range.maximum_price differs from minimum_price; the current Price component assumes a single minimum_price and will mislead on bundles.
- Downloadable products: if links_purchased_separately is true the link selection is REQUIRED; links can have their own price added on top of the base price, so PDP price must reflect chosen links.
- Configurable add-to-cart must send the variant's value UIDs in selected_options, not the parent SKU alone — the build does this correctly, but per-variant price/image/stock is not currently resolved client-side from variants[].
- Cart display fragments are type-specific: showing bundle/downloadable/custom-option selections in the cart requires adding ... on BundleCartItem / DownloadableCartItem / SimpleCartItem(customizable_options) fragments to CART_QUERY, which it currently lacks.
- Magento applies a url_suffix (commonly .html) to product/category URLs; the storefront's pretty /product/[slug] routes ignore it, so canonical/SEO/legacy URLs 404 without a route()-based catch-all resolver.
- media_gallery is a union — product videos come back as ... on ProductVideo { video_content }; querying only { url label } silently drops videos.
- rating_summary is a 0-100 integer (percent), not a 0-5 value: divide by 20 to render stars.
- categoryList is deprecated-leaning in favor of categories(); both work on 2.4.9 but use the same filter shape. The home/nav/category code all use categoryList, which is fine but worth standardizing.
- Out-of-stock configurable combinations are not disabled because variants[].product.stock_status is fetched but unused in AddToCart; shoppers can attempt to add unavailable combos and only get a user_errors response after the round-trip.

### 8.2 Search, Filtering & Layered Navigation

This domain covers Magento's unified `products` query, which powers both keyword search (`search:`) and category browsing (`filter: { category_uid }`) through the same surface: `total_count`, `page_info`, `items`, plus `aggregations` (the data behind layered navigation) and `sort_fields`. In our headless stack everything here is a pure read, so it all lives in React Server Components calling `magentoFetch` (server-to-server, no token, cached with `next: { revalidate, tags:["catalog"] }`). State (active filters, sort, page) belongs in the URL `searchParams` so RSC re-renders on navigation and pages stay shareable/SEO-friendly; filter UI controls are thin Client Components that push to the router. The current build only has the simplest slice: basic keyword search (`SEARCH_PRODUCTS`) and a category PLP with numeric pagination, with ZERO aggregations, filters, sort UI, or suggestions wired up. I verified against the live endpoint that aggregations return price buckets (value like `20_30`), a `category_uid` facet (base64 uids), and attribute facets (color/material/size/style/pattern/climate/etc.), that `sort_fields` is dynamic per result set (search adds `relevance`), and that `attributesList(entityType: CATALOG_PRODUCT)` exposes `is_filterable`/`is_filterable_in_search` for facet discovery. The biggest single win is a shared, filterable, sortable PLP/search results engine that both the category route and the search route consume.

| Feature | Status | Pri | Eff | GraphQL ops |
|---|---|:--:|:--:|---|
| Layered navigation facets (aggregations rendering) | ⬜ missing | P1 | L | `products` |
| Shared PLP/search data layer (products query with filter+sort+aggregations) | 🟡 partial | P1 | M | `products` |
| Multi-select attribute filters (color, material, size, style, pattern, etc.) | ⬜ missing | P1 | M | `products` |
| Price range filter | ⬜ missing | P1 | M | `products` |
| Sort UI (sort_fields driven) | ⬜ missing | P1 | S | `products` |
| Filter/sort-aware pagination and pageSize control | 🟡 partial | P1 | S | `products` |
| Active filter chips + clear all | ⬜ missing | P2 | S | — |
| Color swatch facets | ⬜ missing | P2 | M | `products` `attributesList` `customAttributeMetadataV2` |
| No-results state for search | 🟡 partial | P2 | S | `products` |
| Search autosuggest / type-ahead | ⬜ missing | P2 | M | `products` |
| Mobile filter drawer / collapsible facets | ⬜ missing | P2 | S | — |
| Result count + applied-context header | 🟡 partial | P2 | S | `products` |
| Category-as-facet drill-down (subcategory narrowing) | 🟡 partial | P3 | M | `products` |
| Filterable-attribute discovery / configuration (attributesList) | ⬜ missing | P3 | M | `attributesList` `customAttributeMetadataV2` |
| Recent / popular searches | ⬜ missing | P3 | S | — |

<details><summary><strong>Build notes</strong> (15 items)</summary>

- **Layered navigation facets (aggregations rendering)** — ⬜ missing · P1 · L
  - _Gap:_ Neither CATEGORY_PAGE nor SEARCH_PRODUCTS requests `aggregations`. No sidebar/facet UI exists at all. Verified live: aggregations returns attribute_code,label,count,options{label,value,count},position for color/material/size/style_general/pattern/climate/price/category_uid and more.
  - _Build:_ Add `aggregations(filter:{category:{includeDirectChildrenOnly:true}}) { attribute_code label count position options { label value count } }` to the products selection in a new shared query (PLP_QUERY) in queries.ts. Render server-side in a new <FilterSidebar> RSC sub-tree fed by the parent PLP RSC. Each option is a <Link>/Client toggle that mutates `searchParams` (e.g. ?color=White,Black) and the page re-fetches. Exclude noisy aggregations (e.g. category_uid when already inside a category, price handled separately). Map attribute_code -> ProductAttributeFilterInput key (mostly 1:1).
  - _Artifacts:_ `storefront/src/lib/queries.ts`, `storefront/src/lib/types.ts`, `storefront/src/components/FilterSidebar.tsx`, `storefront/src/components/FilterGroup.tsx`, `storefront/src/lib/plp-search-params.ts`
  - _Depends on:_ Shared PLP/search data layer (products query with filter+sort+aggregations)
- **Shared PLP/search data layer (products query with filter+sort+aggregations)** — 🟡 partial · P1 · M
  - _Gap:_ Two narrow, divergent queries exist (CATEGORY_PAGE uses categoryList.products with no filter/sort/aggregations; SEARCH_PRODUCTS uses products(search:) with no filter/sort/aggregations). Neither accepts a $filter or $sort variable.
  - _Build:_ Create PLP_QUERY: `products(search:$search, filter:$filter, sort:$sort, pageSize:$pageSize, currentPage:$currentPage)` selecting card fields + page_info + aggregations + sort_fields. Build a `buildProductFilter(searchParams, categoryUid?)` helper in a new plp-search-params.ts that converts URL params into ProductAttributeFilterInput (category_uid eq, color/material/size in:[...], price {from,to}). Category route passes category_uid + no search; search route passes search term + no category. Keep cached read via magentoFetch with tags:['catalog'].
  - _Artifacts:_ `storefront/src/lib/queries.ts`, `storefront/src/lib/plp-search-params.ts`, `storefront/src/lib/types.ts`, `storefront/src/app/category/[slug]/page.tsx`, `storefront/src/app/search/page.tsx`
- **Multi-select attribute filters (color, material, size, style, pattern, etc.)** — ⬜ missing · P1 · M
  - _Gap:_ No filter inputs are sent today. Verified ProductAttributeFilterInput exposes color, material, size, style_general, pattern, climate, gender, activity, eco_collection, performance_fabric, etc. as FilterEqualTypeInput (supports `in: [..]`).
  - _Build:_ In buildProductFilter, for each known facet param emit `{ in: values }` on the matching ProductAttributeFilterInput key. Facet option `value` from the aggregation is the attribute option id used directly in `in`. URL encodes selections as comma-joined param per attribute. Toggling an option is a Client Component that updates the router querystring (router.push with scroll:false); RSC re-renders with the new filter. Show active-filter chips with individual remove + 'Clear all'.
  - _Artifacts:_ `storefront/src/lib/plp-search-params.ts`, `storefront/src/components/FilterGroup.tsx`, `storefront/src/components/ActiveFilters.tsx`, `storefront/src/components/FilterSidebar.tsx`
  - _Depends on:_ Shared PLP/search data layer (products query with filter+sort+aggregations); Layered navigation facets (aggregations rendering)
- **Price range filter** — ⬜ missing · P1 · M
  - _Gap:_ Not implemented. Verified live: the `price` aggregation returns bucket options with value like `20_30`; ProductAttributeFilterInput.price is FilterRangeTypeInput with `from`/`to`.
  - _Build:_ Parse the price aggregation `value` (split on '_') into from/to bucket links, OR provide a min/max numeric form. In buildProductFilter map `?price=20-30` (or ?price_from / ?price_to) to `price: { from: "20", to: "30" }`. Render bucket counts in the sidebar. A min/max custom input is a small Client form that pushes price_from/price_to to the URL. Currency formatting via existing format.ts.
  - _Artifacts:_ `storefront/src/lib/plp-search-params.ts`, `storefront/src/components/PriceFilter.tsx`, `storefront/src/lib/format.ts`
  - _Depends on:_ Shared PLP/search data layer (products query with filter+sort+aggregations); Layered navigation facets (aggregations rendering)
- **Sort UI (sort_fields driven)** — ⬜ missing · P1 · S
  - _Gap:_ No sort control; category uses default position, search uses default relevance implicitly. Verified ProductAttributeSortInput allows name, position, price, relevance; sort_fields.options returns the contextual list (search adds Relevance).
  - _Build:_ Request `sort_fields { default options { label value } }` in PLP_QUERY and render a <SortSelect> Client Component. Map `?sort=price&dir=DESC` to `sort: { price: DESC }`. Default to position for category, relevance for search. Selecting an option pushes sort/dir to URL; RSC refetches. Persist alongside filters in searchParams so links remain shareable.
  - _Artifacts:_ `storefront/src/components/SortSelect.tsx`, `storefront/src/lib/plp-search-params.ts`, `storefront/src/lib/queries.ts`
  - _Depends on:_ Shared PLP/search data layer (products query with filter+sort+aggregations)
- **Filter/sort-aware pagination and pageSize control** — 🟡 partial · P1 · S
  - _Gap:_ Category route has numeric prev/next pagination but it only carries ?page and would drop any filter/sort params. Search route has no pagination UI at all despite fetching page_info.
  - _Build:_ Generalize pagination into a <Pagination> component that rebuilds the querystring from the full searchParams (page + all filters + sort). Add it to the search route too. Optional pageSize selector (12/24/48) stored as ?size. Use page_info.total_pages from the shared query. All server-rendered <Link>s for SEO; no client state needed.
  - _Artifacts:_ `storefront/src/components/Pagination.tsx`, `storefront/src/app/category/[slug]/page.tsx`, `storefront/src/app/search/page.tsx`, `storefront/src/lib/plp-search-params.ts`
  - _Depends on:_ Shared PLP/search data layer (products query with filter+sort+aggregations)
- **Active filter chips + clear all** — ⬜ missing · P2 · S
  - _Gap:_ No representation of applied filters; nothing to remove because filters do not exist yet.
  - _Build:_ Pure presentational: read the parsed filter state from searchParams (via plp-search-params helper), look up human labels from the aggregations response (option.label by value), render chips as <Link>s that drop a single param. 'Clear all' links to the base path keeping only the category/search term. No GraphQL needed.
  - _Artifacts:_ `storefront/src/components/ActiveFilters.tsx`, `storefront/src/lib/plp-search-params.ts`
  - _Depends on:_ Multi-select attribute filters (color, material, size, style, pattern, etc.); Layered navigation facets (aggregations rendering)
- **Color swatch facets** — ⬜ missing · P2 · M
  - _Gap:_ AggregationOption returns only label/value/count (verified) - NO swatch hex. Color hex must be sourced separately. PDP configurable_options already expose swatch_data.value for color, so the pattern exists in-app.
  - _Build:_ Detect attribute_code==='color' in the sidebar and render a swatch grid. Source hex either by (a) reusing swatch_data from a configurable product query, (b) a one-time attributesList/customAttributeMetadataV2 lookup of the color option swatches cached with a long revalidate, or (c) a small static color->hex map for Luma data. Selecting a swatch toggles ?color like any other facet.
  - _Artifacts:_ `storefront/src/components/SwatchFilter.tsx`, `storefront/src/lib/queries.ts`, `storefront/src/lib/color-swatches.ts`
  - _Depends on:_ Multi-select attribute filters (color, material, size, style, pattern, etc.)
- **No-results state for search** — 🟡 partial · P2 · S
  - _Gap:_ Search page shows '0 result(s)' and the generic ProductGrid 'No products found' line; there is no guidance, no clear-filters CTA, and a thrown fetch error silently renders empty (catch{} swallows it).
  - _Build:_ When total_count===0, render a dedicated <NoResults> RSC: echo the query/active filters, offer 'Clear all filters' link, surface top categories (reuse TOP_NAV) and optionally a few trending products (PRODUCTS_BY_CATEGORY_UID). Distinguish a real error from a true zero-result by not swallowing fetch errors into an empty array.
  - _Artifacts:_ `storefront/src/components/NoResults.tsx`, `storefront/src/app/search/page.tsx`, `storefront/src/app/category/[slug]/page.tsx`
  - _Depends on:_ Shared PLP/search data layer (products query with filter+sort+aggregations)
- **Search autosuggest / type-ahead** — ⬜ missing · P2 · M
  - _Gap:_ Header search is a plain GET <form action=/search>; no suggestions. Magento has no dedicated suggest endpoint, so this is built on products(search:) with a small pageSize.
  - _Build:_ Add a route handler /api/suggest (Route Handler) that debounces and calls products(search:$q, pageSize:5) server-side (keeps endpoint server-to-server, cacheable, no CORS). A Client Component header search box fetches /api/suggest on input (debounced ~200ms) and shows a dropdown of name+thumbnail linking to /product/[url_key], plus 'See all results for q'. Cache suggest responses with a short revalidate.
  - _Artifacts:_ `storefront/src/app/api/suggest/route.ts`, `storefront/src/components/SearchBox.tsx`, `storefront/src/components/Header.tsx`, `storefront/src/lib/queries.ts`
  - _Depends on:_ Shared PLP/search data layer (products query with filter+sort+aggregations)
- **Mobile filter drawer / collapsible facets** — ⬜ missing · P2 · S
  - _Gap:_ No sidebar exists, so no responsive treatment. Category page currently has no filters; layout is grid-only.
  - _Build:_ Wrap <FilterSidebar> server output in a Client <FilterDrawer> shell that is inline on lg+ and a toggled overlay on mobile (useState for open/close, no data state - the facet data is server-rendered and passed as children/props). 'Show more' per FilterGroup is local Client state. Filter selections still flow through the URL.
  - _Artifacts:_ `storefront/src/components/FilterDrawer.tsx`, `storefront/src/components/FilterGroup.tsx`
  - _Depends on:_ Layered navigation facets (aggregations rendering)
- **Result count + applied-context header** — 🟡 partial · P2 · S
  - _Gap:_ Both pages show a static total_count, but it does not reflect filters (no filters yet) and the search page count is unpaginated context only. No toolbar combining count+sort.
  - _Build:_ Introduce a <ResultsToolbar> RSC that takes total_count + sort_fields and renders count, sort dropdown, and (mobile) the Filters button. Re-uses the shared query's total_count which already reflects the applied $filter. Trivial composition once the shared data layer exists.
  - _Artifacts:_ `storefront/src/components/ResultsToolbar.tsx`, `storefront/src/app/search/page.tsx`, `storefront/src/app/category/[slug]/page.tsx`
  - _Depends on:_ Shared PLP/search data layer (products query with filter+sort+aggregations); Sort UI (sort_fields driven)
- **Category-as-facet drill-down (subcategory narrowing)** — 🟡 partial · P3 · M
  - _Gap:_ Category page renders subcategory pill tiles from categoryList.children, but this is navigation, not a layered-nav facet with live counts tied to current filters. Verified the category_uid aggregation returns subcategory uids+counts.
  - _Build:_ When inside a category, render the category_uid aggregation (or aggregations(filter:{category:{includeDirectChildrenOnly:true}})) as a Category facet with counts that respect other active filters. Selecting adds category_uid to the filter. Decide whether to replace or supplement the existing children tiles to avoid duplication.
  - _Artifacts:_ `storefront/src/components/FilterSidebar.tsx`, `storefront/src/lib/plp-search-params.ts`, `storefront/src/app/category/[slug]/page.tsx`
  - _Depends on:_ Layered navigation facets (aggregations rendering); Multi-select attribute filters (color, material, size, style, pattern, etc.)
- **Filterable-attribute discovery / configuration (attributesList)** — ⬜ missing · P3 · M
  - _Gap:_ Not used. Verified attributesList(entityType: CATALOG_PRODUCT) returns items{code,label,frontend_input, ... on CatalogAttributeMetadata { is_filterable, is_filterable_in_search }} - ideal for driving the facet config.
  - _Build:_ Add an ATTRIBUTES_LIST query; fetch once (long revalidate, tag:'catalog') to build an allow-list/label/inputType map consumed by FilterSidebar so new filterable attributes appear automatically and render with the right control (swatch/boolean/select). Optional: in practice aggregations already returns label+code, so this is an enhancement for control over rendering, not strictly required for v1.
  - _Artifacts:_ `storefront/src/lib/queries.ts`, `storefront/src/lib/filter-config.ts`, `storefront/src/components/FilterSidebar.tsx`
  - _Depends on:_ Layered navigation facets (aggregations rendering)
- **Recent / popular searches** — ⬜ missing · P3 · S
  - _Gap:_ Not implemented. Magento's GraphQL surface here exposes no popular-search query, so this is client/local-only or admin-curated.
  - _Build:_ Store recent terms in localStorage (Client Component) and render in the empty search state and autosuggest. 'Popular' terms, lacking a GraphQL source, would be a small curated static list or a CMS block (cmsBlocks) if desired. No server read required for the recent-terms variant.
  - _Artifacts:_ `storefront/src/components/RecentSearches.tsx`, `storefront/src/components/SearchBox.tsx`
  - _Depends on:_ Search autosuggest / type-ahead

</details>

**Domain gotchas:**
- All of layered nav is a READ — keep it 100% in RSC via magentoFetch with no token and cached `next:{revalidate, tags:['catalog']}`. Do NOT reach for Server Actions or Apollo here; filter/sort/page state belongs in the URL searchParams so RSC re-renders on navigation and pages stay shareable/SEO-indexable.
- Aggregations only reflect the CURRENT filtered result set. The same products() call must return BOTH items and aggregations so counts update as filters apply. Magento returns ALL facets in one call; there is no separate aggregation endpoint.
- Price aggregation `value` comes back as an underscore-joined bucket string like "20_30" (verified live), but the filter input ProductAttributeFilterInput.price is FilterRangeTypeInput { from, to } as STRING numbers. You must split the bucket value to build {from:"20", to:"30"} — they are not the same shape.
- The category_uid aggregation option `value` is a base64 uid (e.g. "MjA="), matching category_uid filter, NOT the integer category_id. Keep uids consistent end-to-end (the app already uses uids elsewhere).
- sort_fields is contextual: a keyword search result includes a `relevance` option (and default 'relevance'), while a category result defaults to 'position'. Don't hardcode the sort option list — render sort_fields.options from the live response.
- ProductAttributeFilterInput is a curated allow-list of attributes (color, material, size, style_general, pattern, climate, gender, activity, eco_collection, performance_fabric, category_uid, price, etc., verified). An attribute can APPEAR in aggregations yet not be a valid filter key, or vice versa — map attribute_code to the filter input key defensively and skip unknowns. category_uid/price aggregations should usually be handled specially, not as generic `in:` facets.
- FilterEqualTypeInput supports `in: [..]` for multi-select within a facet; combining different facets is implicit AND. There is no OR-across-facets in standard GraphQL.
- AggregationOption has NO swatch/hex data (verified — only label/value/count). Color swatches must be sourced separately (configurable_options.swatch_data, customAttributeMetadataV2/attributesList, or a static map). Don't expect the aggregation to carry colors.
- There is no dedicated search-suggest GraphQL field; autosuggest must be built on products(search:, pageSize:small). Proxy it through a Next Route Handler so the call stays server-to-server (no browser CORS to magento.test, and the cache/token boundary stays server-side).
- The current search page swallows fetch errors into an empty product array (catch { products = [] }), making a backend error indistinguishable from a genuine zero-result. Separate error handling from the no-results state before building the empty UX.
- Existing pagination only carries ?page and would silently drop filters/sort. Any new pagination/sort/filter control must rebuild the full querystring from all searchParams, not append to a bare path.
- Don't double-render category narrowing: the PLP already shows subcategory pill tiles from categoryList.children. If you add a category_uid facet to the sidebar, reconcile the two so shoppers don't see the same drill-down twice.
- attributesList uses entityType: CATALOG_PRODUCT (not 'PRODUCT'), and filterable flags live on the inline fragment ... on CatalogAttributeMetadata { is_filterable, is_filterable_in_search } (verified — querying is_filterable on the interface errors).
- Empty `filter: {}` with only a search term is fine, and `products(filter:{})` with neither search nor any filter is rejected by Magento — always include at least category_uid (category route) or search (search route).

### 8.3 Cart, Coupons & Cart Types

This domain covers the Magento GraphQL cart lifecycle: the masked guest cart (createGuestCart), the auto-provisioned customerCart, all add/update/remove/clear mutations, the full price breakdown (discounts, applied_taxes, subtotal variants), coupons (applyCouponToCart/removeCouponFromCart, multi-coupon via applied_coupons), per-item availability errors, gift messaging, and cart-session housekeeping (mergeCarts, assignCustomerToGuestCart, setCartAsInactive). In our headless stack it maps cleanly: cart READS run server-to-server from RSC via src/lib/cart-data.ts (cache: no-store since carts are user-specific), and cart WRITES run as Server Actions in src/lib/actions.ts that resolve a writable cart from httpOnly cookies (guest_cart_id, customer_token) then revalidatePath. The current build has a solid spine — guest+customer carts, addProductsToCart (simple+configurable), updateCartItems, removeItemFromCart, and login-time mergeCarts are all DONE — but the cart only reads two price fields (subtotal_excluding_tax, grand_total) and exposes no discounts/tax breakdown, no coupon UI, no clear-cart, no stock/availability error surfacing, and no support for bundle/grouped/downloadable/virtual product add paths. The biggest gaps are coupons (applyCouponToCart/removeCouponFromCart — explicitly flagged missing), clearCart, a richer prices breakdown, and the non-simple/non-configurable product type add flows that block those PDPs from ever reaching the cart. Note that the generic addProductsToCart already handles simple+configurable+virtual+downloadable+bundle via CartItemInput, so the type-specific mutations are mostly redundant except where their typed inputs are easier (bundle options, downloadable links, gift cards).

| Feature | Status | Pri | Eff | GraphQL ops |
|---|---|:--:|:--:|---|
| Cart price breakdown (discounts, taxes, subtotals) | 🟡 partial | P1 | S | `cart` `customerCart` |
| Apply coupon to cart | ⬜ missing | P1 | M | `applyCouponToCart` `cart` |
| Remove coupon from cart | ⬜ missing | P1 | S | `removeCouponFromCart` `cart` |
| Multi-coupon display (applied_coupons list) | ⬜ missing | P2 | S | `cart` `applyCouponToCart` `removeCouponFromCart` |
| Clear cart (empty the cart) | ⬜ missing | P2 | S | `clearCart` `cart` |
| Per-item availability & error surfacing | ⬜ missing | P1 | M | `cart` `customerCart` `updateCartItems` |
| Mini-cart / cart flyout | ⬜ missing | P2 | M | `cart` `customerCart` |
| Gift message on cart | ⬜ missing | P3 | S | `cart` `customerCart` |
| Add bundle products to cart (Bundle PDP) | ⬜ missing | P2 | L | `addBundleProductsToCart` `addProductsToCart` `cart` |
| Add downloadable products to cart (Downloadable PDP) | ⬜ missing | P3 | M | `addDownloadableProductsToCart` `addProductsToCart` `cart` `customerDownloadableProducts` |
| Add virtual products to cart (Virtual PDP) | ⬜ missing | P3 | S | `addVirtualProductsToCart` `addProductsToCart` `cart` |
| Grouped product add to cart (Grouped PDP) | ⬜ missing | P2 | M | `addProductsToCart` `cart` |
| Add to a new/separate cart (addProductsToNewCart) | ⬜ missing | P3 | S | `addProductsToNewCart` `createGuestCart` |
| Assign customer to guest cart (assignCustomerToGuestCart) | 🟡 partial | P3 | S | `assignCustomerToGuestCart` `mergeCarts` `customerCart` |
| Set cart as inactive (setCartAsInactive) | ⬜ missing | P2 | S | `setCartAsInactive` |
| Cart-level rules / auto-applied promotions display | ⬜ missing | P3 | S | `cart` |
| Cart token/session resilience (expiry & recovery) | 🟡 partial | P1 | M | `customerCart` `cart` `createGuestCart` |

<details><summary><strong>Build notes</strong> (17 items)</summary>

- **Cart price breakdown (discounts, taxes, subtotals)** — 🟡 partial · P1 · S
  - _Gap:_ CART_QUERY only selects prices.grand_total and prices.subtotal_excluding_tax. The live CartPrices type exposes discounts[{amount,label,coupon,applied_to}], applied_taxes[{amount,label}], grand_total_excluding_tax, subtotal_including_tax, and subtotal_with_discount_excluding_tax — none of which are queried or rendered. Per-item prices only read price + row_total; original_row_total, total_item_discount, and discounts are unused.
  - _Build:_ Extend CART_QUERY in src/lib/queries.ts to add prices { discounts { amount{value currency} label } applied_taxes { amount{value currency} label } grand_total_excluding_tax subtotal_with_discount_excluding_tax } and per-item original_row_total + total_item_discount. Widen the Cart/CartItem types in src/lib/types.ts. Render new <dl> rows in the Order summary block of src/app/cart/page.tsx (map discounts to negative lines, taxes to lines). Pure read change, no new mutation. Reuse formatMoney from src/lib/format.ts.
  - _Artifacts:_ `src/lib/queries.ts`, `src/lib/types.ts`, `src/app/cart/page.tsx`
- **Apply coupon to cart** — ⬜ missing · P1 · M
  - _Gap:_ No applyCouponToCart op, action, or UI exists. ApplyCouponToCartOutput returns { cart }; Cart.applied_coupons[{code}] and prices.discounts carry the result.
  - _Build:_ Add APPLY_COUPON mutation (applyCouponToCart(input:{cart_id, coupon_code}) returning cart { applied_coupons{code} prices{...discounts} }) to queries.ts. Add applyCouponAction(code) in src/lib/actions.ts: reuse getWritableCart() to resolve token+cartId from httpOnly cookies, call magentoFetch, catch GraphQL errors (invalid code) into a {ok,error} result, revalidatePath('/cart'). Build a client component CouponForm.tsx ('use client', useTransition + router.refresh) rendered in the cart summary that shows the input, applied code chip, and error text. Magento rejects a second code unless multi-coupon is enabled, so surface the server error verbatim.
  - _Artifacts:_ `src/lib/queries.ts`, `src/lib/actions.ts`, `src/components/CouponForm.tsx`, `src/app/cart/page.tsx`
  - _Depends on:_ Cart price breakdown (discounts, taxes, subtotals)
- **Remove coupon from cart** — ⬜ missing · P1 · S
  - _Gap:_ No removeCouponFromCart op/action/UI. removeCouponFromCart(input:{cart_id}) clears the applied coupon and returns the updated cart.
  - _Build:_ Add REMOVE_COUPON mutation to queries.ts and removeCouponAction() in actions.ts (same getWritableCart() + revalidatePath('/cart') pattern). Wire a small 'Remove' button next to the applied-code chip inside CouponForm.tsx (the component built for apply). Trivial once the coupon component exists.
  - _Artifacts:_ `src/lib/queries.ts`, `src/lib/actions.ts`, `src/components/CouponForm.tsx`
  - _Depends on:_ Apply coupon to cart
- **Multi-coupon display (applied_coupons list)** — ⬜ missing · P2 · S
  - _Gap:_ Cart.applied_coupons is a [AppliedCoupon]{code} list, not a single field. Cms/core CE applies one code at a time, but the field is a list and should be rendered as such for correctness.
  - _Build:_ Read applied_coupons { code } in CART_QUERY, type it as a string[] in types.ts, and render each as a chip in CouponForm.tsx. No extra mutation — falls out of the apply/remove work. Keep the apply input single-code; iterate the list for display.
  - _Artifacts:_ `src/lib/queries.ts`, `src/lib/types.ts`, `src/components/CouponForm.tsx`
  - _Depends on:_ Apply coupon to cart
- **Clear cart (empty the cart)** — ⬜ missing · P2 · S
  - _Gap:_ Flagged missing. NOTE: clearCart input is { uid: ID! } (the cart uid), NOT { cart_id }. ClearCartOutput returns { cart, errors }. Today removing the last item one-by-one via removeItemFromCart is the only path.
  - _Build:_ Add CLEAR_CART mutation clearCart(input:{ uid: $cartId }) — pass the masked cart id as uid. Add clearCartAction() in actions.ts using getWritableCart(); handle the errors field, revalidatePath('/cart') and revalidatePath('/','layout') for the header badge. Add an 'Empty cart' button (client component or a form action) in src/app/cart/page.tsx. Watch the uid-vs-cart_id input gotcha.
  - _Artifacts:_ `src/lib/queries.ts`, `src/lib/actions.ts`, `src/app/cart/page.tsx`
- **Per-item availability & error surfacing** — ⬜ missing · P1 · M
  - _Gap:_ CartItemInterface exposes is_available, not_available_message, and errors — none are queried. The cart silently renders unorderable items, and updateCartItems user_errors / itemsV2 errors are ignored.
  - _Build:_ Add is_available, not_available_message, and errors { code message } to the cart item selection in CART_QUERY; type them in types.ts. In src/app/cart/page.tsx render a red banner per item when !is_available and disable/flag it. Also capture updateCartItems and addProductsToCart user_errors (already returned but only addToCart surfaces them) and bubble them to CartControls.tsx via the action return value. Pure read + return-shape change.
  - _Artifacts:_ `src/lib/queries.ts`, `src/lib/types.ts`, `src/app/cart/page.tsx`, `src/components/CartControls.tsx`, `src/lib/actions.ts`
  - _Depends on:_ Cart price breakdown (discounts, taxes, subtotals)
- **Mini-cart / cart flyout** — ⬜ missing · P2 · M
  - _Gap:_ Header today only shows a cart badge count (HEADER_SESSION total_quantity / getCartCount). No item-level flyout.
  - _Build:_ Reuse getCart() from cart-data.ts to pass cart items into a client MiniCart.tsx mounted in src/components/Header.tsx. Since the header is an RSC, pass serialized cart data as a prop to a 'use client' popover (Tailwind, headless toggle). After any cart Server Action, router.refresh() already re-renders the RSC tree so the flyout updates. Optionally add a lighter MINI_CART_QUERY (name, image, qty, row_total only) to avoid over-fetching in cart-data.ts.
  - _Artifacts:_ `src/components/MiniCart.tsx`, `src/components/Header.tsx`, `src/lib/cart-data.ts`, `src/lib/queries.ts`
  - _Depends on:_ Cart price breakdown (discounts, taxes, subtotals)
- **Gift message on cart** — ⬜ missing · P3 · S
  - _Gap:_ Cart.gift_message { from to message } and GiftMessage type exist and are queryable, but there is no setter in this surface's mutation list (no setGiftOptionsOnCart) — so it is read-only here. Cart-level gift options require config enablement.
  - _Build:_ Read-only for now: add gift_message { from to message } to CART_QUERY and display it if present. There is no gift-message mutation in this instance's 69-mutation surface, so writing it would require enabling/adding the GiftMessageGraphQl resolver server-side. Recommend deferring writes; render existing message only. Document as a backend dependency.
  - _Artifacts:_ `src/lib/queries.ts`, `src/lib/types.ts`, `src/app/cart/page.tsx`
- **Add bundle products to cart (Bundle PDP)** — ⬜ missing · P2 · L
  - _Gap:_ PDP (src/app/product/[slug]) only handles SimpleProduct + ConfigurableProduct. Bundle products can't be configured or added. addBundleProductsToCart takes bundle_options{id,quantity,value[]}; alternatively addProductsToCart accepts entered_options/selected_options for bundles.
  - _Build:_ Extend PRODUCT_DETAIL with a ...on BundleProduct fragment (items{ option_id title required type options{ uid label quantity product{sku} } }). Build a BundleOptions.tsx client component for selecting checkbox/radio/select/multiselect options. Either map selections to selected_options uids and reuse addToCartAction, or add addBundleAction using addBundleProductsToCart with bundle_options. Prefer extending the generic addProductsToCart path (selected_options) to stay consistent with the existing configurable flow. Render dynamic price recompute from chosen options.
  - _Artifacts:_ `src/lib/queries.ts`, `src/lib/types.ts`, `src/lib/actions.ts`, `src/components/BundleOptions.tsx`, `src/app/product/[slug]/page.tsx`
- **Add downloadable products to cart (Downloadable PDP)** — ⬜ missing · P3 · M
  - _Gap:_ PDP can't render or add DownloadableProduct link selections. addDownloadableProductsToCart takes downloadable_product_links[{link_id}]; generic addProductsToCart accepts selected_options for links too.
  - _Build:_ Add ...on DownloadableProduct fragment (downloadable_product_links{ uid title price }, links_purchased_separately) to PRODUCT_DETAIL. Build a small DownloadableLinks.tsx checkbox group. Map chosen link uids to selected_options and reuse addToCartAction (preferred), or add a dedicated action using addDownloadableProductsToCart with downloadable_product_links. Customer post-purchase access is a separate account feature (customerDownloadableProducts).
  - _Artifacts:_ `src/lib/queries.ts`, `src/lib/types.ts`, `src/lib/actions.ts`, `src/components/DownloadableLinks.tsx`, `src/app/product/[slug]/page.tsx`
- **Add virtual products to cart (Virtual PDP)** — ⬜ missing · P3 · S
  - _Gap:_ VirtualProduct add path not handled, though the generic addProductsToCart already supports virtual SKUs with no options. Cart.is_virtual is not read, which matters for skipping shipping at checkout.
  - _Build:_ Minimal: virtual products with no custom options already work through the existing addToCartAction/addProductsToCart by SKU — main work is ensuring the PDP renders the add button for VirtualProduct typename (already generic). Add is_virtual to CART_QUERY so the future checkout can skip the shipping step. addVirtualProductsToCart is only needed if virtual products carry customizable_options. Lowest-cost type to support.
  - _Artifacts:_ `src/app/product/[slug]/page.tsx`, `src/lib/queries.ts`, `src/lib/types.ts`
- **Grouped product add to cart (Grouped PDP)** — ⬜ missing · P2 · M
  - _Gap:_ GroupedProduct PDP not handled. There is no addGroupedProductsToCart in the surface — grouped products are added by sending each associated simple product's SKU+qty through addProductsToCart in one cartItems array.
  - _Build:_ Add ...on GroupedProduct fragment (items{ qty product{ sku name price_range stock_status } }) to PRODUCT_DETAIL. Build GroupedItems.tsx with a qty input per associated product. addToCartAction currently sends a single item — generalize it (or add addManyToCartAction) to accept a cartItems array and submit one addProductsToCart call with all selected SKUs/quantities. Reuses the existing generic mutation; no new GraphQL op.
  - _Artifacts:_ `src/lib/queries.ts`, `src/lib/types.ts`, `src/lib/actions.ts`, `src/components/GroupedItems.tsx`, `src/app/product/[slug]/page.tsx`
- **Add to a new/separate cart (addProductsToNewCart)** — ⬜ missing · P3 · S
  - _Gap:_ Not used. addProductsToNewCart creates a cart and adds items atomically; our flow instead does createGuestCart then addProductsToCart in getWritableCart().
  - _Build:_ Optional optimization: could replace the two-step createGuestCart+addProductsToCart in getWritableCart() with addProductsToNewCart for first-add scenarios, saving a round trip and a cookie race. Low value given the current flow works; document as a possible refinement. Would set the returned cart id into the guest_cart_id httpOnly cookie.
  - _Artifacts:_ `src/lib/actions.ts`, `src/lib/queries.ts`
- **Assign customer to guest cart (assignCustomerToGuestCart)** — 🟡 partial · P3 · S
  - _Gap:_ We currently handle guest->customer transition via mergeCarts on login/register (DONE in auth.ts). assignCustomerToGuestCart is an unused alternative that reassigns ownership rather than merging into the customer's existing cart.
  - _Build:_ mergeCarts already covers the common case and is correctly wired in mergeGuestCart() in src/lib/auth.ts. assignCustomerToGuestCart would only be preferable when the customer has no existing cart and you want to keep the exact guest cart id. Keep mergeCarts as primary; optionally fall back to assignCustomerToGuestCart when customerCart is empty to preserve guest cart metadata. Low priority — current behavior is correct.
  - _Artifacts:_ `src/lib/auth.ts`, `src/lib/queries.ts`
- **Set cart as inactive (setCartAsInactive)** — ⬜ missing · P2 · S
  - _Gap:_ Not used. setCartAsInactive(input:{cart_id}) is normally invoked post-placeOrder so the next page load gets a fresh cart. Relevant once checkout exists.
  - _Build:_ Add a SET_CART_INACTIVE mutation + setCartInactiveAction(). Call it from the checkout success/placeOrder flow (out of this domain) and clear the guest_cart_id cookie so getWritableCart() creates a new guest cart on the next add. Until checkout exists there is no trigger, so build alongside the checkout domain. Server Action using the resolved cart context.
  - _Artifacts:_ `src/lib/actions.ts`, `src/lib/queries.ts`
- **Cart-level rules / auto-applied promotions display** — ⬜ missing · P3 · S
  - _Gap:_ Cart.rules exists on the live Cart type and prices.discounts carry rule labels with coupon=null for auto-applied rules. Neither is read or displayed today.
  - _Build:_ Covered largely by the price-breakdown work: render each prices.discounts entry with its label (auto-applied rules show label + null coupon). Optionally read Cart.rules for richer rule names. No mutation — pure read/render in src/app/cart/page.tsx.
  - _Artifacts:_ `src/lib/queries.ts`, `src/app/cart/page.tsx`
  - _Depends on:_ Cart price breakdown (discounts, taxes, subtotals)
- **Cart token/session resilience (expiry & recovery)** — 🟡 partial · P1 · M
  - _Gap:_ resolveCartContext() already falls back to guest on token failure, and getCart() try/catches to null. But getWritableCart() does not handle a stale guest_cart_id (deleted/expired masked id) — addToCart would throw 'no such entity' instead of minting a fresh cart. Customer token maxAge is hardcoded 1h with no refresh.
  - _Build:_ Harden getWritableCart() in actions.ts: wrap the add path so a 'could not find cart'/'no such entity' GraphQL error deletes the guest_cart_id cookie and retries via createGuestCart once. This is a robustness fix on the existing write path; no new GraphQL op. Consider centralizing the retry in magentoFetch or a small withCartRetry helper. Important before adding more write surfaces (coupons, clear) that share getWritableCart().
  - _Artifacts:_ `src/lib/actions.ts`, `src/lib/cart-cookies.ts`

</details>

**Domain gotchas:**
- clearCart input is { uid: ID! } where uid is the masked cart id — NOT { cart_id } like every other cart mutation. Sending cart_id will fail schema validation.
- applyCouponToCart in core CE applies a single code; sending a coupon when one is already applied returns a GraphQL error ('A coupon is already applied'). Cart.applied_coupons is still a LIST type, so render it as an array even though only one entry exists in CE.
- The generic addProductsToCart (already used) covers simple, configurable, virtual, downloadable, AND bundle via CartItemInput selected_options/entered_options/quantity — the type-specific add* mutations are largely redundant. Prefer extending the existing addToCartAction over adding addBundle/addDownloadable actions to keep one code path.
- There is NO addGroupedProductsToCart mutation. Grouped products are added by submitting each associated simple product (sku+quantity) in a single addProductsToCart cartItems array.
- This instance's 69-mutation surface has NO gift-message setter (no setGiftOptionsOnCart). Cart.gift_message is readable but not writable here — writing requires server-side resolver enablement. Treat gift message as read-only.
- Cart reads must use cache:'no-store' (already the default in magentoFetch when no revalidate is passed) — never cache a user-specific cart with Next fetch tags, or you'll leak one shopper's cart to another. getCart() correctly omits revalidate.
- prices.discounts entries with coupon=null are AUTO-APPLIED cart price rules (not coupons); entries with a coupon value came from applyCouponToCart. Render both as discount lines but only show a remove button for coupon-backed ones.
- After placeOrder you must clear the guest_cart_id cookie (and/or call setCartAsInactive) — otherwise getWritableCart() keeps reusing the now-ordered cart id. Build setCartAsInactive together with checkout.
- customerCart auto-creates and returns the customer's cart id, so logged-in writes never need createGuestCart. Guest writes do — and getWritableCart() must self-heal when the stored masked guest id is stale (deleted) by minting a fresh cart and rewriting the httpOnly cookie.
- Per-item is_available / not_available_message / errors live on CartItemInterface, not on the mutation output — query them on the cart read to detect unorderable lines before checkout; updateCartItems/addProductsToCart also return user_errors that the current build only surfaces for add, not update.

### 8.4 Checkout Flow

Checkout is the single biggest gap in this storefront: the cart page exists but its "Checkout (demo)" button is disabled, and nothing past the cart is built. Magento 2.4.9 exposes a stateful, server-side checkout state machine on the cart object — you mutate the cart step by step (email, shipping address, shipping method, billing address, payment method) and finally placeOrder. In our stack every one of these is a no-store Server Action mutation against src/lib/magento.ts using the existing httpOnly cookies (guest_cart_id or customer_token), exactly like cart actions; reads of countries/agreements/pickup are cached RSC reads. The flow works identically for guest and logged-in carts because resolveCartContext() already abstracts which cart id/token to use. Two 2.4.9-specific facts shape the whole design: placeOrder now returns { orderV2 (CustomerOrder), errors } not the legacy order.order_number string, and a deferred-payment path (completeOrder + is_deferred payment methods) exists for redirect gateways like PayPal. For a Luma demo the realistic happy path is offline payment (Check/Money Order = code "checkmo") + flat-rate/table-rate shipping, which needs zero gateway SDK work and delivers a fully working end-to-end order.

| Feature | Status | Pri | Eff | GraphQL ops |
|---|---|:--:|:--:|---|
| Checkout route + multi-step state machine shell | ⬜ missing | P0 | L | `cart` `customerCart` |
| Set guest email on cart | ⬜ missing | P0 | S | `setGuestEmailOnCart` `cart` |
| Shipping address form (guest + new address) with country/region data | ⬜ missing | P0 | L | `setShippingAddressesOnCart` `countries` `country` `cart` |
| Saved address book selection for logged-in customers | ⬜ missing | P1 | M | `setShippingAddressesOnCart` `setBillingAddressOnCart` `customer` `createCustomerAddress` |
| Shipping method selection (rates list + estimate) | ⬜ missing | P0 | M | `setShippingMethodsOnCart` `estimateShippingMethods` `cart` |
| In-store pickup (pickupLocations / click-and-collect) | ⬜ missing | P3 | L | `pickupLocations` `setShippingAddressesOnCart` `setShippingMethodsOnCart` |
| Billing address (same-as-shipping toggle + separate form) | ⬜ missing | P0 | M | `setBillingAddressOnCart` `cart` |
| Payment method selection — offline methods (Check/Money Order, Bank Transfer, Cash on Delivery, Purchase Order) | ⬜ missing | P0 | M | `setPaymentMethodOnCart` `cart` `placeOrder` |
| Payment method selection — online gateways (PayPal Express, Braintree, Payflow, Payment Services) with deferred/redirect flow | ⬜ missing | P2 | XL | `setPaymentMethodOnCart` `createPaypalExpressToken` `createBraintreeClientToken` `createBraintreePayPalClientToken` `getPaymentConfig` +11 |
| Checkout agreements / terms-and-conditions consent | ⬜ missing | P1 | S | `checkoutAgreements` `placeOrder` |
| Order review / summary with live totals (tax, shipping, discount, grand total) | 🟡 partial | P0 | M | `cart` |
| Coupon / discount code entry in checkout | ⬜ missing | P1 | S | `applyCouponToCart` `removeCouponFromCart` `cart` |
| Place order (immediate / offline path) | ⬜ missing | P0 | M | `placeOrder` `cart` |
| Order confirmation / success page | ⬜ missing | P0 | M | `guestOrder` `guestOrderByToken` `customer` `placeOrder` |
| Checkout error handling, validation, and recovery | ⬜ missing | P1 | M | `cart` `placeOrder` `setShippingAddressesOnCart` `setPaymentMethodOnCart` |
| Virtual / downloadable cart checkout (no-shipping path) | ⬜ missing | P3 | S | `cart` `setBillingAddressOnCart` `setPaymentMethodOnCart` `placeOrder` |
| Express checkout entry / cart-to-checkout handoff | 🟡 partial | P0 | S | `cart` `customerCart` |

<details><summary><strong>Build notes</strong> (17 items)</summary>

- **Checkout route + multi-step state machine shell** — ⬜ missing · P0 · L
  - _Gap:_ Nothing exists past /cart; the cart page Checkout button is a disabled demo stub (cart/page.tsx lines 102-108). No /checkout route, no checkout lib, no order types.
  - _Build:_ New route app/checkout/page.tsx as an RSC that fetches the full cart (a new richer CHECKOUT_CART query: email, shipping_addresses{ selected_shipping_method, available_shipping_methods, all address fields }, available_payment_methods, selected_payment_method, applied_coupons, prices{ subtotal, applied_taxes, discounts, shipping, grand_total }, is_virtual). Drive step gating server-side from cart state (no email -> step 1; has address but no method -> step 3, etc). Build a new src/lib/checkout.ts (reads/helpers) and add checkout mutations to actions.ts or a new checkout-actions.ts. Reuse resolveCartContext() so guest+customer share one code path. Redirect to /cart if cart is empty. Client step components are 'use client' islands calling Server Actions + router.refresh(), mirroring CartControls.tsx.
  - _Artifacts:_ `storefront/src/app/checkout/page.tsx`, `storefront/src/lib/checkout.ts`, `storefront/src/lib/checkout-actions.ts`, `storefront/src/lib/queries.ts`, `storefront/src/lib/types.ts`, `storefront/src/components/checkout/CheckoutStepper.tsx`, `storefront/src/app/cart/page.tsx (enable button -> Link to /checkout)`
  - _Depends on:_ Cart (built); resolveCartContext (built)
- **Set guest email on cart** — ⬜ missing · P0 · S
  - _Gap:_ No email capture anywhere; logged-in carts already carry the customer email so this is guest-only.
  - _Build:_ Server Action setGuestEmailAction(email) calling setGuestEmailOnCart(input:{cart_id, email}) with the guest_cart_id cookie (no token). Skip entirely when customer_token exists (their email is already on the cart). Add isEmailAvailable read as an optional UX nicety to prompt 'log in instead'. Validate email shape server-side before the call. Mutation is no-store. Revalidate /checkout.
  - _Artifacts:_ `storefront/src/lib/checkout-actions.ts`, `storefront/src/lib/queries.ts`, `storefront/src/components/checkout/EmailStep.tsx`
  - _Depends on:_ Checkout route shell
- **Shipping address form (guest + new address) with country/region data** — ⬜ missing · P0 · L
  - _Gap:_ No address UI. Verified CartAddressInput fields: firstname,lastname,company,street[],city,region{region/region_id/region_code},postcode,country_code,telephone,save_in_address_book. setShippingAddressesOnCart takes a LIST of shipping_addresses.
  - _Build:_ RSC reads countries (cached revalidate ~86400, tag 'countries') for the country select and region data; render region as a <select> driven by available_regions when the country has them, else free-text. Server Action setShippingAddressAction(formData) builds shipping_addresses:[{address:{...}}] and calls setShippingAddressesOnCart(input:{cart_id, shipping_addresses}). country_code is the 2-letter abbreviation; pass region_id for countries with fixed regions (US/CA), region string otherwise. Setting the shipping address is what makes available_shipping_methods populate, so step 3 reads from the response. Use save_in_address_book only for logged-in customers.
  - _Artifacts:_ `storefront/src/lib/checkout-actions.ts`, `storefront/src/lib/queries.ts (COUNTRIES, SET_SHIPPING_ADDRESS)`, `storefront/src/lib/types.ts (Country, Region, CartAddress)`, `storefront/src/components/checkout/AddressForm.tsx`, `storefront/src/components/checkout/ShippingStep.tsx`
  - _Depends on:_ Checkout route shell; Set guest email (for guest)
- **Saved address book selection for logged-in customers** — ⬜ missing · P1 · M
  - _Gap:_ Customer addresses are not queried anywhere; CUSTOMER_ACCOUNT query only fetches name/email/orders. BillingAddressInput and CartAddressInput accept customer_address_uid / customer_address_id.
  - _Build:_ Extend the customer query to fetch customer.addresses{ uid, firstname, lastname, street, city, region, postcode, country_code, telephone, default_shipping, default_billing }. In the shipping step for token-bearing carts, render a saved-address radio list; selecting one sends shipping_addresses:[{customer_address_uid}] to setShippingAddressesOnCart instead of a literal address. Provide an 'add new address' fallback to the AddressForm. This overlaps with the Addresses domain (createCustomerAddress) — coordinate so the address-book CRUD lives in /account and is reused here.
  - _Artifacts:_ `storefront/src/lib/queries.ts (CUSTOMER_ADDRESSES)`, `storefront/src/lib/checkout-actions.ts`, `storefront/src/components/checkout/SavedAddressPicker.tsx`
  - _Depends on:_ Shipping address form; Customer auth (built); Address book (Addresses domain)
- **Shipping method selection (rates list + estimate)** — ⬜ missing · P0 · M
  - _Gap:_ Verified AvailableShippingMethod fields: carrier_code, method_code, carrier_title, method_title, amount, available, error_message, price_incl_tax. ShippingMethodInput = { carrier_code, method_code }. Methods only appear after a shipping address is set.
  - _Build:_ RSC/step reads shipping_addresses[0].available_shipping_methods from the cart after the address is set. Render a radio list of available methods (filter available==true), label with carrier_title + method_title + formatMoney(amount). Server Action setShippingMethodAction(carrierCode, methodCode) calls setShippingMethodsOnCart(input:{cart_id, shipping_methods:[{carrier_code, method_code}]}). Optionally use estimateShippingMethods(input:{cart_id, address:{country_code, region_id, postcode}}) to preview rates before a full address is saved (e.g. on the cart page), but the canonical source is the post-address cart. Recompute totals after selection (shipping line appears in prices).
  - _Artifacts:_ `storefront/src/lib/checkout-actions.ts`, `storefront/src/lib/queries.ts (SET_SHIPPING_METHOD, ESTIMATE_SHIPPING)`, `storefront/src/components/checkout/ShippingMethodStep.tsx`
  - _Depends on:_ Shipping address form
- **In-store pickup (pickupLocations / click-and-collect)** — ⬜ missing · P3 · L
  - _Gap:_ Verified pickupLocations args: area, filters, sort, pageSize, currentPage, productsInfo. ShippingCartAddress has pickup_location_code. Requires Inventory In-Store Delivery / source selection configured in admin — likely OFF by default on vanilla Luma, so this is conditional.
  - _Build:_ Feature-flag behind storeConfig/admin availability. RSC reads pickupLocations(area:{search_term/radius} or filters) to list stores; selecting a store sends setShippingAddressesOnCart with shipping_addresses:[{ pickup_location_code, ...store address }] then setShippingMethodsOnCart with carrier_code 'instore'/method 'pickup'. Treat as an alternate branch of the shipping step (toggle 'Ship' vs 'Pick up in store'). Low priority for a Luma demo since sources/MSI pickup are usually not enabled; build only if the catalog is configured for it.
  - _Artifacts:_ `storefront/src/lib/queries.ts (PICKUP_LOCATIONS)`, `storefront/src/lib/checkout-actions.ts`, `storefront/src/components/checkout/PickupStep.tsx`
  - _Depends on:_ Shipping method selection; MSI/in-store-delivery enabled in admin
- **Billing address (same-as-shipping toggle + separate form)** — ⬜ missing · P0 · M
  - _Gap:_ Verified BillingAddressInput = { address, customer_address_id, customer_address_uid, same_as_shipping, use_for_shipping }. For a virtual cart (is_virtual=true) there is no shipping step so billing is mandatory and standalone.
  - _Build:_ Default 'billing same as shipping' checkbox -> Server Action setBillingAddressAction calls setBillingAddressOnCart(input:{cart_id, billing_address:{ same_as_shipping:true }}). When unchecked, reuse AddressForm and send billing_address:{ address:{...} } (or customer_address_uid for saved). For virtual/downloadable-only carts (is_virtual), render the billing address as its own first step and skip shipping entirely. Typically set just before or together with the payment step.
  - _Artifacts:_ `storefront/src/lib/checkout-actions.ts`, `storefront/src/lib/queries.ts (SET_BILLING_ADDRESS)`, `storefront/src/components/checkout/BillingStep.tsx`
  - _Depends on:_ Shipping address form; Checkout route shell
- **Payment method selection — offline methods (Check/Money Order, Bank Transfer, Cash on Delivery, Purchase Order)** — ⬜ missing · P0 · M
  - _Gap:_ Verified available_payment_methods{ code, title, is_deferred } on cart and PaymentMethodInput supports plain { code } plus purchase_order_number. checkmo (Check/Money Order) is enabled on default Luma, giving a zero-integration end-to-end order.
  - _Build:_ RSC reads cart.available_payment_methods. Render a radio list; for offline codes (checkmo, banktransfer, cashondelivery) the Server Action setPaymentMethodAction(code) just calls setPaymentMethodOnCart(input:{cart_id, payment_method:{ code }}). For purchase order, also pass purchase_order_number. No SDK, no token, no redirect — after this + agreements you can call placeOrder directly. Make this the default/only path for the demo and gate the gateway features below behind config detection.
  - _Artifacts:_ `storefront/src/lib/checkout-actions.ts`, `storefront/src/lib/queries.ts (SET_PAYMENT_METHOD)`, `storefront/src/components/checkout/PaymentStep.tsx`
  - _Depends on:_ Billing address; Shipping method selection
- **Payment method selection — online gateways (PayPal Express, Braintree, Payflow, Payment Services) with deferred/redirect flow** — ⬜ missing · P2 · XL
  - _Gap:_ Large surface: PaymentMethodInput has braintree*, paypal_express, payflow*, payment_services_paypal_* variants and the schema exposes is_deferred plus completeOrder, meaning redirect gateways place the order then complete it after the gateway round-trip. Requires merchant credentials configured in admin — out of scope for a credential-less Luma demo.
  - _Build:_ Only build if a real gateway is configured. Pattern: read getPaymentConfig/getPaymentSDK to load the gateway client lib in a 'use client' component; for Braintree call createBraintreeClientToken, tokenize the card client-side, then setPaymentMethodOnCart with payment_method:{ braintree:{ payment_method_nonce, is_active_payment_token_enabler }}. For PayPal Express, createPaypalExpressToken -> redirect to PayPal -> on return placeOrder. For deferred methods (is_deferred=true / Payment Services) use createPaymentOrder + after gateway approval completeOrder/syncPaymentOrder rather than placeOrder. Stored cards via customerPaymentTokens/createVaultCardPaymentToken belong to the Payments domain. Keep all gateway secrets server-side; only the public SDK/client token reaches the browser.
  - _Artifacts:_ `storefront/src/lib/checkout-actions.ts`, `storefront/src/lib/queries.ts (gateway ops)`, `storefront/src/components/checkout/gateways/*.tsx`
  - _Depends on:_ Payment method selection (offline); Gateway credentials configured in admin; Payments/Vault domain
- **Checkout agreements / terms-and-conditions consent** — ⬜ missing · P1 · S
  - _Gap:_ Verified checkoutAgreements returns [{ agreement_id, checkbox_text, content, content_height, is_html, mode, name }]. Returns empty unless an agreement is configured in admin (Stores > Terms and Conditions), so render conditionally.
  - _Build:_ RSC reads checkoutAgreements (cached, tag 'agreements'). If any are returned, render each as a required checkbox in the review step using checkbox_text and content (respect is_html and mode = MANUAL/AUTO). Block the Place Order button until all manual agreements are checked (client-side gating + re-validate server-side in the placeOrder action). Note: current GraphQL placeOrder has no explicit agreement-acceptance argument, so enforcement is UI-side plus the server config; capture acceptance state before calling placeOrder.
  - _Artifacts:_ `storefront/src/lib/queries.ts (CHECKOUT_AGREEMENTS)`, `storefront/src/lib/checkout.ts`, `storefront/src/components/checkout/Agreements.tsx`
  - _Depends on:_ Checkout route shell
- **Order review / summary with live totals (tax, shipping, discount, grand total)** — 🟡 partial · P0 · M
  - _Gap:_ The cart page shows subtotal + grand_total only (CART_QUERY). Checkout needs the full prices breakdown: applied_taxes, discounts, shipping line, and grand_total reflecting the chosen method — none of which are queried today.
  - _Build:_ Extend the checkout cart query with prices{ subtotal_excluding_tax, subtotal_including_tax, applied_taxes{ amount label }, discounts{ amount label }, grand_total } plus shipping_addresses[0].selected_shipping_method{ amount carrier_title method_title } and selected_payment_method{ title }. Render a sticky order-summary card (reuse the cart summary styling) that updates via router.refresh() after each step mutation. Show the chosen address/method/payment as read-only confirmations with 'edit' links back to each step.
  - _Artifacts:_ `storefront/src/lib/queries.ts (CHECKOUT_CART)`, `storefront/src/lib/types.ts (CheckoutCart, applied taxes/discounts)`, `storefront/src/components/checkout/OrderSummary.tsx`, `storefront/src/components/checkout/ReviewStep.tsx`
  - _Depends on:_ Checkout route shell; Shipping method selection; Payment method selection
- **Coupon / discount code entry in checkout** — ⬜ missing · P1 · S
  - _Gap:_ applyCouponToCart/removeCouponFromCart exist on the surface; cart exposes applied_coupons. Not built in cart or checkout. Overlaps with the Promotions/Coupons domain — implement once, reuse in both /cart and /checkout.
  - _Build:_ Server Actions applyCouponAction(code)/removeCouponAction() calling applyCouponToCart(input:{cart_id, coupon_code}) / removeCouponFromCart(input:{cart_id}) with the active cart context. Surface user-facing errors (invalid/expired code) from the GraphQL error. Render a small coupon field in the order summary; on success router.refresh() so discounts and grand_total update. Read cart.applied_coupons{ code } to show the applied state with a remove button.
  - _Artifacts:_ `storefront/src/lib/checkout-actions.ts (or shared cart actions.ts)`, `storefront/src/lib/queries.ts (APPLY_COUPON, REMOVE_COUPON)`, `storefront/src/components/checkout/CouponField.tsx`
  - _Depends on:_ Order review/summary
- **Place order (immediate / offline path)** — ⬜ missing · P0 · M
  - _Gap:_ Critical 2.4.9 change verified: PlaceOrderOutput = { orderV2 (CustomerOrder), errors[PlaceOrderError] } — NOT the legacy order.order_number string. PlaceOrderInput = { cart_id } only.
  - _Build:_ Server Action placeOrderAction() calls placeOrder(input:{cart_id}) requesting { orderV2{ number, token, total{ grand_total{ value currency } } }, errors{ code message } }. If errors is non-empty, return them to the UI (do NOT clear cart). On success: capture order number + token, delete the guest_cart_id cookie (guest) so a fresh cart is created next time, revalidate '/', '/cart', '/account', then redirect('/checkout/success?order=<number>&token=<token>'). Keep the no-store transport. Guard the action: re-check that email/shipping/method/billing/payment are all set (defensive) before calling. For deferred gateways branch to completeOrder instead (see online gateways feature).
  - _Artifacts:_ `storefront/src/lib/checkout-actions.ts`, `storefront/src/lib/queries.ts (PLACE_ORDER)`, `storefront/src/lib/types.ts (PlaceOrderResult)`, `storefront/src/components/checkout/PlaceOrderButton.tsx`
  - _Depends on:_ Set payment method; Billing address; Shipping method; Checkout agreements
- **Order confirmation / success page** — ⬜ missing · P0 · M
  - _Gap:_ Verified CustomerOrder fields available for display: number, order_date, status, total, items, shipping_address, billing_address, shipping_method, payment_methods, email, token. placeOrder.orderV2 already returns the order, so the success page can render largely from the place-order result + a re-fetch.
  - _Build:_ New route app/checkout/success/page.tsx (RSC). Simplest: render from the data returned by placeOrder (number, total) passed via redirect query/searchParams, then for richer detail re-fetch: logged-in customers via customer.orders filtered to the number; guests via guestOrder(input:{ number, email }) or guestOrderByToken(input:{ token }) using the token captured from placeOrder.orderV2.token. Show order number prominently, line items, both addresses, shipping + payment method, grand total, and a 'continue shopping' CTA. Set noindex. This is also the foundation for the guest-order-status/lookup and order-detail features in the Account domain.
  - _Artifacts:_ `storefront/src/app/checkout/success/page.tsx`, `storefront/src/lib/queries.ts (GUEST_ORDER, GUEST_ORDER_BY_TOKEN)`, `storefront/src/lib/types.ts (Order detail)`, `storefront/src/components/checkout/OrderConfirmation.tsx`
  - _Depends on:_ Place order
- **Checkout error handling, validation, and recovery** — ⬜ missing · P1 · M
  - _Gap:_ No error UX exists for checkout; current actions mostly swallow exceptions. placeOrder can fail with PlaceOrderError codes (cart not active, item availability, etc) and customer_token expires after ~1h (TOKEN_MAX_AGE in auth.ts).
  - _Build:_ Standardize each checkout Server Action to return { ok, errors[] } like addToCartAction does, surfacing GraphQL/user_errors to the step UI rather than throwing. Handle: (1) expired customer_token mid-checkout -> resolveCartContext already falls back to guest; detect 'unauthorized' and prompt re-login preserving the cart; (2) item went out of stock -> show on review and link back to cart; (3) placeOrder.errors -> render inline, keep cart intact; (4) re-validate required steps server-side in placeOrderAction. Use Next error.tsx for the /checkout segment as a backstop.
  - _Artifacts:_ `storefront/src/lib/checkout-actions.ts`, `storefront/src/app/checkout/error.tsx`, `storefront/src/components/checkout/StepError.tsx`
  - _Depends on:_ Place order; Each checkout step
- **Virtual / downloadable cart checkout (no-shipping path)** — ⬜ missing · P3 · S
  - _Gap:_ cart.is_virtual is exposed. For is_virtual carts there are no shipping_addresses/shipping methods and billing becomes the primary address step. Virtual/downloadable product types are themselves not built yet, so this is conditional on that catalog work.
  - _Build:_ In the checkout shell, branch on cart.is_virtual: skip the shipping address + shipping method steps, make billing address the first address step (setBillingAddressOnCart only), then payment + place order. The order summary omits the shipping line. Low priority until virtual/downloadable add-to-cart (addVirtualProductsToCart/addDownloadableProductsToCart) exists in the catalog domain.
  - _Artifacts:_ `storefront/src/app/checkout/page.tsx`, `storefront/src/components/checkout/CheckoutStepper.tsx`
  - _Depends on:_ Checkout route shell; Billing address; Virtual/downloadable product types (Catalog domain)
- **Express checkout entry / cart-to-checkout handoff** — 🟡 partial · P0 · S
  - _Gap:_ Cart page exists but its checkout button is a disabled demo stub. No guest-vs-login branch before checkout.
  - _Build:_ Replace the disabled button in cart/page.tsx (lines 102-108) with a Link to /checkout. On /checkout entry, if no customer_token, show a lightweight 'Continue as guest' vs 'Sign in' choice (sign-in routes through existing /login then back to /checkout via a returnTo param; login already merges the guest cart via mergeGuestCart). Ensure a guest cart exists (getWritableCart logic) before entering. Keep it minimal — the real work is the steps above.
  - _Artifacts:_ `storefront/src/app/cart/page.tsx`, `storefront/src/app/checkout/page.tsx`, `storefront/src/components/checkout/GuestOrLogin.tsx`, `storefront/src/app/login/page.tsx (returnTo support)`
  - _Depends on:_ Checkout route shell; Customer auth (built)

</details>

**Domain gotchas:**
- placeOrder in 2.4.9 returns { orderV2: CustomerOrder, errors: [PlaceOrderError] } NOT the legacy { order: { order_number } }. Query orderV2{ number, token, total } and check errors[] before treating it as success. Building against the old shape (still common in tutorials/training data) will silently break.
- Checkout is a stateful server-side machine on the cart: available_shipping_methods only populate AFTER setShippingAddressesOnCart, and available_payment_methods/grand_total only finalize after shipping is chosen. You must order the mutations correctly and re-read the cart between steps — do not cache the cart (no-store).
- There is a deferred-payment path: AvailablePaymentMethod.is_deferred + the completeOrder mutation + createPaymentOrder/syncPaymentOrder. Redirect gateways (PayPal, Payment Services) do NOT finish with placeOrder alone. For the Luma demo, use offline 'checkmo' (Check/Money Order) which is enabled by default and needs zero of this.
- setShippingAddressesOnCart and setBillingAddressOnCart take subtly different inputs: shipping is a LIST (shipping_addresses:[...]) each wrapping {address} or {customer_address_uid}; billing is a single billing_address with same_as_shipping/use_for_shipping flags. region must be region_id for fixed-region countries (US/CA) and a region string otherwise — countries query gives available_regions to decide.
- checkoutAgreements and pickupLocations return empty/error unless enabled in admin (Terms & Conditions; MSI in-store delivery). Render them conditionally; on vanilla Luma they are typically OFF, so don't make the flow depend on them.
- Guest vs customer cart is already abstracted by resolveCartContext()/getWritableCart() — reuse it; never hardcode guest_cart_id. After a successful placeOrder, delete the guest_cart_id cookie so the next visit gets a fresh cart (the old masked id is now consumed/inactive).
- customer_token expires ~1 hour (TOKEN_MAX_AGE = 3600 in auth.ts). A long checkout can outlive it; detect the unauthorized error mid-flow and recover to guest or re-login without losing the cart.
- All checkout mutations are Server Actions over the existing server-only magentoFetch with cache:'no-store'; secrets stay in httpOnly cookies. Only public gateway SDK/client tokens (createBraintreeClientToken etc.) may reach the browser — never the customer_token.
- The success/confirmation page can read back a guest order via guestOrder(number,email) or by the token returned on placeOrder.orderV2.token; logged-in orders come from customer.orders. Plan the order_number + token capture at placeOrder time since the cart is gone afterward.
- Coupons (applyCouponToCart/removeCouponFromCart) and the address book (createCustomerAddress) overlap with the Promotions and Addresses domains — implement them once as shared cart/account utilities and reuse in checkout to avoid divergence.

### 8.5 Payments & Vault

In Magento headless, payment is the tail end of the cart->checkout pipeline: after email + shipping address + shipping method are set, the cart exposes available_payment_methods; you then setPaymentMethodOnCart(payment_method:{code,...gateway input}) and placeOrder(cart_id) which returns orderV2. This maps cleanly to our stack: reads (available/selected methods, vault config, saved tokens) are RSC server-to-server calls via magentoFetch, and every state change (set payment method, place order, save/delete a card) is a Server Action carrying the customer_token or guest_cart_id from httpOnly cookies. CRITICAL live finding: I probed the running instance end-to-end and only checkmo (Check / Money order) is actually enabled. Braintree, PayPal Express, Payflow, and PayPal Payment Services (getPaymentConfig/getVaultConfig/getPaymentSDK) all exist in the GraphQL schema but are NOT configured in admin, so they never appear in available_payment_methods and any nonce/token flow will fail until an admin configures sandbox credentials. I verified a real guest order (#000000003, status Pending) places successfully with checkmo, so the correct strategy is: ship offline (checkmo) first to make checkout completable, then layer Braintree hosted-fields + vault behind an admin-config flag. Note that the entire checkout route and the address/shipping-method steps that gate payment do not exist yet, so Payments depends heavily on the Checkout domain.

| Feature | Status | Pri | Eff | GraphQL ops |
|---|---|:--:|:--:|---|
| Read available payment methods on cart | ⬜ missing | P0 | S | `cart` |
| Offline method: Check / Money order (checkmo) | ⬜ missing | P0 | M | `setPaymentMethodOnCart` `placeOrder` |
| Other offline methods: Bank Transfer / Cash on Delivery / Purchase Order | ⬜ missing | P3 | S | `setPaymentMethodOnCart` `placeOrder` |
| Braintree credit card via Hosted Fields (nonce flow) | ⬜ missing | P1 | L | `createBraintreeClientToken` `setPaymentMethodOnCart` `placeOrder` |
| Braintree 3-D Secure (SCA) | ⬜ missing | P2 | M | `createBraintreeClientToken` `setPaymentMethodOnCart` `placeOrder` |
| Vault: save card during checkout | ⬜ missing | P2 | S | `setPaymentMethodOnCart` `placeOrder` |
| Vault: pay with a saved card (braintree_cc_vault) | ⬜ missing | P2 | M | `customerPaymentTokens` `createBraintreeClientToken` `setPaymentMethodOnCart` `placeOrder` |
| Account: manage saved payment methods (list + delete) | ⬜ missing | P2 | M | `customerPaymentTokens` `deletePaymentToken` |
| PayPal Express Checkout (redirect flow) | ⬜ missing | P2 | L | `createPaypalExpressToken` `setPaymentMethodOnCart` `placeOrder` |
| PayPal Payflow Link / Payflow Pro | ⬜ missing | P3 | XL | `getPayflowLinkToken` `createPayflowProToken` `handlePayflowProResponse` `setPaymentMethodOnCart` `placeOrder` |
| PayPal Payment Services config/SDK (getPaymentConfig/getVaultConfig/getPaymentSDK) | ⬜ missing | P3 | XL | `getPaymentConfig` `getPaymentSDK` `getVaultConfig` `createPaymentOrder` `getPaymentOrder` +4 |
| Place-order error handling & idempotency | ⬜ missing | P0 | M | `placeOrder` `setPaymentMethodOnCart` |
| Order confirmation / success page (guest + customer) | ⬜ missing | P1 | S | `placeOrder` `guestOrder` `guestOrderByToken` `customer` |

<details><summary><strong>Build notes</strong> (13 items)</summary>

- **Read available payment methods on cart** — ⬜ missing · P0 · S
  - _Gap:_ Cart reads exist (CART_QUERY in queries.ts) but do NOT select available_payment_methods/selected_payment_method, and there is no checkout route to render them. Live-verified: available_payment_methods only populates after a shipping address + email exist on the cart; on a bare cart it is empty.
  - _Build:_ Extend CART_QUERY (or add a dedicated CHECKOUT_PAYMENT_QUERY) in src/lib/queries.ts to select available_payment_methods{code title} and selected_payment_method{code title purchase_order_number}. Read in the checkout payment-step RSC via getCart()/a new getCheckoutCart() in src/lib/cart-data.ts using resolveCartContext() (cookie token or guest id). Render as a radio list in a new client component PaymentMethods.tsx.
  - _Artifacts:_ `src/lib/queries.ts`, `src/lib/cart-data.ts`, `src/lib/types.ts`, `src/app/checkout/payment/page.tsx`, `src/components/checkout/PaymentMethods.tsx`
  - _Depends on:_ Checkout: cart with email + shipping address + shipping method set (setGuestEmailOnCart/setShippingAddressesOnCart/setShippingMethodsOnCart)
- **Offline method: Check / Money order (checkmo)** — ⬜ missing · P0 · M
  - _Gap:_ Not built. Verified working live end-to-end: setPaymentMethodOnCart(input:{cart_id, payment_method:{code:"checkmo"}}) then placeOrder(input:{cart_id}) returned orderV2{number:"000000003", status:"Pending"}, errors:null.
  - _Build:_ Add SET_PAYMENT_METHOD and PLACE_ORDER ops to queries.ts. New Server Action setPaymentMethodAction(code) and placeOrderAction() in a new src/lib/checkout-actions.ts: resolve writable cart like getWritableCart() in actions.ts (token vs guest_cart_id cookie), call setPaymentMethodOnCart with {code:"checkmo"}, then placeOrder. On success read orderV2.number, clear the guest_cart_id cookie (order consumes the cart), revalidatePath('/','layout'), and redirect to /checkout/success?order=NUMBER. placeOrder returns errors{code message} — surface them.
  - _Artifacts:_ `src/lib/queries.ts`, `src/lib/checkout-actions.ts`, `src/components/checkout/PaymentMethods.tsx`, `src/components/checkout/PlaceOrderButton.tsx`, `src/app/checkout/success/page.tsx`
  - _Depends on:_ Read available payment methods on cart; Checkout: billing address (setBillingAddressOnCart); Checkout: shipping method set
- **Other offline methods: Bank Transfer / Cash on Delivery / Purchase Order** — ⬜ missing · P3 · S
  - _Gap:_ Schema supports them (PaymentMethodInput has purchase_order_number; banktransfer/cashondelivery use code only). Live-verified these are DISABLED in admin right now — only checkmo appears in available_payment_methods. Build only on demand.
  - _Build:_ Same Server Action path as checkmo, keyed off the code returned by available_payment_methods (banktransfer, cashondelivery). For purchaseorder, render a required text input and pass payment_method:{code:"purchaseorder", purchase_order_number}. Driving the radio list off available_payment_methods means these light up automatically when enabled in admin — no code change needed for banktransfer/cod.
  - _Artifacts:_ `src/components/checkout/PaymentMethods.tsx`, `src/lib/checkout-actions.ts`
  - _Depends on:_ Offline method: Check / Money order (checkmo)
- **Braintree credit card via Hosted Fields (nonce flow)** — ⬜ missing · P1 · L
  - _Gap:_ Schema present: createBraintreeClientToken returns a String (the client token); PaymentMethodInput.braintree is BraintreeInput{payment_method_nonce, device_data, is_active_payment_token_enabler}. LIVE-VERIFIED Braintree is NOT enabled (does not appear in available_payment_methods) — requires sandbox merchant credentials in admin before any of this works. This is the recommended online method to build second.
  - _Build:_ Two parts. (1) Server: add CREATE_BRAINTREE_CLIENT_TOKEN to queries.ts; a Server Action getBraintreeClientToken() returns the token string to the client (token itself is safe to expose; it is short-lived and merchant-scoped). (2) Client: a BraintreeHostedFields.tsx client component loads braintree-web (or dropin) via npm/CDN, mounts hosted fields, calls tokenize() to get payment_method_nonce + device_data — card data never touches our server (PCI SAQ-A). Submit nonce to a placeOrderBraintreeAction(nonce, deviceData, saveCard) Server Action that calls setPaymentMethodOnCart(payment_method:{code:"braintree", braintree:{payment_method_nonce, device_data, is_active_payment_token_enabler:saveCard}}) then placeOrder. Gate the whole option behind a NEXT_PUBLIC_BRAINTREE_ENABLED flag or detect code==='braintree' in available_payment_methods so it stays hidden until configured.
  - _Artifacts:_ `src/lib/queries.ts`, `src/lib/checkout-actions.ts`, `src/components/checkout/BraintreeHostedFields.tsx`, `src/app/checkout/payment/page.tsx`
  - _Depends on:_ Read available payment methods on cart; Offline method: Check / Money order (checkmo); Admin: Braintree sandbox credentials configured
- **Braintree 3-D Secure (SCA)** — ⬜ missing · P2 · M
  - _Gap:_ No Magento op change — 3DS is a client-side step in braintree-web (threeDSecure.verifyCard) that upgrades the nonce before it is sent to placeOrder. Only relevant once Braintree is enabled and 3DS is turned on in admin.
  - _Build:_ Extend BraintreeHostedFields.tsx: after tokenize(), call braintree threeDSecure.verifyCard({nonce, amount, billingAddress, onLookupComplete}) and submit the resulting (verified) nonce to placeOrderBraintreeAction. Amount comes from the cart grand_total (read server-side, passed to the client component). Handle the challenge iframe/modal and the cancelled/failed paths.
  - _Artifacts:_ `src/components/checkout/BraintreeHostedFields.tsx`
  - _Depends on:_ Braintree credit card via Hosted Fields (nonce flow)
- **Vault: save card during checkout** — ⬜ missing · P2 · S
  - _Gap:_ For Braintree, saving is driven by BraintreeInput.is_active_payment_token_enabler:true on setPaymentMethodOnCart at place-order time (requires a logged-in customer_token; guests cannot vault). The dedicated createVaultCardSetupToken/createVaultCardPaymentToken ops belong to the PayPal Payment Services module, which is not enabled here.
  - _Build:_ Add a 'Save this card' checkbox in BraintreeHostedFields.tsx, only shown when a customer_token cookie exists. Pass is_active_payment_token_enabler through placeOrderBraintreeAction into the braintree input. No extra round-trip; the token is vaulted by the gateway during placeOrder.
  - _Artifacts:_ `src/components/checkout/BraintreeHostedFields.tsx`, `src/lib/checkout-actions.ts`
  - _Depends on:_ Braintree credit card via Hosted Fields (nonce flow); Customer auth (existing)
- **Vault: pay with a saved card (braintree_cc_vault)** — ⬜ missing · P2 · M
  - _Gap:_ Schema present: customerPaymentTokens (no args, bearer token) returns items{public_hash, payment_method_code, details(JSON string), type(card\|account)}. PaymentMethodInput.braintree_cc_vault is BraintreeCcVaultInput{public_hash, device_data}. Requires both Braintree enabled and a vaulted card.
  - _Build:_ RSC read: add CUSTOMER_PAYMENT_TOKENS to queries.ts, fetch in checkout payment step with the customer_token cookie; parse the details JSON (maskedCC, type, expiry) for display. Client: SavedCards.tsx radio list. Server Action placeOrderVaultAction(publicHash, deviceData): setPaymentMethodOnCart(payment_method:{code:"braintree_cc_vault", braintree_cc_vault:{public_hash, device_data}}) then placeOrder. Customer-only (no token cookie => hide).
  - _Artifacts:_ `src/lib/queries.ts`, `src/lib/types.ts`, `src/components/checkout/SavedCards.tsx`, `src/lib/checkout-actions.ts`
  - _Depends on:_ Vault: save card during checkout; Customer auth (existing)
- **Account: manage saved payment methods (list + delete)** — ⬜ missing · P2 · M
  - _Gap:_ Schema present: deletePaymentToken(public_hash:String) returns DeletePaymentTokenOutput. customerPaymentTokens returns the list. No /account/payment route exists; the /account page only shows profile + orders today.
  - _Build:_ New route src/app/account/payment/page.tsx (RSC) reads CUSTOMER_PAYMENT_TOKENS with the customer_token cookie, parses details JSON for masked PAN/expiry/brand. A client component with a delete button calls a Server Action deletePaymentTokenAction(publicHash) -> deletePaymentToken(public_hash:$h) with the token, then revalidatePath('/account/payment'). Add a link from /account. Guard: redirect to /login if no token cookie.
  - _Artifacts:_ `src/app/account/payment/page.tsx`, `src/components/account/SavedCardsManager.tsx`, `src/lib/queries.ts`, `src/lib/auth.ts`, `src/lib/types.ts`
  - _Depends on:_ Customer auth (existing); Vault: save card during checkout
- **PayPal Express Checkout (redirect flow)** — ⬜ missing · P2 · L
  - _Gap:_ Schema present: createPaypalExpressToken(input:PaypalExpressTokenInput) returns PaypalExpressTokenOutput{token, paypal_urls}. Set method with paypal_express{payer_id, token}. LIVE-VERIFIED PayPal is NOT enabled here (absent from available_payment_methods) — needs PayPal API credentials in admin.
  - _Build:_ Server Action createPaypalTokenAction: createPaypalExpressToken(input:{cart_id, code:"paypal_express", urls:{return_url, cancel_url}}) -> redirect the browser to paypal_urls.start. On return to a new route /checkout/paypal/return, read token+PayerID from the query string, Server Action: setPaymentMethodOnCart(payment_method:{code:"paypal_express", paypal_express:{token, payer_id}}) then placeOrder -> /checkout/success. Must hide unless code is in available_payment_methods.
  - _Artifacts:_ `src/lib/queries.ts`, `src/lib/checkout-actions.ts`, `src/app/checkout/paypal/return/route.ts`, `src/components/checkout/PaymentMethods.tsx`
  - _Depends on:_ Read available payment methods on cart; Offline method: Check / Money order (checkmo); Admin: PayPal credentials configured
- **PayPal Payflow Link / Payflow Pro** — ⬜ missing · P3 · XL
  - _Gap:_ Schema present (getPayflowLinkToken(input:PayflowLinkTokenInput), createPayflowProToken returns CreatePayflowProTokenOutput, handlePayflowProResponse, PaymentMethodInput.payflow_link/payflow_express/payflowpro/payflowpro_cc_vault). LIVE-VERIFIED not enabled. Lower priority than Braintree/PayPal Express; only build if the merchant specifically uses Payflow.
  - _Build:_ Payflow Link: getPayflowLinkToken -> redirect to hosted page -> handle return. Payflow Pro: createPayflowProToken (secure token) -> client iframe collects card -> handlePayflowProResponse -> setPaymentMethodOnCart{code:"payflowpro"} -> placeOrder. Both are redirect/iframe-heavy; implement as Server Actions plus dedicated return route handlers under /checkout/payflow. Defer until a merchant requires Payflow.
  - _Artifacts:_ `src/lib/queries.ts`, `src/lib/checkout-actions.ts`, `src/app/checkout/payflow/return/route.ts`
  - _Depends on:_ Read available payment methods on cart; Admin: Payflow credentials configured
- **PayPal Payment Services config/SDK (getPaymentConfig/getVaultConfig/getPaymentSDK)** — ⬜ missing · P3 · XL
  - _Gap:_ These ops belong to the magento/module-payment-services-paypal suite. getVaultConfig returns VaultConfigOutput{credit_card{...}} (I confirmed the credit_card field exists but is_vault_enabled-style fields differ from older Braintree vault). getPaymentConfig(location:PaymentLocation) and getPaymentSDK(location) take a PaymentLocation enum. PaymentMethodInput has payment_services_paypal_* inputs and there is a createPaymentOrder/getPaymentOrder/syncPaymentOrder order-bridge flow. LIVE-VERIFIED the module is installed (types resolve) but NOT configured (no payment_services_* methods in available_payment_methods). This is an alternative to legacy Braintree/Express; pick one.
  - _Build:_ Only pursue if the merchant adopts PayPal Payment Services instead of Braintree. Pattern: RSC/Server-Action getPaymentConfig(location:CART or CHECKOUT) + getPaymentSDK to get script URLs + getVaultConfig for vault availability; load the PayPal JS SDK client-side; for the smart-buttons/applepay/googlepay flows use createPaymentOrder->approve->syncPaymentOrder/getPaymentOrder->placeOrder. High complexity; treat as a separate initiative from the Braintree path and do not build both.
  - _Artifacts:_ `src/lib/queries.ts`, `src/lib/checkout-actions.ts`, `src/components/checkout/PayPalPaymentServices.tsx`
  - _Depends on:_ Read available payment methods on cart; Admin: PayPal Payment Services configured; Decision: PayPal Payment Services vs Braintree
- **Place-order error handling & idempotency** — ⬜ missing · P0 · M
  - _Gap:_ placeOrder returns orderV2 + errors{code message} (PlaceOrderOutput.errors is PlaceOrderError) rather than throwing for business errors — must be read explicitly. No place-order UI exists yet.
  - _Build:_ In placeOrderAction, after placeOrder read result.errors and map known codes (CART_NOT_ACTIVE, UNDEFINED, payment declines from the gateway) to friendly messages returned via the Server Action's useActionState shape (mirror AuthState in auth.ts). Disable the PlaceOrderButton while pending; only clear the guest_cart_id cookie on a successful orderV2.number so a retry reuses the same cart. For Braintree, a declined nonce must let the shopper re-tokenize without losing the cart.
  - _Artifacts:_ `src/lib/checkout-actions.ts`, `src/components/checkout/PlaceOrderButton.tsx`
  - _Depends on:_ Offline method: Check / Money order (checkmo)
- **Order confirmation / success page (guest + customer)** — ⬜ missing · P1 · S
  - _Gap:_ placeOrder returns orderV2 with number/status (verified status 'Pending' for checkmo). guestOrder(input) and guestOrderByToken(input) allow guest order lookup; logged-in customers can read via the existing customer.orders query in CUSTOMER_ACCOUNT.
  - _Build:_ New /checkout/success page reads the order number from the redirect (set by placeOrderAction). For richer detail, guests use guestOrder(input:{number,email,...}) via a Server Action; customers reuse the existing account orders read. Keep it minimal for the offline MVP (just number + status + 'we emailed you'), expand later.
  - _Artifacts:_ `src/app/checkout/success/page.tsx`, `src/lib/queries.ts`
  - _Depends on:_ Offline method: Check / Money order (checkmo)

</details>

**Domain gotchas:**
- LIVE-VERIFIED: only checkmo (Check / Money order) is enabled in this instance. Braintree, PayPal Express, Payflow, and PayPal Payment Services all exist in the GraphQL schema but are NOT configured in admin, so they never appear in cart.available_payment_methods and any nonce/token call will fail. Build offline (checkmo) first; gate every online method behind presence in available_payment_methods so they auto-appear once an admin adds sandbox credentials.
- available_payment_methods is empty until the cart has an email AND a shipping address (and effectively a shipping method). I confirmed this on a live guest cart — querying payment methods on a bare cart returns nothing. Payment is therefore strictly downstream of the Checkout domain (setGuestEmailOnCart/setShippingAddressesOnCart/setShippingMethodsOnCart/setBillingAddressOnCart).
- The entire checkout pipeline is unbuilt. Payments cannot ship without the address + shipping-method steps that gate it. Treat Payments as part of one Checkout epic, not standalone.
- placeOrder reports business failures via the errors{code message} field on PlaceOrderOutput, not by throwing — magentoFetch only throws on transport/GraphQL errors. You must explicitly read placeOrder.errors and orderV2.
- placeOrder consumes the cart: after success the guest_cart_id cookie must be deleted (and a customer's cart auto-recreates on next read). Only clear the cookie on a real orderV2.number to keep retries on the same cart and avoid orphaning a paid order.
- createBraintreeClientToken returns a bare String (the client token), not an object. The token is safe to send to the browser (short-lived, merchant-scoped). Actual card data is tokenized client-side by braintree-web into payment_method_nonce — it must never hit our server (keeps us at PCI SAQ-A).
- Vaulting is customer-only: is_active_payment_token_enabler / braintree_cc_vault require a customer_token cookie. Guests cannot save or reuse cards. customerPaymentTokens takes no args and authenticates purely via the bearer token; its items[].details is a JSON string you must parse for masked PAN/expiry/brand.
- There are two distinct PayPal stacks in this schema: legacy Braintree + PayPal Express (createBraintreeClientToken / createPaypalExpressToken) and the newer PayPal Payment Services (getPaymentConfig/getVaultConfig/getPaymentSDK + createPaymentOrder/getPaymentOrder/syncPaymentOrder, with payment_services_paypal_* inputs). getVaultConfig.credit_card belongs to the latter. Do not mix them — pick one online provider.
- PaymentTokenTypeEnum is card|account, and PaymentMethodInput exposes many vault variants (braintree_cc_vault, braintree_paypal_vault, payflowpro_cc_vault, payment_services_paypal_vault). Match the vault code to how the token was originally created (payment_method_code on the saved token), or setPaymentMethodOnCart will reject it.
- Secrets stay server-side per existing pattern: customer_token and guest_cart_id are httpOnly cookies read only inside Server Actions / RSC via cart-cookies.ts. The only thing crossing to the browser for payments is the Braintree/PayPal client token and the card nonce — never the customer bearer token.

### 8.6 Customer Account & Addresses

This domain covers everything a logged-in shopper does to manage their identity after the existing register/login/logout/profile-view flow: an address book (CRUD with country/region selects), editing account info (name/email/password), self-service password reset, email confirmation, and account deletion. It maps cleanly onto our headless stack: all reads are token-authenticated and inherently per-user, so they belong in RSC pages calling magentoFetch with the customer_token from the httpOnly cookie (never cached — these must be cache:'no-store', which magento.ts already does when revalidate is omitted); all writes are Magento mutations wrapped in Server Actions in src/lib/auth.ts (or a new src/lib/account.ts) using useActionState client forms, exactly like the existing loginAction/registerAction. The token-bearing calls reuse getCustomerToken() and the established pattern of redirecting to /login when the token is missing or expired. Two flows are NOT token-authenticated — requestPasswordResetEmail/resetPassword and confirmEmail — so they run on public routes without the cookie. The biggest structural gap is that the current /account is a single page; this domain needs it to become an account hub with sub-routes (/account/edit, /account/address, /account/address/new, /account/address/[id]). Key data dependencies: the address book and any future checkout address form depend on the countries query for the country dropdown and per-country available_regions for the region select, since Magento requires region_id (not free text) for countries with defined regions like the US.

| Feature | Status | Pri | Eff | GraphQL ops |
|---|---|:--:|:--:|---|
| Address book — list / read | ⬜ missing | P1 | S | `customer` |
| Add new address (create) | ⬜ missing | P1 | M | `createCustomerAddress` `countries` `country` |
| Edit existing address (update) | ⬜ missing | P1 | M | `updateCustomerAddressV2` `customer` `countries` |
| Delete address | ⬜ missing | P1 | S | `deleteCustomerAddressV2` |
| Set default billing / shipping address | ⬜ missing | P2 | S | `updateCustomerAddressV2` |
| Countries & regions reference data | ⬜ missing | P1 | S | `countries` `country` |
| Edit account profile (name) | ⬜ missing | P2 | S | `updateCustomerV2` `customer` |
| Change email | ⬜ missing | P2 | S | `updateCustomerEmail` `isEmailAvailable` |
| Change password (logged in) | ⬜ missing | P1 | S | `changeCustomerPassword` |
| Forgot password — request reset email | ⬜ missing | P1 | S | `requestPasswordResetEmail` |
| Reset password (with token from email) | ⬜ missing | P1 | M | `resetPassword` |
| Email confirmation (confirm account) | ⬜ missing | P3 | M | `confirmEmail` |
| Resend confirmation email | ⬜ missing | P3 | S | `resendConfirmationEmail` |
| Email availability check at registration | ⬜ missing | P3 | S | `isEmailAvailable` |
| Delete account | ⬜ missing | P3 | S | `deleteCustomer` |
| Account hub / navigation restructure | 🟡 partial | P2 | S | `customer` |
| customerGroup / group-aware display | ⬜ missing | P3 | S | `customerGroup` |

<details><summary><strong>Build notes</strong> (17 items)</summary>

- **Address book — list / read** — ⬜ missing · P1 · S
  - _Gap:_ customer query is already used for profile+orders on /account, but it does not request the addresses field. No address UI exists. Extend the CUSTOMER_ACCOUNT query (or add a dedicated CUSTOMER_ADDRESSES query) to select customer.addresses { uid firstname lastname company street city region { region region_id region_code } postcode country_code telephone default_billing default_shipping }.
  - _Build:_ RSC read at new route src/app/account/address/page.tsx. Call getCustomerToken(); redirect('/login') if absent. magentoFetch(CUSTOMER_ADDRESSES, { token }) with no revalidate so it is no-store (per-user, never cache). Render server-side list; each row links to /account/address/[uid] and has a delete <form action={deleteAddressAction}> with a hidden uid input. Add an AddressCard server component for formatting.
  - _Artifacts:_ `src/app/account/address/page.tsx`, `src/components/account/AddressCard.tsx`, `src/lib/queries.ts (CUSTOMER_ADDRESSES)`, `src/lib/types.ts (CustomerAddress type)`, `src/app/account/page.tsx (link to address book)`
- **Add new address (create)** — ⬜ missing · P1 · M
  - _Gap:_ No create mutation wired. createCustomerAddress(input: CustomerAddressInput) confirmed on endpoint. input requires firstname, lastname, street (array), city, country_code (CountryCodeEnum), postcode, telephone and region as { region_id } or { region } depending on country.
  - _Build:_ Route src/app/account/address/new/page.tsx (RSC) fetches countries (cacheable: magentoFetch(COUNTRIES, { revalidate: 86400, tags:['countries'] }) — static reference data) and renders a client AddressForm using useActionState. createAddressAction in src/lib/account.ts ('use server'): read token via getCustomerToken(), build CustomerAddressInput, send region as { region_id } when the selected country has available_regions else { region: freeText }. On success revalidatePath('/account/address') and redirect there. Street must be a String[] (split textarea lines).
  - _Artifacts:_ `src/app/account/address/new/page.tsx`, `src/components/account/AddressForm.tsx`, `src/components/account/RegionField.tsx`, `src/lib/account.ts (createAddressAction)`, `src/lib/queries.ts (CREATE_CUSTOMER_ADDRESS, COUNTRIES)`, `src/lib/types.ts (Country/Region types)`
  - _Depends on:_ Countries & regions reference data; Address book — list / read
- **Edit existing address (update)** — ⬜ missing · P1 · M
  - _Gap:_ updateCustomerAddressV2(uid: ID, input: CustomerAddressInput) confirmed. Note it takes the base64 uid (the same uid returned by customer.addresses), NOT the legacy integer id — use the V2 mutation, not the deprecated updateCustomerAddress.
  - _Build:_ Route src/app/account/address/[id]/page.tsx where [id] is the address uid. RSC reads the customer's addresses (no-store) and finds the matching uid to prefill, plus countries for the dropdown. Reuse AddressForm with an initialAddress prop. updateAddressAction(uid, formData) in account.ts wraps updateCustomerAddressV2 with token; same region_id-vs-region rule as create. revalidatePath('/account/address') + redirect.
  - _Artifacts:_ `src/app/account/address/[id]/page.tsx`, `src/components/account/AddressForm.tsx (reused)`, `src/lib/account.ts (updateAddressAction)`, `src/lib/queries.ts (UPDATE_CUSTOMER_ADDRESS_V2)`
  - _Depends on:_ Add new address (create)
- **Delete address** — ⬜ missing · P1 · S
  - _Gap:_ deleteCustomerAddressV2(uid: ID) confirmed, returns Boolean. Magento blocks deleting an address currently set as default billing/shipping — surface that error to the user.
  - _Build:_ deleteAddressAction(formData) in account.ts: getCustomerToken(), magentoFetch(DELETE_CUSTOMER_ADDRESS_V2, { variables:{ uid }, token }), catch the 'cannot delete default' error and return it as state. Triggered by a <form action> button on each AddressCard. revalidatePath('/account/address'). Use a small client confirm (window.confirm in a client wrapper or a details-based confirm) to avoid accidental deletes.
  - _Artifacts:_ `src/lib/account.ts (deleteAddressAction)`, `src/components/account/AddressCard.tsx (delete button)`, `src/lib/queries.ts (DELETE_CUSTOMER_ADDRESS_V2)`
  - _Depends on:_ Address book — list / read
- **Set default billing / shipping address** — ⬜ missing · P2 · S
  - _Gap:_ No separate mutation exists; defaults are flags on the address. Set via updateCustomerAddressV2 with input { default_billing: true } / { default_shipping: true }. Magento auto-unsets the previous default on the other address.
  - _Build:_ Either checkboxes inside AddressForm (covered by create/update) or quick 'Make default' buttons on AddressCard that call a thin setDefaultAddressAction(uid, kind) wrapping updateCustomerAddressV2 with just the relevant flag. revalidatePath('/account/address').
  - _Artifacts:_ `src/lib/account.ts (setDefaultAddressAction)`, `src/components/account/AddressCard.tsx`
  - _Depends on:_ Edit existing address (update)
- **Countries & regions reference data** — ⬜ missing · P1 · S
  - _Gap:_ countries returns 248 entries with available_regions { id code name } on this instance (verified). This is static reference data and the single most reused dependency for both account addresses and checkout.
  - _Build:_ Add COUNTRIES query (id, two_letter_abbreviation/full_name_locale, available_regions). Fetch in RSC with magentoFetch(COUNTRIES,{ revalidate: 86400, tags:['countries'] }) — safe to cache as it is not per-user. Pass to a client RegionField that swaps between a <select> (when the chosen country has available_regions) and a free-text <input> (when it does not). Optionally use single-country query country(id:) to lazy-load regions, but eager countries is simpler. This belongs in shared lib so checkout can reuse it.
  - _Artifacts:_ `src/lib/queries.ts (COUNTRIES)`, `src/components/account/RegionField.tsx`, `src/lib/types.ts (Country, Region)`, `src/lib/account-data.ts (getCountries helper)`
- **Edit account profile (name)** — ⬜ missing · P2 · S
  - _Gap:_ updateCustomerV2(input: CustomerUpdateInput) confirmed. Current /account only displays the name read-only. updateCustomerV2 cannot change email — that is updateCustomerEmail.
  - _Build:_ Route src/app/account/edit/page.tsx (RSC) reads current customer (no-store, token) to prefill, renders client AccountInfoForm via useActionState. updateProfileAction in account.ts wraps updateCustomerV2 with token, then revalidatePath('/','layout') so the header 'Hi name' and /account update, redirect('/account'). Reuse the AuthState error pattern and cleanMessage helper from auth.ts.
  - _Artifacts:_ `src/app/account/edit/page.tsx`, `src/components/account/AccountInfoForm.tsx`, `src/lib/account.ts (updateProfileAction)`, `src/lib/queries.ts (UPDATE_CUSTOMER_V2)`
- **Change email** — ⬜ missing · P2 · S
  - _Gap:_ updateCustomerEmail(email, password) confirmed — current password is mandatory, distinct from updateCustomerV2. isEmailAvailable(email) is a query usable to pre-validate before submit. Changing email may invalidate the bearer token in some configs, so handle re-auth.
  - _Build:_ changeEmailAction(formData) in account.ts: read token, magentoFetch(UPDATE_CUSTOMER_EMAIL,{ variables:{ email, password }, token }). Optionally call isEmailAvailable first to give a friendly 'email already taken' message. After success, if the token is invalidated, refresh by re-running generateCustomerToken is not possible (no password change), so just revalidate and, if a 401 follows, clear cookie and redirect to /login. Part of /account/edit or its own /account/edit/email form.
  - _Artifacts:_ `src/components/account/ChangeEmailForm.tsx`, `src/lib/account.ts (changeEmailAction)`, `src/lib/queries.ts (UPDATE_CUSTOMER_EMAIL, IS_EMAIL_AVAILABLE)`
  - _Depends on:_ Edit account profile (name)
- **Change password (logged in)** — ⬜ missing · P1 · S
  - _Gap:_ changeCustomerPassword(currentPassword, newPassword) confirmed, token-authenticated. Magento enforces the configured minimum strength (default 8 chars, 3 character classes) and rejects reuse — surface those errors.
  - _Build:_ changePasswordAction(formData) in account.ts: getCustomerToken(), validate newPassword === confirm client-side, magentoFetch(CHANGE_CUSTOMER_PASSWORD,{ variables:{ currentPassword, newPassword }, token }). On success Magento keeps the session; revalidatePath('/account') and show a success state. Client form with useActionState at /account/edit or /account/password.
  - _Artifacts:_ `src/components/account/ChangePasswordForm.tsx`, `src/lib/account.ts (changePasswordAction)`, `src/lib/queries.ts (CHANGE_CUSTOMER_PASSWORD)`
- **Forgot password — request reset email** — ⬜ missing · P1 · S
  - _Gap:_ requestPasswordResetEmail(email) confirmed, returns Boolean, no token needed. Always return a generic success message regardless of whether the email exists (avoid account enumeration).
  - _Build:_ Public route src/app/forgot-password/page.tsx with a client form (useActionState). requestResetAction in src/lib/auth.ts (no token): magentoFetch(REQUEST_PASSWORD_RESET,{ variables:{ email } }). Show 'If an account exists, a reset link was sent.' Link from /login. No cookie handling. Note: requires Magento email/SMTP to actually deliver in dev (Mailhog/log).
  - _Artifacts:_ `src/app/forgot-password/page.tsx`, `src/components/ForgotPasswordForm.tsx`, `src/lib/auth.ts (requestResetAction)`, `src/lib/queries.ts (REQUEST_PASSWORD_RESET)`, `src/app/login/page.tsx (link)`
- **Reset password (with token from email)** — ⬜ missing · P1 · M
  - _Gap:_ resetPassword(email, resetPasswordToken, newPassword) confirmed. The Magento email link points to the storefront base URL; we must configure Web > Secure/Unsecure Base URL (or the password-reset URL) so the link lands on our Next route carrying ?token=&email= (or id/token) query params.
  - _Build:_ Public route src/app/reset-password/page.tsx reading searchParams { token, email } (await searchParams in Next 16). Client form posts newPassword to resetPasswordAction in auth.ts: magentoFetch(RESET_PASSWORD,{ variables:{ email, resetPasswordToken, newPassword } }). On success redirect('/login?reset=1'). Handle expired/invalid token error explicitly. No cookie set (user must log in fresh).
  - _Artifacts:_ `src/app/reset-password/page.tsx`, `src/components/ResetPasswordForm.tsx`, `src/lib/auth.ts (resetPasswordAction)`, `src/lib/queries.ts (RESET_PASSWORD)`
  - _Depends on:_ Forgot password — request reset email
- **Email confirmation (confirm account)** — ⬜ missing · P3 · M
  - _Gap:_ confirmEmail(input: ConfirmEmailInput { email, confirmation_key }) confirmed; returns a CustomerOutput. Only relevant when 'Require Emails Confirmation' is enabled in Magento config — when on, registerAction's auto-login (generateCustomerToken) will FAIL until confirmed, so the current auto-login flow needs a guarded fallback.
  - _Build:_ Public route src/app/confirm/page.tsx reads searchParams { id/email, key }, calls confirmEmailAction (auth.ts) wrapping confirmEmail. On success, optionally auto-login if password were known (it is not), so just redirect('/login?confirmed=1'). Also: make registerAction tolerate the 'must confirm email' error from generateCustomerToken and show a 'check your email' message instead of erroring.
  - _Artifacts:_ `src/app/confirm/page.tsx`, `src/lib/auth.ts (confirmEmailAction, registerAction guard)`, `src/lib/queries.ts (CONFIRM_EMAIL)`
- **Resend confirmation email** — ⬜ missing · P3 · S
  - _Gap:_ resendConfirmationEmail(email) confirmed, returns Boolean, no token. Only meaningful when email confirmation is enabled; otherwise Magento errors that the account is already confirmed.
  - _Build:_ Small form (could live on /login or a /confirm/resend route) calling resendConfirmationAction in auth.ts → resendConfirmationEmail(email). Generic success message. No cookie handling.
  - _Artifacts:_ `src/components/ResendConfirmationForm.tsx`, `src/lib/auth.ts (resendConfirmationAction)`, `src/lib/queries.ts (RESEND_CONFIRMATION)`
  - _Depends on:_ Email confirmation (confirm account)
- **Email availability check at registration** — ⬜ missing · P3 · S
  - _Gap:_ isEmailAvailable(email): query returning { is_email_available }. Currently registerAction only surfaces the createCustomerV2 error after submit. This is a UX polish, not required for correctness.
  - _Build:_ Because we use plain fetch server-to-server (no client GraphQL), expose a tiny Server Action checkEmailAvailableAction(email) that the register/email-change client form calls on blur (via a transition) to show a hint. Optional: also call it server-side inside registerAction/changeEmailAction to return a cleaner message. revalidate not applicable (no-store).
  - _Artifacts:_ `src/lib/auth.ts (checkEmailAvailableAction)`, `src/components/RegisterForm.tsx (on-blur check)`, `src/lib/queries.ts (IS_EMAIL_AVAILABLE)`
- **Delete account** — ⬜ missing · P3 · S
  - _Gap:_ deleteCustomer (no args) confirmed, token-authenticated, returns Boolean. Requires the config 'Enable Delete Account' (and may require password re-entry / recent auth depending on settings). Irreversible — needs strong confirmation.
  - _Build:_ deleteAccountAction in account.ts: getCustomerToken(), magentoFetch(DELETE_CUSTOMER,{ token }); on success clear customer_token + guest_cart cookies (same as logoutAction) and redirect('/'). Gate behind a typed-confirmation client UI ('type DELETE'). Place in /account/edit danger zone.
  - _Artifacts:_ `src/components/account/DeleteAccountForm.tsx`, `src/lib/account.ts (deleteAccountAction)`, `src/lib/queries.ts (DELETE_CUSTOMER)`
  - _Depends on:_ Edit account profile (name)
- **Account hub / navigation restructure** — 🟡 partial · P2 · S
  - _Gap:_ /account exists but is a flat page (profile block + orders table). It needs to become an account shell with navigation to the new sub-routes this domain introduces. The customer read is already wired and reusable.
  - _Build:_ Add src/app/account/layout.tsx with an AccountNav (server component) shared across /account, /account/edit, /account/address. Guard the token once in the layout (redirect('/login') if no token) so each child page does not repeat it — or keep per-page guards for safety. Keep the existing orders table on /account. This is the connective tissue that makes the other features navigable.
  - _Artifacts:_ `src/app/account/layout.tsx`, `src/components/account/AccountNav.tsx`, `src/app/account/page.tsx (trim to dashboard)`
- **customerGroup / group-aware display** — ⬜ missing · P3 · S
  - _Gap:_ customerGroup query exists on the surface but has minimal storefront value on Luma B2C. Pricing already reflects group server-side. Low priority; include only if B2C tiering is needed.
  - _Build:_ If needed, fetch customerGroup in the account RSC (token) and display name. No mutation. Most stores skip this entirely.
  - _Artifacts:_ `src/lib/queries.ts (CUSTOMER_GROUP)`, `src/app/account/page.tsx`

</details>

**Domain gotchas:**
- All account reads are per-user and MUST NOT be cached. magento.ts caches only when a numeric `revalidate` is passed; for customer/address reads call magentoFetch WITHOUT revalidate so it sends cache:'no-store'. The one cacheable read here is `countries` (static reference data) — cache it with revalidate:86400, tags:['countries'].
- Use the V2 address mutations: updateCustomerAddressV2 and deleteCustomerAddressV2 take the base64 `uid` (the same value returned by customer.addresses[].uid), NOT the legacy integer id. Do not use the deprecated updateCustomerAddress/deleteCustomerAddress.
- Region handling: CustomerAddressInput.region is an object. For countries that have available_regions (e.g. US), Magento requires region: { region_id: <int> } — a free-text region will be rejected or ignored. For countries without defined regions, pass region: { region: 'free text' }. The RegionField must switch between <select> and <input> based on the chosen country's available_regions.
- country_code is a CountryCodeEnum (e.g. US, GB) — pass the 2-letter code from countries.id / two_letter_abbreviation, not a numeric id and not the country name.
- street is a String[] in CustomerAddressInput — split the textarea into an array of non-empty lines; sending a plain string fails validation.
- changeCustomerPassword, updateCustomerEmail, deleteCustomer, and all address mutations are token-authenticated — they require the Authorization: Bearer header from the httpOnly customer_token cookie. updateCustomerEmail additionally requires the current password; updateCustomerV2 CANNOT change email.
- Magento customer tokens are short-lived (the code sets TOKEN_MAX_AGE = 1h). Any account RSC/action can get a 401 from an expired token mid-session; mirror the existing pattern — catch the error, clear the cookie, redirect('/login').
- requestPasswordResetEmail, resetPassword, confirmEmail, and resendConfirmationEmail are PUBLIC (no token) and run on public routes. resetPassword needs the emailed token+email passed via the link; you must configure Magento's storefront base URL / password-reset URL so the email link lands on the Next /reset-password route. These flows also require working email delivery (Mailhog/SMTP) to test in dev.
- Account enumeration: requestPasswordResetEmail and isEmailAvailable can leak which emails exist. Always return a generic 'if an account exists…' message on the reset flow and only use isEmailAvailable for soft inline hints, not hard public gates.
- If 'Require Emails Confirmation' is enabled in Magento, the existing registerAction auto-login (generateCustomerToken) will fail until the account is confirmed. Guard that path to show a 'check your email to confirm' message instead of surfacing a raw error, and wire confirmEmail/resendConfirmationEmail.
- deleteCustomer requires the 'Enable Delete Account' admin setting; it is irreversible. Gate it behind a typed-confirmation UI and clear the same cookies as logout (customer_token + guest_cart_id) on success.
- Next 16 specifics already in this codebase: cookies() and searchParams are async (await them); Server Actions live in 'use server' files; client forms use React 19 useActionState with the {error} AuthState pattern and the cleanMessage() helper that strips the 'Magento GraphQL error:' prefix. Reuse these rather than inventing new error shapes.

### 8.7 Orders: Detail, Reorder, Cancel, Guest

This domain covers everything past the order-history list that already exists at /account: full order detail (line items, addresses, totals breakdown, payment/shipping method, shipments + tracking, invoices, credit memos), reordering, customer-initiated cancellation (single-step and the email-confirmed two-step flow), guest order lookup + guest cancel, and the customer's downloadable products library. All reads are customer.orders / guestOrder queries run server-to-server in RSC with the httpOnly customer_token cookie (or guest email+number form input); all writes are Server Actions calling cancelOrder/confirmCancelOrder/reorderItems/requestGuestOrderCancel. The current build only fetches number/date/status/total in CUSTOMER_ACCOUNT and has no order detail route, no order id/token, and no reorder/cancel wiring — so this domain is almost entirely greenfield on top of the established auth/cart plumbing. The single most important blocker is that storeConfig.order_cancellation_enabled is currently false on this instance, so all cancel features are non-functional until enabled in admin; reorder, detail, and guest lookup work regardless.

| Feature | Status | Pri | Eff | GraphQL ops |
|---|---|:--:|:--:|---|
| Customer order detail page (/account/orders/[number]) | ⬜ missing | P1 | M | `customer (orders filter: {number:{eq}})` |
| Order line items table with per-item fulfillment status | ⬜ missing | P1 | M | `customer (orders -> items: OrderItem)` |
| Order totals breakdown | ⬜ missing | P1 | S | `customer (orders -> total: OrderTotal)` |
| Shipments and tracking on order detail | ⬜ missing | P2 | M | `customer (orders -> shipments: OrderShipment)` |
| Invoices and credit memos on order detail | ⬜ missing | P2 | M | `customer (orders -> invoices: Invoice, credit_memos: CreditMemo)` |
| Reorder (customer) | ⬜ missing | P1 | M | `reorderItems` |
| Cancel order (single-step, customer) | ⬜ missing | P2 | L | `cancelOrder` `storeConfig (order_cancellation_enabled, order_cancellation_reasons)` |
| Confirm order cancellation (email two-step flow) | ⬜ missing | P3 | M | `confirmCancelOrder` `cancelOrder` |
| Guest order lookup by email + last name + number | ⬜ missing | P2 | M | `guestOrder` |
| Guest order view by token (/orders/[token]) | ⬜ missing | P2 | S | `guestOrderByToken` |
| Guest order cancellation | ⬜ missing | P3 | M | `requestGuestOrderCancel` `storeConfig (order_cancellation_enabled, order_cancellation_reasons)` |
| Customer downloadable products library (/account/downloads) | ⬜ missing | P3 | S | `customerDownloadableProducts` |
| Order history list: filtering, pagination, sort, and detail links | 🟡 partial | P2 | M | `customer (orders filter, pageSize, currentPage, sort)` |
| Order confirmation / success page from checkout | ⬜ missing | P1 | S | `customer (orders) or guestOrderByToken` |

<details><summary><strong>Build notes</strong> (14 items)</summary>

- **Customer order detail page (/account/orders/[number])** — ⬜ missing · P1 · M
  - _Gap:_ Only the list exists (/account renders number/date/status/total from CUSTOMER_ACCOUNT). No detail route, no per-order query, and the order rows are not links. customer.orders supports filter:{number:{eq:$number}} which returns exactly one order for the detail fetch.
  - _Build:_ New RSC route src/app/account/orders/[number]/page.tsx. Read getCustomerToken() from httpOnly cookie; redirect('/login') if absent. magentoFetch(ORDER_DETAIL, {variables:{number}, token}) — no-store (per-customer, never cache). Query customer.orders(filter:{number:{eq:$number}}){items{ number order_date status total{subtotal{...} total_shipping{...} total_tax{...} discounts{amount{...} label} grand_total{...}} items{product_name product_sku product_url_key product_sale_price{...} quantity_ordered quantity_shipped quantity_canceled status selected_options{label value}} billing_address{...} shipping_address{...} shipping_method carrier payment_methods{name type} available_actions }}. Guard items.length to handle a number that isn't the customer's (returns empty). Add Money/address formatting helpers. Make order-history rows in /account into <Link href={`/account/orders/${o.number}`}>. Reorder + Cancel buttons render conditionally on available_actions containing REORDER / CANCEL.
  - _Artifacts:_ `src/app/account/orders/[number]/page.tsx`, `src/app/account/page.tsx (link rows)`, `src/lib/queries.ts (ORDER_DETAIL)`, `src/lib/types.ts (CustomerOrderDetail, OrderItem, OrderAddress, OrderTotal)`, `src/lib/format.ts (formatAddress)`, `src/components/OrderItemsTable.tsx`, `src/components/OrderTotals.tsx`, `src/components/OrderAddressCard.tsx`
  - _Depends on:_ Customer auth (done); format.ts money formatting (done)
- **Order line items table with per-item fulfillment status** — ⬜ missing · P1 · M
  - _Gap:_ OrderItem exposes product_name, product_sku, product_url_key, product_sale_price, quantity_ordered/_shipped/_canceled/_refunded/_invoiced, status, and selected_options{label value}. OrderItem has no product image field, so thumbnails require a secondary products(filter:{sku:{in:[...]}}) lookup if images are wanted.
  - _Build:_ Sub-component OrderItemsTable.tsx (server, presentational) fed by the order detail query. For thumbnails, batch-resolve images: collect product_sku[], one magentoFetch(products(filter:{sku:{in}})){items{sku small_image{url}}} with revalidate (catalog is cacheable) and map by sku — keeps the per-order read uncached while images stay cached. Link product_name to /product/[product_url_key]. Show selected_options as 'Color: Blue, Size: M'. Render quantity_shipped/quantity_canceled as small status chips.
  - _Artifacts:_ `src/components/OrderItemsTable.tsx`, `src/lib/queries.ts (PRODUCT_THUMBS_BY_SKU)`
  - _Depends on:_ Customer order detail page
- **Order totals breakdown** — ⬜ missing · P1 · S
  - _Gap:_ OrderTotal provides subtotal_incl_tax/subtotal_excl_tax, total_shipping/shipping_handling, total_tax/taxes, discounts{amount label}, grand_total, grand_total_excl_tax. The list view only uses total.grand_total today. storeConfig flags orders_invoices_credit_memos_display_* control which rows the store wants shown.
  - _Build:_ OrderTotals.tsx presentational component using existing formatMoney(). Optionally read the storeConfig display flags (orders_invoices_credit_memos_display_subtotal/_shipping_amount/_zero_tax/_grandtotal) — these are cacheable via the existing STORE_CONFIG pattern — to mirror admin display config, but a sensible static layout is fine for v1.
  - _Artifacts:_ `src/components/OrderTotals.tsx`
  - _Depends on:_ Customer order detail page
- **Shipments and tracking on order detail** — ⬜ missing · P2 · M
  - _Gap:_ OrderShipment has number, items{product_name product_sku quantity_shipped order_item{...}}, tracking{carrier number title}, comments. CustomerOrder also has top-level carrier + shipping_method. Tracking number is plain text — Magento GraphQL exposes no carrier deep-link URL, so we cannot link out to a courier site without our own carrier->URL map.
  - _Build:_ Add shipments{number tracking{carrier title number} items{product_name quantity_shipped}} to ORDER_DETAIL. Render an OrderShipments.tsx section listing each shipment with its tracking rows. Optional enhancement: a small client-side carrier->tracking-URL map (UPS/USPS/FedEx) to turn tracking numbers into links; otherwise display as copyable text.
  - _Artifacts:_ `src/components/OrderShipments.tsx`, `src/lib/queries.ts (ORDER_DETAIL shipments block)`
  - _Depends on:_ Customer order detail page
- **Invoices and credit memos on order detail** — ⬜ missing · P2 · M
  - _Gap:_ Invoice and CreditMemo both expose number, items{...}, total{...} (OrderTotal), comments. No PDF/print-document URL is exposed via GraphQL, so 'download invoice PDF' is not possible headlessly without a custom endpoint.
  - _Build:_ Add invoices{number total{grand_total{...}}} and credit_memos{number total{grand_total{...}}} to ORDER_DETAIL. Render collapsible OrderDocuments.tsx sections. Reuse OrderTotals/OrderItemsTable for each document's totals/items. Purely additive presentational work on the same cached-off per-customer read.
  - _Artifacts:_ `src/components/OrderDocuments.tsx`, `src/lib/queries.ts (invoices/credit_memos block)`
  - _Depends on:_ Customer order detail page
- **Reorder (customer)** — ⬜ missing · P1 · M
  - _Gap:_ reorderItems(orderNumber:String!) -> ReorderItemsOutput{ cart{...} userInputErrors{code message path} }. It targets the logged-in customer's cart (token-scoped), so it auto-creates/uses customerCart. userInputErrors uses CheckoutUserInputErrorCodes including PRODUCT_NOT_FOUND, NOT_SALABLE, INSUFFICIENT_STOCK, REORDER_NOT_AVAILABLE — must surface to the shopper (e.g. 'X item(s) could not be re-added').
  - _Build:_ Server Action reorderAction(orderNumber) in a new src/lib/orders.ts ('use server'). Read token from cookie; if missing return error. magentoFetch(REORDER_ITEMS, {variables:{orderNumber}, token}). revalidatePath('/','layout') (cart badge) and revalidatePath('/cart'); collect userInputErrors and either redirect('/cart') with a flash or return them to a client ReorderButton.tsx (useTransition + useActionState) that shows partial-success warnings. Guard on available_actions including REORDER before showing the button.
  - _Artifacts:_ `src/lib/orders.ts (reorderAction)`, `src/lib/queries.ts (REORDER_ITEMS)`, `src/components/ReorderButton.tsx`, `src/app/account/orders/[number]/page.tsx (button)`
  - _Depends on:_ Customer auth (done); Cart (done); Customer order detail page (for placement; can also go on list)
- **Cancel order (single-step, customer)** — ⬜ missing · P2 · L
  - _Gap:_ cancelOrder(input:{order_id:ID!, reason:String!}) -> CancelOrderOutput{ error errorV2{...} order{...} }. CRITICAL: this instance has storeConfig.order_cancellation_enabled=false right now, so the feature is inert until enabled in admin (Stores > Config > Sales > Order Cancellation). Reasons come from storeConfig.order_cancellation_reasons[].description. order_id here is the CustomerOrder.id (base64), NOT the human order number — must select id in the detail query. Eligibility is signaled by available_actions containing CANCEL.
  - _Build:_ Add id and available_actions to ORDER_DETAIL. Read storeConfig.order_cancellation_enabled + order_cancellation_reasons (cacheable, extend STORE_CONFIG) to render a reason <select> only when enabled AND available_actions includes CANCEL. Server Action cancelOrderAction(orderId, reason) in src/lib/orders.ts: magentoFetch(CANCEL_ORDER, {variables:{orderId,reason}, token}); if data.cancelOrder.error/errorV2 surface it, else revalidatePath the detail + /account. Client CancelOrderForm.tsx (useActionState) for the reason select + confirm dialog. NOTE: with confirmation enabled Magento may route to the two-step confirm flow instead (returns no order, sends email) — handle both.
  - _Artifacts:_ `src/lib/orders.ts (cancelOrderAction)`, `src/lib/queries.ts (CANCEL_ORDER, storeConfig cancellation fields)`, `src/components/CancelOrderForm.tsx`
  - _Depends on:_ Customer order detail page; Admin: enable order_cancellation_enabled
- **Confirm order cancellation (email two-step flow)** — ⬜ missing · P3 · M
  - _Gap:_ confirmCancelOrder(input:{order_id:ID!, confirmation_key:String!}) -> CancelOrderOutput. This is the second leg of a two-step cancel when admin requires confirmation: cancelOrder sends an email containing order_id + confirmation_key, and the customer must hit a confirm endpoint. Same enablement gotcha (order_cancellation_enabled=false today).
  - _Build:_ New route src/app/account/orders/cancel/confirm/page.tsx (or a token route) that reads order_id + confirmation_key from searchParams (the email link's query). On load (or via a confirm button -> Server Action) call magentoFetch(CONFIRM_CANCEL_ORDER, {variables:{orderId, confirmationKey}, token}); show success/failure. Works for logged-in customers (token present). Keep it tolerant of expired/used keys via CancelOrderOutput.error.
  - _Artifacts:_ `src/app/account/orders/cancel/confirm/page.tsx`, `src/lib/orders.ts (confirmCancelOrderAction)`, `src/lib/queries.ts (CONFIRM_CANCEL_ORDER)`
  - _Depends on:_ Cancel order (single-step); Admin: enable cancellation with confirmation
- **Guest order lookup by email + last name + number** — ⬜ missing · P2 · M
  - _Gap:_ guestOrder(input:{email:String!, lastname:String!, number:String!}) returns a CustomerOrder with the full detail surface (items, addresses, total, shipments, invoices, available_actions, token). No auth token required. This is the headless equivalent of Luma's 'Orders and Returns' guest lookup. Today nothing exists.
  - _Build:_ New route src/app/orders/lookup/page.tsx with a client form (email/lastname/number) posting to a Server Action guestOrderLookupAction in src/lib/orders.ts. The action calls magentoFetch(GUEST_ORDER, {variables:{email,lastname,number}}) (NO token). On success, set a short-lived httpOnly cookie holding the returned order token (guestOrder result includes token) and redirect to /orders/[token] (guest detail via guestOrderByToken), OR render detail inline. Reuse OrderItemsTable/OrderTotals/OrderShipments components from the customer detail page. Treat not-found/mismatch as a generic 'order not found' (avoid enumeration).
  - _Artifacts:_ `src/app/orders/lookup/page.tsx`, `src/lib/orders.ts (guestOrderLookupAction)`, `src/lib/queries.ts (GUEST_ORDER)`, `src/components/GuestOrderLookupForm.tsx`, `src/components/OrderItemsTable.tsx (reuse)`
  - _Depends on:_ Order detail components (shared with customer detail); Checkout (done) — needed for real guest orders to exist
- **Guest order view by token (/orders/[token])** — ⬜ missing · P2 · S
  - _Gap:_ guestOrderByToken(input:{token:String!}) -> CustomerOrder. The token is returned by guestOrder/place-order and is the stable handle for a guest order. Lets us bookmark/refresh guest detail without holding raw email+number.
  - _Build:_ RSC route src/app/orders/[token]/page.tsx reading the token from the path (or from the short-lived httpOnly cookie set by the lookup action — preferred so the token isn't in shareable URLs/logs). magentoFetch(GUEST_ORDER_BY_TOKEN, {variables:{token}}) no-store. Render with the shared detail components plus a guest-cancel control (next feature). notFound() on empty/invalid token.
  - _Artifacts:_ `src/app/orders/[token]/page.tsx`, `src/lib/queries.ts (GUEST_ORDER_BY_TOKEN)`, `shared order detail components`
  - _Depends on:_ Guest order lookup by email + last name + number; Order detail components
- **Guest order cancellation** — ⬜ missing · P3 · M
  - _Gap:_ requestGuestOrderCancel(input:{token:String!, reason:String!}) -> CancelOrderOutput{error errorV2 order}. Uses the guest order token (not order_id). Same global gate: order_cancellation_enabled=false today, so inert until enabled. Reasons from storeConfig.order_cancellation_reasons. May also be subject to the two-step email confirmation depending on admin config.
  - _Build:_ Server Action requestGuestOrderCancelAction(token, reason) in src/lib/orders.ts (no customer token; uses the guest order token). Client GuestCancelForm.tsx with the reason <select> sourced from cached storeConfig. Render the form on /orders/[token] only when storeConfig.order_cancellation_enabled and order.available_actions includes CANCEL. Surface CancelOrderOutput.error; revalidate the token page on success.
  - _Artifacts:_ `src/lib/orders.ts (requestGuestOrderCancelAction)`, `src/lib/queries.ts (REQUEST_GUEST_ORDER_CANCEL)`, `src/components/GuestCancelForm.tsx`
  - _Depends on:_ Guest order view by token; Admin: enable order_cancellation_enabled
- **Customer downloadable products library (/account/downloads)** — ⬜ missing · P3 · S
  - _Gap:_ customerDownloadableProducts (no args) -> items{ order_increment_id date status download_url remaining_downloads }. Token-scoped. Luma sample data is mostly simple/configurable, so there may be few/no downloadable purchases until a downloadable product is ordered — feature is fully functional but data-sparse on this instance.
  - _Build:_ RSC route src/app/account/downloads/page.tsx; redirect('/login') if no token. magentoFetch(CUSTOMER_DOWNLOADABLE_PRODUCTS, {token}) no-store. Render a table: order #, date, status, remaining downloads, and download_url as an anchor (download_url is a direct, token-authorized Magento URL — render as a plain link, the browser hits Magento directly). Add an 'My Downloads' link in /account. Empty state when items is null/empty.
  - _Artifacts:_ `src/app/account/downloads/page.tsx`, `src/lib/queries.ts (CUSTOMER_DOWNLOADABLE_PRODUCTS)`, `src/lib/types.ts (CustomerDownloadableProduct)`, `src/app/account/page.tsx (nav link)`
  - _Depends on:_ Customer auth (done); Downloadable product type support (not built) — for purchase side
- **Order history list: filtering, pagination, sort, and detail links** — 🟡 partial · P2 · M
  - _Gap:_ DONE: a static 20-order table (number/date/status/total) at /account. MISSING: rows are not links to detail, no pagination controls (CUSTOMER_ACCOUNT hardcodes pageSize:20 currentPage:1), no sort, no status/number filter. customer.orders supports filter:{number,status,order_date,grand_total}, sort:CustomerOrderSortInput, currentPage/pageSize.
  - _Build:_ Promote orders to its own route src/app/account/orders/page.tsx (keep a short preview on /account). Read ?page/?status/?sort searchParams, pass to a parameterized ORDERS_LIST query (filter/sort/pagination) with token, no-store. Wrap rows in <Link> to /account/orders/[number]. Reuse the catalog pagination component pattern from /category. Add a status filter <select> and a date sort toggle.
  - _Artifacts:_ `src/app/account/orders/page.tsx`, `src/app/account/page.tsx (trim to preview + 'View all')`, `src/lib/queries.ts (ORDERS_LIST parameterized)`, `src/components/OrdersPagination.tsx`
  - _Depends on:_ Customer order detail page (link target)
- **Order confirmation / success page from checkout** — ⬜ missing · P1 · S
  - _Gap:_ placeOrder returns the order number (and, for guests, an order token via guestOrderByToken). This is the natural bridge from checkout into this domain. Checkout itself is out of this domain and not yet built, but the success page is where order-detail/track/reorder links first appear.
  - _Build:_ Route src/app/checkout/success/page.tsx (owned by checkout domain but consuming this domain's detail). For logged-in: link to /account/orders/[number]. For guests: persist the placeOrder order token in a short-lived httpOnly cookie and link to /orders/[token]. Reuse OrderItemsTable/OrderTotals for an at-a-glance summary. Flagged here as a dependency-bridge; primary ownership sits with the checkout domain.
  - _Artifacts:_ `src/app/checkout/success/page.tsx (cross-domain)`, `shared order detail components`
  - _Depends on:_ Checkout/placeOrder (NOT built); Customer order detail page; Guest order view by token

</details>

**Domain gotchas:**
- order_cancellation_enabled is FALSE on this instance right now (verified via storeConfig). Every cancel feature (cancelOrder, confirmCancelOrder, requestGuestOrderCancel) is inert until an admin enables it under Stores > Config > Sales > Order Cancellation. Build the UI gated on this storeConfig flag so it self-hides when disabled.
- cancelOrder/confirmCancelOrder take order_id = CustomerOrder.id (an opaque base64 ID), NOT the human-readable order number used for reorderItems and the URL slug. You must select id in the detail query specifically for the cancel action. reorderItems uses orderNumber, and guest cancel uses the guest token — three different identifiers across the domain.
- Eligibility is driven by CustomerOrder.available_actions (enum values are CANCEL and REORDER). Render Reorder/Cancel buttons conditionally on this list rather than guessing from status, so the UI matches Magento's own rules.
- reorderItems returns userInputErrors (CheckoutUserInputErrorCodes: PRODUCT_NOT_FOUND, NOT_SALABLE, INSUFFICIENT_STOCK, REORDER_NOT_AVAILABLE, UNDEFINED) and may add only some items. Treat it as partial-success and tell the shopper which items couldn't be re-added — don't assume the whole order landed in the cart.
- OrderItem has NO image field (only product_name/sku/url_key). For line-item thumbnails do a separate cached products(filter:{sku:{in:[...]}}) lookup keyed by SKU; keep the per-order read no-store and let the catalog image read stay cached.
- All order reads are per-customer/per-guest and must be fetched with cache:'no-store' (the magento.ts default when revalidate is omitted). Do NOT add Next fetch tags/revalidate to order queries — caching another customer's order would be a data-leak. Only catalog/storeConfig reads should be cached.
- Cancellation can be one-step or two-step depending on admin config. When confirmation is required, cancelOrder/requestGuestOrderCancel return no order and email a confirmation_key; the flow only completes via confirmCancelOrder. Build both paths and key off whether CancelOrderOutput.order is present.
- Guest order security: guestOrder requires email+lastname+number together; guestOrderByToken uses an opaque token returned by lookup/placeOrder. Prefer storing the token in a short-lived httpOnly cookie over putting it in shareable URLs/logs, and return a generic 'order not found' on any mismatch to avoid order-enumeration.
- No PDF/print document URLs are exposed via GraphQL for invoices/credit memos/shipping labels, and tracking numbers have no carrier deep-link. 'Download invoice' and 'track on courier site' need either a custom Magento endpoint or a client-side carrier->URL map — they cannot be done with the stock surface alone.
- customerDownloadableProducts.download_url is a direct token-authorized Magento URL — render it as a plain anchor so the browser hits Magento directly; don't proxy it through the Next server. On Luma sample data there may be zero rows until a downloadable product is actually purchased.
- Real order data depends on checkout (placeOrder), which is NOT built. Reorder/cancel/detail/guest flows are implementable now but only exercisable end-to-end once checkout exists or orders are seeded; admin-created orders work for testing the customer (token) paths.

### 8.8 Wishlist

The Wishlist domain is 100% missing from the current build — no routes, lib functions, queries, or components exist. Magento 2.4.9 exposes the modern wishlistV2 surface: reads via customer.wishlists (paginated list) and customer.wishlist_v2(id), and six mutations (addProductsToWishlist, updateProductsInWishlist, removeProductsFromWishlist, addWishlistItemsToCart, clearWishlist). It is a customer-only feature — the entire surface lives under the authenticated `customer` query and every mutation requires a Bearer customer_token; there is no guest wishlist in Magento GraphQL. This maps cleanly onto our existing stack: list reads become RSC server-to-server fetches with the httpOnly customer_token (same pattern as /account), and all writes become Server Actions in a new src/lib/wishlist.ts (mirroring actions.ts/auth.ts), reusing the configurable-product selected_options UID pattern we already use for the cart. The one architectural wrinkle is that wishlist add/remove buttons must live on cached catalog pages (PDP/PLP) that are anonymous and revalidated, so the buttons must be client components that call a Server Action and degrade gracefully (redirect to /login) when there is no token.

| Feature | Status | Pri | Eff | GraphQL ops |
|---|---|:--:|:--:|---|
| Wishlist data layer (queries.ts ops + types + wishlist.ts module) | ⬜ missing | P1 | M | `customer.wishlists` `wishlist_v2` `addProductsToWishlist` `removeProductsFromWishlist` `updateProductsInWishlist` +2 |
| Wishlist page (/wishlist route, RSC list) | ⬜ missing | P1 | M | `customer.wishlists` `wishlist_v2` |
| Add-to-wishlist button on PDP | ⬜ missing | P1 | M | `addProductsToWishlist` |
| Add-to-wishlist button on PLP / category & search grids | ⬜ missing | P2 | M | `addProductsToWishlist` |
| Remove item from wishlist | ⬜ missing | P1 | S | `removeProductsFromWishlist` |
| Update wishlist item quantity / description | ⬜ missing | P2 | S | `updateProductsInWishlist` |
| Move single item to cart | ⬜ missing | P1 | M | `addWishlistItemsToCart` |
| Add all items to cart | ⬜ missing | P2 | S | `addWishlistItemsToCart` |
| Clear wishlist | ⬜ missing | P3 | S | `clearWishlist` |
| Wishlist count badge in header | ⬜ missing | P3 | S | `customer.wishlists` |
| Wishlisted-state indicator on PDP/PLP | ⬜ missing | P3 | L | `customer.wishlists` |
| Share wishlist via email-to-a-friend | ⬜ missing | P3 | M | `sendEmailToFriend` |
| Multiple named wishlists (create/select/rename) | ⬜ missing | P3 | S | `customer.wishlists` `wishlist_v2` `addProductsToWishlist` |
| Login-redirect / guest gating for wishlist actions | ⬜ missing | P1 | M | `addProductsToWishlist` |

<details><summary><strong>Build notes</strong> (14 items)</summary>

- **Wishlist data layer (queries.ts ops + types + wishlist.ts module)** — ⬜ missing · P1 · M
  - _Gap:_ Nothing exists. No wishlist queries in queries.ts, no wishlist types in types.ts, no src/lib/wishlist.ts. queries.ts currently ends at MERGE_CARTS (line 282) with zero wishlist ops.
  - _Build:_ Add a WISHLIST_QUERY to queries.ts reading `customer { wishlists(pageSize,currentPage) { id sharing_code items_count updated_at items_v2(currentPage,pageSize){ page_info{current_page total_pages} items{ id quantity description added_at product{ uid sku name url_key stock_status small_image{url label} price_range{minimum_price{final_price{value currency} regular_price{value currency}}} } ... on ConfigurableWishlistItem{ configurable_options{ option_label value_label } } } } } }`. Add the six mutation strings. Create src/lib/wishlist.ts ('use server' for actions + a server-only read helper) and a getActiveWishlistId(token) that reads customer.wishlists[0].id (default CE has exactly one wishlist, id usually '1' but must be fetched, not hardcoded). Add WishlistItem/WishlistV2 types to types.ts. Reuse magentoFetch with { token } and cache:'no-store' (default when no revalidate) since wishlists are per-user and must never be cached.
  - _Artifacts:_ `storefront/src/lib/queries.ts`, `storefront/src/lib/wishlist.ts`, `storefront/src/lib/types.ts`
  - _Depends on:_ existing magentoFetch transport; existing customer_token httpOnly cookie + getCustomerToken()
- **Wishlist page (/wishlist route, RSC list)** — ⬜ missing · P1 · M
  - _Gap:_ No /wishlist route exists. Routes present: / /category/[slug] /product/[slug] /cart /search /login /register /account.
  - _Build:_ New src/app/wishlist/page.tsx as an async RSC. Read token via getCustomerToken(); if absent redirect('/login') (exact pattern from account/page.tsx lines 14-15). magentoFetch<...>(WISHLIST_QUERY,{token}) — no revalidate so it is no-store/per-request. Render a grid reusing ProductCard styling plus client action controls (move-to-cart, remove, qty). Empty state mirrors the account 'no orders' dashed-border block. Add a 'Wishlist' link to Header account area and to /account.
  - _Artifacts:_ `storefront/src/app/wishlist/page.tsx`, `storefront/src/components/WishlistItemRow.tsx`, `storefront/src/components/Header.tsx`, `storefront/src/app/account/page.tsx`
  - _Depends on:_ Wishlist data layer; getCustomerToken(); ProductCard/Price components
- **Add-to-wishlist button on PDP** — ⬜ missing · P1 · M
  - _Gap:_ PDP (product/[slug]/page.tsx) renders Gallery, Price, AddToCart only. No wishlist control. AddToCart already manages configurable selected_options uids — wishlist must mirror that.
  - _Build:_ New client component WishlistButton.tsx placed next to <AddToCart> in product/[slug]/page.tsx (~line 92). Calls a new addToWishlistAction(input:{sku,quantity,selectedOptions}) Server Action in wishlist.ts. The action: token=getCustomerToken(); if !token return {needsLogin:true} so the client can router.push('/login?redirect=/product/'+slug). Otherwise getActiveWishlistId(token) then addProductsToWishlist(wishlistId, wishlistItems:[{sku, quantity, selected_options}]). For configurable products, lift the selected-options state by reusing AddToCart's selection or sharing a small parent client wrapper so the heart knows the chosen swatch uids (Magento requires the variant context via selected_options for configurables). Return user_errors. No revalidate needed for cart, but revalidatePath('/wishlist').
  - _Artifacts:_ `storefront/src/components/WishlistButton.tsx`, `storefront/src/app/product/[slug]/page.tsx`, `storefront/src/lib/wishlist.ts`
  - _Depends on:_ Wishlist data layer; configurable selected_options UID pattern from AddToCart
- **Add-to-wishlist button on PLP / category & search grids** — ⬜ missing · P2 · M
  - _Gap:_ ProductCard.tsx is a pure server component <Link> with no interactivity. Category/search/home pages are cached RSC (revalidate:120, tags:['catalog']).
  - _Build:_ Add an optional client overlay WishlistHeart (client component) absolutely positioned in ProductCard's image div (top-right, mirroring the 'Sold out' badge at lines 24-28). It calls addToWishlistAction({sku, quantity:1}) — simple products only; configurable products from a grid have no chosen variant, so for ConfigurableProduct the heart should route to the PDP instead of attempting an add (Magento rejects a configurable add without selected_options). Because the surrounding card is a <Link>, the heart button must stopPropagation/preventDefault. The action degrades to /login when unauthenticated. Keep ProductCard a server component and only mount the client heart as a child to preserve catalog caching.
  - _Artifacts:_ `storefront/src/components/ProductCard.tsx`, `storefront/src/components/WishlistHeart.tsx`, `storefront/src/lib/wishlist.ts`
  - _Depends on:_ Add-to-wishlist button on PDP (shares action); Wishlist data layer
- **Remove item from wishlist** — ⬜ missing · P1 · S
  - _Gap:_ No remove control exists; whole feature missing.
  - _Build:_ removeFromWishlistAction(wishlistItemId:string) Server Action: token=getCustomerToken(); getActiveWishlistId(token); magentoFetch(REMOVE_PRODUCTS_FROM_WISHLIST,{variables:{wishlistId, wishlistItemsIds:[wishlistItemId]}, token}); revalidatePath('/wishlist'). Wire into WishlistItemRow via useTransition (same pattern as cart removeItemAction in actions.ts lines 102-110). Note arg name is the misspelled `wishlistItemsIds` (plural with double s) per schema.
  - _Artifacts:_ `storefront/src/lib/wishlist.ts`, `storefront/src/components/WishlistItemRow.tsx`
  - _Depends on:_ Wishlist page; Wishlist data layer
- **Update wishlist item quantity / description** — ⬜ missing · P2 · S
  - _Gap:_ Missing.
  - _Build:_ updateWishlistItemAction(wishlistItemId, {quantity, description}) Server Action calling updateProductsInWishlist(wishlistId, wishlistItems:[{wishlist_item_id, quantity, description, selected_options}]). Add a small qty stepper in WishlistItemRow (mirror cart updateItemQtyAction at actions.ts lines 92-100). selected_options can re-specify a configurable variant if you let users change the chosen swatch from the wishlist; for v1 just send quantity/description.
  - _Artifacts:_ `storefront/src/lib/wishlist.ts`, `storefront/src/components/WishlistItemRow.tsx`
  - _Depends on:_ Wishlist page; Wishlist data layer
- **Move single item to cart** — ⬜ missing · P1 · M
  - _Gap:_ Missing. Existing cart actions add by sku, not by wishlist item id.
  - _Build:_ moveToCartAction(wishlistItemId) Server Action: getActiveWishlistId(token); magentoFetch(ADD_WISHLIST_ITEMS_TO_CART,{variables:{wishlistId, wishlistItemIds:[wishlistItemId]}, token}). Output payload returns { status, add_wishlist_items_to_cart_user_errors{code message}, wishlist }. This mutation targets the CUSTOMER cart implicitly (token-bound) — no cartId needed, which is convenient. Surface user_errors (e.g. out-of-stock, requires-options for configurables). revalidatePath('/wishlist'); revalidatePath('/','layout') to refresh the header cart badge. Optionally the item stays on the wishlist (Magento default keeps it) unless config 'remove after add to cart' is set.
  - _Artifacts:_ `storefront/src/lib/wishlist.ts`, `storefront/src/components/WishlistItemRow.tsx`
  - _Depends on:_ Wishlist page; Wishlist data layer; existing cart/header badge
- **Add all items to cart** — ⬜ missing · P2 · S
  - _Gap:_ Missing.
  - _Build:_ addAllToCartAction() Server Action collecting every wishlist item id and passing wishlistItemIds:[...all] to a single addWishlistItemsToCart call. Inspect add_wishlist_items_to_cart_user_errors to report partial failures (configurable items lacking a stored variant, out-of-stock). revalidatePath('/wishlist') + revalidatePath('/','layout').
  - _Artifacts:_ `storefront/src/lib/wishlist.ts`, `storefront/src/app/wishlist/page.tsx`
  - _Depends on:_ Move single item to cart (shares mutation); Wishlist page
- **Clear wishlist** — ⬜ missing · P3 · S
  - _Gap:_ Missing.
  - _Build:_ clearWishlistAction() Server Action: magentoFetch(CLEAR_WISHLIST,{variables:{wishlistId}, token}); revalidatePath('/wishlist'). Add a 'Clear all' button to the wishlist page header with a confirm step (client component). Output returns { status, wishlist }.
  - _Artifacts:_ `storefront/src/lib/wishlist.ts`, `storefront/src/app/wishlist/page.tsx`
  - _Depends on:_ Wishlist page; Wishlist data layer
- **Wishlist count badge in header** — ⬜ missing · P3 · S
  - _Gap:_ Header has a cart badge via HEADER_SESSION (customer{firstname} + customerCart{total_quantity}) but no wishlist count.
  - _Build:_ Extend the HEADER_SESSION query (queries.ts lines 248-253) to also select customer{ wishlists(pageSize:1){ items_count } } in the same authenticated round-trip — zero extra requests. Render a small badge/link to /wishlist in Header.tsx, shown only when a token is present. Since the header session is already fetched per-request server-side, no caching concern.
  - _Artifacts:_ `storefront/src/lib/queries.ts`, `storefront/src/components/Header.tsx`
  - _Depends on:_ existing HEADER_SESSION header session fetch
- **Wishlisted-state indicator on PDP/PLP** — ⬜ missing · P3 · L
  - _Gap:_ Missing and architecturally non-trivial — catalog pages are anonymous cached RSC (revalidate:120) so they cannot bake in per-customer wishlist state.
  - _Build:_ Two options: (a) lightweight — a per-request client fetch via a Route Handler (src/app/api/wishlist-skus/route.ts) that returns the set of wishlisted SKUs for the current token, called once on mount and used to mark hearts; keeps catalog pages cacheable. (b) heavier — make PDP dynamic for logged-in users. Recommend (a): the cached catalog RSC stays anonymous; a tiny client provider hydrates saved state. After add/remove actions, optimistically toggle and revalidate the route handler's cache tag.
  - _Artifacts:_ `storefront/src/app/api/wishlist-skus/route.ts`, `storefront/src/components/WishlistHeart.tsx`, `storefront/src/components/WishlistButton.tsx`
  - _Depends on:_ Add-to-wishlist button on PDP; Add-to-wishlist button on PLP; Wishlist data layer
- **Share wishlist via email-to-a-friend** — ⬜ missing · P3 · M
  - _Gap:_ Missing. IMPORTANT: there is NO shareWishlist mutation in this instance's 69-mutation surface. Wishlist.sharing_code is read-only. sendEmailToFriend(input:{product_id, recipients[{name,email}], sender{name,email,message}}) is per-PRODUCT, not per-wishlist, and depends on the 'Email to a Friend' feature being enabled in admin.
  - _Build:_ If product-level sharing is acceptable: a 'Share' Server Action shareProductAction(productId, recipients, sender) calling sendEmailToFriend. Render a small share form on PDP and/or per wishlist item. Be honest in the plan that true 'share my whole wishlist by link' is not available headlessly here — at best you can build a custom public read page keyed by sharing_code, but no GraphQL query accepts a sharing_code to read another user's wishlist, so a shared-link view is NOT buildable with the current surface. Recommend deprioritizing or scoping to product email-to-friend only.
  - _Artifacts:_ `storefront/src/lib/wishlist.ts`, `storefront/src/components/ShareProduct.tsx`, `storefront/src/app/product/[slug]/page.tsx`
  - _Depends on:_ PDP; admin 'Email to a Friend' enabled
- **Multiple named wishlists (create/select/rename)** — ⬜ missing · P3 · S
  - _Gap:_ NOT supported on this build. Multiple wishlists is a Magento Commerce (Adobe Commerce) feature; this is Open Source CE 2.4.9, which has exactly ONE wishlist per customer. There is no createWishlist/renameWishlist mutation in the 69-mutation surface. customer.wishlists is plural only for forward-compat and returns a single list.
  - _Build:_ Do NOT build. The plural API is a red herring on CE — always operate on customer.wishlists[0].id. Document this so getActiveWishlistId() simply takes the first (and only) entry. Revisit only if the store is migrated to Adobe Commerce.
  - _Depends on:_ Adobe Commerce edition (not present)
- **Login-redirect / guest gating for wishlist actions** — ⬜ missing · P1 · M
  - _Gap:_ Missing. There is no guest wishlist concept in Magento GraphQL — all wishlist ops require a customer token. The current login flow (auth.ts loginAction) hard-redirects to /account with no return-url support.
  - _Build:_ Wishlist Server Actions return {needsLogin:true} when getCustomerToken() is null; the client component then router.push(`/login?redirect=${encodeURIComponent(path)}`). Extend loginAction/registerAction (auth.ts) to honor a redirect param (read from formData/searchParams) instead of always redirecting to /account. Optionally stash the pending sku in a cookie to auto-add after login (nice-to-have). This gating must be in place before the PDP/PLP buttons ship to avoid confusing guest errors.
  - _Artifacts:_ `storefront/src/lib/auth.ts`, `storefront/src/app/login/page.tsx`, `storefront/src/components/LoginForm.tsx`, `storefront/src/components/WishlistButton.tsx`
  - _Depends on:_ Add-to-wishlist button on PDP; existing auth.ts login flow

</details>

**Domain gotchas:**
- Customer-only, no guest wishlist: every wishlist query and mutation requires a Bearer customer_token. Unlike the cart (which supports a guest_cart_id cookie), Magento GraphQL has no guest/anonymous wishlist. All wishlist Server Actions must read the httpOnly customer_token cookie and gate guests to /login.
- Single wishlist on CE: this is Open Source CE 2.4.9 — exactly ONE wishlist per customer. customer.wishlists is plural only for Adobe Commerce forward-compatibility. There is NO createWishlist/renameWishlist/deleteWishlist mutation in the surface. Always operate on customer.wishlists[0].id; do not hardcode id '1' — fetch it.
- wishlistId is required by every mutation but is NOT discoverable without a read: addProductsToWishlist/remove/update/clear/addWishlistItemsToCart all take wishlistId. You must first query customer.wishlists to get the id (cache it per request). Default id is usually '1' but should be resolved dynamically.
- No native full-wishlist sharing via GraphQL: there is no shareWishlist mutation and no query that accepts a sharing_code to read someone else's wishlist. Wishlist.sharing_code is read-only and effectively unusable headlessly. The only 'share' available is sendEmailToFriend, which is per-PRODUCT (product_id), not per-wishlist, and depends on admin 'Email to a Friend' being enabled.
- Configurable products need selected_options UIDs: adding a configurable product to the wishlist requires the same selected_options variant UIDs used by addProductsToCart. A heart on a PLP/grid (where no variant is chosen) cannot add a configurable — route to the PDP instead. WishlistItemInput fields: sku, quantity, parent_sku, selected_options:[ID], entered_options.
- Schema arg-name quirks: removeProductsFromWishlist uses the misspelled `wishlistItemsIds` (double 's'), while addWishlistItemsToCart uses `wishlistItemIds`. updateProductsInWishlist's input key is `wishlist_item_id` (snake, singular). Easy to get wrong; verified against the live endpoint.
- Wishlist data must never be cached: reads are per-customer and mutable. Use magentoFetch without `revalidate` (defaults to cache:'no-store') and never add Next fetch tags to the wishlist read, unlike the catalog reads which use revalidate:120/tags:['catalog'].
- Catalog-page caching vs per-user state: PDP/PLP are anonymous, cached RSC (revalidate:120). They cannot bake in 'is this product already wishlisted' per customer. Solve filled-heart state via a small client-side fetch to a Route Handler that returns the customer's wishlisted SKUs, keeping the catalog pages cacheable and anonymous.
- addWishlistItemsToCart targets the customer cart implicitly: it is token-bound and needs no cartId — convenient, but it means move-to-cart only works for logged-in customers (consistent with wishlist being customer-only) and you must revalidatePath('/','layout') afterward to refresh the header cart badge.
- Feature toggle: respect magento_wishlist_general_is_enabled from storeConfig. If an admin disables wishlist, all entry points (hearts, /wishlist link, header badge) should hide. Pull this flag alongside the existing storeConfig read.
- items_v2 is paginated: Wishlist.items_v2 returns { items, page_info }. The legacy `items` field is deprecated; always use items_v2 and handle page_info for large wishlists. WishlistItemInterface fields: id, quantity, description, added_at, product, customizable_options.

### 8.9 Product Compare

Product Compare lets shoppers stack 2-N catalog products side by side in an attribute matrix to make a purchase decision. In Magento 2.4.9 GraphQL it is a self-contained subsystem keyed by a compare-list GUID (uid): createCompareList mints the list, addProductsToCompareList/removeProductsFromCompareList mutate it by product uid, compareList(uid) reads back the items plus a synthesized attribute matrix (list-level attributes{code,label} + per-item attributes{code,value}), deleteCompareList clears it, and assignCompareListToCustomer binds a guest list to a logged-in account. It is entirely missing from the current storefront (zero references in src/). It maps cleanly onto our existing dual-pattern stack: the compare-page read is an RSC server-to-server fetch via a new compare-data.ts, and every mutation is a Server Action mirroring actions.ts, with the guest GUID stored in a new httpOnly compare_list_uid cookie exactly like guest_cart_id, and a login-time assign step mirroring mergeGuestCart in auth.ts. It is a P2 engagement feature (not commerce-completeness), modest in size, with no dependency on the unbuilt checkout/payments tracks.

| Feature | Status | Pri | Eff | GraphQL ops |
|---|---|:--:|:--:|---|
| Compare-list session bootstrap & GUID cookie handling | ⬜ missing | P2 | M | `createCompareList` `compareList` `customer (compare_list { uid })` |
| createCompareList (lazy list creation) | ⬜ missing | P2 | S | `createCompareList` |
| Add to compare (action) + Add-to-Compare button on PDP | ⬜ missing | P2 | M | `addProductsToCompareList` `createCompareList` |
| Add-to-compare from PLP / category / search cards | ⬜ missing | P3 | S | `addProductsToCompareList` `createCompareList` |
| Compare page — items list & route | ⬜ missing | P2 | M | `compareList` |
| Attribute comparison matrix (side-by-side table) | ⬜ missing | P2 | L | `compareList` |
| Remove single product from compare | ⬜ missing | P2 | S | `removeProductsFromCompareList` |
| Clear entire compare list | ⬜ missing | P3 | S | `deleteCompareList` `removeProductsFromCompareList` |
| Assign guest compare list to customer on login/register | ⬜ missing | P2 | M | `assignCompareListToCustomer` `customer (compare_list { uid })` |
| Compare count badge / entry point in header | ⬜ missing | P3 | S | `compareList` `customer (compare_list { item_count })` |
| Add-to-cart from compare page | ⬜ missing | P3 | S | `addProductsToCart` |
| De-duplication, max-items & already-on-list state | ⬜ missing | P3 | M | `addProductsToCompareList` `removeProductsFromCompareList` `compareList` |

<details><summary><strong>Build notes</strong> (12 items)</summary>

- **Compare-list session bootstrap & GUID cookie handling** — ⬜ missing · P2 · M
  - _Gap:_ No compare cookie, no resolver, nothing in src/lib. This is the foundational plumbing every other compare feature builds on; analogous infra for the cart (guest_cart_id cookie + resolveCartContext) exists and is the template.
  - _Build:_ New src/lib/compare-cookies.ts mirroring cart-cookies.ts: COMPARE_UID_COOKIE = 'compare_list_uid'; getCompareUid() reads cookie; resolveCompareContext() returns { token, uid } — if customer_token present, read customer{ compare_list { uid } } and prefer that, else fall back to the cookie uid (may be null). A getWritableCompareList() in the actions file (mirrors getWritableCart) lazily calls createCompareList(input:{}) when no uid exists yet, then sets the httpOnly compare_list_uid cookie (sameSite lax, path /, secure in prod, maxAge ~30d) just like GUEST_CART_COOKIE. Guests get a generated GUID; logged-in users get the customer-owned list (no cookie needed once assigned).
  - _Artifacts:_ `storefront/src/lib/compare-cookies.ts`, `storefront/src/lib/queries.ts`, `storefront/src/lib/actions.ts (or new compare-actions.ts)`
- **createCompareList (lazy list creation)** — ⬜ missing · P2 · S
  - _Gap:_ Not implemented. Magento accepts createCompareList(input:{}) with no products and returns compare_list { uid item_count items{...} }. Called on-demand from the add action, never eagerly, to avoid orphan lists.
  - _Build:_ Add CREATE_COMPARE_LIST op to queries.ts: mutation { createCompareList(input:{}) { uid item_count } }. Invoked inside getWritableCompareList() in a Server Action when resolveCompareContext() yields no uid. The returned uid is written to the compare_list_uid httpOnly cookie (guest) — for a logged-in customer Magento auto-associates the new list to the account so assignCompareListToCustomer is unnecessary at creation time. No CORS concern: runs server-side via magentoFetch with optional bearer token.
  - _Artifacts:_ `storefront/src/lib/queries.ts`, `storefront/src/lib/compare-cookies.ts`
  - _Depends on:_ Compare-list session bootstrap & GUID cookie handling
- **Add to compare (action) + Add-to-Compare button on PDP** — ⬜ missing · P2 · M
  - _Gap:_ No action, no button. PDP (/product/[slug]) currently renders only AddToCart. addProductsToCompareList takes uid (the list GUID) + products:[ID!] which are PRODUCT uids (base64), NOT skus — the existing PRODUCT_DETAIL query already selects product.uid, so the data is available to pass into the button.
  - _Build:_ Server Action addToCompareAction(productUid) in compare-actions.ts: resolve-or-create list via getWritableCompareList(), then magentoFetch(ADD_PRODUCTS_TO_COMPARE_LIST, {variables:{uid, products:[productUid]}, token}); revalidatePath('/compare') and revalidatePath('/','layout') for the header count. New client component AddToCompare.tsx ('use client', useTransition like AddToCart.tsx) rendered on the PDP next to AddToCart, receiving product.uid; shows a transient '✓ Added to compare / View compare' confirmation. Mutation goes through the Server Action so the customer_token cookie stays httpOnly and is never exposed to the browser.
  - _Artifacts:_ `storefront/src/lib/compare-actions.ts`, `storefront/src/lib/queries.ts`, `storefront/src/components/AddToCompare.tsx`, `storefront/src/app/product/[slug]/page.tsx`
  - _Depends on:_ createCompareList (lazy list creation); Compare-list session bootstrap & GUID cookie handling
- **Add-to-compare from PLP / category / search cards** — ⬜ missing · P3 · S
  - _Gap:_ ProductCard.tsx is a pure Link with no actions and the card field set (PRODUCT_CARD_FIELDS) already includes uid, so the product uid needed by addProductsToCompareList is present on every card. Requires wrapping a small client control over the otherwise-server card.
  - _Build:_ Add an optional small client overlay button (reuse AddToCompare.tsx in an icon/compact variant) positioned absolutely in ProductCard.tsx's image container, calling the same addToCompareAction(product.uid). Keep ProductCard a server component and embed the client button as a child so the grid stays RSC-rendered. Because the action targets a per-list endpoint, no per-card cart context is needed — just the product uid already on the card.
  - _Artifacts:_ `storefront/src/components/ProductCard.tsx`, `storefront/src/components/AddToCompare.tsx`
  - _Depends on:_ Add to compare (action) + Add-to-Compare button on PDP
- **Compare page — items list & route** — ⬜ missing · P2 · M
  - _Gap:_ Route /compare does not exist. compareList(uid:$uid) returns uid, item_count, attributes{code label}, items{ uid product{ uid sku name url_key small_image{url label} stock_status price_range{...} } attributes{ code value } }. All product sub-fields mirror what PDP/PLP already select, so Price/types can be reused.
  - _Build:_ New RSC route storefront/src/app/compare/page.tsx (force-dynamic / cache:'no-store' because it is session-scoped). New src/lib/compare-data.ts getCompareList(): resolveCompareContext() -> if no uid return null -> magentoFetch(COMPARE_LIST_QUERY,{variables:{uid},token}) with try/catch returning null (mirrors cart-data.ts getCart). Page renders an empty state ('No products to compare' + link to catalog) when null/empty, otherwise hands data to the matrix component. Add COMPARE_LIST_QUERY to queries.ts and CompareList/CompareItem/CompareAttribute types to types.ts.
  - _Artifacts:_ `storefront/src/app/compare/page.tsx`, `storefront/src/lib/compare-data.ts`, `storefront/src/lib/queries.ts`, `storefront/src/lib/types.ts`
  - _Depends on:_ Compare-list session bootstrap & GUID cookie handling; Add to compare (action) + Add-to-Compare button on PDP
- **Attribute comparison matrix (side-by-side table)** — ⬜ missing · P2 · L
  - _Gap:_ No matrix component. Magento returns list-level attributes{code label} (the row headers, store-config driven 'Comparable Attributes') and per-item attributes{code value} (HTML-ish strings). The matrix is built by joining each row code against each item's attributes by code. price/name are top-level item.product fields, not in the attributes array, and must be rendered as fixed header rows.
  - _Build:_ New server component CompareMatrix.tsx (presentational, no client JS needed for display): build a Map per item of code->value, iterate the list attributes to emit rows. Sticky first column for attribute labels, horizontal scroll on mobile (overflow-x-auto, matching the mobile-nav pattern in Header.tsx). Reuse Price.tsx for the price row from item.product.price_range and a thumbnail header row reusing next/image with images.unoptimized config. Values may contain HTML (e.g. description) — render via dangerouslySetInnerHTML only for known-safe attribute codes, plain text otherwise.
  - _Artifacts:_ `storefront/src/components/CompareMatrix.tsx`, `storefront/src/components/Price.tsx`
  - _Depends on:_ Compare page — items list & route
- **Remove single product from compare** — ⬜ missing · P2 · S
  - _Gap:_ Not implemented. removeProductsFromCompareList(input:{uid:$listUid, products:[$productUid]}) returns the updated compare_list. Needs the list GUID from context plus the product uid (available on each compare item).
  - _Build:_ Server Action removeFromCompareAction(productUid) in compare-actions.ts: resolve uid from resolveCompareContext() (no lazy-create here — list must already exist), magentoFetch(REMOVE_PRODUCTS_FROM_COMPARE_LIST,{variables:{uid, products:[productUid]}, token}); revalidatePath('/compare') + revalidatePath('/','layout'). Small client remove button per matrix column (useTransition) wired to the action. If item_count hits 0 the page falls through to its empty state on next render.
  - _Artifacts:_ `storefront/src/lib/compare-actions.ts`, `storefront/src/lib/queries.ts`, `storefront/src/components/CompareMatrix.tsx`
  - _Depends on:_ Compare page — items list & route
- **Clear entire compare list** — ⬜ missing · P3 · S
  - _Gap:_ Not implemented. deleteCompareList(uid:$uid){result} destroys the whole list server-side; after deletion the GUID is dead and the guest cookie must be cleared so the next add mints a fresh list.
  - _Build:_ Server Action clearCompareAction() in compare-actions.ts: magentoFetch(DELETE_COMPARE_LIST,{variables:{uid}, token}); then cookies().delete('compare_list_uid') (mirrors logoutAction clearing cart cookies); revalidatePath('/compare') + revalidatePath('/','layout'). 'Clear all' button on the compare page header. (Alternative to deleteCompareList: bulk removeProductsFromCompareList with all uids, but delete + cookie reset is cleaner for guests.)
  - _Artifacts:_ `storefront/src/lib/compare-actions.ts`, `storefront/src/lib/queries.ts`, `storefront/src/app/compare/page.tsx`
  - _Depends on:_ Compare page — items list & route
- **Assign guest compare list to customer on login/register** — ⬜ missing · P2 · M
  - _Gap:_ Not implemented. auth.ts already has the exact analogue (mergeGuestCart) called inside loginAction/registerAction. assignCompareListToCustomer(uid:$guestUid){ result compare_list{uid} } binds the guest GUID to the authenticated customer; afterwards the guest cookie should be dropped in favor of the customer-owned list.
  - _Build:_ Add assignGuestCompareList(token) helper in auth.ts mirroring mergeGuestCart: read the guest compare_list_uid cookie; if present, magentoFetch(ASSIGN_COMPARE_LIST_TO_CUSTOMER,{variables:{uid:guestUid}, token}); then cookies().delete('compare_list_uid') since the list is now customer-owned and resolved via customer{compare_list{uid}}. Call it right after mergeGuestCart in both loginAction and registerAction. Wrap in try/catch (a stale/empty guest list should not block login). Also clear the compare cookie in logoutAction alongside the cart cookies.
  - _Artifacts:_ `storefront/src/lib/auth.ts`, `storefront/src/lib/queries.ts`, `storefront/src/lib/compare-cookies.ts`
  - _Depends on:_ Compare-list session bootstrap & GUID cookie handling
- **Compare count badge / entry point in header** — ⬜ missing · P3 · S
  - _Gap:_ Header.tsx renders nav + cart badge + auth link but no compare entry. The compare item_count is available from compareList(uid){item_count} (guest) or customer{compare_list{item_count}} (logged in); the logged-in HEADER_SESSION query could be extended to fetch it in the same round-trip.
  - _Build:_ Add a getCompareCount() in compare-data.ts (resolveCompareContext -> compareList(uid){item_count}, return 0 on null/error, mirroring getCartCount). In Header.tsx (already async RSC) extend the logged-in HEADER_SESSION query with customer{ compare_list { item_count } } to avoid an extra round-trip; for guests call getCompareCount(). Render a 'Compare' link with a count pill next to the cart badge, hidden when count is 0.
  - _Artifacts:_ `storefront/src/components/Header.tsx`, `storefront/src/lib/compare-data.ts`, `storefront/src/lib/queries.ts`
  - _Depends on:_ Compare page — items list & route; Compare-list session bootstrap & GUID cookie handling
- **Add-to-cart from compare page** — ⬜ missing · P3 · S
  - _Gap:_ Reuses the already-built cart pipeline. Simple products can be added by sku directly; configurable products on the compare list cannot be added with a single click because compareList does not expose selected_options/variant selection, so those must link out to the PDP.
  - _Build:_ Per-column action in CompareMatrix.tsx: for SimpleProduct (item.product.__typename) reuse the existing addToCartAction({sku}) from actions.ts via a small client button; for ConfigurableProduct render a 'Choose options' Link to /product/[url_key] instead (the compare query already selects product.url_key and we can add __typename). No new GraphQL needed — purely wiring existing cart action into the compare UI.
  - _Artifacts:_ `storefront/src/components/CompareMatrix.tsx`, `storefront/src/lib/actions.ts`, `storefront/src/lib/queries.ts`
  - _Depends on:_ Attribute comparison matrix (side-by-side table)
- **De-duplication, max-items & already-on-list state** — ⬜ missing · P3 · M
  - _Gap:_ Magento silently de-dupes server-side (re-adding an existing product is a no-op, no user_error) and imposes no hard cap, so this is a UX layer. To show toggle state the PDP must know whether the current product uid is already on the list, which requires reading the compare list during PDP render.
  - _Build:_ On PDP, after fetching the product, also call getCompareList() (or a lightweight compareList query returning only items{ product{ uid } }) and pass an isInCompare boolean into AddToCompare.tsx so it renders 'Remove from compare' wired to removeFromCompareAction instead of add. Optionally cap the client UI at ~4-5 products for matrix readability (disable add with a tooltip past the cap). De-dup is free server-side; this work is purely the toggle/affordance.
  - _Artifacts:_ `storefront/src/components/AddToCompare.tsx`, `storefront/src/app/product/[slug]/page.tsx`, `storefront/src/lib/compare-data.ts`
  - _Depends on:_ Add to compare (action) + Add-to-Compare button on PDP; Remove single product from compare

</details>

**Domain gotchas:**
- addProductsToCompareList / removeProductsFromCompareList take PRODUCT uids (base64 ID), NOT skus — unlike the cart which is sku-driven. The existing PRODUCT_CARD_FIELDS and PRODUCT_DETAIL queries already select uid, so pass product.uid (never product.sku) into compare actions.
- The compare list is identified by its own GUID (uid) returned from createCompareList — it is a separate identifier from the cart's masked guest_cart_id. Do not conflate them; use a distinct compare_list_uid httpOnly cookie.
- Guest vs customer resolution differs: guests carry the uid in the cookie, but a logged-in customer's list is read via customer { compare_list { uid } } and is auto-owned by the account — prefer the customer list and ignore the guest cookie once assigned.
- Login must assign the guest list to the customer via assignCompareListToCustomer(uid) — this is the compare analogue of mergeCarts. Without it, a guest who built a compare list then logs in loses it. Place the call right after mergeGuestCart in loginAction/registerAction and then delete the guest compare cookie.
- The matrix has two data sources that must be joined: list-level attributes { code label } are the ROW definitions (driven by the admin 'Comparable Attributes' / store config), while each item's attributes { code value } supply the cell values. Join by code; missing codes render an empty cell. price and name are top-level item.product fields, NOT in the attributes array.
- Attribute values can contain HTML (e.g. description, some textarea attributes). Only dangerouslySetInnerHTML for known-safe codes; render the rest as text to avoid injection.
- compareList is session/GUID-scoped, so /compare and getCompareCount must be uncached (cache:'no-store' / force-dynamic) — do NOT apply the catalog revalidate+tags caching used for category/PDP reads, or one visitor will see another's list.
- After deleteCompareList the GUID is invalid; you must clear the compare_list_uid cookie so the next add re-mints a list, otherwise subsequent compareList(uid) reads will error on a dead GUID (handle with try/catch returning null, like getCart).
- On token expiry, resolveCompareContext should fall back to the guest cookie just as resolveCartContext does — a stale customer_token must not throw and break the compare page.
- Configurable products cannot be one-click added to cart from the compare page because compareList does not expose option/variant selection — link those out to the PDP; only simple products support direct add-to-cart from compare.
- createCompareList should be lazy (only on first add) to avoid minting orphan empty lists and setting cookies for visitors who never use compare.

### 8.10 Reviews & Ratings

The Reviews & Ratings domain is entirely missing from the current build — no PDP rating display, no review list, no write-review form, no aggregate badges on cards, and no "my reviews" account view. The full surface is supported by this Magento 2.4.9 instance and verified against the live endpoint: ProductInterface exposes rating_summary, review_count and a paginated reviews(pageSize,currentPage) field; productReviewRatingsMetadata returns the rating dimensions (Luma has one rating named "Rating" with id "NA==" and five value options, each carrying a base64 value_id); createProductReview is the only mutation; and customer.reviews(pageSize,currentPage) backs an account view. This maps cleanly onto our headless stack: all reads are RSC server-to-server fetches via magentoFetch (cacheable with next.revalidate/tags), and the single write is a Server Action that works for BOTH guests and logged-in customers — store config confirms product_reviews_enabled="1" and allow_guests_to_write_product_reviews="1", and createProductReview takes no cart/token requirement (passing the customer_token cookie when present simply attributes the review to the account). The two big gotchas are (1) ratings/average_rating/rating_summary are PERCENTAGES 0-100, not 1-5 stars, so star widgets must divide by 20; and (2) Magento holds new reviews in a "Pending" moderation queue by default, so a freshly submitted review will NOT appear in the list immediately — the UX must say "submitted for approval" rather than optimistically render it.

| Feature | Status | Pri | Eff | GraphQL ops |
|---|---|:--:|:--:|---|
| PDP rating summary badge (stars + count) | ⬜ missing | P2 | S | `products` |
| PDP reviews list (read, paginated) | ⬜ missing | P2 | M | `products` |
| Rating ratings metadata fetch (form dimensions) | ⬜ missing | P2 | S | `productReviewRatingsMetadata` |
| Write-review form UI (star input + fields) | ⬜ missing | P2 | M | `productReviewRatingsMetadata` |
| Submit review Server Action (createProductReview) | ⬜ missing | P2 | M | `createProductReview` |
| Guest vs customer review gating + nickname prefill | ⬜ missing | P3 | S | `storeConfig` `customer` |
| Pending-moderation UX (no optimistic render) | ⬜ missing | P3 | S | `createProductReview` |
| Star rating on product cards (PLP / search / home) | ⬜ missing | P3 | S | `products` `categories` |
| My Reviews in account area | ⬜ missing | P3 | M | `customer` |
| Reviews pagination / load-more on PDP | ⬜ missing | P3 | M | `products` |
| Ratings breakdown display per review | ⬜ missing | P3 | S | `products` |

<details><summary><strong>Build notes</strong> (11 items)</summary>

- **PDP rating summary badge (stars + count)** — ⬜ missing · P2 · S
  - _Gap:_ PDP (product/[slug]/page.tsx) fetches PRODUCT_DETAIL but does not request rating_summary or review_count. No star widget component exists.
  - _Build:_ Add rating_summary and review_count to PRODUCT_DETAIL in queries.ts (no extra round-trip; same RSC fetch, stays cached revalidate:120 tags:['catalog']). Build a server-renderable Stars component that takes a 0-100 percent and renders 5 SVG stars with fractional fill (percent/20). Render badge under the <h1> in product/[slug]/page.tsx with an anchor link to #reviews. When review_count is 0, render a muted 'No reviews yet — be the first' link to the form.
  - _Artifacts:_ `storefront/src/lib/queries.ts (extend PRODUCT_DETAIL)`, `storefront/src/lib/types.ts (rating_summary, review_count on ProductDetail)`, `storefront/src/components/Stars.tsx (new, server component)`, `storefront/src/app/product/[slug]/page.tsx (render badge)`
- **PDP reviews list (read, paginated)** — ⬜ missing · P2 · M
  - _Gap:_ No reviews section on the PDP. reviews(pageSize,currentPage){items{...} page_info} field is unused.
  - _Build:_ Extend PRODUCT_DETAIL (or a separate PRODUCT_REVIEWS query keyed by sku/url_key for independent pagination) to request reviews(pageSize:5,currentPage:1){items{nickname summary text average_rating created_at ratings_breakdown{name value}} page_info{current_page total_pages}}. Render server-side in a ReviewList component inside product/[slug]/page.tsx under an id='reviews' anchor. average_rating is 0-100 -> reuse Stars (percent/20). For pagination keep it simple first: a separate RSC route segment or a ?reviewPage= search param read in the PDP server component (re-fetch reviews page on param change), since we have no Apollo. created_at is a 'YYYY-MM-DD HH:MM:SS' string — format with a small date helper (extend format.ts).
  - _Artifacts:_ `storefront/src/lib/queries.ts (reviews block / PRODUCT_REVIEWS)`, `storefront/src/lib/types.ts (ProductReview, ProductReviews, RatingBreakdown)`, `storefront/src/components/ReviewList.tsx (new)`, `storefront/src/components/ReviewItem.tsx (new)`, `storefront/src/app/product/[slug]/page.tsx (render section + read ?reviewPage param)`, `storefront/src/lib/format.ts (formatReviewDate)`
  - _Depends on:_ PDP rating summary badge (stars + count)
- **Rating ratings metadata fetch (form dimensions)** — ⬜ missing · P2 · S
  - _Gap:_ productReviewRatingsMetadata is never queried. The form needs the rating id ('NA==') and per-star value_id ('MTY=' .. 'MjA=') to submit createProductReview.
  - _Build:_ Add a REVIEW_RATINGS_METADATA query (productReviewRatingsMetadata{items{id name values{value value_id}}}) to queries.ts. Fetch in the RSC that renders the review form, cached aggressively (revalidate:3600, tags:['review-meta']) since metadata is static config. Pass items down to the client form component so each star button maps its 1-5 index to the correct value_id. Do NOT hardcode the base64 ids — they can differ per environment; resolve them from metadata at render time.
  - _Artifacts:_ `storefront/src/lib/queries.ts (REVIEW_RATINGS_METADATA)`, `storefront/src/lib/types.ts (RatingMetadata, RatingValueMetadata)`, `storefront/src/lib/reviews-data.ts (new, getRatingsMetadata RSC helper)`
- **Write-review form UI (star input + fields)** — ⬜ missing · P2 · M
  - _Gap:_ No review form component exists. AddToCart.tsx is the closest pattern (client component using useTransition + Server Action).
  - _Build:_ Client component ReviewForm.tsx modeled on AddToCart.tsx: useState for selected star value_id + text fields, useTransition to call the createReviewAction Server Action. Build an interactive StarRatingInput (hover/click over 5 buttons) that maps index->value_id from passed metadata. Validate all fields non-empty before enabling submit. Prefill nickname from customer firstname when logged in (pass an optional defaultNickname prop from the RSC that reads customer.firstname via existing token cookie). On success show 'Thanks — your review is awaiting approval' and reset the form; on user_errors/exception show the message inline (same msg pattern as AddToCart).
  - _Artifacts:_ `storefront/src/components/ReviewForm.tsx (new)`, `storefront/src/components/StarRatingInput.tsx (new, client)`, `storefront/src/app/product/[slug]/page.tsx (render form, pass metadata + defaultNickname)`
  - _Depends on:_ Rating ratings metadata fetch (form dimensions); Submit review Server Action (createProductReview)
- **Submit review Server Action (createProductReview)** — ⬜ missing · P2 · M
  - _Gap:_ createProductReview is not wired. No reviews.ts actions file. Input shape verified: {sku, nickname, summary, text, ratings:[{id, value_id}]}.
  - _Build:_ New 'use server' action createReviewAction in src/lib/actions-reviews.ts (or extend actions.ts). Read optional customer_token via getCustomerToken() and pass it to magentoFetch when present (server-to-server, httpOnly cookie never reaches browser) so the review is tied to the account; omit it for guests. Build ratings array as [{id: ratingId, value_id: selectedValueId}] from the form. Call CREATE_PRODUCT_REVIEW returning createProductReview{review{nickname}}. Return {ok, error} and, on success, revalidateTag('catalog') + revalidatePath('/product/[slug]') so review_count/summary refresh once the review is later approved. Trim/length-guard inputs server-side; map GraphQL errors via the existing cleanMessage helper. Note: there are no user_errors on this mutation — failures throw, so wrap in try/catch.
  - _Artifacts:_ `storefront/src/lib/queries.ts (CREATE_PRODUCT_REVIEW)`, `storefront/src/lib/actions-reviews.ts (new) or actions.ts`, `storefront/src/lib/cart-cookies.ts (reuse getCustomerToken)`
- **Guest vs customer review gating + nickname prefill** — ⬜ missing · P3 · S
  - _Gap:_ Gating not implemented. Live config confirms product_reviews_enabled='1' and allow_guests_to_write_product_reviews='1', but the storefront should read these rather than assume.
  - _Build:_ Extend the STORE_CONFIG query with product_reviews_enabled and allow_guests_to_write_product_reviews (string '0'/'1'). In the PDP RSC: if reviews disabled, render nothing; if guest reviews disabled AND no customer_token cookie, render a 'Sign in to write a review' CTA linking to /login instead of the form. When a token exists, fetch customer{firstname} (reuse CUSTOMER_NAME pattern) to pass defaultNickname into ReviewForm. Cache storeConfig read (revalidate:3600).
  - _Artifacts:_ `storefront/src/lib/queries.ts (extend STORE_CONFIG; reuse CUSTOMER_NAME)`, `storefront/src/app/product/[slug]/page.tsx (gating logic + sign-in CTA)`
  - _Depends on:_ Write-review form UI (star input + fields)
- **Pending-moderation UX (no optimistic render)** — ⬜ missing · P3 · S
  - _Gap:_ Not handled. Magento default holds new reviews as 'Pending' in admin; createProductReview returns the review object but it is not yet publicly listed.
  - _Build:_ Pure UX in ReviewForm success state: show a persistent confirmation ('Thank you — your review has been submitted and will appear after approval') and do NOT append the returned review to the visible ReviewList. Do not rely on revalidation to surface it immediately. Optionally surface the just-submitted review back to the same shopper via createProductReview's returned review{nickname summary text average_rating} purely as an echo card labelled 'Your review (pending)'.
  - _Artifacts:_ `storefront/src/components/ReviewForm.tsx (success messaging)`
  - _Depends on:_ Submit review Server Action (createProductReview)
- **Star rating on product cards (PLP / search / home)** — ⬜ missing · P3 · S
  - _Gap:_ PRODUCT_CARD_FIELDS in queries.ts omits rating_summary/review_count; ProductCard.tsx has no stars.
  - _Build:_ Add rating_summary and review_count to the shared PRODUCT_CARD_FIELDS fragment in queries.ts (propagates to CATEGORY_PAGE, SEARCH_PRODUCTS, FEATURED_BY_URLKEY, PRODUCTS_BY_CATEGORY_UID with zero new round-trips). Add the two fields to the Product type. Render a small Stars (percent/20) + count under the name in ProductCard.tsx; hide entirely when review_count is 0 to avoid empty 0-star rows. Reuse the same server-rendered Stars component from the PDP badge.
  - _Artifacts:_ `storefront/src/lib/queries.ts (PRODUCT_CARD_FIELDS)`, `storefront/src/lib/types.ts (Product)`, `storefront/src/components/ProductCard.tsx`, `storefront/src/components/Stars.tsx (reuse)`
  - _Depends on:_ PDP rating summary badge (stars + count)
- **My Reviews in account area** — ⬜ missing · P3 · M
  - _Gap:_ customer.reviews(pageSize,currentPage) exists but the /account page only shows profile + orders.
  - _Build:_ Add a MY_REVIEWS query (customer{reviews(pageSize:20,currentPage:1){items{summary text average_rating created_at product{name url_key}} page_info{total_pages}}}). Fetch in a new RSC route /account/reviews (or a section on /account) using the existing token cookie via getCustomerToken() (no-store, authenticated). Render with the shared Stars and a link to each product. Add a nav link from /account. Same token-expiry redirect-to-login guard used in account/page.tsx.
  - _Artifacts:_ `storefront/src/lib/queries.ts (MY_REVIEWS)`, `storefront/src/app/account/reviews/page.tsx (new) or section in account/page.tsx`, `storefront/src/components/Stars.tsx (reuse)`
  - _Depends on:_ PDP rating summary badge (stars + count)
- **Reviews pagination / load-more on PDP** — ⬜ missing · P3 · M
  - _Gap:_ page_info{current_page total_pages} is available on reviews; no pagination control built. Confirmed live: products can have total_pages>1.
  - _Build:_ Two options in our no-Apollo stack: (a) server-driven via a ?reviewPage= search param read by the PDP RSC, re-fetching the reviews page on navigation (simple, SEO-friendly, matches existing PLP pagination pattern); or (b) a client 'Load more' component calling a dedicated Server Action getMoreReviews(urlKey,page) that returns the next page's items to append. Prefer (a) for parity with category pagination; reuse page_info to render numbered/prev-next links anchored to #reviews.
  - _Artifacts:_ `storefront/src/app/product/[slug]/page.tsx (read ?reviewPage, render pager)`, `storefront/src/lib/queries.ts (PRODUCT_REVIEWS keyed by page)`, `storefront/src/components/ReviewPagination.tsx (new)`
  - _Depends on:_ PDP reviews list (read, paginated)
- **Ratings breakdown display per review** — ⬜ missing · P3 · S
  - _Gap:_ ratings_breakdown{name value} is available on each ProductReview and currently unused. Luma returns one entry name='Rating' value='1'..'5'.
  - _Build:_ Include ratings_breakdown{name value} in the reviews selection. In ReviewItem, when there is a single dimension just render the star row from average_rating; when multiple dimensions exist, render a labelled mini-bar per dimension (value is a 1-5 string here, not a percent — render as value/5 stars, distinct from the 0-100 average_rating). Keep this additive so it gracefully handles future multi-rating configs.
  - _Artifacts:_ `storefront/src/components/ReviewItem.tsx (breakdown rendering)`, `storefront/src/lib/types.ts (RatingBreakdown {name,value})`
  - _Depends on:_ PDP reviews list (read, paginated)

</details>

**Domain gotchas:**
- rating_summary AND average_rating are PERCENTAGES (0-100), not 1-5. Verified live: average_rating 20 = 1 star, 60 = 3 stars. Star widgets must compute percent/20 (or width:percent% fill). This is the #1 mistake to avoid.
- ratings_breakdown[].value is DIFFERENT: it is a raw 1-5 string, not a percent. Don't apply the /20 conversion to breakdown values — only to rating_summary/average_rating.
- createProductReview ratings input requires base64 ids: ratings:[{id, value_id}] where id is the rating dimension id (Luma: 'NA==') and value_id is the chosen star's base64 (1 star='MTY=' .. 5 stars='MjA='). These MUST come from productReviewRatingsMetadata at runtime — do not hardcode; they can differ per environment.
- New reviews are held in Magento's moderation queue (status Pending) by default. createProductReview succeeds and returns the review object, but it will NOT appear in product.reviews until an admin approves it. Never optimistically append it to the public list; show 'awaiting approval' instead.
- Guest reviews are allowed here (allow_guests_to_write_product_reviews='1') and createProductReview needs no cart/token. Passing the customer_token cookie (server-to-server) simply attributes the review to the account; omit it for guests. Gate the form on storeConfig.product_reviews_enabled / allow_guests_to_write_product_reviews rather than assuming.
- createProductReview has NO user_errors field (unlike addProductsToCart). Validation/failure surfaces as a thrown GraphQL error, so the Server Action must try/catch and map the message — reuse the existing cleanMessage() helper from auth.ts.
- created_at is a plain 'YYYY-MM-DD HH:MM:SS' string in store time, not ISO-8601. Parse/format it explicitly (extend format.ts) rather than passing straight to Date() which may misinterpret timezone.
- Adding rating_summary/review_count to the shared PRODUCT_CARD_FIELDS fragment instantly lights up stars across PLP, search and home with zero extra round-trips — but products with review_count 0 return rating_summary 0, which would render an empty 5-star row; hide the widget when review_count===0.
- productReviewRatingsMetadata is static config — cache it hard (revalidate:3600, tag it) instead of refetching per PDP render. Same for the storeConfig review flags.
- Magento's review IDs (ratings metadata ids/value_ids) are base64-encoded uids; treat them as opaque strings end-to-end and never decode/transform them, mirroring how the existing code treats configurable selected_options uids.

### 8.11 CMS & Content (PageBuilder)

Magento exposes editorial content through three GraphQL operations: cmsPage(identifier|id) for full pages, cmsBlocks(identifiers) for reusable HTML fragments, and route(url) which resolves any storefront URL to its underlying entity (CmsPage, CategoryTree, or product types) — the headless equivalent of Magento's URL rewrite + routing layer. All three are pure reads, so they fit our RSC server-to-server fetch pattern in src/lib/magento.ts with Next fetch caching (revalidate + tags), no tokens or cookies needed. The content field is a raw HTML string that we render with dangerouslySetInnerHTML — the exact pattern already used for product.description.html in the PDP. The critical headless gotchas are: (1) Magento ships CMS HTML with ABSOLUTE backend links (https://magento.test/...) and inline styles that must be sanitized/rewritten to relative storefront routes; (2) PageBuilder content is just enriched HTML carrying data-content-type attributes plus a separate CSS contract and inline styles — Magento does NOT return the PageBuilder CSS over GraphQL, so we must self-host the PageBuilder stylesheet for layouts/sliders/tabs to look right; and (3) this particular Luma install authored its sample pages as CLASSIC HTML (no data-content-type markup) and embeds legacy {{widget}}/{{store}} directives that GraphQL leaves unparsed in some content. Currently NONE of this exists — the home page is a hardcoded hero/category/featured layout, the footer is static text, and there are no CMS routes — so the entire domain is greenfield except that the rendering primitive (dangerouslySetInnerHTML) is already proven in the codebase.

| Feature | Status | Pri | Eff | GraphQL ops |
|---|---|:--:|:--:|---|
| CMS HTML renderer component (sanitize + link rewrite) | ⬜ missing | P1 | M | — |
| CMS page route + rendering (/page/[identifier] or /[...slug]) | ⬜ missing | P1 | S | `cmsPage` |
| Universal route resolver (catch-all CMS/category/product URLs) | ⬜ missing | P2 | L | `route` `cmsPage` |
| CMS blocks fetch + render (reusable content fragments) | ⬜ missing | P2 | S | `cmsBlocks` |
| PageBuilder markup + CSS support | ⬜ missing | P2 | XL | `cmsPage` `cmsBlocks` |
| Home page from CMS (cms_home_page) with hardcoded fallback | 🟡 partial | P3 | S | `cmsPage` `storeConfig` |
| Footer links from CMS pages | ⬜ missing | P2 | S | `cmsPage` |
| Category description rendering (CMS/PageBuilder HTML on PLP) | 🟡 partial | P2 | S | `categories` |
| 404 / no-route CMS page | ⬜ missing | P3 | S | `cmsPage` `storeConfig` |
| Widget directive handling ({{widget}} / {{store}} / {{media url}}) | ⬜ missing | P3 | M | `cmsBlocks` `cmsPage` |
| CMS content cache invalidation (on-demand revalidation) | ⬜ missing | P3 | M | — |

<details><summary><strong>Build notes</strong> (11 items)</summary>

- **CMS HTML renderer component (sanitize + link rewrite)** — ⬜ missing · P1 · M
  - _Gap:_ Nothing exists. The PDP already uses raw dangerouslySetInnerHTML for product.description.html (product/[slug]/page.tsx:106) with no sanitization or link rewriting — that same naive approach would leak https://magento.test/... links into CMS content. Verified live: sale-left-menu-block content contains absolute hrefs like https://magento.test/women/tops-women/hoodies-and-sweatshirts-women.html and inline style= attributes.
  - _Build:_ Create src/components/CmsContent.tsx (server component, no 'use client'). Input: { html: string }. Pre-process the string server-side: (a) rewrite href='https://magento.test/...html' to relative storefront routes (strip backend host + .html suffix, map /women/... category paths to /category/... and product paths to /product/...); (b) optionally run through a sanitizer (isomorphic-dompurify) to drop <script>/on* handlers — Magento content is admin-authored so trust is moderate, but sanitization is cheap insurance; (c) render via <div className='cms-content' dangerouslySetInnerHTML={{__html: processed}} />. Add a .cms-content scope in globals.css to give raw HTML sane typography (Tailwind v4 resets remove default h2/ul/p styling, so unstyled CMS HTML looks broken without this). Centralize the magento.test->relative rewrite in a helper in src/lib/format.ts (reuse base_media_url logic). Refactor the PDP description to use this same component.
  - _Artifacts:_ `src/components/CmsContent.tsx`, `src/lib/format.ts (add rewriteCmsLinks + media URL helper)`, `src/app/globals.css (.cms-content typography scope)`, `src/app/product/[slug]/page.tsx (refactor description to use CmsContent)`
- **CMS page route + rendering (/page/[identifier] or /[...slug])** — ⬜ missing · P1 · S
  - _Gap:_ No CMS page route exists. Verified live that real content is present: about-us (1147 chars), customer-service (4158 chars), privacy-policy-cookie-restriction-mode (20772 chars), enable-cookies (892 chars), no-route (839 chars), all page_layout=1column except no-route=2columns-right.
  - _Build:_ RSC read. Add CMS_PAGE query to queries.ts selecting identifier, url_key, title, content_heading, content, page_layout, meta_title, meta_description. Create route app/page/[identifier]/page.tsx (or fold into the universal route resolver below). Fetch with magentoFetch(CMS_PAGE, { variables:{ identifier }, revalidate: 3600, tags:['cms', `cms-page-${identifier}`] }). Render <h1>{title}</h1> (or content_heading) then <CmsContent html={content} />. Implement generateMetadata from meta_title/meta_description. Call notFound() when cmsPage is null (GraphQL returns an error 'The CMS page with the X ID doesn't exist' for unknown identifiers — catch and 404). Map page_layout to a wrapper width class (1column vs 2columns-*).
  - _Artifacts:_ `src/lib/queries.ts (CMS_PAGE)`, `src/lib/types.ts (CmsPage type)`, `src/app/page/[identifier]/page.tsx`
  - _Depends on:_ CMS HTML renderer component (sanitize + link rewrite)
- **Universal route resolver (catch-all CMS/category/product URLs)** — ⬜ missing · P2 · L
  - _Gap:_ Not built. Verified live: route(url:"/") -> CmsPage{relative_url:'home', type:CMS_PAGE}; route returns RoutableInterface whose possibleTypes are CmsPage, CategoryTree, and all product types (Simple/Virtual/Downloadable/Bundle/Grouped/Configurable). This lets URLs resolve without hardcoded prefixes.
  - _Build:_ RSC read. Add app/[...slug]/page.tsx as a low-priority catch-all (App Router matches static/dynamic segments first, so existing /category, /product, /cart etc. win). Build ROUTE_RESOLVER query: route(url:$url){ __typename redirect_code relative_url ... on CmsPage{...} ... on CategoryTree{uid url_key} ... on ProductInterface{uid url_key} }. Join params.slug with '/' for the url arg. Switch on __typename: CmsPage -> render via CmsContent; CategoryTree/Product -> redirect() to our existing /category/[slug] or /product/[slug] routes (or render inline). Honor redirect_code (301/302) with Next redirect(). This is the 'correct' headless approach but is more complex than the simple /page/[identifier] route; can ship /page/[identifier] first (P1) and add this later (P2) for native-URL fidelity. Cache revalidate:3600, tags:['cms','route'].
  - _Artifacts:_ `src/lib/queries.ts (ROUTE_RESOLVER)`, `src/app/[...slug]/page.tsx`
  - _Depends on:_ CMS page route + rendering (/page/[identifier] or /[...slug])
- **CMS blocks fetch + render (reusable content fragments)** — ⬜ missing · P2 · S
  - _Gap:_ Not built. Verified live: cmsBlocks(identifiers:[...]) works and returns real fragments — sale-left-menu-block (1650 chars, category nav lists) and gear-left-menu-block (380 chars). Fields available: identifier, title, content. Content is classic HTML with absolute magento.test links (needs the link-rewrite from the renderer feature).
  - _Build:_ RSC read. Add CMS_BLOCKS query: cmsBlocks(identifiers:$ids){ items{ identifier title content } }. Create src/components/CmsBlock.tsx (async server component) accepting an identifier, fetching with revalidate:3600 tags:['cms', `cms-block-${id}`], and rendering through <CmsContent html={item.content} />. Support fetching multiple identifiers in one round-trip for layout efficiency. Gracefully render nothing if the block is missing/empty.
  - _Artifacts:_ `src/lib/queries.ts (CMS_BLOCKS)`, `src/lib/types.ts (CmsBlock type)`, `src/components/CmsBlock.tsx`
  - _Depends on:_ CMS HTML renderer component (sanitize + link rewrite)
- **PageBuilder markup + CSS support** — ⬜ missing · P2 · XL
  - _Gap:_ Not built and not exercised by this install: verified the Luma sample pages (customer-service, about-us) and blocks use CLASSIC HTML with NO data-content-type attributes — so no PageBuilder markup is present in current seed data. However any admin-authored PageBuilder content WILL carry data-content-type and depends on PageBuilder CSS that Magento does NOT return over GraphQL.
  - _Build:_ Two parts. (1) CSS: self-host Magento's PageBuilder frontend stylesheet (extract from the backend theme's pub/static .../Magento_PageBuilder css, or use a community headless-pagebuilder CSS package) and import it scoped under .cms-content in globals.css, so [data-content-type='row'\|'banner'\|'slider'\|'buttons'\|'tabs'] lay out correctly. (2) Media/JS: PageBuilder inline styles reference background images via inline style url() — these point at backend media and must pass through the same magento.test rewrite + Next image config (already images.unoptimized for local). Interactive content types (slider, tabs, accordion) ship inert HTML over GraphQL with no JS; to make them interactive, either (a) ship a small client component (src/components/PageBuilderEnhancer.tsx, 'use client') that hydrates data-content-type='slider'/'tabs'/'accordion' with React behavior after mount, or (b) accept static rendering (all slides/tabs stacked) for MVP. Decision: static render first (covers 90% of PageBuilder: rows/columns/banners/text/buttons/images), add the enhancer only if sliders/tabs appear in real content. All sanitization must whitelist data-* and style attributes (DOMPurify strips them by default — configure ALLOWED_ATTR).
  - _Artifacts:_ `src/app/globals.css (import PageBuilder CSS scoped to .cms-content)`, `src/components/CmsContent.tsx (preserve data-* + style attrs through sanitizer)`, `src/components/PageBuilderEnhancer.tsx (optional client hydration for slider/tabs/accordion)`
  - _Depends on:_ CMS HTML renderer component (sanitize + link rewrite)
- **Home page from CMS (cms_home_page) with hardcoded fallback** — 🟡 partial · P3 · S
  - _Gap:_ Home renders today but is 100% hardcoded JSX (app/page.tsx: gradient hero, TOP_NAV category tiles, FEATURED_BY_URLKEY product rows). The CMS side is plumbed in Magento — verified storeConfig.cms_home_page='home' and route('/') resolves to CmsPage 'home' — BUT the 'home' CMS page content is EMPTY in this install (content length 0). So there is no CMS home content to render yet.
  - _Build:_ RSC read. Add cms_home_page to the STORE_CONFIG query. In app/page.tsx, fetch cmsPage(identifier: cms_home_page); if content is non-empty render <CmsContent/> (optionally above/below the existing curated featured rows); if empty (current state) keep the hardcoded hero+featured as fallback. Recommendation: keep the curated featured-product rows (they use live catalog data the CMS can't easily produce) and treat CMS home content as an optional banner slot. Cache revalidate:600 tags:['cms','cms-page-home']. Low urgency since current home works and CMS content is empty — this is a 'merchandiser editability' enhancement, not a gap.
  - _Artifacts:_ `src/lib/queries.ts (add cms_home_page to STORE_CONFIG)`, `src/app/page.tsx (conditional CMS slot + fallback)`
  - _Depends on:_ CMS HTML renderer component (sanitize + link rewrite)
- **Footer links from CMS pages** — ⬜ missing · P2 · S
  - _Gap:_ Footer.tsx is fully static (just the Luma-headless brand blurb, zero links). Magento has no single 'footer links' GraphQL feed; Luma normally renders footer links from a 'footer_links_block' CMS block and/or hardcoded CMS-page links. Verified the target pages exist (about-us, customer-service, privacy-policy-cookie-restriction-mode, enable-cookies).
  - _Build:_ Two options. (a) Simple/recommended: hardcode the link list in Footer.tsx pointing at our /page/[identifier] routes (/page/about-us, /page/customer-service, /page/privacy-policy-cookie-restriction-mode, /page/enable-cookies) — these identifiers are stable Luma defaults. (b) CMS-driven: render a footer CMS block via <CmsBlock identifier='...'/> if the merchant maintains one. Start with (a). Group into 'Company' and 'Customer Service' columns. No GraphQL needed for option (a) beyond the page routes existing.
  - _Artifacts:_ `src/components/Footer.tsx`
  - _Depends on:_ CMS page route + rendering (/page/[identifier] or /[...slug])
- **Category description rendering (CMS/PageBuilder HTML on PLP)** — 🟡 partial · P2 · S
  - _Gap:_ The CATEGORY_PAGE query already selects category.description, and types.ts has Category.description, but the category route (category/[slug]/page.tsx) NEVER renders it — the field is fetched and dropped. So the data is available but unused.
  - _Build:_ RSC read (already fetched). In category/[slug]/page.tsx, render <CmsContent html={cat.description}/> below the H1/product-count when description is non-empty. This reuses the description field already in CATEGORY_PAGE — only a render change plus the shared CmsContent component. Same link-rewrite/PageBuilder-CSS concerns apply since category descriptions can be PageBuilder content.
  - _Artifacts:_ `src/app/category/[slug]/page.tsx (render description via CmsContent)`
  - _Depends on:_ CMS HTML renderer component (sanitize + link rewrite)
- **404 / no-route CMS page** — ⬜ missing · P3 · S
  - _Gap:_ No custom not-found page exists (only a generic notFound() in category/product routes). Verified storeConfig.cms_no_route='no-route' and the 'no-route' CMS page exists with content (839 chars, page_layout=2columns-right).
  - _Build:_ RSC read. Add app/not-found.tsx that fetches storeConfig.cms_no_route then cmsPage(identifier:no_route) and renders <CmsContent/>. Cache aggressively (revalidate:3600). Note: Next's not-found component runs at render time so the fetch is fine. Also use storeConfig.cms_no_route in the universal route resolver's null branch.
  - _Artifacts:_ `src/app/not-found.tsx`, `src/lib/queries.ts (add cms_no_route to STORE_CONFIG)`
  - _Depends on:_ CMS HTML renderer component (sanitize + link rewrite)
- **Widget directive handling ({{widget}} / {{store}} / {{media url}})** — ⬜ missing · P3 · M
  - _Gap:_ Not handled. In this install the sampled pages return fully-rendered HTML (no raw directives in customer-service/about-us), but Magento GraphQL is known to leave certain {{widget}} directives (esp. dynamic product/catalog widgets) and occasionally {{media url}} unresolved in content. The classic CMS blocks here already use absolute magento.test URLs (the rewrite case), and inline style= is present.
  - _Build:_ String post-processing in the CmsContent pre-processor (src/lib/format.ts). Handle the common cases: rewrite any leftover {{media url='X'}} to base_media_url+X; rewrite {{store url='X'}} / {{store direct_url='X'}} to relative paths; for {{widget type='Magento\\CatalogWidget\\Block\\Product\\ProductsList' ...}} (which GraphQL does NOT render), detect the directive and either strip it or, for a fuller solution, parse its conditions and resolve to a products() query and inject a <ProductGrid/>. MVP: strip unrenderable widget directives so they don't show as raw text; full widget resolution is a separate large effort. Add unit coverage for the rewrite regexes.
  - _Artifacts:_ `src/lib/format.ts (directive + widget stripping/rewriting)`, `src/components/CmsContent.tsx (apply pre-processor)`
  - _Depends on:_ CMS HTML renderer component (sanitize + link rewrite)
- **CMS content cache invalidation (on-demand revalidation)** — ⬜ missing · P3 · M
  - _Gap:_ No revalidation endpoint exists anywhere in the app (catalog reads use time-based revalidate+tags like ['catalog'] but nothing triggers revalidateTag). CMS content changes infrequently, so time-based revalidate (1h) is acceptable for MVP, but there's no instant-publish path.
  - _Build:_ Tag all CMS reads with stable tags ('cms', `cms-page-${id}`, `cms-block-${id}`). Add a route handler app/api/revalidate/route.ts that accepts a secret token + tag(s) and calls revalidateTag(). Wire a Magento-side webhook/observer (or a manual admin tool) to POST to it on CMS page/block save. This is shared infra with the rest of the catalog (same revalidate plumbing) so build it once. Lowest priority — purely an editorial-freshness optimization.
  - _Artifacts:_ `src/app/api/revalidate/route.ts`, `src/lib/magento.ts (ensure consistent CMS tags)`
  - _Depends on:_ CMS page route + rendering (/page/[identifier] or /[...slug]); CMS blocks fetch + render (reusable content fragments)

</details>

**Domain gotchas:**
- CMS content carries ABSOLUTE backend URLs: verified sale-left-menu-block contains hrefs like https://magento.test/women/tops-women/hoodies-and-sweatshirts-women.html. Rendering raw would send shoppers to the Magento backend and break the headless SPA. Every CMS string must pass a link-rewrite step (strip backend host, drop .html, map to /category//product/ routes) BEFORE dangerouslySetInnerHTML.
- PageBuilder CSS is NOT delivered over GraphQL. The content field has data-content-type attributes + inline styles that assume Magento's PageBuilder stylesheet is loaded. In headless you must self-host that CSS scoped under .cms-content or layouts/banners/sliders render as unstyled stacked divs. This is the single biggest reason naive CMS rendering looks broken.
- This specific Luma install authored sample pages as CLASSIC HTML, not PageBuilder — verified zero data-content-type attributes in customer-service/about-us and in the CMS blocks. So you cannot validate PageBuilder rendering against the seed data; you must test with admin-created PageBuilder content. Don't assume the seed data exercises the hard path.
- Tailwind v4's preflight reset strips default styling from h1/h2/ul/p/a. Raw CMS HTML (which relies on browser defaults) will render as unstyled run-together text unless you add a .cms-content typography scope in globals.css. The existing PDP description (dangerouslySetInnerHTML at product/[slug]/page.tsx:106) likely already looks under-styled for the same reason.
- DOMPurify (the natural sanitizer choice) strips data-* and inline style attributes by default — exactly what PageBuilder needs to lay out. If you sanitize, you must explicitly allow data-content-type/data-element/style or PageBuilder breaks. Balance XSS safety vs PageBuilder fidelity; content is admin-authored so a permissive ALLOWED_ATTR is reasonable.
- cmsPage with an unknown identifier returns a GraphQL ERROR (verified: 'The CMS page with the "404-not-found" ID doesn't exist'), not null data — so magentoFetch will throw. CMS page routes must try/catch and call notFound() rather than expecting a null cmsPage.
- route(url) is the only operation that maps a raw storefront path to an entity type, and it covers CmsPage + CategoryTree + all product types (verified possibleTypes). It honors redirect_code for 301/302. A universal catch-all using it is the 'correct' way to mirror Magento URL rewrites, but it must be the LOWEST-priority App Router segment so existing /category, /product, /cart, /search routes still win.
- The 'home' CMS page exists and is the configured cms_home_page, but its content is EMPTY in this install (verified content length 0). Do not rip out the working hardcoded hero/featured home to wire up CMS home — there's nothing to render. Treat CMS home as an optional merchandising slot with the curated layout as fallback.
- Dynamic {{widget}} directives (e.g. CatalogWidget ProductsList) are frequently NOT rendered by Magento GraphQL and can leak into content as raw {{...}} text. They cannot be resolved by HTML rendering alone — you must detect and either strip them or re-implement the widget by issuing a products() query and rendering a ProductGrid.
- page_layout varies per page (verified 1column for most, 2columns-right for no-route). To match Magento visuals you must map page_layout values to wrapper widths / sidebar presence; ignoring it makes 2-column pages render full-width.

### 8.12 Newsletter, Contact & Share

This domain covers three transactional "engagement" forms exposed by Magento GraphQL: footer newsletter signup (subscribeEmailToNewsletter), a contact-us form (contactUs), and email-a-product / share-with-friend (sendEmailToFriend), plus optional reCAPTCHA gating shared by all three. All four are entirely missing from the current build — the Footer is a static component, there is no /contact route, and the PDP has no share UI. Each form maps cleanly onto the established stack pattern: a "use server" Server Action in a new src/lib/engage.ts calling magentoFetch (no-store, no token required since all three work for guests), driven by a client component using React 19 useActionState exactly like LoginForm/RegisterForm. None of these need cart/customer tokens, so they are low-risk additions, but they are pure engagement (P2/P3) — none block core commerce. The one real cross-cutting gotcha is reCAPTCHA: on this instance recaptchaV3Config returns is_enabled:false with an empty website_key, so v3 is currently OFF, but a production-correct implementation must read recaptchaV3Config, conditionally render the Google script + token client-side, and forward the token via the X-ReCaptcha HTTP header (not a GraphQL argument), which requires a small extension to magentoFetch.

| Feature | Status | Pri | Eff | GraphQL ops |
|---|---|:--:|:--:|---|
| Footer newsletter signup | ⬜ missing | P2 | S | `subscribeEmailToNewsletter` |
| Newsletter double-opt-in / status messaging | ⬜ missing | P3 | S | `subscribeEmailToNewsletter` |
| Account-page newsletter preference (optional) | ⬜ missing | P3 | M | `subscribeEmailToNewsletter` `updateCustomerV2` |
| Contact Us form + route | ⬜ missing | P2 | M | `contactUs` |
| Contact form server-side validation & error mapping | ⬜ missing | P3 | S | `contactUs` |
| Email a friend (share product) from PDP | ⬜ missing | P3 | M | `sendEmailToFriend` |
| Multi-recipient handling for email-a-friend | ⬜ missing | P3 | S | `sendEmailToFriend` |
| reCAPTCHA gating for engagement forms | ⬜ missing | P3 | L | `recaptchaV3Config` `recaptchaFormConfig` `subscribeEmailToNewsletter` `contactUs` `sendEmailToFriend` |
| Footer information architecture (links to Contact/CMS) | ⬜ missing | P2 | S | — |

<details><summary><strong>Build notes</strong> (9 items)</summary>

- **Footer newsletter signup** — ⬜ missing · P2 · S
  - _Gap:_ Footer.tsx is a static server component with no form. No subscribe action, query constant, or client widget exists. subscribeEmailToNewsletter(email: String!) returns { status } of SubscriptionStatusesEnum (SUBSCRIBED \| NOT_ACTIVE \| UNSUBSCRIBED \| UNCONFIRMED) — confirmed against the live schema.
  - _Build:_ Add SUBSCRIBE_NEWSLETTER op to queries.ts: `mutation($email:String!){subscribeEmailToNewsletter(email:$email){status}}`. Create src/lib/engage.ts ("use server") with subscribeNewsletterAction(prev,formData) following the auth.ts pattern: validate email server-side, call magentoFetch (cache: no-store, no token), map status to a friendly message (SUBSCRIBED = 'You are subscribed'; UNCONFIRMED/NOT_ACTIVE = 'Check your email to confirm' for double-opt-in stores), catch GraphQL errors (e.g. 'already subscribed') via the existing cleanMessage helper. Build a client NewsletterForm.tsx using useActionState (mirror LoginForm). Convert Footer.tsx to render it in a new column. No cookie/token handling needed. Optionally read storeConfig for a heading, but there is no newsletter_general_active field in 2.4.9 so do not gate on config — rely on try/catch.
  - _Artifacts:_ `src/lib/queries.ts`, `src/lib/engage.ts`, `src/components/NewsletterForm.tsx`, `src/components/Footer.tsx`
- **Newsletter double-opt-in / status messaging** — ⬜ missing · P3 · S
  - _Gap:_ Sub-feature of the signup. The returned SubscriptionStatusesEnum must be branched on; many Luma installs default to double opt-in, returning NOT_ACTIVE/UNCONFIRMED rather than SUBSCRIBED. Currently nothing reads the status.
  - _Build:_ In subscribeNewsletterAction, switch on result.subscribeEmailToNewsletter.status: SUBSCRIBED -> success; NOT_ACTIVE \| UNCONFIRMED -> 'Almost there — confirm via the email we just sent'; UNSUBSCRIBED -> generic. Return a typed state { status, message } from the action so NewsletterForm can style success vs pending differently. Pure server-side logic, no new infra.
  - _Artifacts:_ `src/lib/engage.ts`, `src/components/NewsletterForm.tsx`
  - _Depends on:_ Footer newsletter signup
- **Account-page newsletter preference (optional)** — ⬜ missing · P3 · M
  - _Gap:_ Magento exposes customer.is_subscribed on the customer query and updateCustomerV2(input:{is_subscribed}) to toggle. The /account page currently shows profile + orders only. subscribeEmailToNewsletter also works for the logged-in email. No subscription state is read or written today.
  - _Build:_ Extend CUSTOMER_ACCOUNT query in queries.ts to include is_subscribed. Add a toggleSubscriptionAction in engage.ts (or auth.ts) using updateCustomerV2 with the customer_token from the httpOnly cookie (token passed to magentoFetch, like other authed calls). Render a checkbox/toggle on /account that calls the action and revalidatePath('/account'). Lower value than the footer form; engagement nicety for registered users.
  - _Artifacts:_ `src/lib/queries.ts`, `src/lib/engage.ts`, `src/app/account/page.tsx`
  - _Depends on:_ Footer newsletter signup
- **Contact Us form + route** — ⬜ missing · P2 · M
  - _Gap:_ No /contact route, no form, no action. Confirmed live schema: contactUs(input: ContactUsInput!) requires name, email, comment (all String!), telephone is optional; returns { status } (Boolean). Works for guests, no token.
  - _Build:_ Add CONTACT_US op to queries.ts: `mutation($input:ContactUsInput!){contactUs(input:$input){status}}`. Add contactUsAction(prev,formData) to engage.ts: read name/email/comment/telephone, validate required fields server-side, call magentoFetch (no-store, no token), return {ok,message} state. Create src/app/contact/page.tsx (server component shell + metadata) rendering a client ContactForm.tsx via useActionState (mirror RegisterForm's multi-field layout). On success, swap the form for a thank-you panel. Link to /contact from Footer. No cookie handling.
  - _Artifacts:_ `src/lib/queries.ts`, `src/lib/engage.ts`, `src/app/contact/page.tsx`, `src/components/ContactForm.tsx`, `src/components/Footer.tsx`
- **Contact form server-side validation & error mapping** — ⬜ missing · P3 · S
  - _Gap:_ Sub-feature. The contactUs mutation throws GraphQL errors on missing fields or recaptcha failure; these must be caught and surfaced rather than crashing the action.
  - _Build:_ In contactUsAction, do field presence + basic email regex checks before the network call (return field-level errors), then wrap magentoFetch in try/catch using the existing cleanMessage() helper to strip the 'Magento GraphQL error:' prefix. Return a discriminated state so ContactForm can show inline messages. Pure logic, reuses the auth.ts error-cleaning convention.
  - _Artifacts:_ `src/lib/engage.ts`, `src/components/ContactForm.tsx`
  - _Depends on:_ Contact Us form + route
- **Email a friend (share product) from PDP** — ⬜ missing · P3 · M
  - _Gap:_ No share UI on the PDP. Confirmed schema: sendEmailToFriend(input: SendEmailToFriendInput!) requires product_id: Int!, sender {name,email,message all String!}, and recipients: [SendEmailToFriendRecipientInput!] each {name,email}. CRITICAL GAP: PRODUCT_DETAIL query in queries.ts fetches uid + sku but NOT the numeric `id`, which this mutation requires.
  - _Build:_ First add `id` to the PRODUCT_DETAIL query items selection (the numeric product id). Add SEND_EMAIL_TO_FRIEND op to queries.ts. Add shareProductAction(prev,formData) to engage.ts: parse sender + repeated recipient fields, parse hidden product_id (Number()), build the nested input, call magentoFetch (no-store, no token), return state. Build a client ShareProduct.tsx (modal/disclosure with sender fields + dynamic recipient rows) using useActionState, rendered on src/app/product/[slug]/page.tsx near AddToCart, with product id passed as a hidden field. Note feature must be enabled in admin (Send to Friend) or the mutation errors — guard via try/catch.
  - _Artifacts:_ `src/lib/queries.ts`, `src/lib/engage.ts`, `src/components/ShareProduct.tsx`, `src/app/product/[slug]/page.tsx`
- **Multi-recipient handling for email-a-friend** — ⬜ missing · P3 · S
  - _Gap:_ Sub-feature. recipients is a list input; admin config caps the count and rate-limits sends. The form must support N rows and serialize them into the array.
  - _Build:_ In ShareProduct.tsx keep client state for a recipients array (add/remove row buttons, React 19 useState). Name inputs as recipient_name[] / recipient_email[] and reconstruct the array in shareProductAction via formData.getAll(). Optionally read the per-store max-recipients from storeConfig if exposed; otherwise cap in UI and let the server error surface. No backend infra beyond the share action.
  - _Artifacts:_ `src/components/ShareProduct.tsx`, `src/lib/engage.ts`
  - _Depends on:_ Email a friend (share product) from PDP
- **reCAPTCHA gating for engagement forms** — ⬜ missing · P3 · L
  - _Gap:_ No recaptcha integration anywhere. Live recaptchaV3Config currently returns is_enabled:false, website_key:'', forms:[] — so it is OFF on this instance today, but a correct build must handle the enabled case. ReCaptchaFormEnum includes NEWSLETTER, CONTACT, SENDFRIEND (plus CUSTOMER_LOGIN/CREATE etc.). Magento headless expects the token in the X-ReCaptcha HTTP header, which magentoFetch does not yet support.
  - _Build:_ Add an `headers`/`recaptchaToken` option to magentoFetch that sets the `X-ReCaptcha` header. Add a recaptcha-config read (recaptchaV3Config: website_key, minimum_score, badge_position, forms; revalidate cached) in magento.ts/queries.ts. Create a client ReCaptcha.tsx (or hook) that, only when is_enabled and the relevant form is in `forms`, loads https://www.google.com/recaptcha/api.js?render=KEY, executes grecaptcha to mint a token on submit, and injects it as a hidden field; the Server Action forwards it via magentoFetch's new header option. Wrap NewsletterForm, ContactForm, ShareProduct. Since it is disabled here, ship it config-driven so it is a no-op until an admin enables v3 — this avoids hard-coding and keeps the forms working now.
  - _Artifacts:_ `src/lib/magento.ts`, `src/lib/queries.ts`, `src/components/ReCaptcha.tsx`, `src/lib/engage.ts`, `src/components/NewsletterForm.tsx`, `src/components/ContactForm.tsx`, `src/components/ShareProduct.tsx`
  - _Depends on:_ Footer newsletter signup; Contact Us form + route; Email a friend (share product) from PDP
- **Footer information architecture (links to Contact/CMS)** — ⬜ missing · P2 · S
  - _Gap:_ Footer.tsx is currently a single static blurb. Adding the newsletter form and /contact link is the natural moment to give it a columned layout. No GraphQL needed for the structure itself (CMS link targets belong to the CMS domain).
  - _Build:_ Refactor Footer.tsx into a multi-column server component: brand blurb, a 'Stay in touch' column hosting NewsletterForm, and a 'Support' column with a Link to /contact (and placeholders for CMS pages owned by another domain). Pure presentational; no data layer changes.
  - _Artifacts:_ `src/components/Footer.tsx`
  - _Depends on:_ Footer newsletter signup; Contact Us form + route

</details>

**Domain gotchas:**
- reCAPTCHA token transport is an HTTP header (X-ReCaptcha), NOT a GraphQL argument — the current magentoFetch has no way to set per-request headers for this, so it must be extended before recaptcha gating can work. recaptchaV3Config on this instance returns is_enabled:false / empty website_key / forms:[], so recaptcha is effectively OFF today; build it config-driven so forms work now and recaptcha becomes a no-op until an admin enables it.
- sendEmailToFriend requires product_id as an Int (numeric id), but the PDP's PRODUCT_DETAIL query currently selects only uid and sku — you must add `id` to that query, or the share form has no valid product_id to send.
- All three mutations (subscribe/contact/sendEmailToFriend) are guest-capable and need NO customer_token, so unlike cart/account actions they require no cookie/session handling — keep them token-less and cache:no-store.
- subscribeEmailToNewsletter returns SubscriptionStatusesEnum, not a boolean — double-opt-in stores return UNCONFIRMED/NOT_ACTIVE, so 'success' must not be assumed from a non-error response; branch on status to message 'check your email'.
- There is no newsletter_general_active or contact_enabled field on StoreConfig in 2.4.9 (confirmed: query errors), so you cannot feature-flag these via storeConfig — guard purely with try/catch around the mutation and surface friendly errors via the existing cleanMessage() helper.
- Send-to-Friend and Contact are admin-toggleable features in Magento; if disabled in admin the mutation throws rather than returning a status, so the Server Action must catch and present a graceful 'currently unavailable' message.
- Magento rate-limits sendEmailToFriend (max recipients + send interval per IP) and contactUs; surface throttling errors instead of letting the action throw, and consider a client-side honeypot since recaptcha is currently off.
- Follow the established useActionState pattern (LoginForm/RegisterForm) and put all three actions in one new "use server" file src/lib/engage.ts so the cart/auth action files stay domain-focused.

### 8.13 Store, i18n, Currency, SEO & Routing

This domain covers how the storefront identifies itself to Magento (Store header / store view), how it presents money and language to shoppers, and how it is discoverable and correctly indexed by search engines. In our headless stack it maps cleanly: storeConfig/availableStores/currency/countries are server-to-server RSC reads (cacheable, no token), and there are NO mutations here — everything is read-only config plus Next.js framework SEO primitives (generateMetadata, metadataBase, the sitemap.ts/robots.ts/manifest.ts file conventions, and JSON-LD <script> tags). The current build has only static root metadata, a hardcoded lang="en", and a single hardcoded en-US/USD currency format in format.ts; there is no per-page metadata depth, no canonical/OG/JSON-LD, no sitemap or robots, and no store/locale/currency switching. This instance is single-store, single-website, USD-only, en_US locale, with URL rewrites using a .html suffix — so multi-store/i18n/multi-currency features are architecturally relevant but currently low-yield (P2/P3), whereas SEO completeness (metadata, canonical, structured data, sitemap, robots) is high-value P1 and entirely missing. The route() resolver is the keystone for canonical/SEO-safe URL resolution and 301 redirect handling, and is not yet used at all.

| Feature | Status | Pri | Eff | GraphQL ops |
|---|---|:--:|:--:|---|
| Centralized store config provider (storeConfig) with SEO + locale fields | 🟡 partial | P1 | M | `storeConfig` |
| Dynamic page metadata depth (title/description/keywords from CMS-managed meta) | 🟡 partial | P1 | S | `products` `categories` `cmsPage` `storeConfig` |
| Canonical URLs + metadataBase | ⬜ missing | P1 | S | `storeConfig` `products` `categories` |
| OpenGraph & Twitter card metadata | ⬜ missing | P1 | S | `products` `categories` `storeConfig` |
| Structured data: Product JSON-LD | ⬜ missing | P1 | S | `products` |
| Structured data: BreadcrumbList JSON-LD + on-page breadcrumbs from Magento | 🟡 partial | P2 | M | `products` `categories` |
| Structured data: Organization / WebSite (Sitelinks searchbox) | ⬜ missing | P2 | S | `storeConfig` |
| Dynamic sitemap.xml | ⬜ missing | P1 | M | `products` `categories` `storeConfig` |
| robots.txt | ⬜ missing | P1 | S | `storeConfig` |
| Robots noindex on non-content & thin pages | ⬜ missing | P2 | S | — |
| web app manifest + favicon/icons from store config | 🟡 partial | P3 | S | `storeConfig` |
| Magento route() URL resolution + 301 redirect handling (catch-all) | ⬜ missing | P2 | L | `route` `storeConfig` |
| Currency formatting from store config (de-hardcode Intl locale) | 🟡 partial | P3 | S | `storeConfig` `currency` |
| Multi-currency display + currency switcher | ⬜ missing | P3 | L | `currency` `storeConfig` `availableStores` |
| Store/website switcher (availableStores) | ⬜ missing | P3 | L | `availableStores` `storeConfig` |
| Internationalization / locale routing (i18n) + html lang | 🟡 partial | P3 | M | `storeConfig` `availableStores` |
| hreflang alternate links for multi-locale stores | ⬜ missing | P3 | M | `availableStores` `storeConfig` |
| Countries / regions data (locale-aware address + geo) | ⬜ missing | P2 | S | `countries` `country` |
| Paginated PLP SEO (rel canonical to page 1 + noindex thin pages) | ⬜ missing | P2 | S | `categories` |

<details><summary><strong>Build notes</strong> (19 items)</summary>

- **Centralized store config provider (storeConfig) with SEO + locale fields** — 🟡 partial · P1 · M
  - _Gap:_ queries.ts STORE_CONFIG fetches only store_name, base_currency_code, base_media_url and is not actually consumed anywhere for SEO/locale. layout.tsx title/description are hardcoded literals; footer copyright, lang, currency, URL suffixes all hardcoded. Verified live: storeConfig returns locale=en_US, default_title='Magento Commerce', title_separator='-', product_url_suffix/category_url_suffix='.html', copyright, cms_home_page='home', root_category_uid='Mg=='.
  - _Build:_ Expand STORE_CONFIG in queries.ts to add locale, secure_base_url, base_link_url, default_title, default_description, default_keywords, title_prefix, title_suffix, title_separator, product_url_suffix, category_url_suffix, root_category_uid, copyright, head_shortcut_icon, cms_home_page, default_display_currency_code, timezone. Add getStoreConfig() in a new src/lib/store-config.ts as a cached RSC read (magentoFetch with revalidate:3600, tags:['config']) wrapped in React.cache() for per-request dedupe. Consume in layout.tsx generateMetadata (title.default/template from default_title/title_suffix/separator), Footer (copyright), html lang (locale -> BCP47), and format.ts. No token, no mutation.
  - _Artifacts:_ `src/lib/queries.ts`, `src/lib/store-config.ts`, `src/app/layout.tsx`, `src/components/Footer.tsx`, `src/lib/format.ts`
- **Dynamic page metadata depth (title/description/keywords from CMS-managed meta)** — 🟡 partial · P1 · S
  - _Gap:_ PDP and PLP generateMetadata set only { title: name }. No description, keywords, or fallbacks. PDP/PLP queries do not request meta_title/meta_description/meta_keyword. Verified live: products and categoryList expose meta_title/meta_description/meta_keyword but they are NULL in Luma sample data, so a fallback to name + stripped description html is mandatory.
  - _Build:_ Add meta_title, meta_description, meta_keyword to PRODUCT_DETAIL and CATEGORY_PAGE in queries.ts. In each generateMetadata build { title: meta_title \|\| name, description: meta_description \|\| stripHtml(description).slice(0,160), keywords: meta_keyword }. Add a small stripHtml helper to format.ts. Pure RSC reads; reuse the already-fetched product/category (wrap fetchers in React.cache to avoid a second round-trip between generateMetadata and the page body).
  - _Artifacts:_ `src/lib/queries.ts`, `src/app/product/[slug]/page.tsx`, `src/app/category/[slug]/page.tsx`, `src/lib/format.ts`
  - _Depends on:_ Centralized store config provider (storeConfig) with SEO + locale fields
- **Canonical URLs + metadataBase** — ⬜ missing · P1 · S
  - _Gap:_ No canonical tags anywhere; no metadataBase set, so Next emits relative OG URLs. PLP pagination (?page=N) has no canonical strategy. Verified live: product/category canonical_url fields exist but are NULL in this instance, so canonical must be composed from a public base URL + url_key + suffix.
  - _Build:_ Add metadataBase in layout.tsx root metadata from an env NEXT_PUBLIC_SITE_URL (the public storefront origin, NOT magento.test). In each page's generateMetadata add alternates: { canonical: `/product/${url_key}` } (and `/category/${slug}` for PLP, always pointing at page 1 / no query for paginated PLPs). Optionally honor Magento canonical_url when non-null. Use storeConfig product_url_suffix/category_url_suffix only if mirroring Magento URLs; since our routes are /product/[slug] not /slug.html, canonical should reflect OUR public route shape.
  - _Artifacts:_ `src/app/layout.tsx`, `src/app/product/[slug]/page.tsx`, `src/app/category/[slug]/page.tsx`, `src/app/search/page.tsx`, `.env.example`
  - _Depends on:_ Centralized store config provider (storeConfig) with SEO + locale fields
- **OpenGraph & Twitter card metadata** — ⬜ missing · P1 · S
  - _Gap:_ No openGraph or twitter objects in any metadata. PDP queries fetch media_gallery/small_image but not the canonical `image{url}` used for OG. No og:type=product, no price/availability OG product tags.
  - _Build:_ In product generateMetadata return openGraph: { title, description, type:'website', images:[{url: image.url, width, height, alt:name}], url: canonical } and twitter:{ card:'summary_large_image' }. Add `image { url }` to PRODUCT_DETAIL. Set site-wide defaults (og:site_name = storeConfig.store_name, og:locale = locale) in root layout metadata. Images are absolute Magento media URLs already (magento.test/media/...) so they work for crawlers without the Next image optimizer. Pure RSC.
  - _Artifacts:_ `src/app/layout.tsx`, `src/lib/queries.ts`, `src/app/product/[slug]/page.tsx`, `src/app/category/[slug]/page.tsx`
  - _Depends on:_ Canonical URLs + metadataBase; Centralized store config provider (storeConfig) with SEO + locale fields
- **Structured data: Product JSON-LD** — ⬜ missing · P1 · S
  - _Gap:_ No JSON-LD anywhere. PDP already fetches price_range, sku, stock_status, media_gallery — most fields present; only needs assembling into a schema.org object.
  - _Build:_ Add a server component <ProductJsonLd product={...} /> (or inline) rendering <script type='application/ld+json' dangerouslySetInnerHTML={{__html: JSON.stringify(schema)}} /> in the PDP body. Map: offers.price = final_price.value, priceCurrency = final_price.currency, availability = stock_status==='IN_STOCK' ? 'https://schema.org/InStock' : OutOfStock, url = canonical, image = media_gallery urls, sku, name, description = stripHtml(description). No new query fields needed beyond existing PDP data; add brand only if a brand attribute exists. Pure RSC, no client JS.
  - _Artifacts:_ `src/components/ProductJsonLd.tsx`, `src/app/product/[slug]/page.tsx`, `src/lib/format.ts`
  - _Depends on:_ Canonical URLs + metadataBase
- **Structured data: BreadcrumbList JSON-LD + on-page breadcrumbs from Magento** — 🟡 partial · P2 · M
  - _Gap:_ PDP has a hand-built 2-level breadcrumb using only the last category; PLP has Home/Name only. No JSON-LD. Verified live: categories expose `breadcrumbs { category_name category_url_key }` and `url_path` to build a full ancestor trail (e.g. Gear > Bags).
  - _Build:_ Add `categories { name url_path breadcrumbs { category_name category_url_key } }` to PRODUCT_DETAIL and `breadcrumbs { category_name category_url_key } url_path` to CATEGORY_PAGE. Build a shared <Breadcrumbs items={[...]} /> component used by both pages that renders the visible trail AND a BreadcrumbList JSON-LD script. URLs map ancestor category_url_key -> /category/[slug]. Pure RSC.
  - _Artifacts:_ `src/lib/queries.ts`, `src/components/Breadcrumbs.tsx`, `src/app/product/[slug]/page.tsx`, `src/app/category/[slug]/page.tsx`
  - _Depends on:_ Structured data: Product JSON-LD
- **Structured data: Organization / WebSite (Sitelinks searchbox)** — ⬜ missing · P2 · S
  - _Gap:_ No site-level structured data. store_name and logo/favicon available from storeConfig (head_shortcut_icon is null in this instance; use a bundled logo).
  - _Build:_ Render Organization + WebSite JSON-LD once in layout.tsx (server). WebSite.potentialAction = SearchAction with target `${siteUrl}/search?q={search_term_string}`. Organization.name = storeConfig.store_name, url = siteUrl, logo = a bundled asset. Pure RSC, single script in <body>.
  - _Artifacts:_ `src/app/layout.tsx`, `src/lib/store-config.ts`
  - _Depends on:_ Centralized store config provider (storeConfig) with SEO + locale fields
- **Dynamic sitemap.xml** — ⬜ missing · P1 · M
  - _Gap:_ No sitemap. Magento's own sitemap.xml is on magento.test, not the headless origin, and points at the wrong (Luma) URLs.
  - _Build:_ Add src/app/sitemap.ts (Next MetadataRoute.Sitemap convention). For large catalogs use generateSitemaps() to chunk (<=50k URLs/file). Fetch all categories (categories/categoryList) and paginate products(pageSize:200) server-side to collect url_key + updated_at; map to absolute URLs via metadataBase. Cache the underlying fetches (revalidate:3600, tags:['catalog']). Pure RSC reads, no token. Set changefreq/priority heuristically (home>category>product).
  - _Artifacts:_ `src/app/sitemap.ts`, `src/lib/queries.ts`, `src/lib/store-config.ts`
  - _Depends on:_ Canonical URLs + metadataBase
- **robots.txt** — ⬜ missing · P1 · S
  - _Gap:_ No robots.txt; crawlers get a 404 and may index transactional/account pages.
  - _Build:_ Add src/app/robots.ts (MetadataRoute.Robots). rules: allow '/', disallow ['/cart','/account','/login','/register','/api','/search']. sitemap: `${siteUrl}/sitemap.xml`, host: siteUrl. Static-ish; can read siteUrl from env. Trivial.
  - _Artifacts:_ `src/app/robots.ts`
  - _Depends on:_ Dynamic sitemap.xml
- **Robots noindex on non-content & thin pages** — ⬜ missing · P2 · S
  - _Gap:_ No per-page robots directives; /cart, /account, /login, /register are currently indexable. Search with no results is thin content.
  - _Build:_ Export metadata = { robots: { index:false, follow:false } } from cart/account/login/register layouts or pages. For /search, set robots index:false dynamically in generateMetadata when q empty or total_count===0. Framework-only, no GraphQL.
  - _Artifacts:_ `src/app/cart/page.tsx`, `src/app/account/page.tsx`, `src/app/login/page.tsx`, `src/app/register/page.tsx`, `src/app/search/page.tsx`
  - _Depends on:_ robots.txt
- **web app manifest + favicon/icons from store config** — 🟡 partial · P3 · S
  - _Gap:_ Only src/app/favicon.ico exists. No manifest, no apple-touch-icon, no theme-color. storeConfig.head_shortcut_icon is null in this instance, so icons come from bundled assets.
  - _Build:_ Add src/app/manifest.ts (MetadataRoute.Manifest) with name=store_name, short_name, theme_color, background_color, icons. Add icon assets and rely on Next file conventions (icon.png, apple-icon.png) for the rest. Mostly static; name can read store config.
  - _Artifacts:_ `src/app/manifest.ts`, `src/app/icon.png`, `src/app/apple-icon.png`
  - _Depends on:_ Centralized store config provider (storeConfig) with SEO + locale fields
- **Magento route() URL resolution + 301 redirect handling (catch-all)** — ⬜ missing · P2 · L
  - _Gap:_ Routing is fully static (/product/[slug], /category/[slug]). The route() resolver is unused. Verified live: route('voyage-yoga-bag.html') -> type PRODUCT, route('gear.html') -> type CATEGORY, route('no-route') -> type CMS_PAGE; route returns redirect_code (0/301/302) and relative_url for moved entities. Suffix is '.html' (storeConfig product/category_url_suffix).
  - _Build:_ Add a catch-all src/app/[...slug]/page.tsx (lowest precedence, runs only when no static route matches). Reconstruct the Magento path = slug.join('/') + storeConfig suffix, call ROUTE query (magentoFetch, revalidate:300, tags:['catalog']). On redirect_code 301/302 -> next/navigation redirect() to relative_url. On type PRODUCT/CATEGORY/CMS_PAGE -> either render via the existing components or redirect() to the canonical /product\|/category route. This makes the storefront resilient to Magento-shaped inbound links and is the backbone for CMS page rendering. Pure RSC read; no token.
  - _Artifacts:_ `src/app/[...slug]/page.tsx`, `src/lib/queries.ts`, `src/lib/store-config.ts`
  - _Depends on:_ Centralized store config provider (storeConfig) with SEO + locale fields
- **Currency formatting from store config (de-hardcode Intl locale)** — 🟡 partial · P3 · S
  - _Gap:_ format.ts hardcodes Intl.NumberFormat('en-US') and defaults currency to 'USD'. It does respect the per-Money currency code, but locale grouping/symbol placement is fixed to en-US. Verified live: currency query returns base/display USD, available_currency_codes=['USD'] only.
  - _Build:_ Pass the store locale (storeConfig.locale -> BCP47, e.g. en_US -> en-US) into formatMoney, or read it from a server context. Since format.ts is imported by client (Price.tsx) and server, thread locale via props or a thin context provider seeded in layout from getStoreConfig(). Keep the per-Money currency code (Magento already returns prices in display currency). Low value in this single-currency instance but removes the hardcode.
  - _Artifacts:_ `src/lib/format.ts`, `src/components/Price.tsx`, `src/lib/store-config.ts`
  - _Depends on:_ Centralized store config provider (storeConfig) with SEO + locale fields
- **Multi-currency display + currency switcher** — ⬜ missing · P3 · L
  - _Gap:_ No currency UI. Magento accepts a per-request 'Content-Currency' header to switch display currency, and exchange_rates are exposed. Verified live: this instance has available_currency_codes=['USD'] ONLY and exchange_rates=[USD->1], so multi-currency is non-functional until more currencies are configured in admin. Architecturally relevant, currently a no-op.
  - _Build:_ Fetch currency.available_currency_codes for the switcher options. Store the chosen code in a (non-httpOnly) cookie 'currency' read in RSC; add a 'Content-Currency' header passthrough to magentoFetch (extend MagentoFetchOptions with currency, default from cookie). A client <CurrencySwitcher> sets the cookie and refreshes. Because price caching is per-currency, include currency in fetch cache tags/keys to avoid cross-currency cache bleed. Gated on admin enabling >1 currency.
  - _Artifacts:_ `src/lib/magento.ts`, `src/components/CurrencySwitcher.tsx`, `src/components/Header.tsx`, `src/lib/queries.ts`
  - _Depends on:_ Currency formatting from store config (de-hardcode Intl locale); Centralized store config provider (storeConfig) with SEO + locale fields
- **Store/website switcher (availableStores)** — ⬜ missing · P3 · L
  - _Gap:_ magento.ts already supports a per-request Store header (opts.store / STORE_CODE env) but it is never varied at runtime. Verified live: availableStores returns exactly ONE store (code 'default', locale en_US, USD, is_default). So a switcher has nothing to switch to until more store views/websites are configured. Plumbing exists; UI + persistence missing.
  - _Build:_ Fetch availableStores (id, code, store_code, store_name, locale, base_currency_code, store_group_name, website_name) as a cached RSC read. Persist selected store_code in a cookie 'store'; read it in a request-scoped helper that supplies opts.store to magentoFetch (so ALL reads honor the active store view). Client <StoreSwitcher> sets the cookie + router.refresh(). Critically, vary all catalog cache tags by store_code to prevent serving one store's localized content for another. Only meaningful once multiple stores exist.
  - _Artifacts:_ `src/lib/magento.ts`, `src/lib/store-config.ts`, `src/components/StoreSwitcher.tsx`, `src/components/Header.tsx`, `src/lib/queries.ts`
  - _Depends on:_ Centralized store config provider (storeConfig) with SEO + locale fields
- **Internationalization / locale routing (i18n) + html lang** — 🟡 partial · P3 · M
  - _Gap:_ html lang='en' is hardcoded in layout.tsx. No locale segment routing, no per-locale store mapping. Verified live: single store, locale en_US only — full i18n routing is not exercisable yet, but the lang hardcode is wrong-by-construction.
  - _Build:_ Minimum: set <html lang> from storeConfig.locale (en_US -> 'en-US') in layout. Full i18n (deferred): introduce src/app/[locale]/ segment, a middleware mapping locale -> Magento store_code -> Store header, and per-locale generateStaticParams. Given one store view, ship only the lang fix now; gate the locale-segment architecture behind additional store views.
  - _Artifacts:_ `src/app/layout.tsx`, `src/lib/store-config.ts`
  - _Depends on:_ Centralized store config provider (storeConfig) with SEO + locale fields; Store/website switcher (availableStores)
- **hreflang alternate links for multi-locale stores** — ⬜ missing · P3 · M
  - _Gap:_ No hreflang. Requires >1 store view/locale to be meaningful; this instance has exactly one (en_US), so hreflang would only emit a single self/x-default entry today.
  - _Build:_ Once multiple store views exist, in generateMetadata return alternates.languages = { 'en-US': urlForStore('default', path), 'de-DE': ..., 'x-default': ... } derived from availableStores locales + the per-locale URL builder. Pure metadata, no extra runtime cost. Strictly dependent on multi-store being configured.
  - _Artifacts:_ `src/app/product/[slug]/page.tsx`, `src/app/category/[slug]/page.tsx`, `src/lib/store-config.ts`
  - _Depends on:_ Internationalization / locale routing (i18n) + html lang; Store/website switcher (availableStores); Canonical URLs + metadataBase
- **Countries / regions data (locale-aware address + geo)** — ⬜ missing · P2 · S
  - _Gap:_ Not fetched anywhere. Verified live: countries returns full ISO list with two_letter_abbreviation, full_name_locale/english, and available_regions (e.g. US states). Primarily consumed by checkout/address features but the reference fetch belongs to this i18n domain.
  - _Build:_ Add COUNTRIES query and a cached getCountries() RSC read (revalidate:86400, tags:['config']) in store-config.ts (or a geo lib). For a single country's regions use the country(id) query. Surface to address/checkout forms as select options; no token, no mutation. Country names are locale-resolved via the Store header automatically.
  - _Artifacts:_ `src/lib/queries.ts`, `src/lib/store-config.ts`
  - _Depends on:_ Centralized store config provider (storeConfig) with SEO + locale fields
- **Paginated PLP SEO (rel canonical to page 1 + noindex thin pages)** — ⬜ missing · P2 · S
  - _Gap:_ PLP uses ?page=N with no canonical/robots handling, so paginated variants are independently indexable -> duplicate content. generateMetadata ignores searchParams entirely.
  - _Build:_ In category generateMetadata read searchParams.page; set alternates.canonical to the page-1 category URL for page>1, and consider robots index:false for out-of-range pages. Coordinate with the global canonical strategy. Framework-only beyond existing category fetch.
  - _Artifacts:_ `src/app/category/[slug]/page.tsx`
  - _Depends on:_ Canonical URLs + metadataBase

</details>

**Domain gotchas:**
- route() requires the FULL Magento URL path WITH the configured suffix: 'gear.html'/'voyage-yoga-bag.html' resolve, but 'gear'/'bags' return null. Always append storeConfig.product_url_suffix / category_url_suffix (both '.html' here) and strip any leading slash before calling route().
- This instance is single-everything: availableStores returns ONE store (default/en_US/USD), currency.available_currency_codes=['USD'], exchange_rates=[USD->1]. Store switcher, currency switcher, multi-currency, i18n routing, and hreflang are architecturally valid but functionally no-ops until an admin configures additional store views/websites/currencies — hence P3.
- Magento meta fields are NULL in Luma sample data (product/category meta_title, meta_description, meta_keyword all null; canonical_url null). Every SEO feature MUST implement a fallback chain (meta_title -> name; meta_description -> stripped short description; canonical -> composed from site base + our route shape).
- metadataBase / canonical / OG / sitemap must use the PUBLIC storefront origin (a new NEXT_PUBLIC_SITE_URL env), NOT magento.test. storeConfig.base_url points at the Magento backend (https://magento.test/) and the Luma .html URL shapes — using it for canonical would point crawlers at the headend, not the Next app.
- Our public routes are /product/[slug] and /category/[slug], but Magento's native URLs are <url_key>.html. Decide one canonical shape and stick to it; the catch-all route() resolver should redirect inbound Magento-shaped .html links to our canonical /product|/category routes (or vice versa) to avoid two indexable URLs per entity.
- format.ts is imported by a client component (Price.tsx), so store locale/currency can't be read from a server-only helper there — thread locale via props or a client-readable cookie/context, otherwise the import graph breaks ('server-only' would poison the client bundle).
- If a currency or store switcher is added, the Next fetch cache (revalidate+tags on catalog reads) will bleed across currencies/stores unless the Store/Content-Currency value is folded into the cache key (e.g. store-/currency-scoped tags). Prices and localized names are per-store/per-currency.
- JSON-LD must be emitted as a server-rendered <script type='application/ld+json'> (not next/script with client strategy) so crawlers see it in the initial HTML; build the object server-side and JSON.stringify it.
- There are NO mutations in this domain — everything is read-only config (storeConfig, availableStores, currency, countries, route) plus Next.js framework SEO file conventions (sitemap.ts, robots.ts, manifest.ts, generateMetadata). No httpOnly token is needed for any of these reads.
- AGENTS.md warns this is a modified Next.js 16 with breaking changes — verify the exact MetadataRoute / generateMetadata / generateSitemaps / metadataBase APIs against node_modules/next/dist/docs before implementing, rather than assuming stock Next 14/15 behavior.

### 8.14 Security, reCAPTCHA & Cross-cutting Quality

This domain covers bot protection (Google reCAPTCHA v2/v3 wired to Magento forms) plus the non-functional quality concerns that span every feature: cache revalidation correctness, error/loading/not-found UX, accessibility, performance (PPR/use-cache), GraphQL type safety, testing, and production TLS/deployment. The instance exposes reCAPTCHA via two reads — recaptchaV3Config (global v3 site key, currently is_enabled:false) and recaptchaFormConfig(formType: ReCaptchaFormEnum!) which returns { is_enabled, configurations { website_key, re_captcha_type, badge_position, theme, language_code, minimum_score, technical_failure_message, validation_failure_message } } for 11 form types (CUSTOMER_LOGIN, CUSTOMER_CREATE, CUSTOMER_FORGOT_PASSWORD, CUSTOMER_EDIT, CONTACT, NEWSLETTER, PRODUCT_REVIEW, SENDFRIEND, PLACE_ORDER, BRAINTREE, RESEND_CONFIRMATION_EMAIL). In our headless stack reCAPTCHA is uniquely awkward: the token MUST be minted in the browser (grecaptcha.execute / widget), but all our mutations run inside Server Actions that call Magento server-to-server, so the token has to be threaded from a client component, through the Server Action, into magentoFetch as the X-ReCaptcha HTTP header — and magentoFetch currently has no way to inject arbitrary headers. The cross-cutting items are mostly invisible-but-mandatory: today there are zero error.tsx/not-found.tsx/global-error.tsx boundaries, no GraphQL codegen (queries are template strings with hand-written types in types.ts), no tests, and revalidatePath("/","layout") is over-broad. These are the items that make the build production-grade rather than a demo.

| Feature | Status | Pri | Eff | GraphQL ops |
|---|---|:--:|:--:|---|
| reCAPTCHA config fetch + capability detection (server) | ⬜ missing | P2 | S | `recaptchaV3Config` `recaptchaFormConfig` |
| Client reCAPTCHA token minting + script loading | ⬜ missing | P2 | M | `recaptchaFormConfig` `recaptchaV3Config` |
| X-ReCaptcha header plumbing through magentoFetch + Server Actions | ⬜ missing | P2 | M | `generateCustomerToken` `createCustomerV2` `contactUs` `createProductReview` `subscribeEmailToNewsletter` +2 |
| reCAPTCHA on Login form (CUSTOMER_LOGIN) | ⬜ missing | P2 | S | `recaptchaFormConfig` `generateCustomerToken` |
| reCAPTCHA on Register form (CUSTOMER_CREATE) | ⬜ missing | P2 | S | `recaptchaFormConfig` `createCustomerV2` `generateCustomerToken` |
| reCAPTCHA on forgot-password / reset (CUSTOMER_FORGOT_PASSWORD) | ⬜ missing | P3 | S | `recaptchaFormConfig` `requestPasswordResetEmail` `resetPassword` |
| reCAPTCHA on Contact / Review / Newsletter / Send-to-friend forms | ⬜ missing | P3 | M | `recaptchaFormConfig` `contactUs` `createProductReview` `subscribeEmailToNewsletter` `sendEmailToFriend` +1 |
| reCAPTCHA on checkout / place-order (PLACE_ORDER, BRAINTREE) | ⬜ missing | P3 | M | `recaptchaFormConfig` `placeOrder` `setPaymentMethodOnCart` |
| Cache revalidation strategy (tag-based, on-demand) | 🟡 partial | P1 | M | `products` `categories` `cart` `storeConfig` |
| Error boundaries (error.tsx / global-error.tsx) | ⬜ missing | P1 | S | — |
| not-found.tsx (404) handling | ⬜ missing | P1 | S | `products` `categories` `route` |
| Loading UX / Suspense streaming | 🟡 partial | P2 | S | — |
| Accessibility (a11y) pass | 🟡 partial | P1 | M | — |
| Performance: PPR / use-cache / image optimization | 🟡 partial | P2 | L | `products` `categories` `storeConfig` |
| GraphQL codegen & typed operations | ⬜ missing | P2 | M | — |
| Automated testing (unit + e2e) | ⬜ missing | P2 | L | — |
| Production TLS / deployment hardening | 🟡 partial | P1 | M | — |
| Server Action / GraphQL error normalization & user messaging | 🟡 partial | P1 | S | `addProductsToCart` `updateCartItems` `removeItemFromCart` `createCustomerV2` `generateCustomerToken` |

<details><summary><strong>Build notes</strong> (18 items)</summary>

- **reCAPTCHA config fetch + capability detection (server)** — ⬜ missing · P2 · S
  - _Gap:_ No reCAPTCHA code exists. Endpoint confirms recaptchaV3Config returns is_enabled:false (disabled on this instance) and recaptchaFormConfig(formType:ReCaptchaFormEnum!) returns { is_enabled, configurations { website_key re_captcha_type badge_position theme language_code minimum_score technical_failure_message validation_failure_message } }. 11 form enum values verified live.
  - _Build:_ Add RECAPTCHA_FORM_CONFIG + RECAPTCHA_V3_CONFIG ops to src/lib/queries.ts. Create src/lib/recaptcha.ts: getRecaptchaConfig(formType) RSC helper calling magentoFetch with next:{revalidate:3600, tags:['recaptcha']} (config is store-config-level, safe to cache long). Because the site key is public it can be passed to client components. Gate rendering: if !is_enabled return null so forms behave exactly as today when reCAPTCHA is off (matches current is_enabled:false state). re_captcha_type distinguishes recaptcha (v2 checkbox) / invisible / recaptcha_v3 — branch the widget on it.
  - _Artifacts:_ `src/lib/queries.ts`, `src/lib/recaptcha.ts`, `src/lib/types.ts`
- **Client reCAPTCHA token minting + script loading** — ⬜ missing · P2 · M
  - _Gap:_ No client reCAPTCHA infra. Current forms (LoginForm, RegisterForm) are client components using useActionState but mint no token. The token can ONLY be produced in the browser — this is the central headless gotcha.
  - _Build:_ Create a client component src/components/Recaptcha.tsx that receives { websiteKey, type, badgePosition, theme, lang } as props from a server parent. Use next/script (strategy='afterInteractive') to load https://www.google.com/recaptcha/api.js?render=<key> for v3 (or no ?render for v2). Expose a useRecaptcha() hook returning getToken(action) -> Promise<string> via grecaptcha.execute(key,{action}) for v3, or render an explicit <div> widget + grecaptcha.getResponse() for v2/invisible. Token is appended to the FormData (hidden input name='gRecaptchaResponse') OR returned to the action call. Render the badge per badge_position. Use react 19 'use client'.
  - _Artifacts:_ `src/components/Recaptcha.tsx`, `src/lib/recaptcha.ts`
  - _Depends on:_ reCAPTCHA config fetch + capability detection (server)
- **X-ReCaptcha header plumbing through magentoFetch + Server Actions** — ⬜ missing · P2 · M
  - _Gap:_ magentoFetch (src/lib/magento.ts) only supports token/store/revalidate/tags — there is NO way to pass an arbitrary header. Server Actions (auth.ts, actions.ts) read FormData but never accept/forward a captcha token. This plumbing is the hard part and gates every protected form.
  - _Build:_ Extend MagentoFetchOptions with optional recaptchaToken?: string and set headers['X-ReCaptcha']=token when present (Magento's GraphQL ReCaptcha module reads this exact header). Update each Server Action (loginAction, registerAction, plus future contact/review/newsletter/reset actions) to read formData.get('gRecaptchaResponse') and pass recaptchaToken into magentoFetch. On Magento validation failure GraphQL returns a 'reCAPTCHA validation failed' error — catch and surface configurations.validation_failure_message. Keep server-to-server transport; only the token transits client->action->Magento.
  - _Artifacts:_ `src/lib/magento.ts`, `src/lib/auth.ts`, `src/lib/actions.ts`
  - _Depends on:_ Client reCAPTCHA token minting + script loading
- **reCAPTCHA on Login form (CUSTOMER_LOGIN)** — ⬜ missing · P2 · S
  - _Gap:_ LoginForm.tsx submits email/password to loginAction with no captcha. Magento gates CUSTOMER_LOGIN via recaptchaFormConfig(formType:CUSTOMER_LOGIN).
  - _Build:_ In /login page (server) fetch getRecaptchaConfig('CUSTOMER_LOGIN') and pass props into LoginForm. Mount <Recaptcha/>, mint token on submit, inject as hidden field; loginAction forwards X-ReCaptcha. If is_enabled false, render exactly today's form (no behavior change).
  - _Artifacts:_ `src/app/login/page.tsx`, `src/components/LoginForm.tsx`, `src/lib/auth.ts`
  - _Depends on:_ X-ReCaptcha header plumbing through magentoFetch + Server Actions
- **reCAPTCHA on Register form (CUSTOMER_CREATE)** — ⬜ missing · P2 · S
  - _Gap:_ RegisterForm.tsx -> registerAction creates account + auto-logs-in with no captcha. CUSTOMER_CREATE enum exists. Note: the auto-login generateCustomerToken call after create may ALSO be CUSTOMER_LOGIN-gated — verify and pass token to both calls or only the create.
  - _Build:_ Same pattern as login: /register page fetches getRecaptchaConfig('CUSTOMER_CREATE'), RegisterForm mounts widget, registerAction forwards X-ReCaptcha on the createCustomerV2 call. The follow-up generateCustomerToken auto-login runs server-side without a fresh token — if CUSTOMER_LOGIN is also enabled this will fail; fall back to redirecting to /login on captcha error rather than auto-login.
  - _Artifacts:_ `src/app/register/page.tsx`, `src/components/RegisterForm.tsx`, `src/lib/auth.ts`
  - _Depends on:_ X-ReCaptcha header plumbing through magentoFetch + Server Actions
- **reCAPTCHA on forgot-password / reset (CUSTOMER_FORGOT_PASSWORD)** — ⬜ missing · P3 · S
  - _Gap:_ Password reset is not built at all (noted as NOT yet built). CUSTOMER_FORGOT_PASSWORD enum exists; this is the highest-abuse-value form to protect.
  - _Build:_ When the password-reset feature is built (separate domain), wire getRecaptchaConfig('CUSTOMER_FORGOT_PASSWORD') into the request form and forward X-ReCaptcha on requestPasswordResetEmail. resetPassword (with token from email) is typically not captcha-gated.
  - _Artifacts:_ `src/app/forgot-password/page.tsx`, `src/lib/auth.ts`
  - _Depends on:_ X-ReCaptcha header plumbing through magentoFetch + Server Actions
- **reCAPTCHA on Contact / Review / Newsletter / Send-to-friend forms** — ⬜ missing · P3 · M
  - _Gap:_ None of these forms are built yet (contact, reviews, newsletter all listed as NOT built). Enum values CONTACT, PRODUCT_REVIEW, NEWSLETTER, SENDFRIEND, RESEND_CONFIRMATION_EMAIL all confirmed. contactUs input verified: { comment email name telephone }.
  - _Build:_ Each owning feature/domain builds its form + Server Action; this domain provides the reusable getRecaptchaConfig(formType) + <Recaptcha/> + X-ReCaptcha plumbing so each only maps its enum (CONTACT/PRODUCT_REVIEW/NEWSLETTER/SENDFRIEND) and forwards the token. Newsletter especially benefits since it's a public single-field form.
  - _Artifacts:_ `src/components/Recaptcha.tsx`, `src/lib/recaptcha.ts`, `src/lib/actions.ts`
  - _Depends on:_ X-ReCaptcha header plumbing through magentoFetch + Server Actions
- **reCAPTCHA on checkout / place-order (PLACE_ORDER, BRAINTREE)** — ⬜ missing · P3 · M
  - _Gap:_ Checkout is not built (separate P0 domain). PLACE_ORDER and BRAINTREE enums exist. Card-testing protection at placeOrder is genuinely valuable but depends entirely on the checkout build.
  - _Build:_ In the checkout domain's place-order Server Action, fetch getRecaptchaConfig('PLACE_ORDER') (and BRAINTREE if Braintree payment is enabled), mint token client-side on the review step, forward X-ReCaptcha on placeOrder. v3 invisible is the right UX here to avoid friction at the final step.
  - _Artifacts:_ `src/app/checkout/`, `src/lib/actions.ts`
  - _Depends on:_ X-ReCaptcha header plumbing through magentoFetch + Server Actions
- **Cache revalidation strategy (tag-based, on-demand)** — 🟡 partial · P1 · M
  - _Gap:_ magentoFetch already supports next:{revalidate,tags}. Catalog reads use revalidate+tags. BUT cart mutations call revalidatePath('/','layout') (over-broad, busts the whole layout tree incl. header on every qty change) and there is NO on-demand revalidateTag webhook from Magento, so catalog edits/price/stock changes only refresh on the time-based revalidate window. No tag taxonomy (e.g. product:<sku>, category:<uid>).
  - _Build:_ Define a tag taxonomy in magento.ts callers: tags like 'catalog', `product:${urlKey}`, `category:${uid}`, 'cms'. Replace broad revalidatePath('/','layout') in actions.ts with targeted revalidateTag('cart')/revalidatePath('/cart') and a lighter header refresh. Add an authenticated route handler src/app/api/revalidate/route.ts accepting a secret + tag list, callable from a Magento webhook/cron or manual purge, calling revalidateTag. Document the time-based fallback (revalidate seconds) for stock/price drift.
  - _Artifacts:_ `src/lib/actions.ts`, `src/app/api/revalidate/route.ts`, `src/lib/magento.ts`
- **Error boundaries (error.tsx / global-error.tsx)** — ⬜ missing · P1 · S
  - _Gap:_ Verified zero error.tsx and zero global-error.tsx anywhere in src/app. magentoFetch throws on HTTP!=ok and on GraphQL errors; today an uncaught throw in a page (e.g. Magento down, network) yields the default Next error with no reset/retry and no branded UI.
  - _Build:_ Add src/app/error.tsx ('use client', with reset() retry button and a friendly message), src/app/global-error.tsx (catches root layout errors, must render its own <html><body>), and per-segment error.tsx for /cart, /product/[slug], /category/[slug] so a failed catalog fetch degrades locally. Keep the thrown Error.message generic to users (magentoFetch already truncates bodies) and log full detail server-side.
  - _Artifacts:_ `src/app/error.tsx`, `src/app/global-error.tsx`, `src/app/cart/error.tsx`, `src/app/product/[slug]/error.tsx`
- **not-found.tsx (404) handling** — ⬜ missing · P1 · S
  - _Gap:_ No not-found.tsx exists. PDP/PLP/search pages fetch by url_key; when products/categoryList returns empty the page likely renders blank or throws rather than calling notFound(). The 'route' query (Magento URL resolver) is unused — useful to disambiguate product vs category vs CMS URLs and to drive correct 404s.
  - _Build:_ Add src/app/not-found.tsx (global) plus segment-level not-found.tsx for product/category. In each page, when the items array is empty call notFound() from next/navigation so Next serves a real 404 status. Optionally adopt the 'route' query for a single catch-all resolver that maps any path to PRODUCT/CATEGORY/CMS_PAGE and 404s otherwise.
  - _Artifacts:_ `src/app/not-found.tsx`, `src/app/product/[slug]/page.tsx`, `src/app/category/[slug]/page.tsx`, `src/lib/queries.ts`
- **Loading UX / Suspense streaming** — 🟡 partial · P2 · S
  - _Gap:_ A single global src/app/loading.tsx (product-grid skeleton) exists and is reused for every route, so /cart, /account, /product all show a catalog-grid skeleton that doesn't match the page. No per-segment loading.tsx and no in-page <Suspense> around slow sub-queries (e.g. header session, featured rows).
  - _Build:_ Add route-appropriate loading.tsx for /cart, /account, /product/[slug], /category/[slug]. Wrap independently-slow RSC subtrees (Header session query, home featured rows) in <Suspense> with tailored fallbacks so the shell streams immediately. Pairs with PPR below.
  - _Artifacts:_ `src/app/cart/loading.tsx`, `src/app/account/loading.tsx`, `src/app/product/[slug]/loading.tsx`, `src/components/Header.tsx`
- **Accessibility (a11y) pass** — 🟡 partial · P1 · M
  - _Gap:_ Forms use <label> + autoComplete (good). Gaps: error text (state.error red <p>) is not associated via aria-describedby and not announced (no role='alert'/aria-live); configurable color/size swatches likely use clickable divs without role/aria-pressed/keyboard handlers; gallery thumbnails, cart qty steppers, and the cart badge need aria-labels; focus management on route change and on Server Action error is unhandled; reCAPTCHA badge needs the required attribution text if badge hidden.
  - _Build:_ Add role='alert' aria-live='polite' to form error <p> and link via aria-describedby. Convert swatches to <button> with aria-pressed and visible focus rings (Tailwind focus-visible). Add aria-labels to icon-only controls (cart badge 'N items', qty +/-, remove). Add a visually-hidden 'Skip to content' link in layout.tsx and an id on <main>. Run an axe/Lighthouse a11y audit (chrome-devtools mcp) as the acceptance gate.
  - _Artifacts:_ `src/components/AddToCart.tsx`, `src/components/Gallery.tsx`, `src/components/CartControls.tsx`, `src/components/Header.tsx`, `src/app/layout.tsx`, `src/components/LoginForm.tsx`, `src/components/RegisterForm.tsx`
- **Performance: PPR / use-cache / image optimization** — 🟡 partial · P2 · L
  - _Gap:_ Catalog reads are cached via fetch revalidate+tags (good). But next.config.ts sets images.unoptimized:true globally (correct for local 127.0.0.1 SSRF block, but ships to prod unless changed). No PPR/'use cache' adoption. Header runs a no-store session query on every request, blocking the shell. Geist loaded via next/font (good).
  - _Build:_ Gate images.unoptimized behind NODE_ENV (optimize in prod with a public Magento domain in remotePatterns). Evaluate Next 16 'use cache' directive + cacheLife for catalog data helpers in magento.ts callers, and Partial Prerendering so the static shell prerenders while dynamic (cart/session) streams. Move the per-request header session into a <Suspense> dynamic hole so the rest of the page is static/PPR-eligible. Add a Lighthouse perf budget as CI gate. NOTE: read node_modules/next/dist/docs before using these APIs — this Next build has breaking changes vs trained knowledge (per AGENTS.md).
  - _Artifacts:_ `next.config.ts`, `src/lib/magento.ts`, `src/components/Header.tsx`
  - _Depends on:_ Cache revalidation strategy (tag-based, on-demand)
- **GraphQL codegen & typed operations** — ⬜ missing · P2 · M
  - _Gap:_ queries.ts holds hand-written /* GraphQL */ template strings and types.ts has hand-maintained interfaces (Customer, UserError, etc.). magentoFetch<T> is generic with no compile-time guarantee T matches the query. No @graphql-codegen, no schema introspection artifact committed.
  - _Build:_ Add @graphql-codegen/cli with the client-preset, introspect https://magento.test/graphql (using NODE_EXTRA_CA_CERTS for the mkcert CA), output typed documents into src/lib/gql/. Replace the string ops + manual types incrementally; magentoFetch can accept a TypedDocumentNode for end-to-end inference. Add a 'codegen' npm script and run it in CI/pre-build. Keeps server-only transport unchanged.
  - _Artifacts:_ `codegen.ts`, `package.json`, `src/lib/gql/`, `src/lib/magento.ts`
- **Automated testing (unit + e2e)** — ⬜ missing · P2 · L
  - _Gap:_ No test runner, no test files, no scripts beyond dev/build/start/lint in package.json. Server Actions with cookie/token side-effects (loginAction, mergeGuestCart, getWritableCart) and format.ts are untested.
  - _Build:_ Add Vitest for unit tests of format.ts and pure helpers, with a mocked magentoFetch to test action branching (guest vs customer cart resolution, merge logic, error mapping). Add Playwright for e2e against a running dev server covering: browse->add to cart->cart totals, register->auto-login, login->guest cart merge, and (once built) reCAPTCHA-gated form happy/blocked paths. Add 'test' and 'test:e2e' scripts; run unit in CI, e2e on demand.
  - _Artifacts:_ `vitest.config.ts`, `playwright.config.ts`, `src/lib/__tests__/`, `package.json`
- **Production TLS / deployment hardening** — 🟡 partial · P1 · M
  - _Gap:_ Local TLS works via NODE_EXTRA_CA_CERTS=mkcert CA in npm scripts; this is dev-only and won't apply on a host that uses a public CA. Cookies set secure only when NODE_ENV==='production' (correct). No security headers / CSP, no rate-limiting on Server Actions, MAGENTO_GRAPHQL_URL/STORE come from env (good), images.unoptimized must flip for prod. reCAPTCHA needs the script domains allowed in any future CSP.
  - _Build:_ For prod: point MAGENTO_GRAPHQL_URL at the public Magento domain with a publicly-trusted cert (drop NODE_EXTRA_CA_CERTS), set images.remotePatterns to that domain and disable unoptimized. Add a next.config headers() block (or middleware) for HSTS, X-Content-Type-Options, Referrer-Policy, and a CSP that allowlists www.google.com/recaptcha + www.gstatic.com for reCAPTCHA. Keep secrets server-only (already not NEXT_PUBLIC except media). Consider lightweight rate-limiting / origin checks on auth Server Actions. Document env matrix in .env.example.
  - _Artifacts:_ `next.config.ts`, `.env.example`, `src/middleware.ts`, `package.json`
  - _Depends on:_ Performance: PPR / use-cache / image optimization
- **Server Action / GraphQL error normalization & user messaging** — 🟡 partial · P1 · S
  - _Gap:_ auth.ts has cleanMessage() stripping the 'Magento GraphQL error:' prefix and login maps any failure to 'Invalid email or password.' addToCartAction returns user_errors. But updateItemQtyAction/removeItemAction in actions.ts have NO try/catch — a thrown magentoFetch error bubbles as an unhandled Server Action rejection with no UI. reCAPTCHA validation failures will arrive as generic GraphQL errors needing the configurations.validation_failure_message mapping.
  - _Build:_ Centralize error mapping in a helper (e.g. src/lib/errors.ts) that classifies GraphQL errors (auth, validation, reCAPTCHA, network) and returns safe user copy + logs detail. Wrap updateItemQtyAction/removeItemAction in try/catch returning a typed result the client can surface. Map reCAPTCHA failures to the form's technical_failure_message/validation_failure_message from recaptchaFormConfig. Avoid leaking raw Magento internals to the client.
  - _Artifacts:_ `src/lib/errors.ts`, `src/lib/actions.ts`, `src/lib/auth.ts`, `src/components/CartControls.tsx`

</details>

**Domain gotchas:**
- reCAPTCHA tokens can ONLY be minted in the browser (grecaptcha.execute). Our entire mutation path is Server Actions calling Magento server-to-server, so the token must travel client component -> FormData/arg -> Server Action -> X-ReCaptcha header. magentoFetch currently has NO mechanism to inject arbitrary headers — that is the single biggest blocker and must be built first.
- Magento validates reCAPTCHA via the exact HTTP header 'X-ReCaptcha' on the GraphQL mutation request (not a GraphQL argument). Easy to get wrong by trying to pass it as a query variable.
- On THIS instance reCAPTCHA is currently disabled: recaptchaV3Config.is_enabled is false and recaptchaFormConfig(...).is_enabled will be false. Code must treat is_enabled:false as a no-op pass-through (render forms exactly as today) or every form breaks the moment the code ships while the admin toggle is off.
- recaptchaFormConfig requires the formType argument (ReCaptchaFormEnum!) — querying it without the arg errors. The 11 valid enum values are PLACE_ORDER, CONTACT, CUSTOMER_LOGIN, CUSTOMER_FORGOT_PASSWORD, CUSTOMER_CREATE, CUSTOMER_EDIT, NEWSLETTER, PRODUCT_REVIEW, SENDFRIEND, BRAINTREE, RESEND_CONFIRMATION_EMAIL. The site key lives under configurations.website_key (NOT a top-level website_key field — that field does not exist on ReCaptchaConfigOutput).
- Register auto-login is a trap: registerAction creates the account then immediately calls generateCustomerToken server-side with no fresh browser token. If CUSTOMER_LOGIN reCAPTCHA is enabled, that second call will fail validation. Fall back to redirecting to /login on captcha-gated logins instead of auto-login.
- v3 (score-based, invisible) vs v2 (checkbox) vs invisible-v2 are different UX and different script-load/render paths; re_captcha_type in configurations tells you which. minimum_score only matters for v3 and is enforced server-side by Magento, not the client.
- Zero error.tsx / not-found.tsx / global-error.tsx exist today — any Magento outage or unknown URL currently degrades to a blank/crashed page. global-error.tsx must render its own <html>/<body>. notFound() must be called explicitly when products/categoryList returns an empty items array (empty result is not an automatic 404).
- revalidatePath('/','layout') used in cart and auth actions is over-broad — it busts the entire layout subtree (including header) on every qty tick. Move to targeted revalidateTag('cart')/revalidatePath('/cart'). There is also no Magento->Next webhook, so catalog price/stock edits only reflect after the time-based revalidate window unless an /api/revalidate route + tag taxonomy is added.
- next.config.ts ships images.unoptimized:true unconditionally. It is correct locally (Next 16 blocks 127.0.0.1/private-IP image optimization as SSRF protection) but will silently disable optimization in production unless gated by NODE_ENV and pointed at a public Magento domain in remotePatterns.
- Local TLS trust relies on NODE_EXTRA_CA_CERTS=mkcert CA baked into the npm dev/build/start scripts. This is a dev-only crutch — codegen introspection and any server fetch need the same CA, and production must switch to a publicly-trusted cert and drop the override.
- Per AGENTS.md this is a non-standard Next.js 16 build with breaking changes vs trained knowledge — PPR, 'use cache', and image config APIs MUST be checked against node_modules/next/dist/docs before use; do not assume Next 14/15 semantics.
- Queries are hand-written template strings with hand-maintained types (types.ts), and magentoFetch<T> trusts the caller's T — type drift is unguarded until GraphQL codegen is introduced. Any reCAPTCHA result types added now should anticipate that migration.
- If a future Content-Security-Policy is added, it must allowlist www.google.com/recaptcha/ and www.gstatic.com or the reCAPTCHA script/badge will be blocked; and if the badge is visually hidden, Google's terms require visible 'protected by reCAPTCHA' attribution text.

---

_Blueprint generated by a 15-agent analysis workflow against the live Magento 2.4.9 GraphQL schema. Status reflects the storefront build as of generation._
