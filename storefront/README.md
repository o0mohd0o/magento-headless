# storefront

Next.js 16 (App Router, React 19, TypeScript, Tailwind v4) storefront for the
headless Magento 2.4.9 backend in the parent repository.

Start here:

- [../README.md](../README.md) — what the project is and the public/private split.
- [../SETUP.md](../SETUP.md) — full install path (Docker, mkcert, Magento, storefront).
- [../HEADLESS.md](../HEADLESS.md) — network isolation design.
- [../STATUS.md](../STATUS.md) — feature status and open work.
- [AGENTS.md](AGENTS.md) — this Next.js build differs from stock; read
  `node_modules/next/dist/docs/` before touching metadata, caching or image APIs.

## Scripts

```bash
npm run dev        # next dev on :3000 (inside Docker it is reached via the app front-door)
npm run build      # production build
npm run start      # serve the production build
npm run lint       # eslint
npm run test       # node --test over src/lib/*.test.ts (pure modules, no network)
npm run test:e2e   # HTTP smoke checks against a running stack (e2e.test.ts)
npm run codegen    # regenerate src/lib/gql-schema.generated.ts from the live schema
```

## Layout

| Path | Purpose |
| --- | --- |
| `src/app` | Routes. `[...slug]` is the Magento URL-rewrite catch-all. |
| `src/lib/magento.ts` | Server-only GraphQL transport: Store / Content-Currency / X-ReCaptcha headers, fetch-cache tags. |
| `src/lib/queries.ts` | Hand-written GraphQL documents. |
| `src/lib/*-actions.ts` | Server Actions. All return `ActionResult` or `FormState` from `src/lib/errors.ts`. |
| `src/lib/revalidate.ts` | Cache tag taxonomy and the single place that purges cart/session views. |
| `src/app/api/revalidate` | Bearer-authenticated webhook for on-demand tag revalidation. |
| `src/components/recaptcha` | reCAPTCHA v3 token minting; a no-op while Magento has it disabled. |
| `src/lib/magezon` | Magezon Page Builder renderer. |

## Environment

See `../env/storefront.env`. `MAGENTO_GRAPHQL_URL` is the private GraphQL
listener; `NEXT_PUBLIC_SITE_URL` is the public origin used for canonical
URLs; `REVALIDATE_SECRET` enables `/api/revalidate`.
