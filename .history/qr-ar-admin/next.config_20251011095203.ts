/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "localhost:3001",
        "localhost:5001",
        "localhost:5002",
        "192.168.0.2:3000",
        "192.168.0.2:3001", 
        "192.168.0.2:5001",
        "192.168.0.2:5002",
      ],
    },
  },
  devIndicators: {
    allowedDevOrigins: [
      "localhost:3000",
      "localhost:3001", 
      "192.168.0.2:3000",
      "192.168.0.2:3001",
    ],
  },t('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "localhost:3001",
        "localhost:5001",
        "localhost:5002",
        "192.168.0.2:3000",
        "192.168.0.2:3001",
        "192.168.0.2:5001",
        "192.168.0.2:5002",
      ],
    },
  },
  images: {
    domains: ["localhost", "192.168.0.2"],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "5001",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "localhost",
        port: "5002",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "192.168.0.2",
        port: "5001",
        pathname: "/uploads/**",
      },
    ],
  },
  async rewrites() {
    // Determine API base URL based on environment
    const getApiBaseUrl = () => {
      // In development, use local IP if accessed from network
      if (process.env.NODE_ENV === "development") {
        return (
          process.env.NEXT_PUBLIC_API_INTERNAL_BASE_URL ||
          process.env.API_INTERNAL_BASE_URL ||
          "http://localhost:5001"
        );
      }
      return process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5001";
    };

    const apiBaseUrl = getApiBaseUrl();

    return [
      {
        source: "/api/:path*",
        destination: `${apiBaseUrl}/api/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${apiBaseUrl}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
