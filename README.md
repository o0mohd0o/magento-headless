# Magento Headless Storefront

Headless Magento Open Source 2.4.9 with a Next.js 16 storefront.

This project is based on `markshust/docker-magento`, but the public web surface
is intentionally changed: `https://magento.test/` serves the Next.js storefront,
while Magento GraphQL/REST/SOAP stay off the public domain.

```text
Browser
  -> https://magento.test/
  -> app nginx :8443
  -> storefront:3000

storefront container
  -> http://app:8181/graphql
  -> Magento PHP-FPM
  -> MariaDB / OpenSearch / Redis / RabbitMQ
```

Public Magento API paths are not exposed:

```bash
curl -sk -o /dev/null -w '%{http_code}\n' https://magento.test/graphql   # 404
curl -sk -o /dev/null -w '%{http_code}\n' https://magento.test/rest/V1/  # 404
curl -sk -o /dev/null -w '%{http_code}\n' https://magento.test/soap      # 404
```

See [HEADLESS.md](HEADLESS.md) for the full isolation design.

---

## What Is Included

### Storefront

- Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4.
- Server-side Magento GraphQL reads from React Server Components.
- Same-origin BFF route for browser GraphQL calls: `/api/graphql`.
- Catalog browsing, category pages, search, autosuggest, facets, sorting.
- Product detail pages, image gallery, reviews, wishlist, compare.
- Guest and customer carts, coupons, checkout flow, account area.
- SEO metadata, JSON-LD, sitemap, robots, and URL rewrite routing.

### Headless Page Builder

- Magezon Page Builder content rendered in Next.js.
- Custom Magento GraphQL bridge exposing `magezonContent`.
- Page Builder homepage imported as `headless-home`.
- Magezon product sections fetch live Magento catalog data.

### Docker Topology

- Magento runs inside the markshust Docker stack.
- Storefront runs as a Docker service in `compose.dev.yaml`.
- Storefront port `3000` is internal only; it is not published to the host.
- Public domain keeps only storefront, media/static assets, and admin.
- Private GraphQL listener runs at `app:8181` and is not host-published.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Storefront | Next.js 16, React 19, TypeScript, Tailwind CSS v4 |
| Commerce API | Magento GraphQL, private Docker network |
| Backend | Magento Open Source 2.4.9, PHP 8.5 |
| Data | MariaDB, OpenSearch, Redis/Valkey, RabbitMQ |
| Content | Magezon Page Builder + custom headless bridge |
| Dev stack | Docker Desktop, mkcert, markshust/docker-magento |

---

## Quick Start

Read [SETUP.md](SETUP.md) for the full install path. If Magento is already
installed in this checkout, the usual development flow is:

```bash
git checkout headless-isolation
bin/start
```

Then verify the public/private split:

```bash
# Public storefront and browser assets
curl -sk -o /dev/null -w '%{http_code}\n' https://magento.test/
curl -sk -o /dev/null -w '%{http_code}\n' https://magento.test/media/

# Public backend APIs must stay hidden
curl -sk -o /dev/null -w '%{http_code}\n' https://magento.test/graphql
curl -sk -o /dev/null -w '%{http_code}\n' https://magento.test/rest/V1/
curl -sk -o /dev/null -w '%{http_code}\n' https://magento.test/soap

# Private GraphQL from inside the Docker network
bin/docker-compose exec storefront wget -qO- \
  --post-data '{"query":"{storeConfig{store_code}}"}' \
  --header 'Content-Type: application/json' \
  http://app:8181/graphql
```

Expected result:

- `/` -> `200`
- `/media/` -> `200`
- `/graphql`, `/rest/V1/`, `/soap` -> `404`
- private GraphQL returns `{"data":{"storeConfig":{"store_code":"default"}}}`

---

## Service URLs

| Service | URL / access |
| --- | --- |
| Public storefront | `https://magento.test/` |
| Magento admin | `https://magento.test/admin/` |
| Public GraphQL | intentionally `404` |
| Private GraphQL | `http://app:8181/graphql` from containers only |
| Storefront dev server | `storefront:3000` inside Docker only |
| Mailcatcher | `http://localhost:1080` |
| phpMyAdmin | `http://localhost:8080` |

Use `bin/docker-compose` for dev-stack commands. Bare `docker compose` only sees
the base compose files unless you manually pass the same `-f` arguments.

---

## Common Commands

```bash
bin/start                         # start the full dev stack
bin/stop                          # stop the stack
bin/status                        # show container status
bin/magento <cmd>                 # run Magento CLI
bin/docker-compose logs storefront
bin/docker-compose exec storefront sh

cd storefront
npm test
npm run lint
npm run build
npm run codegen
```

---

## Payments

Online payment-gateway verification is intentionally not a next step in this
repo. Real gateway tests require provider credentials, secrets, webhooks, and
account configuration that should not be committed or shared.

Use Magento offline/test payment methods for checkout smoke testing. Add live
payment-provider setup only when credentials and a safe test account are
available.

---

## Project Structure

```text
Magezon/                   Magezon Page Builder modules
magezon-headless-nextjs/   Magento bridge module + renderer source
storefront/                Next.js storefront
  src/app/                 App Router routes
  src/components/          Product, cart, account, checkout UI
  src/lib/                 GraphQL transport, queries, actions
  src/lib/magezon/         Page Builder JSON-to-React renderer
docker/app/                Headless nginx fragments
env/                       Container environment files
bin/                       markshust/docker-magento helper scripts
compose*.yaml              Docker Compose stack
HEADLESS.md                Public/private topology notes
SETUP.md                   Full install and troubleshooting guide
```

The Magento application under `src/` is large and normally recreated with
`bin/download` and Composer. The Page Builder modules in `Magezon/` are included
for local setup.

---

## Documentation

- [SETUP.md](SETUP.md): installation, homepage import, verification, debugging.
- [HEADLESS.md](HEADLESS.md): isolation topology and rationale.
- [BLUEPRINT.md](BLUEPRINT.md): project planning notes and larger feature map.
