"use client";

import { useEffect, useState } from "react";

export function ApiDebugInfo() {
  const [apiInfo, setApiInfo] = useState<{
    hostname: string;
    detectedApiUrl: string;
    envApiUrl: string | undefined;
    isNetworkAccess: boolean;
  } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const hostname = window.location.hostname;
    const isNetworkIP = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
    const envApiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    let detectedApiUrl: string;
    if (envApiUrl) {
      detectedApiUrl = envApiUrl;
    } else if (isNetworkIP) {
      detectedApiUrl = `http://${hostname}:5001`;
    } else {
      detectedApiUrl = "http://localhost:5001";
    }

    setApiInfo({
      hostname,
      detectedApiUrl,
      envApiUrl,
      isNetworkAccess: isNetworkIP,
    });
  }, []);

  if (!apiInfo) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono shadow-lg max-w-sm z-50">
      <div className="font-bold mb-2 text-green-400">🌐 API Debug Info</div>
      <div className="space-y-1">
        <div>
          <span className="text-gray-400">Frontend:</span>{" "}
          <span className="text-blue-300">{apiInfo.hostname}</span>
        </div>
        <div>
          <span className="text-gray-400">API URL:</span>{" "}
          <span className="text-yellow-300">{apiInfo.detectedApiUrl}</span>
        </div>
        <div>
          <span className="text-gray-400">Source:</span>{" "}
          <span className="text-purple-300">
            {apiInfo.envApiUrl ? "ENV Variable" : "Auto-detected"}
          </span>
        </div>
        <div>
          <span className="text-gray-400">Access Type:</span>{" "}
          <span
            className={
              apiInfo.isNetworkAccess ? "text-green-300" : "text-blue-300"
            }
          >
            {apiInfo.isNetworkAccess ? "📱 Network (Mobile)" : "💻 Localhost"}
          </span>
        </div>
      </div>
      <div className="mt-2 pt-2 border-t border-gray-600 text-gray-400">
        Press F12 → Console for API logs
      </div>
    </div>
  );
}
