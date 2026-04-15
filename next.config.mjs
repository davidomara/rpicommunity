/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  basePath: "/rpicommunity",
  experimental: {
    serverActions: {
      bodySizeLimit: "8mb",
      allowedOrigins: ["10.20.70.138"]
    }
  },
  async redirects() {
    return [
      {
        source: "/favicon.ico",
        destination: "/favicon.svg",
        permanent: false
      }
    ];
  }
};

export default nextConfig;