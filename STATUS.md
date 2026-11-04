# Storefront status

Living feature ledger for the Next.js storefront. Replaces the 1,500-line matrix
that used to live in `BLUEPRINT.md` (sections 1 to 7 of that file remain as the
design record). Update this file in the same commit as the feature it describes.

Last regrade: 2026-11-04, from reading `storefront/src` on branch
`claude/clever-lovelace-dco39n`. Grades mean "present and wired in code", not
"verified against a live Magento"; the e2e smoke tests need a running stack.

## Completeness by domain

Counts follow the 204 feature rows of the original blueprint. Done = wired end to
end; Partial = present with a known gap.

| Domain | Done | Partial | Missing | Notes |
|---|--:|--:|--:|---|
| Catalog & product types | 9 | 5 | 3 | Simple, configurable, bundle, grouped. No downloadable, no custom options. |
| Search & layered nav | 8 | 3 | 4 | Facets, price, sort, chips, autosuggest. No swatch facets or mobile drawer. |
| Cart & coupons | 6 | 6 | 5 | Coupons, clear cart, discounts. Taxes not shown; no mini-cart. |
| Checkout | 13 | 1 | 3 | Guest + customer, agreements, separate billing, virtual carts skip shipping. No saved-address picker, pickup, or online gateways. |
| Payments & vault | 5 | 1 | 7 | Any offline method Magento returns; saved-card list/delete. No Braintree/PayPal. |
| Customer account | 13 | 1 | 3 | Address book, profile, email, password, forgot/reset, delete account. No email confirmation. |
| Orders | 8 | 3 | 3 | Detail, shipments, invoices, reorder, cancel (gated on admin flag), guest lookup. No credit memos or downloads. |
| Wishlist | 7 | 1 | 6 | Page, PDP button, remove, move to cart, badge. Not on product cards. |
| Compare | 6 | 4 | 2 | Cookie of up to 4 SKUs, matrix page, badge. Not Magento's compare list. |
| Reviews | 5 | 3 | 3 | List, badge, write form (pending moderation). No pagination or card stars. |
| CMS & content | 7 | 4 | 0 | Magezon renderer, CMS pages/blocks, catch-all URL resolver, revalidation webhook. |
| Newsletter, contact, share | 6 | 2 | 1 | All three forms, reCAPTCHA-ready. No account newsletter preference. |
| Store, i18n, SEO, routing | 12 | 5 | 2 | Metadata, JSON-LD, sitemap, robots, lang from store, store/currency switcher. No hreflang. |
| Security & quality | 11 | 7 | 0 | reCAPTCHA threaded through login/register/forms/place-order; tag revalidation + webhook; shared error normalisation; unit tests on checkout branching. |
| **Total** | **116** | **46** | **42** | Weighted completeness about 68%. |

## Architecture rules that are in force

- **Transport**: `lib/magento.ts` is server-only. It sends `Store`, `Content-Currency` (from the switcher cookies) and `X-ReCaptcha` (when an action passes a token). Headers are part of Next's fetch cache key.
- **Caching**: catalog, CMS, store config, countries and review metadata are cached with tags from `lib/revalidate-request.ts`. Cart, customer, order, wishlist and compare reads are always `no-store`.
- **Invalidation**: `POST /api/revalidate` with `Authorization: Bearer $REVALIDATE_SECRET` and `{ tags, paths }`. Tags are allow-listed. Cart and session writes call `revalidateCartViews()` / `revalidateSession()` from `lib/revalidate.ts`, the only place that purges the layout.
- **Actions**: every Server Action returns `ActionResult` or `FormState` from `lib/errors.ts`; raw Magento text goes through `cleanMessage()`.
- **Config-driven UI**: cancel-order button, store/currency switcher and reCAPTCHA all read Magento config and disappear or no-op when the admin flag is off.
- **Checkout**: step gating is the pure `deriveCheckoutState()`; `placeOrder` uses the 2.4.9 `orderV2` + `errors` shape via `interpretPlaceOrder()`. Both are unit tested.

## Open work, in priority order

1. **Tests**: unit coverage exists for errors, checkout gating, placeOrder interpretation and the webhook validator. Still missing: a browser or mocked-transport test of add-to-cart → checkout → placeOrder, and login with cart merge.
2. **Codegen**: `npm run codegen` emits schema types only. Add `typescript-operations` over `lib/queries.ts` and type `magentoFetch` with generated documents (needs a reachable Magento to run).
3. **Checkout**: saved-address picker for signed-in customers (`customer_address_uid`), forgot-password form minting a reCAPTCHA token (action already accepts one).
4. **Catalog**: downloadable products and customizable options on the PDP; cross-sells in the cart.
5. **Engagement on cards**: wishlist and compare buttons plus star rating on `ProductCard`.
6. **Security headers**: add a Content-Security-Policy once the Magezon embed origins (YouTube, Facebook, Instagram, Google Maps) are enumerated. `CmsContent` sanitisation is regex-based; tighten before any user-generated HTML.
7. **Performance**: move the Header's session query into a Suspense boundary so the shell can be partially prerendered.
8. **Deferred by design (P3)**: online gateways, in-store pickup, hreflang/locale routing, multiple wishlists (Adobe Commerce only), email confirmation flow.

## Known pre-existing lint debt

`npm run lint` reports 18 errors, all in `src/components/SearchBox.tsx` and
`src/lib/magezon/elements/*` (React Compiler rules: setState in effects, refs
during render, `Math.random` in render). They predate this ledger and do not
block `next build`.
