/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // mupdf 是 wasm 依赖，不打包进 bundle
    serverComponentsExternalPackages: ["mupdf"],
  },
};

export default nextConfig;
