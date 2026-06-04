/**
 * build-homepage.mjs — authors the headless homepage as a Magezon Page Builder
 * profile and emits SQL that upserts it into the `headless-home` CMS page.
 *
 * The Next.js homepage fetches this page via the QasrAlawani_MagezonHeadless
 * GraphQL module (magezonContent) and renders it with <MagezonRenderer>. So the
 * ENTIRE homepage is page-builder-driven content — exactly the Magezon workflow,
 * just authored as JSON instead of clicked together in the Angular admin UI.
 *
 *   node scripts/build-homepage.mjs        # writes _homepage.sql next to repo root
 *
 * Aesthetic: "Kinetic Sport-Luxe" — near-black ink, warm paper, one electric
 * acid-lime accent; ultra-condensed Anton display vs refined Hanken Grotesk body.
 */
import { writeFileSync } from "node:fs";

/* --------------------------------------------------------------------- *
 * tiny element builders
 * --------------------------------------------------------------------- */
let _n = 0;
const id = (p = "e") => `${p}${(_n++).toString(36)}`;

const el = (type, props = {}, children) => {
  // Magezon's admin builder JS (base.js initParallax) calls
  // `getDesignValue(el,'background_position').replace(...)` with NO guard, so an
  // element that has a background but no background_position crashes the canvas
  // (and the model it then serializes on Save). Default it so every element is
  // builder-safe. Harmless to the Next.js renderer (it only uses
  // background_position when a background_image is set). `props` can override.
  const node = {
    id: id(),
    background_position: "center-center",
    background_style: "cover",
    type,
    ...props,
  };
  if (children) node.elements = children;
  return node;
};

const row = (props, children) => el("row", { row_type: "full_width_row", ...props }, children);
const fullRow = (props, children) => el("row", props, children); // edge-to-edge (no container)
const col = (props, children) => el("column", props, children);
const heading = (props) => el("heading", { heading_type: "h2", ...props });
const text = (content, props = {}) => el("text", { content, ...props });
const image = (props) => el("single_image", props);
const button = (props) => el("button", { button_size: "large", display_as_link: "0", ...props });
const productGrid = (props) => el("product_grid", { columns: "4", ...props });

/* spacing helper: vertical section padding (px) */
const pad = (top, bottom) => ({ padding_top: String(top), padding_bottom: String(bottom) });

/* --------------------------------------------------------------------- *
 * sections
 * --------------------------------------------------------------------- */

// 1) HERO — full-bleed lifestyle image, dark left-weighted scrim, big statement.
const hero = fullRow(
  {
    el_class: "hp-hero",
    background_image: "wysiwyg/home/home-main.jpg",
    background_style: "cover",
    background_position: "center-center",
    min_height: "720",
    ...pad(80, 80),
  },
  [
    el("row", { row_type: "full_width_row" }, [
      col({ lg_size: "8", md_size: "10", el_class: "hero-copy" }, [
        text("Luma Athletics — SS26 Performance", { el_class: "kicker" }),
        heading({
          heading_type: "h1",
          el_class: "hero-h1",
          text: 'Made to <span class="lime">move</span> first.',
        }),
        text(
          "<p>Engineered layers, technical knits and carry built for the people who never sit still. The full Luma range — served live over Magento GraphQL, rendered by the page builder.</p>",
          { el_class: "hero-sub" },
        ),
        button({ title: "Shop Women", link: "/category/women", el_class: "btn-lime act1" }),
        button({ title: "Shop Men", link: "/category/men", el_class: "btn-ghost act2" }),
      ]),
    ]),
  ],
);

// 2) TICKER — lime marquee band.
const tickerItems = [
  "Free shipping over $75",
  "New SS26 drop",
  "Engineered for motion",
  "30-day returns",
  "Performance fabrics",
];
const tickerGroup = `<span class="g">${tickerItems
  .map((t) => `<span class="i">${t}</span><span class="d">✦</span>`)
  .join("")}</span>`;
const ticker = fullRow({ el_class: "hp-ticker-row", background_color: "D6FB3D", ...pad(16, 16) }, [
  el("row", { row_type: "full_width_row" }, [
    col({ lg_size: "12" }, [
      text(`<div class="ticker-track">${tickerGroup}${tickerGroup}</div>`, { el_class: "ticker" }),
    ]),
  ]),
]);

// 3) CATEGORY TRIPTYCH — three editorial cards.
const catCard = (img, title, count, href) =>
  col({ lg_size: "4", md_size: "4", el_class: "hp-cat reveal" }, [
    image({
      image: img,
      link: href,
      alt_tag: title,
      image_hover_effect: "zoom",
      content_position: "over",
      title,
      description: `${count} · Explore →`,
    }),
  ]);

const categories = row({ el_class: "section paper", ...pad(96, 40) }, [
  col({ lg_size: "12", el_class: "section-head reveal" }, [
    text("The edit", { el_class: "kicker" }),
    heading({ el_class: "section-h2", text: 'Shop by <span class="mark">discipline</span>' }),
  ]),
  el("row", { row_type: "full_width_row", el_class: "cat-grid" }, [
    catCard("wysiwyg/womens/womens-main.jpg", "Women", "75 styles", "/category/women"),
    catCard("wysiwyg/mens/mens-main.jpg", "Men", "72 styles", "/category/men"),
    catCard("wysiwyg/gear/gear-fitnes.jpg", "Gear", "34 styles", "/category/gear"),
  ]),
]);

// 4) EDITORIAL SPLIT — image + manifesto copy.
const split = row({ el_class: "section paper hp-split", ...pad(40, 96) }, [
  el("row", { row_type: "full_width_row", el_class: "split-grid" }, [
    col({ lg_size: "6", el_class: "split-img reveal" }, [
      image({ image: "wysiwyg/home/home-performance.jpg", alt_tag: "Performance fabrics" }),
    ]),
    col({ lg_size: "6", el_class: "split-copy reveal" }, [
      text("Performance fabrics", { el_class: "kicker" }),
      heading({ el_class: "section-h2", text: "Built for the <br>second mile." }),
      text(
        "<p>Four-way stretch, moisture-wicking knits and bonded seams that disappear when you’re mid-rep. Every piece is pressure-tested before it earns the Luma mark.</p>",
        { el_class: "body" },
      ),
      button({ title: "Explore fabrics", link: "/category/performance-fabrics", el_class: "btn-ink" }),
    ]),
  ]),
]);

// 5) FEATURED PRODUCTS — live grid from Magento (client-fetched via /api/graphql).
const featured = row({ el_class: "section paper", ...pad(88, 88) }, [
  col({ lg_size: "12", el_class: "section-head row-head reveal" }, [
    text("Just landed", { el_class: "kicker" }),
    heading({ el_class: "section-h2", text: "This week’s lineup" }),
    text('<p><a href="/category/tops-women">View all tops →</a></p>', { el_class: "head-link" }),
  ]),
  col({ lg_size: "12", el_class: "hp-products reveal" }, [
    // Magento's default ProductAttributeSortInput has no created_at; use position.
    productGrid({ category_id: "21", columns: "4", limit: "8", sort_by: "position" }),
  ]),
]);

// 6) VALUE PROPS — ink band, four numbered promises.
const vp = (num, label, desc) =>
  col({ lg_size: "3", md_size: "6", el_class: "vp" }, [
    heading({ heading_type: "div", el_class: "vp-num", text: num }),
    heading({ heading_type: "h3", el_class: "vp-label", text: label }),
    text(`<p>${desc}</p>`),
  ]);

const promises = row({ el_class: "section ink", background_color: "0A0A0A", ...pad(80, 80) }, [
  el("row", { row_type: "full_width_row", el_class: "vp-grid" }, [
    vp("01", "Free shipping", "On every order over $75, anywhere in the contiguous US."),
    vp("02", "30-day returns", "Wear it, train in it. Not right? Send it back, no questions."),
    vp("03", "Secure checkout", "Encrypted, PCI-compliant payments on the Magento backend."),
    vp("04", "Made to last", "Pressure-tested fabrics backed by the Luma performance mark."),
  ]),
]);

// 7) SECOND SHOWCASE — bags grid.
const bags = row({ el_class: "section paper", ...pad(88, 88) }, [
  col({ lg_size: "12", el_class: "section-head row-head reveal" }, [
    text("Carry the day", { el_class: "kicker" }),
    heading({ el_class: "section-h2", text: "Bags & gear" }),
    text('<p><a href="/category/bags">View all bags →</a></p>', { el_class: "head-link" }),
  ]),
  col({ lg_size: "12", el_class: "hp-products reveal" }, [
    productGrid({ category_id: "4", columns: "4", limit: "4", sort_by: "position" }),
  ]),
]);

// 8) CTA BAND — lime, closing statement.
const cta = fullRow({ el_class: "hp-cta", background_color: "D6FB3D", align: "center", ...pad(110, 110) }, [
  el("row", { row_type: "full_width_row" }, [
    col({ lg_size: "10", md_size: "12", el_class: "cta-copy", align: "center" }, [
      text("Your move", { el_class: "kicker" }),
      heading({ heading_type: "h2", el_class: "cta-h", text: "Move first. <br>Rest later." }),
      button({ title: "Start shopping", link: "/category/women", el_class: "btn-ink" }),
    ]),
  ]),
]);

const elements = [hero, ticker, categories, split, featured, promises, bags, cta];

/* --------------------------------------------------------------------- *
 * custom CSS (scoped under .magezon-builder)
 * --------------------------------------------------------------------- */
const custom_css = `
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Hanken+Grotesk:wght@400;500;600;700;800&display=swap');
.magezon-builder{
  /* Fonts are loaded + defined HERE (not via next/font) so the profile renders
     identically in the Next.js storefront, the Magezon admin preview, AND the
     Luma frontend — the design is self-contained in the page-builder profile. */
  --font-display: 'Anton', 'Arial Narrow', system-ui, sans-serif;
  --font-grotesk: 'Hanken Grotesk', ui-sans-serif, system-ui, sans-serif;
  --ink:#0A0A0A; --paper:#F2EEE4; --lime:#D6FB3D; --muted:#6B675E;
  font-family: var(--font-grotesk), ui-sans-serif, system-ui, sans-serif;
  color: var(--ink); background: var(--paper); overflow-x: hidden;
}
.magezon-builder a{ text-decoration: none; color: inherit; }
.magezon-builder .mgz-element-heading-text{
  font-family: var(--font-display), "Arial Narrow", sans-serif;
  font-weight: 400; line-height: .9; letter-spacing: .005em; text-transform: uppercase; margin: 0;
}
.magezon-builder .lime{ color: var(--lime); }
.magezon-builder .mark{ background: var(--lime); color: var(--ink); padding: 0 .12em; box-decoration-break: clone; -webkit-box-decoration-break: clone; }
.magezon-builder .kicker .mgz-text{
  font-family: var(--font-grotesk); text-transform: uppercase; letter-spacing: .34em;
  font-size: .72rem; font-weight: 700; color: var(--muted); margin: 0 0 1.1rem;
}
.magezon-builder .section-h2 .mgz-element-heading-text{ font-size: clamp(2.3rem, 5.2vw, 4.6rem); }
.magezon-builder .paper{ background: var(--paper); }

/* buttons */
.magezon-builder .mgz-button{ display: inline-block; }
.magezon-builder .mgz-button .mgz-btn{
  background: var(--ink); color: #fff; border: 1.5px solid var(--ink); border-radius: 0;
  padding: 17px 34px; font-family: var(--font-grotesk); font-weight: 700;
  text-transform: uppercase; letter-spacing: .16em; font-size: 12.5px;
  transition: transform .25s cubic-bezier(.2,.8,.2,1), background .25s ease, color .25s ease, border-color .25s ease;
}
.magezon-builder .btn-lime  .mgz-btn{ background: var(--lime); color: var(--ink); border-color: var(--lime); }
.magezon-builder .btn-lime  .mgz-btn:hover{ background: var(--ink); color: var(--lime); }
.magezon-builder .btn-ghost .mgz-btn{ background: transparent; color: #fff; border-color: rgba(255,255,255,.55); }
.magezon-builder .btn-ghost .mgz-btn:hover{ background: #fff; color: var(--ink); border-color: #fff; }
.magezon-builder .btn-ink   .mgz-btn{ background: var(--ink); color: var(--lime); border-color: var(--ink); }
.magezon-builder .btn-ink   .mgz-btn:hover{ transform: translateY(-3px); }

/* HERO */
.magezon-builder .hp-hero .mgz-element-inner{ display: flex; align-items: center; }
.magezon-builder .hp-hero .mgz-parallax-inner::after{
  content: ""; position: absolute; inset: 0;
  background: linear-gradient(95deg, rgba(10,10,10,.94) 0%, rgba(10,10,10,.66) 42%, rgba(10,10,10,.12) 100%);
}
.magezon-builder .hero-copy .kicker .mgz-text{ color: var(--lime); }
.magezon-builder .hero-h1 .mgz-element-heading-text{ font-size: clamp(3.1rem, 9vw, 8rem); color: #fff; }
.magezon-builder .hero-sub .mgz-text{ color: rgba(255,255,255,.82); font-size: clamp(1rem,1.35vw,1.2rem); line-height: 1.55; max-width: 40ch; margin: 1.5rem 0 0; }
.magezon-builder .hero-copy .mgz-element-button{ display: inline-block; margin: 1.9rem 1rem 0 0; }
.magezon-builder .hero-copy .mgz-column-inner > .mgz-element{ opacity: 0; transform: translateY(26px); animation: heroIn .9s cubic-bezier(.2,.8,.2,1) forwards; }
.magezon-builder .hero-copy .kicker{ animation-delay: .05s; }
.magezon-builder .hero-copy .hero-h1{ animation-delay: .16s; }
.magezon-builder .hero-copy .hero-sub{ animation-delay: .30s; }
.magezon-builder .hero-copy .act1{ animation-delay: .44s; }
.magezon-builder .hero-copy .act2{ animation-delay: .54s; }
@keyframes heroIn{ to{ opacity: 1; transform: none; } }

/* TICKER */
.magezon-builder .hp-ticker-row .mgz-element-inner{ overflow: hidden; }
.magezon-builder .hp-ticker-row .mgz-row{ display: block; }
.magezon-builder .ticker .mgz-text{ overflow: hidden; }
.magezon-builder .ticker-track{ display: inline-flex; white-space: nowrap; will-change: transform; animation: ticker 26s linear infinite; }
.magezon-builder .ticker-track .g{ display: inline-flex; align-items: center; }
.magezon-builder .ticker-track .i{ font-family: var(--font-display); text-transform: uppercase; font-size: 1.15rem; color: var(--ink); letter-spacing: .02em; padding: 0 1.4rem; }
.magezon-builder .ticker-track .d{ color: var(--ink); opacity: .55; }
@keyframes ticker{ to{ transform: translateX(-50%); } }

/* SECTION HEADS */
.magezon-builder .section-head{ max-width: 1280px; margin: 0 auto; }
.magezon-builder .row-head{ display: flex; flex-wrap: wrap; align-items: flex-end; gap: .4rem 2rem; }
.magezon-builder .row-head .mgz-element-heading{ flex: 1 1 auto; }
.magezon-builder .head-link .mgz-text{ margin: 0; }
.magezon-builder .head-link a{ font-family: var(--font-grotesk); text-transform: uppercase; letter-spacing: .14em; font-size: .74rem; font-weight: 700; border-bottom: 2px solid var(--lime); padding-bottom: 2px; }

/* CATEGORY CARDS — moody desaturated grid; colour + zoom on hover */
.magezon-builder .cat-grid{ gap: 0; }
.magezon-builder .hp-cat{ margin-top: 2.4rem; }
.magezon-builder .hp-cat .mgz-single-image, .magezon-builder .hp-cat .mgz-single-image-inner{ height: 100%; }
.magezon-builder .hp-cat .mgz-single-image-inner{ overflow: hidden; background: var(--ink); }
.magezon-builder .hp-cat img{ width: 100%; aspect-ratio: 4/5; object-fit: cover; object-position: center 30%; display: block; filter: grayscale(.55) brightness(.6) contrast(1.14); transition: transform .65s cubic-bezier(.2,.8,.2,1), filter .55s ease; }
.magezon-builder .hp-cat .mgz-single-image-inner:hover img{ filter: grayscale(0) brightness(.92) contrast(1.04); }
.magezon-builder .hp-cat .mgz-single-image-inner::after{ content: ""; position: absolute; inset: 0; z-index: 1; background: linear-gradient(to top, rgba(10,10,10,.85) 0%, rgba(10,10,10,.12) 48%, rgba(10,10,10,.5) 100%); }
.magezon-builder .hp-cat .image-content{ position: absolute; inset: auto 0 0 0; z-index: 2; margin: 0; padding: 1.8rem; display: flex; flex-direction: column; align-items: flex-start; justify-content: flex-end; color: #fff; }
.magezon-builder .hp-cat .image-title{ font-family: var(--font-display); text-transform: uppercase; font-size: clamp(2.2rem,3.2vw,3.2rem); line-height: .85; }
.magezon-builder .hp-cat .image-description{ font-family: var(--font-grotesk); text-transform: uppercase; letter-spacing: .2em; font-size: .68rem; color: var(--lime); margin-top: .55rem; }
.magezon-builder .hp-cat .mgz-single-image-inner::before{ content: ""; position: absolute; top: 1.3rem; left: 1.3rem; z-index: 2; width: 34px; height: 34px; border: 1.5px solid rgba(255,255,255,.4); border-radius: 50%; }

/* EDITORIAL SPLIT */
.magezon-builder .split-grid{ align-items: stretch; }
.magezon-builder .split-img .mgz-single-image-inner{ overflow: hidden; height: 100%; }
.magezon-builder .split-img img{ width: 100%; height: 100%; aspect-ratio: 4/5; object-fit: cover; object-position: center 25%; display: block; filter: contrast(1.05) saturate(1.03); }
.magezon-builder .split-copy .mgz-column-inner{ height: 100%; display: flex; flex-direction: column; justify-content: center; padding: clamp(2rem, 4vw, 4.5rem); }
.magezon-builder .split-copy .body .mgz-text{ color: var(--muted); font-size: 1.05rem; line-height: 1.65; margin: 1.4rem 0 2rem; max-width: 42ch; }

/* PRODUCT GRIDS */
.magezon-builder .hp-products{ margin-top: 2.2rem; }
.magezon-builder .hp-products .mgz-product-item{ background: #fff; border: 1px solid rgba(10,10,10,.1); padding: 1rem 1rem 1.4rem; transition: transform .25s ease, box-shadow .25s ease; }
.magezon-builder .hp-products .mgz-product-item:hover{ opacity: 1; transform: translateY(-5px); box-shadow: 0 16px 34px rgba(10,10,10,.13); }
.magezon-builder .hp-products .mgz-product-item img{ width: 100%; aspect-ratio: 1; object-fit: cover; background: #f0ede4; }
.magezon-builder .hp-products .mgz-product-name{ font-family: var(--font-grotesk); text-transform: uppercase; letter-spacing: .03em; font-weight: 600; font-size: .78rem; margin-top: .9rem; }
.magezon-builder .hp-products .mgz-product-price strong{ font-family: var(--font-display); font-size: 1.35rem; letter-spacing: .01em; }
.magezon-builder .mgz-commerce-skeleton{ aspect-ratio: 1; border-radius: 0 !important; }

/* VALUE PROPS (ink) */
.magezon-builder .ink{ color: #fff; }
.magezon-builder .vp{ margin-top: 1.5rem; }
.magezon-builder .vp .mgz-column-inner{ border-top: 2px solid rgba(255,255,255,.16); padding-top: 1.4rem; }
.magezon-builder .vp-num .mgz-element-heading-text{ color: var(--lime); font-size: 2.6rem; }
.magezon-builder .vp-label .mgz-element-heading-text{ color: #fff; font-size: 1.05rem; letter-spacing: .04em; margin-top: .7rem; }
.magezon-builder .vp .mgz-text{ color: rgba(255,255,255,.62); font-size: .9rem; line-height: 1.55; margin-top: .6rem; }

/* CTA */
.magezon-builder .hp-cta .cta-h .mgz-element-heading-text{ font-size: clamp(2.8rem, 8vw, 6.5rem); color: var(--ink); }
.magezon-builder .hp-cta .kicker .mgz-text{ color: rgba(10,10,10,.6); }
.magezon-builder .cta-copy .mgz-element-button{ margin-top: 2rem; }

/* SCROLL REVEAL (progressive enhancement; static when unsupported) */
@supports (animation-timeline: view()){
  .magezon-builder .reveal{ animation: revealIn .9s cubic-bezier(.2,.8,.2,1) both; animation-timeline: view(); animation-range: entry 0% cover 24%; }
  @keyframes revealIn{ from{ opacity: 0; transform: translateY(42px); } to{ opacity: 1; transform: none; } }
}
@media (prefers-reduced-motion: reduce){
  .magezon-builder *{ animation: none !important; }
}

/* RESPONSIVE */
@media (max-width: 991px){
  .magezon-builder .hp-hero .mgz-parallax-inner::after{ background: linear-gradient(180deg, rgba(10,10,10,.5) 0%, rgba(10,10,10,.88) 100%); }
  .magezon-builder .split-copy .mgz-column-inner{ padding: 2.2rem 1rem 3rem; }
  .magezon-builder .row-head{ align-items: flex-start; }
  .magezon-builder .hp-cat img{ aspect-ratio: 16/11; }
}
@media (max-width: 767px){
  /* the commerce adapter hard-codes a 4-col inline grid; stack to 2 on phones */
  .magezon-builder .hp-products .mgz-product-grid{ grid-template-columns: repeat(2, minmax(0,1fr)) !important; gap: 10px !important; }
  .magezon-builder .hp-hero{ min-height: 560px !important; }
  .magezon-builder .vp .mgz-column-inner{ padding-top: 1rem; }
}
`.trim();

/* --------------------------------------------------------------------- *
 * emit
 * --------------------------------------------------------------------- */
const profile = { elements, custom_css, custom_classes: "" };
const json = JSON.stringify(profile);
const content = `[mgz_pagebuilder]${json}[/mgz_pagebuilder]`;
const b64 = Buffer.from(content, "utf8").toString("base64");

// Stable UPSERT — update the existing page in place (keeps its page_id so admin
// editor tabs / bookmarks stay valid) and only INSERT when it doesn't exist yet.
const sql = `-- headless homepage (generated by scripts/build-homepage.mjs)
SET @content = FROM_BASE64('${b64}');
UPDATE cms_page SET
  title='Headless Home', page_layout='cms-full-width', content=@content,
  content_heading='', is_active=1, sort_order=0,
  meta_title='Luma Athletics — Made to Move',
  meta_description='Headless Luma storefront homepage, designed with the Magezon Page Builder.',
  update_time=NOW()
WHERE identifier='headless-home';
INSERT INTO cms_page
  (title, page_layout, identifier, content, content_heading, is_active, sort_order, meta_title, meta_description, creation_time, update_time)
SELECT 'Headless Home', 'cms-full-width', 'headless-home', @content, '', 1, 0,
       'Luma Athletics — Made to Move',
       'Headless Luma storefront homepage, designed with the Magezon Page Builder.', NOW(), NOW()
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM cms_page WHERE identifier='headless-home');
-- ensure an All-Store-Views (store_id 0) mapping exists, idempotently
INSERT INTO cms_page_store (page_id, store_id)
SELECT p.page_id, 0 FROM cms_page p
WHERE p.identifier='headless-home'
  AND NOT EXISTS (SELECT 1 FROM cms_page_store s WHERE s.page_id=p.page_id AND s.store_id=0);
SELECT CONCAT('headless-home is page_id=', (SELECT page_id FROM cms_page WHERE identifier='headless-home' LIMIT 1)) AS result;
`;

writeFileSync(new URL("../../_homepage.sql", import.meta.url), sql);
console.log(`elements: ${elements.length} top-level sections`);
console.log(`profile json: ${(json.length / 1024).toFixed(1)} KB, custom_css: ${(custom_css.length / 1024).toFixed(1)} KB`);
console.log(`content (with shortcode): ${(content.length / 1024).toFixed(1)} KB -> base64 ${(b64.length / 1024).toFixed(1)} KB`);
console.log(`wrote _homepage.sql`);
