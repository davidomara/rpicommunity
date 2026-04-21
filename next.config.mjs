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
        source: "/meta.json",
        destination: "/rpicommunity/meta.json",
        permanent: false,
        basePath: false
      },
      {
        source: "/favicon.svg",
        destination: "/rpicommunity/favicon.svg",
        permanent: false,
        basePath: false
      },
      {
        source: "/favicon.ico",
        destination: "/rpicommunity/favicon.svg",
        permanent: false,
        basePath: false
      }
    ];
  }
};

export default nextConfig;
