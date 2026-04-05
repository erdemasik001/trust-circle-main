import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Serve .wasm files as static assets so IDKit can fetch them at runtime
    config.module.rules.push({
      test: /\.wasm$/,
      type: "asset/resource",
      generator: {
        filename: "static/wasm/[hash][ext]",
      },
    });
    return config;
  },
};

export default nextConfig;
