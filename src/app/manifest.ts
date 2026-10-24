import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LE SAC DORÉ™",
    short_name: "Le Sac Doré",
    description: "Handmade luxury leather handbags. More than a bag.",
    start_url: "/",
    display: "standalone",
    background_color: "#F7F4EE",
    theme_color: "#F7F4EE",
    categories: ["shopping", "lifestyle", "fashion"],
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
