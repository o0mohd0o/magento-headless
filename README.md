# Magento Headless — Magento Open Source 2.4.9 + Next.js

A headless commerce setup: **Magento Open Source CE 2.4.9** (via
[markshust/docker-magento](https://github.com/markshust/docker-magento)) as the
commerce backend, and a **Next.js 16** App Router storefront (`storefront/`)
that consumes Magento's GraphQL API.

```
Browser ──► Next.js (localhost:3000) ──► Magento GraphQL (https://magento.test/graphql) ──► MariaDB / OpenSearch / Redis
            • RSC server-to-server reads (catalog, PDP, search) — no CORS
            • Server Actions for cart (guest masked cart id in httpOnly cookie)
```

---

## Cloning this repo

To keep the repo lean and license-clean, a few things are **not** committed and
must be recreated locally:

| Not committed | How to recreate |
|---------------|-----------------|
| `src/` — the Magento install (866 MB, licensed) | `bin/download community 2.4.9 && bin/setup magento.test` |
| `Magezon/` + `src/app/code/Magezon` — Page Builder (commercial © Magezon) | Install from your own Magezon license |
| `certs/`, `rootCA.pem`, `storefront/certs/` — TLS certs | `bin/setup-ssl magento.test` (uses your mkcert CA) |
| `env/magento.env` — install-time admin credentials | `cp env/magento.env.sample env/magento.env`, then edit |
| `storefront/.env.local` — storefront env | `cp storefront/.env.example storefront/.env.local` |

The runtime `env/*.env` files (db, opensearch, redis, rabbitmq, php) are the
standard docker-magento dev defaults and **are** committed.

---

## 1. Backend — Magento (docker-magento)

Installed in the repo root via the standard docker-magento flow:

```bash
bin/download community 2.4.9     # composer create-project from repo.magento.com
bin/setup magento.test           # full install (DB, OpenSearch, Redis, RabbitMQ, SSL, dev mode)
```

Then Luma sample data + headless tweaks:

```bash
bin/magento sampledata:deploy
bin/magento module:enable Magento_CatalogSampleData Magento_ConfigurableSampleData ... # all *SampleData modules
bin/magento sampledata:reset
bin/magento setup:upgrade
bin/magento module:disable Magento_TwoFactorAuth Magento_AdminAdobeImsTwoFactorAuth   # easier dev/admin
bin/magento indexer:reindex && bin/magento cache:flush
```

### URLs & credentials

| What | Where |
|------|-------|
| Storefront (Magento Luma) | https://magento.test/ |
| Admin | https://magento.test/admin/ — credentials you set in `env/magento.env` |
| GraphQL endpoint | https://magento.test/graphql |
| Mailcatcher | http://magento.test:1080 |

### Managing the backend

```bash
bin/start      # start all containers
bin/stop       # stop them
bin/status     # container status
bin/magento <cmd>   # run bin/magento inside the phpfpm container
bin/mysql      # mysql shell
```

> Requires Docker Desktop with ≥ 6 GB RAM, and `magento.test` in `/etc/hosts`
> pointing at `127.0.0.1`.

### TLS / certificate note

The site cert was (re)generated with the **host's mkcert CA** (already trusted in
the macOS System keychain), so both the browser and Node trust `magento.test`
without warnings. The CA is exported to `certs/magento-rootCA.pem` and copied to
`storefront/certs/` for Node (`NODE_EXTRA_CA_CERTS`).

If you ever recreate the containers and the cert reverts to a container-generated
CA, re-run:

```bash
TRUST_STORES=system mkcert -cert-file /tmp/m.crt -key-file /tmp/m.key magento.test
CID=$(bin/docker-compose ps -q app)
docker cp /tmp/m.crt "$CID":/etc/nginx/certs/nginx.crt
docker cp /tmp/m.key "$CID":/etc/nginx/certs/nginx.key
bin/docker-compose exec -T -u root app nginx -s reload
cp "$(mkcert -CAROOT)/rootCA.pem" certs/magento-rootCA.pem
cp certs/magento-rootCA.pem storefront/certs/magento-rootCA.pem
```

---

## 2. Frontend — Next.js storefront (`storefront/`)

Next.js 16 (App Router, TypeScript, Tailwind v4). No Apollo, no extra GraphQL
client — plain `fetch` for RSC reads, Server Actions for cart mutations.

### Run it

```bash
cd storefront
npm run dev      # http://localhost:3000  (NODE_EXTRA_CA_CERTS is set in the npm script)
```

### Architecture

- **Reads** (home, category/PLP, product/PDP, search) happen in **React Server
  Components** via `src/lib/magento.ts` → `fetch(MAGENTO_GRAPHQL_URL)`
  server-to-server. The browser never calls Magento, so **no CORS** is needed.
  Catalog queries use Next's `fetch` cache (`next: { revalidate, tags }`).
- **Cart** mutations use **Server Actions** (`src/lib/actions.ts`):
  `addToCartAction`, `updateItemQtyAction`, `removeItemAction`. A guest cart is
  created via `createGuestCart` and its **masked cart id** is stored in an
  `httpOnly` cookie (`guest_cart_id`). Configurable products pass
  `selected_options` (the option value uids).
- **Customer auth** (`src/lib/auth.ts`): `loginAction` (`generateCustomerToken`),
  `registerAction` (`createCustomerV2` + auto-login), `logoutAction`
  (`revokeCustomerToken`). The bearer token is kept in an `httpOnly` cookie
  (`customer_token`). On login the **guest cart is merged** into the customer
  cart (`mergeCarts`), and all cart operations become token-aware
  (`customerCart`). The `/account` page shows profile + order history.
- **Env** (`.env.local`): `MAGENTO_GRAPHQL_URL`, `MAGENTO_STORE_CODE`,
  `NODE_EXTRA_CA_CERTS`. All server-only — nothing secret reaches the browser.

### Routes

| Route | Purpose |
|-------|---------|
| `/` | Hero, category tiles, featured product rows |
| `/category/[slug]` | Category / PLP with **faceted filtering + sort** (layered nav) |
| `/product/[slug]` | PDP — gallery, price, types, add to cart, **reviews**, wishlist |
| `/cart` | Cart line items, qty/remove, coupons, live totals |
| `/search?q=` | Full-text search with **facets + sort** |
| `/wishlist` | Customer wishlist (add from PDP, move to cart) |
| `/login`, `/register` | Customer sign-in / registration |
| `/forgot-password`, `/reset-password` | Password recovery |
| `/checkout` | Multi-step checkout (email → address → shipping → payment) |
| `/checkout/success` | Order confirmation |
| `/account` | Dashboard (profile, default address, recent orders) |
| `/account/orders`, `/account/orders/[number]` | Order history + detail + reorder |
| `/account/addresses` | Address book (CRUD) |
| `/account/profile` | Edit name + change password |
| `/sitemap.xml`, `/robots.txt` | SEO |

### Structure

```
storefront/src/
  lib/
    magento.ts       # server-only GraphQL fetch transport
    queries.ts       # all GraphQL operations (verified against 2.4.9)
    actions.ts       # 'use server' cart mutations
    cart-data.ts     # read-only cart fetch for RSC (header badge, cart page)
    cart-cookies.ts  # guest_cart_id cookie helpers
    types.ts, format.ts
  components/         # Header, Footer, ProductCard, ProductGrid, Price,
                     # Gallery, AddToCart (client), CartControls (client)
  app/               # layout, page (home), category, product, cart, search
```

---

## 3. Page Builder homepage (Magezon, headless)

The storefront homepage (`/`) is **authored in the Magezon Page Builder** and
rendered headlessly — the page-builder workflow, decoupled from the Luma theme.

**Backend.** The Magezon suite + a small bridge module `QasrAlawani_MagezonHeadless`
live in `src/app/code`. The bridge adds a GraphQL query:

```graphql
{ magezonContent(identifier: "headless-home", type: CMS_PAGE) {
    has_pagebuilder profile_json media_base_url } }
```

`profile_json` is the decoded element tree (`{ elements, custom_css }`) with
`{{mgzlink}}` tokens + media paths already resolved server-side. Page Builder
content is stored on a CMS page as the shortcode
`[mgz_pagebuilder]{…JSON profile…}[/mgz_pagebuilder]` — which means content can be
**authored directly as JSON**, no Angular admin builder required.

**Frontend.** `storefront/src/lib/magezon/` is a self-contained renderer that maps
each Magezon element `type` → a React component (48 components, responsive 12-col
grid, per-element scoped CSS — same structure as the monolith). `src/app/page.tsx`
fetches `magezonContent("headless-home")` server-side and renders it with
`<MagezonRenderer>` (graceful fallback if the page is missing). The product
elements (`product_grid` …) are Client Components that fetch live catalog data
through a same-origin proxy at `src/app/api/graphql/route.ts`
(`NEXT_PUBLIC_MAGENTO_GRAPHQL_URL=/api/graphql`).

**Authoring / iterating.** The homepage tree is generated by a script so it stays
maintainable:

```bash
cd storefront
node scripts/build-homepage.mjs                       # → ../_homepage.sql
bin/clinotty mysql -h db -u magento -pmagento magento < ../_homepage.sql
bin/magento cache:flush
rm -rf .next/cache/fetch-cache                         # bust Next's data cache
```

Design: a "kinetic sport-luxe" system — near-black ink, warm paper, one acid-lime
accent; Anton (display) + Hanken Grotesk (body) via `next/font`. Hero, lime ticker,
category triptych, editorial split, two **live** product grids (tops, bags),
numbered value props, and a closing CTA — all from the page-builder profile.

> PHP 8.5 note: Magezon is 2019-era code, and Magento developer mode escalates PHP
> deprecations to fatals. The installed copy is patched for PHP 8.5 (GraphQL
> partial-schema descriptions, a null array-offset, and implicit-nullable
> constructor params). See `MEMORY` / commit history for specifics.

---

## Gotchas handled (so they don't surprise you again)

1. **Sample data didn't import** — `sampledata:deploy` downloaded the packages
   but left the `*SampleData` modules **disabled** ("Nothing to import").
   Fix: `module:enable` them all + `sampledata:reset` + `setup:upgrade`.
2. **Self-signed cert** — the container generated its own mkcert CA that the host
   didn't trust. Re-signed the cert with the host mkcert CA (see TLS note above).
3. **Tailwind v4 produced no utilities** — auto source-detection respects
   `.gitignore`, and the docker-magento root `.gitignore` has `src/` which also
   matches `storefront/src/`. Fix: explicit `@source "../**/*.{ts,tsx}"` in
   `globals.css`.
4. **Broken product images** — Next 16's image optimizer blocks hosts that
   resolve to a private IP (`magento.test → 127.0.0.1`, SSRF protection). Fix:
   `images.unoptimized = true` for local dev (browser loads media directly).

---

## Roadmap

See **[`BLUEPRINT.md`](BLUEPRINT.md)** for a full feature analysis of the Magento
2.4.9 storefront surface (34 queries / 69 mutations, 204 features across 14
domains) mapped to the build, with a phased implementation plan.

**Completeness.** A code audit against the 204-feature blueprint initially found
71 done / 43 partial / 92 missing. Since then the **buildable, non-gated gaps**
were closed: newsletter signup, contact form, email-a-friend, **bundle** products,
related/upsell + tier prices, clear-cart, change-email, delete-account, **guest
order lookup**, order cancellation, shipments/tracking/invoices, header
wishlist/compare counts, **search autosuggest**, Breadcrumb + Organization
JSON-LD, reCAPTCHA `X-ReCaptcha` header plumbing, category descriptions,
email-availability check, locale-driven currency formatting, and **unit tests**.

A further pass then closed the **infrastructure** and **config-aware** items:
- **Magento `route()`/UrlRewrite universal resolver** — catch-all `[...slug]`
  route resolves legacy/canonical URLs (`/hero-hoodie.html` → `/product/…`) + 301s.
- **GraphQL codegen** — `codegen.ts` + `npm run codegen` generates typed schema
  (`src/lib/gql-schema.generated.ts`).
- **Tests** — `npm test` (unit) + `npm run test:e2e` (7 integration tests, all green).
- **Checkout agreements**, **store/currency switcher**, **saved-cards/vault**
  (`/account/payment`), and **account newsletter** — all built **config-aware**
  (they render real data the moment Magento exposes it; inert here on the
  single-store/USD/no-agreements/no-saved-cards demo).

The only items not implemented are those with **no possible client-side
representation** on this instance: online card-gateway tokenization UI
(Braintree Hosted Fields / PayPal redirect — need merchant SDK + credentials)
and the reCAPTCHA challenge widget (needs site keys) — both have their
data/transport layers wired (`available_payment_methods`, `getRecaptchaConfig`,
`X-ReCaptcha` header) and only need the provider front-end once credentials
exist.

**Progress against the blueprint:**

- ✅ **Phase 1 (P0) — Transactable store.** Full multi-step checkout
  (email → address → shipping method → offline payment) → `placeOrder` →
  confirmation. Countries/regions, order summary with live totals, error
  boundaries (`error.tsx`/`not-found.tsx`/`global-error.tsx`). _Verified by
  placing real orders end-to-end._
- ✅ **Phase 2 (P1) — Account & conversion.** Account hub (dashboard, order
  history + **detail + reorder**, **address book CRUD**, profile edit, change
  password), **password reset**, **cart coupons**, **grouped** products (so
  179/181 products are buyable), and SEO (per-page metadata, canonical, OpenGraph,
  **Product JSON-LD**, `sitemap.xml`, `robots.txt`).
- ✅ **Phase 3 (P2):** **wishlist**, **layered-nav** (faceted/sortable PLP +
  search with active-filter chips), **reviews & ratings** (display +
  write-review), **CMS pages** (`/page/[identifier]` + PageBuilder rendering),
  **product compare**. Online card gateways (Braintree/PayPal) & reCAPTCHA are
  wired *config-aware* but inert on this Luma demo (no merchant credentials).
- 🟡 **Phase 4 (P3):** ✅ locale-driven `<html lang>` (from `storeConfig`),
  ✅ security headers, ✅ PWA manifest. Multi-store/currency switcher, order
  cancellation, in-store pickup, and online gateways are **config-gated** —
  inert on this single-store / USD / flags-off / no-credentials demo instance,
  and activate when the corresponding Magento admin settings are enabled.
