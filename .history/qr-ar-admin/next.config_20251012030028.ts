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
  },
  webpack: (config: any, { isServer, webpack }: any) => {
    // Optimize model-viewer
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
      };

      // Suppress Lit dev mode warnings in production-like builds
      config.plugins.push(
        new webpack.DefinePlugin({
          "process.env.NODE_ENV": JSON.stringify(
            process.env.NODE_ENV || "development"
          ),
        })
      );
    }

    return config;
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
      {
        protocol: "https",
        hostname: "192.168.0.2",
        port: "5002",
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
          "https://localhost:5002"
        );
      }
      return process.env.NEXT_PUBLIC_API_BASE_URL || "https://localhost:5002";
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
  
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'camera=*, microphone=*, gyroscope=*, accelerometer=*, xr-spatial-tracking=*',
          },
          {
            key: 'Feature-Policy',
            value: 'xr-spatial-tracking \'self\'; camera \'self\'; microphone \'self\'; gyroscope \'self\'; accelerometer \'self\'',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
