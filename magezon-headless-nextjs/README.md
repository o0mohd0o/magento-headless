# Magezon Page Builder → Headless (Next.js) — Approach B (JSON-to-React)

Render **Magezon Page Builder** content on a **headless Magento (Adobe Commerce) + Next.js** storefront by exposing the decoded element tree over GraphQL and re-implementing each element as a React component.

This is **Approach B** from the feasibility analysis: instead of injecting Magezon's server-rendered HTML (Approach A), we transport the builder's **structured element tree** and render it as real React components — the same strategy PWA Studio uses for Adobe's *native* Page Builder, but built for Magezon (which ships no headless/GraphQL support of its own).

```
┌─────────────────────────┐        GraphQL          ┌──────────────────────────┐
│  Magento / Adobe Commerce│  magezonContent(...)    │       Next.js app        │
│                          │  ───────────────────▶   │                          │
│  QasrAlawani_MagezonHead-│   { profile_json,       │  <MagezonRenderer/>      │
│  less module:            │     media_base_url }    │   ├─ parseProfile()       │
│   • extracts [mgz_page-  │                         │   ├─ registry: type→Comp  │
│     builder] JSON        │                         │   ├─ ElementWrapper       │
│   • resolves {{mgzlink}} │                         │   │   (grid/spacing/bg/css)│
│   • returns element tree │                         │   └─ elements/*.tsx        │
└─────────────────────────┘                         └──────────────────────────┘
```

## Why this works (and what it costs)

Magezon stores a JSON element tree inside a `[mgz_pagebuilder]…[/mgz_pagebuilder]` shortcode in the CMS `content` column and renders it **server-side in PHP**. Magento's stock `cmsPage.content` GraphQL field returns that raw shortcode — useless to a headless client. So:

- **Backend** (`magento-module/`): a small Magento module adds a `magezonContent` GraphQL query that extracts the JSON, **reuses Magezon's own helper** to resolve `{{mgzlink}}` tokens into real category/product/page URLs, and returns the decoded tree as a JSON string.
- **Frontend** (`nextjs/`): a self-contained renderer parses that tree and maps each `element.type` to a React component, faithfully reproducing Magezon's wrapper structure, 12-column grid, visibility utilities, and per-element scoped CSS (spacing/border/background) — **without** depending on Magezon's storefront CSS/JS bundle.

The cost of Approach B is the component library: each Magezon element type needs a React equivalent, and you maintain it as Magezon adds element types. That library is what this scaffold gives you.

---

## Part 1 — Magento module (`QasrAlawani_MagezonHeadless`)

### Install
```bash
cp -r magento-module/app/code/QasrAlawani <MAGENTO_ROOT>/app/code/QasrAlawani
cd <MAGENTO_ROOT>
bin/magento module:enable QasrAlawani_MagezonHeadless
bin/magento setup:upgrade
bin/magento setup:di:compile      # production mode only
bin/magento cache:flush
```
Requires the Magezon modules (`Magezon_Core`, `Magezon_Builder`, `Magezon_PageBuilder`, and `Magezon_PageBuilderPreview` for the admin preview) — the resolver reuses `Magezon\Builder\Helper\Data::prepareProfileBlock()` for `{{mgzlink}}` resolution and the preview table for live content.

Then set the preview URL: **Stores → Configuration → General → Magezon Headless → Headless Preview → Next.js Storefront Base URL** = e.g. `https://shop.qasralawani.com`. (Leaving it empty hides the Headless Preview button.)

### Query it
```graphql
query Offers {
  magezonContent(identifier: "offers-page", type: CMS_PAGE) {
    has_pagebuilder
    profile_json      # JSON string: { "elements": [...] }
    media_base_url
    raw_html          # fallback when has_pagebuilder = false
  }
}
```
Pass a `Store: <store_code>` header for per-store-view content. CMS blocks: `type: CMS_BLOCK`.

There's also a convenience field on the native type: `cmsPage(identifier:"…"){ magezon_profile_json }`.

---

## Part 2 — Next.js renderer (`nextjs/lib/magezon`)

> The scaffold has no `node_modules`, so your editor will flag `Cannot find module 'react'` until you copy it into a real Next.js app (React 18/19). No other runtime dependency.

### Install
```bash
cp -r nextjs/lib/magezon <YOUR_NEXTJS>/lib/magezon
# set the endpoint
echo 'MAGENTO_GRAPHQL_URL=https://your-magento/graphql' >> <YOUR_NEXTJS>/.env.local
```

### Use (App Router, Server Component)
```tsx
// app/(cms)/[slug]/page.tsx
import { fetchMagezonContent, MagezonRenderer } from '@/lib/magezon';
import '@/lib/magezon/styles/magezon.css';

export default async function CmsPage({ params }: { params: { slug: string } }) {
  const content = await fetchMagezonContent(params.slug, 'CMS_PAGE');

  if (!content.has_pagebuilder) {
    return <div dangerouslySetInnerHTML={{ __html: content.raw_html ?? '' }} />;
  }
  return (
    <MagezonRenderer
      profileJson={content.profile_json}
      mediaBaseUrl={content.media_base_url}
    />
  );
}
```

### Commerce elements (product grids/sliders/categories)
These work **out of the box**: the default adapter fetches from your storefront's standard GraphQL (`products()` / `categoryList`) for SKU- and category-based selection and renders default cards in grid / list / slider layouts. Just ensure `NEXT_PUBLIC_MAGENTO_GRAPHQL_URL` is set.

To restyle, override a single type with your own card component:
```tsx
import { registerElement } from '@/lib/magezon';
registerElement('product_grid', MyProductGrid);
```
To replace data + rendering wholesale (e.g. to use your existing product fetcher, or to support Magento **rule-condition** selection / **reviews** which have no plain GraphQL source):
```tsx
'use client';
import { MagezonCommerceProvider } from '@/lib/magezon';
// criteria = { type, source, skus, categoryId, categoryIds, sort, limit, columns, ... }
<MagezonCommerceProvider renderer={(criteria, el) => <MyGrid {...criteria} />}>
  <MagezonRenderer … />
</MagezonCommerceProvider>
```

### Override or add an element
```tsx
import { registerElement } from '@/lib/magezon';
import { MyHeading } from '@/components/MyHeading';
registerElement('heading', MyHeading);   // override the bundled one
```
To add a brand-new type: create `lib/magezon/elements/MyType.tsx` (signature `({ element, ctx }: MagezonElementProps)`, render inner content only) and register it in `register-defaults.ts`.

---

## Part 3 — Live admin preview (parity with core Magezon)

Content editors get a **"Headless Preview"** button in the Magezon builder navbar, right next to Magezon's own preview. Clicking it opens the Next.js renderer showing the page **as customers will actually see it** — and it **live-updates on every edit**, exactly like Magezon's storefront live preview.

```
Magezon builder (admin)                 Magento                      Next.js
─────────────────────────               ───────                      ───────
[Headless Preview] click ──save live──▶ mgz_pagebuilder_preview_profile
   │  (every edit re-saves)                    ▲                         │
   └── window.open ─────────────────────────────┼──▶ /magezon-preview?builderId=…
                                                 │         │ polls every 2s
                                          magezonPreview ◀─┘ (GraphQL)
                                                 │
                                          resolve (mgzlink + directives + media)
                                                 └──▶ <MagezonRenderer/> (prod components)
```

**How it's wired (upgrade-safe — no Magezon core edits):**
- A navbar button is registered through Magezon's own extension point (`CompositeConfigProvider > directives` in `etc/di.xml`) — the same mechanism Magezon's preview button uses.
- The button reuses Magezon's existing live-save endpoint (`mgzpagebuilder/preview/save`), which stores the live builder JSON in `mgz_pagebuilder_preview_profile` keyed by `builderId` on every edit.
- The `/magezon-preview` page polls the `magezonPreview(builder_id)` GraphQL query, which reads that row, resolves it (mgzlink + directives + media), and renders it with the **production React components** — so the preview is pixel-identical to the live page.

**Features:** device frames (desktop / tablet / mobile), live status indicator, auto-refresh on edit, manual refresh. Because the preview uses the same components as production, **WYSIWYG is exact** — what editors see is what ships.

**Security:** `builderId` is treated as a capability token (the same model as Magezon's public preview controller). It's a hard-to-guess id; if your threat model needs more, gate `magezonPreview` behind an admin token or move resolution to an ACL-protected admin controller. Directive expansion (below) mirrors storefront behavior, which is already admin-authored content.

---

## File map

```
magento-module/app/code/QasrAlawani/MagezonHeadless/
  registration.php  composer.json
  etc/module.xml  etc/schema.graphqls  etc/di.xml  etc/acl.xml  etc/config.xml
  etc/adminhtml/system.xml                 # Stores>Config: Next.js base URL
  Model/MagezonProfileExtractor.php        # extract + mgzlink + DIRECTIVE expansion
  Model/Resolver/MagezonContent.php        # Query.magezonContent
  Model/Resolver/CmsPageMagezonProfile.php # CmsPage.magezon_profile_json
  Model/Resolver/MagezonPreview.php        # Query.magezonPreview (live admin preview)
  Block/Adminhtml/PreviewConfig.php        # exposes preview URL to admin JS
  view/adminhtml/layout/default.xml        # injects config + button CSS
  view/adminhtml/templates/preview-config.phtml
  view/adminhtml/web/css/headless-preview.css
  view/base/web/js/builder/navbar/headless-preview.js     # Angular navbar directive
  view/base/web/js/templates/builder/navbar/headless-preview.html

nextjs/
  app/magezon-preview/page.tsx             # live admin preview page (device frames + poll)
  lib/magezon/
    index.ts                 # public API
    types.ts                 # element tree types
    api.ts                   # magezonContent + magezonPreview fetch
    MagezonRenderer.tsx      # entry point (parse + normalize + render tree)
    MagezonElement.tsx       # per-element factory + list renderer
    ElementWrapper.tsx       # port of getElementHtml(): wrapper/inner/bg/scoped <style>
    registry.tsx             # type -> component map
    register-defaults.ts     # registers bundled components
    grid.ts                  # port of getWrapperClasses()/getInnerClasses()
    style.ts                 # port of getStylesHtml() (spacing/border/bg + responsive)
    links.ts media.ts        # link + media/value helpers
    styles/magezon.css       # self-contained grid + visibility + base styles
    styles/icons.css         # icon-font (Font Awesome) for icon/button/social elements
    elements/                # one component per element type (~50 + commerce/block adapters + fallback)
```

---

## How fidelity is preserved

`ElementWrapper` + `grid.ts` + `style.ts` are direct ports of Magezon's PHP rendering:
- **Wrapper/inner DOM** mirrors `Block\Element::getElementHtml()` — `.mgz-element.{id}` + `.{id}-s` inner, with the per-element `<style class="mgz-style">` emitted exactly like the storefront.
- **Grid/visibility/animation classes** mirror `getWrapperClasses()` (`mgz-col-{bp}-{n}`, `mgz-hidden-{bp}`, offsets, `mgz-animated`).
- **Scoped CSS** (`style.ts`) ports `ElementStyle::getStylesHtml()` including the `device_type=custom` responsive media-query breakpoints (xs ≤575, sm ≤767, md ≤991, lg ≤1199).
- **`{{mgzlink}}`** category/product/page links and **media paths** are resolved to real URLs server-side (module) / via `mediaUrl()` (frontend).

So each element component only implements its *own inner content* — spacing, borders, backgrounds, grid and visibility are handled centrally and identically to the monolith.

### Element-level effects (also centralized in the wrapper)
- **Scroll animations** — `animation_in` (+ `animation_duration`/`animation_delay`/`animation_infinite`) plays an animate.css-style keyframe when the element scrolls into view (`IntersectionObserver`). Progressive enhancement: armed only after mount, so content stays visible with JS off. ~15 common keyframes ship in `magezon.css`; unmapped names fall back to a fade-in. Only animated/parallax elements opt into a tiny client component — everything else stays server-rendered.
- **Parallax** — `parallax_type` (`scroll`/`scale`/`opacity` and combos) transforms the background layer on scroll, using `parallax_speed`.
- **Video backgrounds** — `background_type = yt_vm_video` injects a covering YouTube/Vimeo iframe (autoplay/muted/loop) or local `<video>`.
- **Page-level settings** — the profile's **custom CSS** is emitted as a scoped `<style>` and **custom classes** are added to the `.magezon-builder` wrapper, matching the storefront.

---

## Coverage matrix

**~50 element types implemented — effectively the full Magezon element set.** Anything unmapped (a truly custom third-party element) renders via `<Fallback>` (a labelled placeholder in dev, nothing in prod) — add it by dropping a component into `elements/` and registering it.

| Group | Types | Status |
|---|---|---|
| Structure | `row`, `inner_row`, `column`, `inner_column`, `tab`/`tab_item`/`accordion_section` (pass-through) | ✅ |
| Core content | `heading`, `text`, `single_image`, `button` | ✅ |
| Content | `separator`, `empty_space`, `icon`, `icon_list`, `list`, `message_box`, `call_to_action`, `pricing_table`, `raw_html`, `raw_js`, `social_icons`, `gmaps`, `video` | ✅ |
| Interactive (React hooks, no jQuery) | `tabs`, `accordion`, `toggle`, `slider`, `number_counter`, `countdown`, `progress_bar`, `testimonials`, `flip_box` | ✅ |
| Media galleries/sliders | `content_slider`, `image_carousel`, `image_gallery` | ✅ |
| Social embeds (load provider SDK) | `facebook_comments`, `facebook_like`, `facebook_page`, `twitter_button`, `twitter_timeline`, `instagram`, `flickr`, `pinterest` | ✅ |
| Forms | `search_form` (→ catalog search), `contact_form` (render; wire submit) | ✅ |
| Magento bridges | `static_block` & `pagebuilder_template` (**inlined server-side**), `magento_widget` (directive HTML) | ✅ |
| Layout bridges | `custom_block`, `sidebar` | 🔌 host stub — map via `MagezonBlockProvider` |
| Commerce | `product_grid`, `product_list`, `product_slider`, `single_product`, `products`, `categories` | ✅ renders via standard Magento `products()` / `categoryList` (grid/list/slider cards); restyle or replace via `MagezonCommerceProvider` |
| Commerce (no GraphQL source) | `recent_reviews`, `condition`-based product selection | 🔌 supply via `MagezonCommerceProvider` |

Each implemented component is a faithful port of its Magezon `.phtml` (field names + markup preserved). `static_block` and `pagebuilder_template` are **inlined by the backend** (the referenced CMS block / saved Magezon template is loaded, resolved, and attached as children) so they render natively with no client round-trip. Commerce elements fetch from your storefront's standard GraphQL out of the box for SKU- and category-based selection. Only `custom_block`/`sidebar` (Magento *layout* blocks), product **reviews**, and Magento **rule-condition** product selection need host wiring.

---

## Limitations — status

The original Approach-B limitations and how this build addresses them:

| # | Limitation | Status |
|---|---|---|
| 1 | **WYSIWYG directives** (`{{widget}}`, `{{media url}}`, `{{store url}}`, `{{config path}}`) | ✅ **Fixed.** `MagezonProfileExtractor` recursively expands `{{…}}` directives via Magento's `FilterProvider`, exactly as the storefront does — for both production and preview. Still sanitize untrusted HTML (DOMPurify) if your content isn't fully trusted. |
| 2 | **Icon fonts** | ✅ **Addressed.** `styles/icons.css` pulls Font Awesome 6 (covers `fa`/`fas`/`fab`). For 100% parity self-host Magezon's `mgz-font`/openiconic (instructions in the file). |
| 3 | **Interactive parity** (sliders/tabs/accordions) | ✅ **Effectively solved.** They're first-class React reimplementations, and the **admin preview uses the same components as production**, so what editors see is what ships. Transitions differ cosmetically from owl-carousel/jQuery but behavior matches. |
| 4 | **No admin preview** | ✅ **Fixed.** Live "Headless Preview" in the Magezon builder (Part 3). |
| 5 | **Magezon version drift** | ⚠️ **Mitigated.** Field names follow the installed Magezon (2019 1.x–2.x line). The live preview surfaces any drift immediately; verify against a real `profile_json` if the other project runs a different Magezon major. |

Remaining host-wiring (by design, not gaps): the **commerce adapter** (product selectors) needs your product GraphQL via `MagezonCommerceProvider`, and **`custom_block`/`sidebar`** (Magento layout blocks) map through `MagezonBlockProvider`. Everything else renders out of the box.

## License note
Magezon's PHP is readable but **proprietary** (Magezon Software License). This module reads/serializes its output via its public helpers and extension points (the navbar config provider, the preview save endpoint); it does not modify or redistribute Magezon code.
```
