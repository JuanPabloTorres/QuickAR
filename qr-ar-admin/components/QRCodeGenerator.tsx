"use client";

import { getEnvironmentInfo, getExperienceUrl } from "@/lib/assets";
import { ExperienceDto } from "@/types";
import { useEffect, useState } from "react";

interface QRCodeGeneratorProps {
  experience: ExperienceDto;
  size?: number;
  className?: string;
}

export default function QRCodeGenerator({
  experience,
  size = 200,
  className = "",
}: QRCodeGeneratorProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [experienceUrl, setExperienceUrl] = useState<string>("");
  const [environment, setEnvironment] = useState<any>(null);

  useEffect(() => {
    const env = getEnvironmentInfo();
    setEnvironment(env);

    const expUrl = getExperienceUrl(experience.slug);
    setExperienceUrl(expUrl);

    // Generar QR usando servicio público (pueden usar otros servicios)
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(
      expUrl
    )}`;
    setQrCodeUrl(qrUrl);
  }, [experience.slug, size]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(experienceUrl);
      // Aquí puedes agregar notificación de éxito
    } catch (err) {
      console.error("Error copiando URL:", err);
    }
  };

  if (!qrCodeUrl) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}
        style={{ width: size, height: size }}
      >
        <div className="text-gray-500 text-sm">Generando QR...</div>
      </div>
    );
  }

  return (
    <div className={`qr-code-container ${className}`}>
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <div className="text-center mb-3">
          <h3 className="text-lg font-semibold text-gray-800">
            {experience.title}
          </h3>
          <p className="text-sm text-gray-600">Escanea para ver en AR</p>
        </div>

        <div className="flex justify-center mb-3">
          <img
            src={qrCodeUrl}
            alt={`QR Code para ${experience.title}`}
            width={size}
            height={size}
            className="border border-gray-200 rounded"
          />
        </div>

        <div className="text-center space-y-2">
          <div className="text-xs text-gray-500 break-all">{experienceUrl}</div>

          <button
            onClick={copyToClipboard}
            className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
          >
            Copiar URL
          </button>

          {environment && (
            <div className="text-xs text-gray-400">
              Entorno: {environment.isNetwork ? "Red Local" : "Localhost"}(
              {environment.hostname})
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Hook para usar información del entorno
export function useEnvironmentInfo() {
  const [environment, setEnvironment] = useState<any>(null);

  useEffect(() => {
    const env = getEnvironmentInfo();
    setEnvironment(env);
  }, []);

  return environment;
}

// Hook para generar URLs de experiencias
export function useExperienceUrl(slug: string) {
  const [url, setUrl] = useState<string>("");

  useEffect(() => {
    if (slug) {
      const expUrl = getExperienceUrl(slug);
      setUrl(expUrl);
    }
  }, [slug]);

  return url;
}
