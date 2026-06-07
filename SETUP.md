# Setup Guide

This guide installs and verifies the Dockerized headless Magento 2.4.9 +
Next.js 16 storefront.

The important rule: the public domain serves the storefront, not Magento APIs.
After the headless stack is running, public `/graphql`, `/rest`, and `/soap`
must return `404`. The storefront talks to Magento privately at
`http://app:8181/graphql`.

---

## Prerequisites

- macOS with Docker Desktop.
- Docker Desktop memory set to at least 6 GB.
- Node.js 20+ and npm.
- `mkcert` installed and trusted:

```bash
brew install mkcert nss
mkcert -install
```

- `/etc/hosts` contains:

```text
127.0.0.1 ::1 magento.test
```

Check it with:

```bash
grep -n "magento.test" /etc/hosts
```

---

## Existing Checkout

If this checkout already has Magento installed, you should see:

```bash
test -f src/app/etc/env.php && echo "Magento is installed"
```

In that case, skip the fresh install and go to [Run the headless stack](#run-the-headless-stack).

---

## Fresh Install

These commands are long-running. Run them in order from the repository root.

```bash
bin/download community 2.4.9
bin/setup magento.test
bin/magento sampledata:deploy
bin/magento module:enable --all
bin/magento setup:upgrade
bin/magento indexer:reindex
bin/magento cache:flush
```

At this point Magento should be installed, but on this branch you should not use
the public domain as a Magento API endpoint. Public API isolation is verified
later, after the storefront service is running.

---

## Install Magezon + Headless Bridge

Two module sets must be present under `src/app/code`:

- `Magezon/*` -> `src/app/code/Magezon`
- `QasrAlawani/MagezonHeadless` -> `src/app/code/QasrAlawani/MagezonHeadless`

```bash
mkdir -p src/app/code/Magezon
cp -R Magezon/* src/app/code/Magezon/

mkdir -p src/app/code/QasrAlawani
cp -R magezon-headless-nextjs/magento-module/app/code/QasrAlawani/MagezonHeadless \
  src/app/code/QasrAlawani/

bin/copytocontainer --all

bin/magento module:enable \
  Magezon_Core Magezon_Builder Magezon_PageBuilder Magezon_PageBuilderIconBox \
  Magezon_PageBuilderPageableContainer Magezon_PageBuilderPreview Magezon_Newsletter \
  QasrAlawani_MagezonHeadless

bin/magento setup:upgrade
bin/magento cache:flush
```

---

## Import the Page Builder Homepage

The storefront homepage reads a Magento CMS page named `headless-home` through
the custom `magezonContent` GraphQL query.

```bash
cd storefront
node scripts/build-homepage.mjs
cd ..

bin/clinotty mysql -h db -u magento -pmagento magento < _homepage.sql
bin/magento cache:flush
```

---

## Run the Headless Stack

Start the full stack:

```bash
bin/start
```

The dev compose file builds and runs the `storefront` service. It is intentionally
not exposed on a host port; nginx in the `app` container proxies the public
domain to it.

Useful status checks:

```bash
bin/docker-compose ps --all
bin/docker-compose logs --tail=120 app
bin/docker-compose logs --tail=120 storefront
bin/docker-compose exec app nginx -t
```

Expected nginx result:

```text
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

Warnings about the deprecated `listen ... http2` directive come from the base
nginx image and do not block startup.

---

## Verify Isolation

Run these from the host:

```bash
curl -sk -o /dev/null -w '%{http_code}\n' https://magento.test/graphql
curl -sk -o /dev/null -w '%{http_code}\n' https://magento.test/rest/V1/
curl -sk -o /dev/null -w '%{http_code}\n' https://magento.test/soap
curl -sk -o /dev/null -w '%{http_code}\n' https://magento.test/
curl -sk -o /dev/null -w '%{http_code}\n' https://magento.test/media/
```

Expected:

```text
404
404
404
200
200
```

Confirm GraphQL still works privately:

```bash
bin/docker-compose exec storefront wget -qO- \
  --post-data '{"query":"{storeConfig{store_code}}"}' \
  --header 'Content-Type: application/json' \
  http://app:8181/graphql
```

Expected:

```json
{"data":{"storeConfig":{"store_code":"default"}}}
```

Confirm the ports are not accidentally exposed:

```bash
docker inspect --format '{{json .NetworkSettings.Ports}}' magento-headless-storefront-1
docker inspect --format '{{json .NetworkSettings.Ports}}' magento-headless-app-1
```

Expected:

- `storefront` shows `{"3000/tcp":null}`.
- `app` publishes only host `80` and `443`; no `8181` host binding.

---

## Verify the Storefront

Open:

```text
https://magento.test/
```

The homepage should show the Magezon Page Builder design and live product
sections. A category page should render products, for example:

```text
https://magento.test/category/women?color=49&sort=price_ASC
```

Fast host-side checks:

```bash
curl -sk -o /dev/null -w '%{http_code}\n' https://magento.test/
curl -sk -o /dev/null -w '%{http_code}\n' \
  'https://magento.test/category/women?color=49&sort=price_ASC'
curl -sk 'https://magento.test/api/suggest?q=bag'
```

Expected:

- homepage -> `200`
- category page -> `200`
- suggest API returns product JSON

---

## Standalone Storefront Mode

The Docker stack is the recommended mode for the isolated topology. Standalone
host mode is useful only when you intentionally want to run Next.js outside
Docker at `http://localhost:3000`.

In standalone mode, Node must trust the mkcert CA because it talks to Magento
over HTTPS:

```bash
cd storefront
cp .env.example .env.local
mkdir -p certs
cp "$(mkcert -CAROOT)/rootCA.pem" certs/magento-rootCA.pem
npm install
npm run dev
```

Open:

```text
http://localhost:3000/
```

Remember: standalone mode is not the public isolation topology. The full Docker
stack serves the storefront at `https://magento.test/` and keeps Magento GraphQL
private.

---

## Payments

Online payment-gateway verification is not part of the next setup step. Real
gateway testing requires credentials, secrets, webhook endpoints, and provider
account configuration.

For local checkout smoke tests, use Magento offline/test payment methods. Add
live payment-provider setup only when safe test credentials are available.

---

## Troubleshooting

### App container exits with `fastcgi_backend`

If nginx reports an error similar to:

```text
no port in upstream "fastcgi_backend"
```

the headless nginx fragments must use the markshust variable:

```nginx
fastcgi_pass $fastcgi_backend;
```

Check:

```bash
bin/docker-compose exec app nginx -t
```

### Public `/graphql` returns 200

That means the public Magento API is exposed. Do not fix this by pointing the
storefront at public `/graphql`.

Check that `compose.dev.yaml` mounts:

```text
./docker/app/nginx-headless.conf:/var/www/html/nginx.conf
./docker/app/conf.d-headless.conf:/etc/nginx/conf.d/zz-headless.conf
```

Then recreate/restart the app container:

```bash
bin/docker-compose up -d --force-recreate app
```

### Storefront private GraphQL gets redirects or empty data

The internal `:8181` listener must force Magento's secure host values:

```nginx
fastcgi_param HTTPS on;
fastcgi_param HTTP_HOST magento.test;
fastcgi_param SERVER_NAME magento.test;
fastcgi_param SERVER_PORT 443;
```

Then retest:

```bash
bin/docker-compose exec storefront wget -qO- \
  --post-data '{"query":"{storeConfig{store_code}}"}' \
  --header 'Content-Type: application/json' \
  http://app:8181/graphql
```

### Category pages return 500 after recreating the storefront

A stale host `.next` cache can corrupt Turbopack inside the Linux container. The
storefront service should mount `/app/.next` as an anonymous container volume,
similar to `/app/node_modules`.

Check `compose.dev.yaml`:

```yaml
volumes:
  - ./storefront:/app
  - /app/node_modules
  - /app/.next
```

Then recreate the storefront:

```bash
bin/docker-compose up -d --force-recreate storefront
```

### Next.js blocks dev resources for `magento.test`

Next.js dev mode may log:

```text
Blocked cross-origin request to Next.js dev resource
```

Allow the proxied dev origin in `storefront/next.config.ts`:

```ts
const nextConfig = {
  allowedDevOrigins: ["magento.test"],
};
```

Restart the storefront container after changing this.

### Homepage says the Page Builder page has not been published

Work through these checks:

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `Cannot query field "magezonContent"` | Bridge module is missing or disabled | Reinstall `QasrAlawani_MagezonHeadless`, run `setup:upgrade`, flush cache |
| `has_pagebuilder:false` or `null` | `headless-home` CMS page is missing | Re-run `node scripts/build-homepage.mjs` and import `_homepage.sql` |
| Product grids stay empty | Storefront cannot call BFF route | Ensure `NEXT_PUBLIC_MAGENTO_GRAPHQL_URL=/api/graphql` |
| Standalone host mode has TLS errors | Node does not trust mkcert | Copy `rootCA.pem` to `storefront/certs/magento-rootCA.pem` |

Bridge/page verification from inside Docker:

```bash
bin/docker-compose exec storefront wget -qO- \
  --post-data '{"query":"{magezonContent(identifier:\"headless-home\",type:CMS_PAGE){has_pagebuilder}}"}' \
  --header 'Content-Type: application/json' \
  http://app:8181/graphql
```

Expected:

```json
{"data":{"magezonContent":{"has_pagebuilder":true}}}
```
