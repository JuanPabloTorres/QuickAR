/**
 * Asset URL Debug Component
 * Temporary debug component to analyze and fix blob URLs
 */

"use client";

import {
  analyzeAssetURLs,
  checkUrlExists,
  logAssetAnalysis,
  URLAnalysis,
} from "@/lib/helpers/assetUrlAnalyzer";
import { useEffect, useState } from "react";

export default function AssetUrlDebugger() {
  const [analysis, setAnalysis] = useState<URLAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const runAnalysis = async () => {
    setIsLoading(true);
    try {
      const results = await analyzeAssetURLs();
      setAnalysis(results);

      // Also check which suggested URLs exist
      for (const item of results) {
        if (item.suggestedUrl) {
          item.exists = await checkUrlExists(item.suggestedUrl);
        }
      }

      setAnalysis([...results]);

      // Log to console
      await logAssetAnalysis();
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isVisible) {
      runAnalysis();
    }
  }, [isVisible]);

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded text-sm"
        >
          🔍 Debug URLs
        </button>
      </div>
    );
  }

  const blobUrls = analysis.filter((a) => a.isBlob);
  const validUrls = analysis.filter((a) => !a.isBlob && a.currentUrl);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-auto">
      <div className="min-h-full p-4">
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold">Asset URL Analysis</h2>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="p-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div>🔍 Analyzing asset URLs...</div>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-red-50 border border-red-200 rounded p-4">
                    <div className="text-2xl font-bold text-red-600">
                      {blobUrls.length}
                    </div>
                    <div className="text-sm text-red-800">
                      Blob URLs (problematic)
                    </div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded p-4">
                    <div className="text-2xl font-bold text-green-600">
                      {validUrls.length}
                    </div>
                    <div className="text-sm text-green-800">
                      Valid server URLs
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded p-4">
                    <div className="text-2xl font-bold text-blue-600">
                      {analysis.length}
                    </div>
                    <div className="text-sm text-blue-800">Total assets</div>
                  </div>
                </div>

                {blobUrls.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 text-red-600">
                      🔴 Problematic Blob URLs
                    </h3>
                    <div className="space-y-3">
                      {blobUrls.map((item) => (
                        <div
                          key={item.assetId}
                          className="border border-red-200 rounded p-3 bg-red-50"
                        >
                          <div className="font-medium">
                            {item.experienceTitle} → {item.assetName}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            <div>Type: {item.assetType}</div>
                            <div>Current: {item.currentUrl}</div>
                            {item.suggestedUrl && (
                              <div className="flex items-center gap-2">
                                <span>Suggested: {item.suggestedUrl}</span>
                                {item.exists !== undefined && (
                                  <span
                                    className={`text-xs px-2 py-1 rounded ${
                                      item.exists
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {item.exists ? "✓ Exists" : "✗ Not Found"}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={runAnalysis}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
                  >
                    🔄 Refresh Analysis
                  </button>
                  <button
                    onClick={() => {
                      const report = analysis
                        .map(
                          (item) =>
                            `${item.experienceTitle},${item.assetName},${
                              item.assetType
                            },${item.currentUrl},${item.isBlob ? "BLOB" : "OK"}`
                        )
                        .join("\n");

                      const blob = new Blob([report], { type: "text/csv" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "asset-url-analysis.csv";
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
                  >
                    📊 Export CSV
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
