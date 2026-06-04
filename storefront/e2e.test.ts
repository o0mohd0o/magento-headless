import { test } from "node:test";
import assert from "node:assert/strict";

// Integration/e2e smoke tests against a running dev/prod server.
// Run with: npm run test:e2e  (requires `npm run dev` up on :3000)
const BASE = process.env.E2E_BASE ?? "http://localhost:3000";

test("home renders the page-builder homepage", async () => {
  const r = await fetch(`${BASE}/`);
  assert.equal(r.status, 200);
  // Homepage is authored in the Magezon Page Builder (headless-home CMS page)
  // and server-rendered by <MagezonRenderer>. Assert SSR'd section copy.
  const html = await r.text();
  assert.match(html, /Made to/); // hero heading
  assert.match(html, /magezon-builder/); // renderer wrapper
});

test("category PLP accepts a facet filter", async () => {
  const r = await fetch(`${BASE}/category/women?color=49&sort=price_ASC`);
  assert.equal(r.status, 200);
});

test("search autosuggest API returns items", async () => {
  const r = await fetch(`${BASE}/api/suggest?q=bag`);
  assert.equal(r.status, 200);
  const d = await r.json();
  assert.ok(Array.isArray(d.items));
});

test("PDP renders a product", async () => {
  const r = await fetch(`${BASE}/product/hero-hoodie`);
  assert.equal(r.status, 200);
  assert.match(await r.text(), /Hero Hoodie/);
});

test("CMS page renders", async () => {
  const r = await fetch(`${BASE}/page/customer-service`);
  assert.equal(r.status, 200);
});

test("contact and order-lookup pages exist", async () => {
  assert.equal((await fetch(`${BASE}/contact`)).status, 200);
  assert.equal((await fetch(`${BASE}/order-lookup`)).status, 200);
});

test("sitemap and robots are served", async () => {
  assert.equal((await fetch(`${BASE}/sitemap.xml`)).status, 200);
  assert.equal((await fetch(`${BASE}/robots.txt`)).status, 200);
});
