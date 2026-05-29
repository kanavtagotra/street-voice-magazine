import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@napi-rs/canvas",
    "canvas",
    "sharp",
    "pdfjs-dist",
    "pdf-to-img",
  ],
  experimental: {
    serverActions: {
      bodySizeLimit: "80mb",
    },
  },
};

export default nextConfig;
