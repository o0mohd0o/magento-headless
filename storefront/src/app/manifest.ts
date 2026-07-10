import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// Next's Manifest type doesn't know these members yet (W3C drafts / vendor).
type ManifestWithExtensions = MetadataRoute.Manifest & {
  scope_extensions?: { type: string; origin: string }[];
  edge_side_panel?: { preferred_width: number };
  note_taking?: { new_note_url: string };
};

// Served at /manifest.webmanifest (auto-linked in <head> by Next). Relative
// URLs throughout so the same manifest works on magento.test and the live
// domain. Icons/screenshots are real files in public/ — PWABuilder fetches
// and validates every src, declared size, and MIME type.
//
// Deliberately absent: iarc_rating_id — that is a real age-rating certificate
// GUID issued by IARC (free questionnaire in Google Play Console / Microsoft
// Partner Center when packaging for a store); add it once issued.
export default function manifest(): MetadataRoute.Manifest {
  const m: ManifestWithExtensions = {
    id: "/",
    name: "Luma Headless",
    short_name: "Luma",
    description:
      "A headless commerce storefront on Magento Open Source 2.4.9 — catalog, cart and checkout served live over GraphQL.",
    start_url: "/",
    scope: "/",
    lang: "en",
    dir: "ltr",
    display: "standalone",
    display_override: ["window-controls-overlay", "standalone", "minimal-ui"],
    orientation: "any",
    background_color: "#ffffff",
    theme_color: "#4f46e5",
    categories: ["shopping"],
    prefer_related_applications: false,
    // The only "related application" is this web app itself; with
    // prefer_related_applications: false the entry is behaviorally inert.
    related_applications: [
      { platform: "webapp", url: `${SITE_URL}/manifest.webmanifest` },
    ],
    // Parent brand origin (docs/courses live on *.mageforge.io). Takes real
    // effect only if that origin serves .well-known/web-app-origin-association.
    scope_extensions: [{ type: "origin", origin: "https://mageforge.io" }],
    // web+luma:<term> deep links open catalog search in the installed app.
    protocol_handlers: [{ protocol: "web+luma", url: "/search?q=%s" }],
    // The responsive storefront works at side-panel widths (Edge sidebar).
    edge_side_panel: { preferred_width: 400 },
    // Opening a .lumalist shopping-list file lands on /list (launchQueue).
    file_handlers: [
      { action: "/list", accept: { "application/json": [".lumalist"] } },
    ],
    // OS "new note" actions open a fresh local shopping note.
    note_taking: { new_note_url: "/notes?new=1" },
    launch_handler: { client_mode: "navigate-existing" },
    icons: [
      // purpose is spelled out even though "any" is the default — PWABuilder's
      // legacy manifest-validation library requires an explicit purpose:"any".
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-192-maskable.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    screenshots: [
      {
        src: "/screenshots/home-wide.png",
        sizes: "1280x800",
        type: "image/png",
        form_factor: "wide",
        label: "Luma Headless homepage",
      },
      {
        src: "/screenshots/category-narrow.png",
        sizes: "486x844",
        type: "image/png",
        form_factor: "narrow",
        label: "Category browsing with filters",
      },
    ],
    shortcuts: [
      {
        name: "Search products",
        short_name: "Search",
        description: "Search the catalog",
        url: "/search",
      },
      {
        name: "Cart",
        short_name: "Cart",
        description: "View your shopping cart",
        url: "/cart",
      },
      {
        name: "Track an order",
        short_name: "Orders",
        description: "Look up a guest order",
        url: "/order-lookup",
      },
    ],
    // Sharing text into the app lands on catalog search (/search?q=…).
    share_target: {
      action: "/search",
      method: "GET",
      enctype: "application/x-www-form-urlencoded",
      params: { text: "q" },
    },
  };
  return m;
}
