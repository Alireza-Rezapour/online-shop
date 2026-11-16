import type { NextConfig } from "next";

const storageHost = process.env.NEXT_PUBLIC_STORAGE_PUBLIC_BASE_URL
  ? new URL(process.env.NEXT_PUBLIC_STORAGE_PUBLIC_BASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  images: {
    remotePatterns: storageHost
      ? [{ protocol: "https", hostname: storageHost }]
      : [],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
