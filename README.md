# Magento Headless — Open Source 2.4.9 + Next.js 16

A production-style **headless commerce** stack:

- **Magento Open Source CE 2.4.9** as the commerce backend (catalog, cart,
  checkout, customers, orders) — run on Docker via
  [markshust/docker-magento](https://github.com/markshust/docker-magento).
- **Next.js 16** App Router storefront (`storefront/`) that talks to Magento
  only over **GraphQL**.
- **Magezon Page Builder** content rendered **headlessly** — the page-builder
  element tree is exposed over GraphQL and re-implemented as React components.

```
Browser ──► Next.js (localhost:3000) ──► Magento GraphQL (https://magento.test/graphql) ──► MariaDB / OpenSearch / Redis
            • RSC server-to-server reads (catalog, PDP, search) — no CORS
            • Server Actions for cart (guest masked cart id in httpOnly cookie)
```

---

## What we've built ✅

A snapshot of the current state — what actually works today.

**Backend — Magento 2.4.9 (Docker)**
- Full Magento Open Source CE 2.4.9 stack on Docker: nginx, MariaDB, OpenSearch,
  Redis, RabbitMQ, Mailcatcher.
- Luma **sample data** loaded, GraphQL API live, developer mode, trusted local
  **TLS** via the host mkcert CA.
- **Magezon Page Builder** suite + a custom **`QasrAlawani_MagezonHeadless`**
  GraphQL bridge module, patched to run on **PHP 8.5**.

**Storefront — Next.js 16**
- Complete happy path, **verified with real orders**: browse → product → cart →
  multi-step checkout → order → account/order history.
- **RSC reads** (catalog, PLP, PDP, search) server-to-server → **no CORS**;
  **Server Actions** for the guest + customer cart; **customer auth** with
  guest-cart merge on login.
- Faceted/sortable **PLP & search**, **wishlist**, **product compare**,
  **reviews & ratings**, cart **coupons**, **password reset**, full **account**
  hub (orders + reorder, address book CRUD, profile, change password).
- **SEO** (per-page metadata, canonical, OpenGraph, Product/Breadcrumb/Org
  JSON-LD, `sitemap.xml`, `robots.txt`), security headers, PWA manifest,
  universal `route()`/UrlRewrite resolver with 301s.
- **Headless Magezon homepage** — a 48-component JSON-to-React renderer
  (`src/lib/magezon/`) renders a page-builder profile, including **live**
  product grids.
- Tooling: **unit + e2e tests**, **GraphQL codegen**.

**Completeness** — measured against the 204-feature blueprint in
[`BLUEPRINT.md`](BLUEPRINT.md): the core commerce surface (Phases 1–3) is
**complete**. The only remaining items are **config-gated** — online card-gateway
UI (Braintree/PayPal), the reCAPTCHA challenge widget, and multi-store/currency
switching. Their data/transport layers are already wired; they light up the
moment the matching Magento credentials/flags exist. See
[Feature status](#feature-status).

---

## Prerequisites

- **Docker Desktop** with ≥ 6 GB RAM allocated.
- **Node.js 20+** and npm (for the storefront).
- **mkcert** (for browser- and Node-trusted local HTTPS).
- `magento.test` mapped to `127.0.0.1` in `/etc/hosts`.
- This repo is intentionally lean — the Magento install and the proprietary
  Magezon source are **not committed**. See [Cloning this repo](#cloning-this-repo).

---

## Quick start

### 1 — Backend: Magento

```bash
# Install Magento 2.4.9 (docker-magento standard flow)
bin/download community 2.4.9      # composer create-project from repo.magento.com
bin/setup magento.test            # DB, OpenSearch, Redis, RabbitMQ, SSL, dev mode

# Luma sample data + headless-friendly tweaks
bin/magento sampledata:deploy
bin/magento module:enable Magento_CatalogSampleData Magento_ConfigurableSampleData …  # all *SampleData modules
bin/magento sampledata:reset
bin/magento setup:upgrade
bin/magento module:disable Magento_TwoFactorAuth Magento_AdminAdobeImsTwoFactorAuth     # easier dev/admin
bin/magento indexer:reindex && bin/magento cache:flush
```

> Install the Magezon Page Builder suite (from your own Magezon license) into
> `src/app/code/Magezon`, then `bin/magento setup:upgrade`. The headless bridge
> module already lives in `magezon-headless-nextjs/magento-module` — copy it to
> `src/app/code/QasrAlawani/MagezonHeadless`.

### 2 — Storefront: Next.js

```bash
cd storefront
cp .env.example .env.local          # adjust if your backend URL/store differ
npm install
npm run dev                         # → http://localhost:3000
```

`NODE_EXTRA_CA_CERTS` is set inside the npm scripts so Node trusts the
`magento.test` certificate for server-side fetches.

### 3 — Page Builder homepage

The homepage (`/`) is authored as a Magezon profile and applied via a generator
script (keeps the layout maintainable as code):

```bash
cd storefront
node scripts/build-homepage.mjs                                   # → ../_homepage.sql
bin/clinotty mysql -h db -u magento -pmagento magento < ../_homepage.sql
bin/magento cache:flush
rm -rf .next/cache/fetch-cache                                    # bust Next's data cache
```

---

## Daily usage

```bash
bin/start            # start all containers
bin/stop             # stop them
bin/status           # container status
bin/magento <cmd>    # run bin/magento inside the phpfpm container
bin/mysql            # mysql shell
bin/clinotty <cmd>   # run any command in the phpfpm container

cd storefront && npm run dev    # storefront dev server (localhost:3000)
npm test                        # unit tests
npm run test:e2e                # integration tests
npm run codegen                 # regenerate typed GraphQL schema
```

### URLs & credentials

| What | Where |
|------|-------|
| Storefront (headless, Next.js) | http://localhost:3000 |
| Storefront (Magento Luma) | https://magento.test/ |
| Admin | https://magento.test/admin/ — credentials you set in `env/magento.env` |
| GraphQL endpoint | https://magento.test/graphql |
| Mailcatcher | http://magento.test:1080 |

---

## Cloning this repo

To keep the repo lean and license-clean, a few things are **not** committed and
must be recreated locally:

| Not committed | How to recreate |
|---------------|-----------------|
| `src/` — the Magento install (~866 MB, licensed) | `bin/download community 2.4.9 && bin/setup magento.test` |
| `Magezon/` + `src/app/code/Magezon` — Page Builder (commercial © Magezon) | Install from your own Magezon license |
| `certs/`, `rootCA.pem`, `storefront/certs/` — TLS certs | `bin/setup-ssl magento.test` (uses your mkcert CA) |
| `env/magento.env` — install-time admin credentials | `cp env/magento.env.sample env/magento.env`, then edit |
| `storefront/.env.local` — storefront env | `cp storefront/.env.example storefront/.env.local` |

The runtime `env/*.env` files (db, opensearch, redis, rabbitmq, php) are the
standard docker-magento dev defaults and **are** committed.

---

## How it works

### Storefront (Next.js 16, App Router, TypeScript, Tailwind v4)

No Apollo, no GraphQL client library — plain `fetch` for reads, Server Actions
for mutations.

- **Reads** (home, category/PLP, product/PDP, search) run in **React Server
  Components** via `src/lib/magento.ts` → `fetch(MAGENTO_GRAPHQL_URL)`
  server-to-server. The browser never calls Magento, so **no CORS**. Catalog
  queries use Next's `fetch` cache (`next: { revalidate, tags }`).
- **Cart** mutations are **Server Actions** (`src/lib/actions.ts`). A guest cart
  is created on demand and its **masked cart id** lives in an `httpOnly` cookie
  (`guest_cart_id`). Configurable products pass `selected_options` (option uids).
- **Customer auth** (`src/lib/auth.ts`): `generateCustomerToken` /
  `createCustomerV2` / `revokeCustomerToken`; bearer token in an `httpOnly`
  cookie. On login the **guest cart merges** into the customer cart, and all cart
  operations become token-aware.

### Page Builder, headless

- **Backend.** `QasrAlawani_MagezonHeadless` adds a GraphQL query that returns
  the decoded builder tree:

  ```graphql
  { magezonContent(identifier: "headless-home", type: CMS_PAGE) {
      has_pagebuilder profile_json media_base_url } }
  ```

  Page Builder content is stored on a CMS page as a
  `[mgz_pagebuilder]{…JSON…}[/mgz_pagebuilder]` shortcode, so it can be authored
  **directly as JSON** — no Angular admin builder required. `{{mgzlink}}` tokens
  and media paths are resolved server-side.
- **Frontend.** `src/lib/magezon/` maps each element `type` → a React component
  (48 components, responsive 12-col grid, per-element scoped CSS). `app/page.tsx`
  fetches the profile and renders `<MagezonRenderer>` (graceful fallback if the
  page is missing). Product elements are Client Components that fetch live
  catalog data through a same-origin proxy at `app/api/graphql/route.ts`.
- **Design.** A "kinetic sport-luxe" system — near-black ink, warm paper, one
  acid-lime accent; **Anton** (display) + **Hanken Grotesk** (body) loaded by the
  profile's **custom CSS** (`@import`), so it renders identically in Next.js and
  inside Magento.

> **PHP 8.5 note.** Magezon is 2019-era code and Magento developer mode escalates
> PHP deprecations to fatals. The installed copy is patched for PHP 8.5 (GraphQL
> partial-schema descriptions, a null array-offset, implicit-nullable params).

### Routes

| Route | Purpose |
|-------|---------|
| `/` | Headless Magezon homepage (hero, ticker, triptych, live product grids, CTA) |
| `/category/[slug]` | Category / PLP with faceted filtering + sort (layered nav) |
| `/product/[slug]` | PDP — gallery, price, types, add to cart, reviews, wishlist |
| `/cart` | Cart line items, qty/remove, coupons, live totals |
| `/search?q=` | Full-text search with facets + sort + autosuggest |
| `/wishlist`, `/compare` | Customer wishlist & product compare |
| `/login`, `/register`, `/forgot-password`, `/reset-password` | Customer auth |
| `/checkout`, `/checkout/success` | Multi-step checkout + order confirmation |
| `/account` (+ `/orders`, `/addresses`, `/profile`) | Account hub |
| `/[...slug]` | Universal Magento `route()`/UrlRewrite resolver (legacy URLs → 301) |
| `/sitemap.xml`, `/robots.txt` | SEO |

### Project structure

```
.
├── bin/  compose.*.yaml  env/  Makefile     # docker-magento environment
├── src/                                       # Magento install (not committed)
├── magezon-headless-nextjs/                   # the headless-Magezon package + docs
│   ├── magento-module/  …/QasrAlawani/MagezonHeadless   # GraphQL bridge
│   └── nextjs/lib/magezon/                     # the renderer
└── storefront/                                 # Next.js 16 storefront
    └── src/
        ├── lib/        magento.ts queries.ts actions.ts auth.ts cart-*.ts
        ├── lib/magezon/   # 48-element JSON-to-React renderer
        ├── components/    # Header, Footer, ProductCard, Gallery, AddToCart …
        └── app/           # routes (home, category, product, cart, checkout, account …)
```

---

## Feature status

Measured against the 204-feature blueprint in [`BLUEPRINT.md`](BLUEPRINT.md):

- ✅ **Phase 1 — Transactable store.** Full multi-step checkout
  (email → address → shipping → offline payment) → `placeOrder` → confirmation,
  countries/regions, live totals, error boundaries. _Verified with real orders._
- ✅ **Phase 2 — Account & conversion.** Account hub (dashboard, order history +
  detail + reorder, address book CRUD, profile, change password), password reset,
  cart coupons, grouped products, SEO (metadata, canonical, OpenGraph, Product
  JSON-LD, sitemap, robots).
- ✅ **Phase 3 — Engagement.** Wishlist, layered-nav PLP + search with active
  filter chips, reviews & ratings (display + write), CMS pages + PageBuilder
  rendering, product compare, newsletter/contact/email-a-friend, bundle products,
  search autosuggest, guest order lookup.
- 🟡 **Phase 4 — Config-gated.** Locale-driven `<html lang>`, security headers,
  PWA manifest are ✅. Online card gateways (Braintree/PayPal), the reCAPTCHA
  widget, multi-store/currency switching, in-store pickup, and order cancellation
  are **wired config-aware** — inert on this single-store / USD / no-credentials
  demo, and activate when the matching Magento admin settings are enabled.

---

## Gotchas handled

1. **Sample data didn't import** — `sampledata:deploy` left the `*SampleData`
   modules disabled. Fix: `module:enable` them all + `sampledata:reset` +
   `setup:upgrade`.
2. **Self-signed cert** — the container generated its own mkcert CA the host
   didn't trust. Re-signed with the host mkcert CA (see below).
3. **Tailwind v4 produced no utilities** — auto source-detection respects
   `.gitignore`, and the root `src/` ignore also matched `storefront/src/`. Fix:
   explicit `@source "../**/*.{ts,tsx}"` in `globals.css`.
4. **Broken product images** — Next 16's image optimizer blocks hosts resolving
   to a private IP (`magento.test → 127.0.0.1`). Fix: `images.unoptimized = true`
   for local dev.
5. **Admin Save / preview 500s** — nginx workers run as `app` but
   `/var/cache/nginx/client_temp` was owned by `nginx` mode 0700, so large POST
   bodies couldn't buffer. Fix:
   `docker compose exec -u root app chown -R app:app /var/cache/nginx` (re-run
   after a full container recreate).

### TLS / certificate note

The site cert is signed with the **host's mkcert CA** (trusted in the macOS
System keychain), so browser and Node both trust `magento.test`. The CA is at
`certs/magento-rootCA.pem`, copied to `storefront/certs/` for Node
(`NODE_EXTRA_CA_CERTS`). If a container recreate reverts the cert to a
container-generated CA, re-sign it:

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

## Further reading

- [`BLUEPRINT.md`](BLUEPRINT.md) — full 204-feature analysis (34 queries /
  69 mutations across 14 domains) mapped to the build, with the phased plan.
- [`magezon-headless-nextjs/README.md`](magezon-headless-nextjs/README.md) — the
  headless-Magezon approach (JSON-to-React) in depth.
- [`storefront/README.md`](storefront/README.md) — storefront-specific notes.
