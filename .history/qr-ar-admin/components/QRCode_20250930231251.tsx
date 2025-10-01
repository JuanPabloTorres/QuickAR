"use client";

import React, { useEffect, useState } from "react";
import { QRCodeGenerator, QRCodeOptions } from "@/lib/qr-code";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { Loader } from "@/components/ui/loader";
import "./qr-code.css";

interface QRCodeDisplayProps {
  text: string;
  size?: number;
  title?: string;
  showDownload?: boolean;
  downloadFilename?: string;
  className?: string;
  options?: QRCodeOptions;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  text,
  size = 256,
  title,
  showDownload = true,
  downloadFilename,
  className = "",
  options,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    generateQR();
  }, [text, size, options]);

  const generateQR = async () => {
    try {
      setLoading(true);
      setError(null);

      const dataUrl = await QRCodeGenerator.generateDataURL(text, {
        size,
        ...options,
      });

      setQrDataUrl(dataUrl);
    } catch (err) {
      setError("Error generating QR code");
      console.error("QR generation error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      await QRCodeGenerator.downloadQR(text, downloadFilename || "qrcode.png", {
        size,
        ...options,
      });
    } catch (err) {
      console.error("Download error:", err);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error("Copy error:", err);
    }
  };

  const getSizeClass = (size: number): string => {
    if (size <= 128) return "qr-size-128";
    if (size <= 192) return "qr-size-192";
    if (size <= 256) return "qr-size-256";
    if (size <= 320) return "qr-size-320";
    return "qr-size-384";
  };

  return (
    <Card className={`p-4 ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-white mb-4 text-center">
          {title}
        </h3>
      )}

      <div className={`qr-container ${getSizeClass(size)}`}>
        {loading ? (
          <div className="qr-loading-container">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white"></div>
          </div>
        ) : error ? (
          <div className="qr-error-container">
            <p className="text-red-600 text-sm text-center p-4">{error}</p>
          </div>
        ) : (
          <div className="qr-image-container">
            <img src={qrDataUrl} alt="QR Code" className="qr-image" />
          </div>
        )}

        {/* URL Display */}
        <div className="qr-url-container">
          <p className="qr-url-text">{text}</p>
        </div>

        {/* Action Buttons */}
        <div className="qr-actions">
          {showDownload && !loading && !error && (
            <Button onClick={handleDownload} variant="secondary" size="sm">
              📥 Descargar
            </Button>
          )}

          <Button onClick={handleCopyUrl} variant="secondary" size="sm">
            📋 Copiar URL
          </Button>
        </div>
      </div>
    </Card>
  );
};

interface ExperienceQRProps {
  slug: string;
  title?: string;
  size?: number;
  showDownload?: boolean;
  className?: string;
  options?: QRCodeOptions;
}

export const ExperienceQR: React.FC<ExperienceQRProps> = ({
  slug,
  title,
  size = 256,
  showDownload = true,
  className = "",
  options,
}) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const url = `${baseUrl}/x/${slug}`;

  return (
    <QRCodeDisplay
      text={url}
      size={size}
      title={title || `QR Code - ${slug}`}
      showDownload={showDownload}
      downloadFilename={`${slug}-qr.png`}
      className={className}
      options={options}
    />
  );
};
