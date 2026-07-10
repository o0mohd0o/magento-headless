import type { MetadataRoute } from "next";

// Served at /manifest.webmanifest (auto-linked in <head> by Next). Relative
// URLs throughout so the same manifest works on magento.test and the live
// domain. Icons/screenshots are real files in public/ — PWABuilder fetches
// and validates every src, declared size, and MIME type.
export default function manifest(): MetadataRoute.Manifest {
  return {
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
}
