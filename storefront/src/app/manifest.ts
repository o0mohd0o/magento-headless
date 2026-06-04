import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Luma Headless",
    short_name: "Luma",
    description: "A headless commerce storefront on Magento Open Source 2.4.9.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#4f46e5",
    icons: [],
  };
}
