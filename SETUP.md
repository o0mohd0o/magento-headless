# Complete setup guide

Full, step-by-step setup for the headless Magento 2.4.9 + Next.js storefront,
including the Magezon Page Builder homepage. If your homepage at
`http://localhost:3000/` is **blank** or shows *"the page-builder homepage hasn't
been published yet"*, jump to [Troubleshooting](#troubleshooting-blank-homepage).

> The storefront renders the homepage from a Magento CMS page (`headless-home`)
> served over a custom GraphQL query (`magezonContent`). For that to work you need
> **three** things in place: (1) the Magezon modules **and** the headless bridge
> module installed in Magento, (2) the `headless-home` page imported, and (3) the
> storefront able to reach Magento over HTTPS (it needs the TLS cert).

---

## Prerequisites

- **Docker Desktop**, ≥ 6 GB RAM
- **Node.js 20+** and npm
- **[mkcert](https://github.com/FiloSottile/mkcert)** (`brew install mkcert nss`)
- `magento.test` → `127.0.0.1` in `/etc/hosts`

---

## 1. Install Magento

```bash
bin/download community 2.4.9
bin/setup magento.test
bin/magento sampledata:deploy
bin/magento module:enable --all
bin/magento setup:upgrade
bin/magento indexer:reindex && bin/magento cache:flush
```

Confirm the site loads at `https://magento.test/` and the GraphQL endpoint at
`https://magento.test/graphql`.

## 2. Install the Page Builder modules

Two module sets must end up in `src/app/code` — the Magezon suite **and** the
headless GraphQL bridge.

```bash
# (a) Magezon Page Builder suite  ->  src/app/code/Magezon
mkdir -p src/app/code/Magezon
cp -R Magezon/* src/app/code/Magezon/

# (b) The headless bridge module  ->  src/app/code/QasrAlawani/MagezonHeadless
mkdir -p src/app/code/QasrAlawani
cp -R magezon-headless-nextjs/magento-module/app/code/QasrAlawani/MagezonHeadless \
      src/app/code/QasrAlawani/

# Sync into the container and register everything
bin/copytocontainer --all
bin/magento module:enable \
  Magezon_Core Magezon_Builder Magezon_PageBuilder Magezon_PageBuilderIconBox \
  Magezon_PageBuilderPageableContainer Magezon_PageBuilderPreview Magezon_Newsletter \
  QasrAlawani_MagezonHeadless
bin/magento setup:upgrade
bin/magento cache:flush
```

**Verify the bridge query exists** (this is the single most important check):

```bash
curl -s --cacert "$(mkcert -CAROOT)/rootCA.pem" \
  -H 'Content-Type: application/json' -X POST https://magento.test/graphql \
  -d '{"query":"{ magezonContent(identifier:\"headless-home\", type: CMS_PAGE){ has_pagebuilder } }"}'
```

- `{"data":{"magezonContent":{"has_pagebuilder":true}}}` → bridge + page are good.
- `"Cannot query field \"magezonContent\""` → the **bridge module isn't
  installed/enabled** (redo step 2b).
- `has_pagebuilder:false` or `null` → the **page isn't imported** (do step 3).

## 3. Import the Page Builder homepage

```bash
cd storefront && node scripts/build-homepage.mjs && cd ..   # writes _homepage.sql at repo root
bin/clinotty mysql -h db -u magento -pmagento magento < _homepage.sql
bin/magento cache:flush
```

This upserts the `headless-home` CMS page. Re-run the `curl` check above — it
should now return `has_pagebuilder:true`.

## 4. Configure & run the storefront

The storefront talks to Magento over **HTTPS**, so Node must trust the mkcert CA.
This cert is **not** in the repo — you must provide your own:

```bash
cd storefront
cp .env.example .env.local

# Give Node the CA that signed magento.test (REQUIRED — without it the homepage is blank)
mkdir -p certs
cp "$(mkcert -CAROOT)/rootCA.pem" certs/magento-rootCA.pem

npm install
npm run dev        # → http://localhost:3000
```

Open `http://localhost:3000/` — the Magezon homepage should now render. After the
first load, content is cached for 5 minutes (`revalidate = 300`); to force a
refresh during setup, restart `npm run dev` or `rm -rf .next/cache/fetch-cache`.

---

## Troubleshooting: blank homepage

`src/app/page.tsx` fetches `magezonContent("headless-home")` and, if anything
fails, silently renders a fallback ("…hasn't been published yet"). So a blank or
fallback homepage always means the fetch failed or returned empty. Work through
these in order:

| Symptom / check | Cause | Fix |
|---|---|---|
| `npm run dev` logs show a TLS / `self-signed certificate` / `unable to verify` error | **Node can't trust magento.test** — the cert at `storefront/certs/magento-rootCA.pem` is missing | `cp "$(mkcert -CAROOT)/rootCA.pem" storefront/certs/magento-rootCA.pem`, restart dev (this is the #1 cause) |
| `curl` returns `Cannot query field "magezonContent"` | **Bridge module not installed/enabled** | Redo [step 2b](#2-install-the-page-builder-modules), `setup:upgrade`, `cache:flush` |
| `curl` returns `has_pagebuilder:false`/`null` | **`headless-home` page not imported** | Redo [step 3](#3-import-the-page-builder-homepage) |
| Homepage shell renders but product grids are empty | **Missing client env var** | Ensure `.env.local` has `NEXT_PUBLIC_MAGENTO_GRAPHQL_URL=/api/graphql`, restart dev |
| Homepage was blank, now stuck even after a fix | **Next.js data cache** | `rm -rf storefront/.next/cache/fetch-cache` and restart |
| `curl` itself fails to connect | **Magento/SSL not up** | Check `bin/status`; re-run `bin/setup-ssl magento.test` |

Quick one-liner to see what the storefront sees (run from `storefront/`):

```bash
NODE_EXTRA_CA_CERTS=./certs/magento-rootCA.pem node -e \
'fetch("https://magento.test/graphql",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({query:"{magezonContent(identifier:\"headless-home\",type:CMS_PAGE){has_pagebuilder}}"})}).then(r=>r.json()).then(j=>console.log(JSON.stringify(j))).catch(e=>console.error("FETCH FAILED:",e.message))'
```

- `{"data":{"magezonContent":{"has_pagebuilder":true}}}` → everything is wired;
  the homepage will render.
- `FETCH FAILED: ... certificate ...` → it's the cert (fix above).
