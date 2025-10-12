"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Loader } from "@/components/ui/loader";
import { QRCodeGenerator, QRCodeOptions } from "@/lib/qr-code";
import React, { useEffect, useState } from "react";
import "../styles/qr-code.css";

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
    <Card variant="glass" className={className}>
      {title && (
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2">
            <Icon name="qr" size="lg" className="text-brand-400" />
            <span>{title}</span>
          </CardTitle>
        </CardHeader>
      )}

      <CardContent>
        <div className={`qr-container ${getSizeClass(size)}`}>
          {loading ? (
            <div className="qr-loading-container flex items-center justify-center p-8">
              <Loader size="lg" variant="brand" />
            </div>
          ) : error ? (
            <div className="qr-error-container">
              <div className="flex items-center justify-center space-x-2 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <Icon name="warning" size="md" className="text-red-400" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            </div>
          ) : (
            <div className="qr-image-container">
              <img
                src={qrDataUrl}
                alt="QR Code"
                className="qr-image rounded-lg"
              />
            </div>
          )}

          {/* URL Display */}
          <div className="qr-url-container mt-4">
            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <p className="qr-url-text text-xs text-muted-foreground break-all">
                {text}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="qr-actions mt-4 flex flex-wrap gap-2 justify-center">
            {showDownload && !loading && !error && (
              <Button
                onClick={handleDownload}
                variant="outline"
                size="sm"
                className="hover:shadow-neon-sm transition-all duration-300"
              >
                <Icon name="upload" size="sm" className="mr-2" />
                Descargar
              </Button>
            )}

            <Button
              onClick={handleCopyUrl}
              variant="ghost"
              size="sm"
              className="hover:shadow-neon-sm transition-all duration-300"
            >
              <Icon name="qr" size="sm" className="mr-2" />
              Copiar URL
            </Button>
          </div>
        </div>
      </CardContent>
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
