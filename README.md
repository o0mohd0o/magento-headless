# Magento Headless Storefront

A **headless commerce** storefront built on **Magento Open Source 2.4.9** and
**Next.js 16** — a fast, modern React frontend over Magento's GraphQL API, with
**Magezon Page Builder** content rendered headlessly as React components.

```
Browser ──► Next.js (App Router) ──► Magento GraphQL ──► MariaDB / OpenSearch / Redis
            • Server-side reads (RSC) — no CORS
            • Server Actions for cart & checkout
```

---

## ✨ Features

**Storefront**
- ⚡ **Headless & fast** — Next.js 16 App Router reads Magento over GraphQL in
  React Server Components (no CORS, ISR caching).
- 🛒 **Full commerce flow** — browse → product → cart → multi-step checkout →
  order, with guest and logged-in customer carts (guest cart merges on login).
- 🔎 **Catalog** — category & search pages with **faceted filtering, sorting, and
  autosuggest**; configurable, grouped, and bundle product types.
- 📦 **Product pages** — image gallery, live pricing, **reviews & ratings**,
  **wishlist**, and **product compare**.
- 💳 **Cart & checkout** — coupons, live totals, multi-step checkout, order
  confirmation.
- 👤 **Customer accounts** — sign-in/registration, **order history + reorder**,
  **address book**, profile editing, password reset.
- 🔍 **SEO** — per-page metadata, canonical/OpenGraph, JSON-LD (Product,
  Breadcrumb, Organization), `sitemap.xml`, `robots.txt`, and a universal
  URL-rewrite resolver with 301s.

**Headless Page Builder**
- 🎨 **Magezon Page Builder, headless** — a custom GraphQL bridge exposes the
  builder's element tree, rendered by a **48-component JSON-to-React renderer**
  (responsive 12-column grid, per-element scoped CSS).
- 🛍️ **Live content** — product grids inside page-builder sections fetch real
  catalog data.

**Engineering**
- 🧩 Plain `fetch` + **Server Actions** (no Apollo), **strict TypeScript**,
  **Tailwind CSS v4**.
- ✅ **Unit + e2e tests**, **GraphQL codegen**, security headers, PWA manifest.
- 🐳 **Dockerized** Magento 2.4.9 backend (PHP 8.5).

---

## 🧱 Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4 |
| API | Magento GraphQL |
| Backend | Magento Open Source CE 2.4.9, PHP 8.5 |
| Data / infra | MariaDB, OpenSearch, Redis, RabbitMQ, Docker |
| Page Builder | Magezon Page Builder + custom headless GraphQL bridge |

---

## 🚀 Getting started

### Prerequisites
- Docker Desktop (≥ 6 GB RAM), Node.js 20+, and `mkcert`
- `magento.test` → `127.0.0.1` in `/etc/hosts`

### 1 — Backend (Magento)

```bash
bin/download community 2.4.9      # fetch Magento 2.4.9
bin/setup magento.test            # DB, OpenSearch, Redis, RabbitMQ, SSL, dev mode
bin/magento sampledata:deploy && bin/magento setup:upgrade   # Luma sample data
```

### 2 — Storefront (Next.js)

```bash
cd storefront
cp .env.example .env.local        # point at your Magento GraphQL endpoint
npm install
npm run dev                       # → http://localhost:3000
```

### 3 — Page Builder homepage (optional)

```bash
cd storefront
node scripts/build-homepage.mjs                                   # generate the profile
bin/clinotty mysql -h db -u magento -pmagento magento < ../_homepage.sql
bin/magento cache:flush
```

---

## 🛠️ Usage

```bash
bin/start            # start the Magento backend
bin/stop             # stop it
bin/magento <cmd>    # run a Magento CLI command
cd storefront

npm run dev          # storefront dev server (http://localhost:3000)
npm run build        # production build
npm test             # unit tests
npm run test:e2e     # integration tests
npm run codegen      # regenerate typed GraphQL schema
```

| Service | URL |
|---------|-----|
| Headless storefront (Next.js) | http://localhost:3000 |
| Magento admin | https://magento.test/admin/ |
| GraphQL endpoint | https://magento.test/graphql |

---

## 📁 Project structure

```
magezon-headless-nextjs/   # the headless-Magezon package (GraphQL bridge + renderer)
storefront/                # Next.js 16 storefront
  src/lib/                 #   GraphQL transport, queries, cart/auth server actions
  src/lib/magezon/         #   48-element JSON-to-React page-builder renderer
  src/components/          #   Header, ProductCard, Gallery, AddToCart …
  src/app/                 #   routes (home, category, product, cart, checkout, account …)
bin/  compose.*.yaml  env/ # Dockerized Magento 2.4.9 backend (docker-magento)
```

> **Note:** the Magento install (`src/`) and the commercial Magezon source are
> not committed — recreate them with the steps above and your own Magezon
> license. The standard docker-magento dev env files are included.

---

Built with Magento Open Source, Next.js, and Magezon Page Builder.
