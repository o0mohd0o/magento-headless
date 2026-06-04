/**
 * Same-origin GraphQL proxy.
 *
 * The storefront keeps `MAGENTO_GRAPHQL_URL` server-only (the browser never sees
 * the Magento endpoint or its self-signed cert). But the Magezon page-builder's
 * commerce elements (product_grid / product_slider / categories) are Client
 * Components that fetch products from the browser. This thin proxy lets them hit
 * a same-origin path (`/api/graphql`) which forwards, server-side, to Magento —
 * Node already trusts the mkcert CA via NODE_EXTRA_CA_CERTS, so there are no
 * CORS or certificate problems in the browser.
 *
 * Read-only by contract: only POST GraphQL queries are forwarded. This is the
 * same public storefront GraphQL the Luma theme uses, so it is safe to expose.
 */
import { NextResponse } from "next/server";

const ENDPOINT = process.env.MAGENTO_GRAPHQL_URL || "";
const DEFAULT_STORE = process.env.MAGENTO_STORE_CODE || "";

export async function POST(request: Request) {
  if (!ENDPOINT) {
    return NextResponse.json(
      { errors: [{ message: "MAGENTO_GRAPHQL_URL is not configured." }] },
      { status: 500 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { errors: [{ message: "Invalid JSON body." }] },
      { status: 400 },
    );
  }

  // Honor a Store header from the client, falling back to the configured store.
  const store = request.headers.get("store") || DEFAULT_STORE;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (store) headers.Store = store;

  try {
    const upstream = await fetch(ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      // Let Next cache identical product queries briefly; mutations aren't sent here.
      next: { revalidate: 120 },
    });
    const json = await upstream.json();
    return NextResponse.json(json, { status: upstream.status });
  } catch (err) {
    return NextResponse.json(
      { errors: [{ message: `Upstream GraphQL fetch failed: ${(err as Error).message}` }] },
      { status: 502 },
    );
  }
}
