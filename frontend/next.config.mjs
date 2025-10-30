/** @type {import('next').NextConfig} */
const computedBasePath = (() => {
  const raw = process.env.BASE_PATH ? process.env.BASE_PATH.trim() : "";
  if (!raw || raw === "/") return "";
  return raw.startsWith("/") ? raw : `/${raw}`;
})();

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    turbo: {
      rules: {},
    },
  },
  ...(computedBasePath ? { basePath: computedBasePath } : {}),
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;


