# BLUEPRINT.md — Analysis against the current codebase

Date: 2026-11-02. Branch: `claude/clever-lovelace-dco39n` at `3497474`.
Method: static reading of `storefront/src` (about 27,700 lines of TS/TSX across 190 files)
against the 204-feature ledger in `BLUEPRINT.md`. No Magento instance was reachable from
this session, so every grade below is "present and wired in code", not "verified at runtime".

## 0. Implemented on 2026-11-04

The recommendations in section 7 were actioned on this branch:

- **Section 8 of `BLUEPRINT.md` retired**; sections 1 to 7 kept under a dated banner. `STATUS.md` holds the regraded ledger and the open-work list.
- **Revalidation**: tag taxonomy in `lib/revalidate-request.ts`, `revalidateTag(tag, "max")` helpers in `lib/revalidate.ts`, per-product tags on PDP reads, and a bearer-authenticated `POST /api/revalidate` webhook. The layout-wide purge now lives in one function.
- **Errors**: `lib/errors.ts` with `cleanMessage()`, `fail()`, `ActionResult`, `FormState`. The five duplicated helpers are gone; auth errors, reCAPTCHA failures and outages map to user copy.
- **Config gating**: cancel-order button reads `storeConfig.order_cancellation_enabled`. Store/currency switcher is a working client component backed by cookies, validated Server Actions, and `Store` / `Content-Currency` headers in `magentoFetch` (which also scopes the fetch cache).
- **Virtual carts**: `CHECKOUT_CART` reads `billing_address`; `deriveCheckoutState()` skips shipping for `is_virtual`; a billing step with "same as shipping" or a separate address form was added, backed by a new `setBillingAddressOnCart` mutation.
- **reCAPTCHA**: `useRecaptcha()` hook and `RecaptchaField` component mint v3 tokens; login, register, place-order, contact, newsletter and review actions forward them as `X-ReCaptcha`. Everything is a no-op while Magento reports `is_enabled: false`.
- **Tests**: 18 new unit tests (22 total) covering error normalisation, checkout gating for guest/customer/physical/virtual carts, `placeOrder` interpretation, and webhook validation. `tsc --noEmit` and `next build` pass.
- **Cleanup**: unused Magento compare-list operations removed from `queries.ts`; `storefront/README.md` replaced; stale `sellerCatalogConfig` comment removed from `next.config.ts`; `REVALIDATE_SECRET` documented in `env/storefront.env`.

Not done, and why: `typescript-operations` codegen needs a reachable Magento schema; a CSP needs the Magezon embed origins enumerated first; the critical-path browser test needs a running stack. All three are listed in `STATUS.md`.

## 1. Verdict

`BLUEPRINT.md` is a snapshot of the storefront as it existed in the initial commit
(2026-06-04). It has not been touched since, while 14 commits of feature work landed on top.
It still says the store cannot place an order and that checkout, wishlist, compare, reviews,
CMS, SEO, account self-service and error boundaries are "entirely absent". All of those now
exist. Roughly two thirds of the roadmap is built; the document scores it at 9%.

| Measure | Blueprint says | Code today (estimate) |
|---|--:|--:|
| Done | 2 | ~102 |
| Partial | 31 | ~52 |
| Missing | 171 | ~50 |
| Weighted completeness | ~9% | ~63% |

The document is therefore no longer usable as a status tracker or a work queue. Its durable
value is sections 4 to 7 (architecture, cross-cutting concerns, risks, recommendations), most of
which were followed and several of which are still open. Section 8 (the 1,500-line matrix,
about 95% of the file by size) should be replaced by a short living status table.

## 2. Completeness by domain, regraded

Counts are per feature row in section 8 of the blueprint. "Done" means the feature is present
and wired end to end in code. "Partial" means present but with a gap the blueprint itself
called out.

| Domain | Blueprint ✅/🟡/⬜ | Regraded ✅/🟡/⬜ | Main remaining gaps |
|---|---|---|---|
| 8.1 Catalog & product types | 2/5/10 | 9/5/3 | Downloadable, custom options, cross-sell, gallery video |
| 8.2 Search & layered nav | 0/5/10 | 8/3/4 | Swatch facets, mobile drawer, attributesList, recent searches |
| 8.3 Cart & coupons | 0/3/14 | 6/6/5 | Taxes in breakdown, mini-cart, gift message, downloadable |
| 8.4 Checkout | 0/2/15 | 11/2/4 | Saved-address picker, separate billing form, virtual (no-ship) path, pickup |
| 8.5 Payments & vault | 0/0/13 | 5/1/7 | Every online gateway (Braintree, PayPal, Payflow) |
| 8.6 Account & addresses | 0/1/16 | 13/1/3 | Email confirmation, resend confirmation, customerGroup |
| 8.7 Orders | 0/1/13 | 8/3/3 | Credit memos, two-step/guest cancel, downloads library |
| 8.8 Wishlist | 0/0/14 | 7/1/6 | PLP button, filled-heart state, qty edit, share |
| 8.9 Compare | 0/0/12 | 6/4/2 | PLP button, assign-to-customer on login |
| 8.10 Reviews | 0/0/11 | 5/3/3 | Pagination, card stars, My Reviews |
| 8.11 CMS & content | 0/2/9 | 6/4/1 | On-demand invalidation, CMS-driven footer |
| 8.12 Newsletter/contact/share | 0/0/9 | 5/2/2 | reCAPTCHA gating, account newsletter pref |
| 8.13 Store/i18n/SEO/routing | 0/6/13 | 10/7/2 | hreflang, paginated-PLP canonical, switchers unwired |
| 8.14 Security & quality | 0/6/12 | 3/10/5 | All five reCAPTCHA gates, tag revalidation, CSP |
| **Total** | **2/31/171** | **~102/52/50** | |

Evidence for the "done" column, by file: `app/checkout/page.tsx` + `components/checkout/CheckoutFlow.tsx`
(5-step server-gated flow, agreements, placeOrder via `orderV2`), `lib/account-actions.ts`
(address CRUD, profile, email, password, reorder, cancel, delete account), `app/account/orders/[number]`
(items, totals, shipments + tracking, invoices), `lib/wishlist*.ts`, `lib/compare*.ts`,
`lib/reviews.ts` + `components/Review*.tsx`, `lib/cms.ts` + `components/CmsContent.tsx`,
`app/[...slug]/page.tsx` + `lib/route.ts`, `app/sitemap.ts`, `app/robots.ts`, `lib/seo.ts`,
`components/*JsonLd.tsx`, `app/error.tsx`, `app/global-error.tsx`, `app/not-found.tsx`,
`lib/filters.ts` + `components/catalog/*`, `app/api/suggest/route.ts`.

## 3. What the blueprint got right and the code followed

These recommendations from sections 4 to 7 are implemented as specified:

- **placeOrder uses the 2.4.9 shape.** `checkout-actions.ts` reads `orderV2 { number token }` and checks `errors[]` before redirecting. The blueprint's top-ranked risk did not materialise.
- **Per-user reads are never cached.** Cart, customer, wishlist, compare and payment-token reads call `magentoFetch` without `revalidate`, which the transport maps to `cache: "no-store"`. No cross-shopper cache leak path was found.
- **Reference data is cached and tagged.** Countries (86,400s, `countries`), storeConfig (3,600s, `store-config`), catalog (60 to 300s, `catalog`), CMS (300s, `cms`), review metadata (86,400s).
- **`magentoFetch` accepts per-request headers.** `store` and `recaptchaToken` (→ `X-ReCaptcha`) options exist.
- **Account hub with one guard.** `app/account/layout.tsx` calls `requireToken()` once; sub-routes exist for addresses, orders, profile, payment.
- **SEO anchored on a public URL.** `metadataBase` comes from `NEXT_PUBLIC_SITE_URL`, never `magento.test`. `html lang` is read from storeConfig.
- **Config-driven no-ops.** `StoreSwitcher` renders nothing on a single-store instance; `getRecaptchaConfig()` returns null when disabled.
- **Token expiry fallback.** `cart-cookies.ts` falls back to the guest cart on an invalid customer token.
- **Error boundaries and 404.** All three files exist at the app root.

## 4. Open items the blueprint still predicts correctly

Each of these is a blueprint recommendation that was only half-applied. They are the real
backlog this document should be reduced to.

1. **reCAPTCHA is plumbing without callers.** `magentoFetch` accepts `recaptchaToken`, and `recaptcha.ts` fetches config, but no Server Action passes a token and no component mints one (`grep recaptcha src/components src/app` returns nothing). The moment an admin enables reCAPTCHA, login, register, review, contact, newsletter and place-order will start failing with a header error. Risk 2 in the blueprint, unchanged.
2. **Revalidation is still path-based and over-broad.** Reads carry tags, but no write calls `revalidateTag`. `revalidatePath("/", "layout")` appears 14 times (cart qty, wishlist, compare, auth, place order). There is no `/api/revalidate` webhook, so the tags on catalog and CMS reads are dead weight. Recommendation 6, not done.
3. **Error normalisation is duplicated, not centralised.** Five files define their own `clean()` / `cleanMessage()` with the same regex (`auth.ts`, `account-actions.ts`, `checkout-actions.ts`, `comms-actions.ts`, `wishlist-actions.ts`). Return shapes diverge: `{ ok, error }`, `{ ok, errors: [...] }`, `{ ok, message }`, `{ ok, needLogin }`, `{ error }`. Recommendation 4, not done.
4. **Codegen generates schema types only.** `codegen.ts` runs the `typescript` plugin into `gql-schema.generated.ts` (schema enums and input types). `queries.ts` is still 1,000 lines of hand-written template strings with hand-written result types in `types.ts`, so `magentoFetch<T>` remains unchecked against the documents. Risk "type drift", unchanged in practice.
5. **Tests do not cover the critical path.** `filters.test.ts` has 4 unit tests; `e2e.test.ts` has 7 HTTP smoke checks (pages return 200 and contain text). No test exercises add-to-cart, login, cart merge, checkout or placeOrder. Recommendation 10, not done.
6. **Order cancellation is not gated.** `CancelOrderButton` renders unconditionally; nothing reads `storeConfig.order_cancellation_enabled` (currently false per the blueprint). Customers will see a button that returns a Magento error.
7. **Store and currency switchers are inert UI, not inert features.** `StoreSwitcher` renders two `<select>` elements with no handler, no cookie and no way to reach the `store` option on `magentoFetch`. It self-hides today, but will appear as broken controls the day a second store view or currency is configured. There is also no cache-key scoping by store or currency.
8. **Virtual and downloadable carts are forced through shipping.** `CHECKOUT_CART` does not read `is_virtual`, and `CheckoutFlow` always requires a shipping address and method. Downloadable products have no PDP handling at all.
9. **Checkout address UX gaps.** No saved-address picker for logged-in customers (the blueprint's "highest-leverage reuse"), and billing is hard-wired to `same_as_shipping: true` with no separate billing form.
10. **Header is not in a Suspense hole.** `layout.tsx` renders `<Header />` synchronously and Header performs the per-request session query, so the shell cannot be partially prerendered. Cross-cutting "Performance" item, open.
11. **Security headers lack a CSP.** `next.config.ts` sets nosniff, frame, referrer and permissions headers, but no `Content-Security-Policy`. `CmsContent` sanitises with regexes (strips `<script>` and `on*=` attributes) but leaves `javascript:` hrefs, `<iframe>`, `<object>` and inline `style` intact. Acceptable for merchant-authored CMS, worth tightening before user-generated content.

## 5. Where the code diverged from the blueprint on purpose

These are not defects, but the document should be updated to reflect them.

- **Magezon Page Builder replaced native PageBuilder.** The blueprint's CMS domain assumes `data-content-type` markup and self-hosted PageBuilder CSS. The codebase instead ships a custom Magento module exposing `magezonContent` and a React renderer with roughly 50 element components under `lib/magezon/`. The home page is a Magezon profile (`headless-home`), not `cms_home_page`. The blueprint's PageBuilder notes in 8.11 are obsolete.
- **Compare uses a storefront cookie of SKUs, not Magento's compare list.** `compare.ts` stores up to 4 SKUs in a `compare_skus` cookie and queries products by SKU. `createCompareList` / `addProductsToCompareList` mutations are defined in `queries.ts` but are not what the page uses. This sidesteps the GUID-cookie subsystem and the assign-on-login step the blueprint planned. Fine for CE, but the mutations are now unused definitions.
- **PWA scope was added that the blueprint never listed.** Manifest, service worker, offline page, file handlers (`/list` opens `.lumalist` files), protocol handlers, a notes page and a Magezon admin preview route. These account for the last six commits and should be tracked somewhere.
- **Network isolation (HEADLESS.md) is new.** Public `/graphql`, `/rest`, `/soap` return 404; the storefront reaches a private `app:8181` listener. The blueprint assumed `https://magento.test/graphql` throughout.

## 6. Problems with the document itself

- **Stale by five months and 14 commits.** Single commit touching it is the initial import. Every status, count and "Current state" sentence is wrong for today's code.
- **Size.** 317 KB in one Markdown file, 1,701 lines, dominated by per-feature build notes that duplicate what the code now expresses. It is too large to review and too large for most tooling to diff meaningfully.
- **Internal count mismatch.** The header says 204 features; the tables contain 205 status cells because the domain summary table's header row also carries a ✅ glyph. Harmless, but it shows the totals were generated, not audited.
- **Terminology drift.** "PageBuilder" throughout versus Magezon in code; "revalidatePath('/','layout') to be replaced" versus still present; "no /checkout route" versus a working route.
- **Companion docs are also stale or boilerplate.** `storefront/README.md` is the untouched create-next-app template. A comment in `next.config.ts` references a `sellerCatalogConfig` upload relay that does not exist anywhere in `src`.

## 7. Recommendations

1. **Retire section 8 of `BLUEPRINT.md`.** Keep sections 1 to 7 as a design record with a dated banner, or move them to `docs/`. Replace the matrix with a one-page `STATUS.md` holding the regraded table from section 2 above and the eleven open items from section 4. Keep it under 150 lines so it gets updated with features.
2. **Close the five "half-applied" architecture items first**, in this order, because each is small and unblocks correctness rather than features: (a) wire `revalidateTag` into writes and add `/api/revalidate`; (b) create `lib/errors.ts` and make all actions return one `{ ok, error? }` shape; (c) gate `CancelOrderButton` and `StoreSwitcher` on their config flags, or wire the switcher properly; (d) read `is_virtual` in checkout and skip shipping; (e) thread a reCAPTCHA token through login, register and place-order so the feature is correct before it is enabled.
3. **Add the three missing critical-path tests** before any further feature work: guest add-to-cart → checkout → placeOrder (mocked `magentoFetch` or a seeded instance), login with cart merge, and `placeOrder` error branch. The existing `node --test` harness is enough.
4. **Finish codegen properly** by adding the `typescript-operations` plugin (or client-preset) over `queries.ts` and typing `magentoFetch` with the generated documents. The schema file alone does not protect against the drift the blueprint warned about.
5. **Decide on compare.** Either delete the unused Magento compare-list mutations from `queries.ts` and document the cookie approach, or switch to the Magento list and gain assign-on-login. Carrying both is confusing.
6. **Replace `storefront/README.md`** with a short pointer to the root README, SETUP.md and HEADLESS.md, and fix the stale `sellerCatalogConfig` comment in `next.config.ts`.
7. **Leave online payments, pickup, multi-store and hreflang where the blueprint put them (P3)**. Nothing in the code or the admin configuration described in the blueprint has changed the case for building them now.
