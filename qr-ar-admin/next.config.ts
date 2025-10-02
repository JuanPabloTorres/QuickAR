/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "localhost:5001",
        "localhost:5002",
        "192.168.0.5:3000",
        "192.168.0.5:5001",
        "192.168.0.5:5002",
      ],
    },
  },
  images: {
    domains: ["localhost", "192.168.0.5"],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "5001",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "192.168.0.5",
        port: "5001",
        pathname: "/uploads/**",
      },
    ],
  },
  async rewrites() {
    // Determinar la URL base de la API según el entorno
    const getApiBaseUrl = () => {
      // En desarrollo, usar IP local si se accede desde red
      if (process.env.NODE_ENV === "development") {
        return (
          process.env.NEXT_PUBLIC_API_INTERNAL_BASE_URL ||
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
