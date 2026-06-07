# Headless topology & isolation

This project is headless at two levels: the **application** (a decoupled Next.js
storefront that reads Magento over GraphQL) and the **deployment** (Magento's API
surface is not reachable on the public domain). This document describes the
second part — the network isolation — because "headless" is often claimed at the
app layer while the backend is still wide open on the same hostname.

## The rule

> The public domain serves **only** the storefront (plus the media/static assets
> a browser must load). Magento's `/graphql`, `/rest`, and `/soap` are **not**
> exposed publicly. The storefront reaches Magento over a **private** path.

## Request flow

```
                      ┌─────────────────────────── public (TLS) ───────────────────────────┐
  Browser ──HTTPS──▶  app (nginx :8443)
                          │  location /            ──▶  storefront:3000      (Next.js)
                          │  /admin /media /static ──▶  Magento (php-fpm)     (kept public)
                          │  /graphql /rest /soap  ──▶  404                   (NOT exposed)
                      └──────────────────────────────────────────────────────────────────────┘

  storefront (Next.js, internal) ──http──▶ app (nginx :8181, internal-only) ──▶ Magento GraphQL
        ▲                                   (forces HTTP_HOST + HTTPS so Magento
        └── browser cart/client comps           matches its secure base URL)
            call same-origin /api/graphql
            which proxies server-side ────────────────────────────────────┘
```

Key points:

- **`/graphql` is 404 on the public domain.** `curl https://<host>/graphql` does
  not reach Magento. There is no introspectable GraphQL surface on the internet.
- **The storefront fetches GraphQL privately** at `http://app:8181/graphql` over
  the Docker network. Port `8181` is never published to the host.
- **The browser never talks to Magento for data.** Server Components fetch
  server-side; client components call the same-origin Next.js BFF route
  (`/api/graphql`), which proxies to the private endpoint. So even client-side
  reads do not expose Magento.
- **Media and `/admin` stay public** on purpose: browsers must load product
  images, and admin is a login-gated entry point. See "Hardening" below.

## Why the internal `:8181` listener exists

Magento has `web/url/redirect_to_base` enabled by default, so a request whose
`Host` doesn't match the configured base URL gets a `301` to the base URL. The
internal listener (`docker/app/conf.d-headless.conf`) forces
`HTTP_HOST=magento.test` and `HTTPS on` at the FastCGI layer, so Magento sees
the request as arriving on its real secure host and answers GraphQL directly
instead of redirecting the storefront back to the (now-404) public `/graphql`.

This mirrors the loopback listener used on the native (non-Docker) production
deploy of the same project.

## What this is — and isn't

- **Is:** origin/network isolation. The Magento API surface is off the public
  domain; the storefront is the only public face; the backend is reachable only
  over the private container network.
- **Isn't:** separate physical infrastructure. Storefront and backend still run
  on one host / one Docker network. "Isolation" here is at the network/origin
  level, not separate machines or VPCs.

## Hardening (next steps, not enabled by default)

- **Lock down `/admin`** — restrict by IP allowlist or move it behind a VPN /
  separate hostname. It is intentionally left public here.
- **Rate-limit / allowlist the BFF** (`/api/graphql`) — it is the one storefront
  endpoint that forwards GraphQL; add persisted-query allowlisting or rate limits
  before heavy traffic.
- **Don't publish infra ports** — the dev compose publishes `db`, `redis`,
  `opensearch`, `rabbitmq` to the host for convenience; drop those `ports:` in a
  production compose so only the front-door is exposed.

## Verifying

After `bin/start` (and a normal Magento + storefront bring-up):

```bash
# Backend APIs are NOT on the public domain:
curl -sk -o /dev/null -w '%{http_code}\n' https://magento.test/graphql   # -> 404
curl -sk -o /dev/null -w '%{http_code}\n' https://magento.test/rest/V1/  # -> 404
curl -sk -o /dev/null -w '%{http_code}\n' https://magento.test/soap      # -> 404

# Storefront + the assets a browser legitimately needs ARE public:
curl -sk -o /dev/null -w '%{http_code}\n' https://magento.test/          # -> 200 (storefront)
curl -sk -o /dev/null -w '%{http_code}\n' https://magento.test/media/    # -> 200

# GraphQL still works, but only from inside the network:
docker compose exec storefront wget -qO- --post-data '{"query":"{storeConfig{store_code}}"}' \
  --header 'Content-Type: application/json' http://app:8181/graphql
```
