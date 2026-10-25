import type { NextConfig } from "next";

// GitHub Pages 项目页部署时由 CI 注入 NEXT_PUBLIC_BASE_PATH=/<repo>
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
