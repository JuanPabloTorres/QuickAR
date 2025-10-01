import QRCode from "qrcode";

export interface QRCodeOptions {
  size?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
}

export class QRCodeGenerator {
  private static readonly DEFAULT_OPTIONS: QRCodeOptions = {
    size: 256,
    margin: 4,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
    errorCorrectionLevel: "M",
  };

  /**
   * Generate a QR code as a data URL
   */
  static async generateDataURL(
    text: string,
    options?: QRCodeOptions
  ): Promise<string> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };

    try {
      return await QRCode.toDataURL(text, {
        width: opts.size,
        margin: opts.margin,
        color: opts.color,
        errorCorrectionLevel: opts.errorCorrectionLevel,
      });
    } catch (error) {
      console.error("Error generating QR code:", error);
      throw new Error("Failed to generate QR code");
    }
  }

  /**
   * Generate a QR code as an SVG string
   */
  static async generateSVG(
    text: string,
    options?: QRCodeOptions
  ): Promise<string> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };

    try {
      return await QRCode.toString(text, {
        type: "svg",
        width: opts.size,
        margin: opts.margin,
        color: opts.color,
        errorCorrectionLevel: opts.errorCorrectionLevel,
      });
    } catch (error) {
      console.error("Error generating QR code SVG:", error);
      throw new Error("Failed to generate QR code SVG");
    }
  }

  /**
   * Generate QR code for an experience
   */
  static async generateExperienceQR(
    slug: string,
    baseUrl: string = process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000",
    options?: QRCodeOptions
  ): Promise<string> {
    const url = `${baseUrl}/x/${slug}`;
    return this.generateDataURL(url, options);
  }

  /**
   * Generate QR code SVG for an experience
   */
  static async generateExperienceQRSVG(
    slug: string,
    baseUrl: string = process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000",
    options?: QRCodeOptions
  ): Promise<string> {
    const url = `${baseUrl}/x/${slug}`;
    return this.generateSVG(url, options);
  }

  /**
   * Download QR code as image
   */
  static async downloadQR(
    text: string,
    filename: string = "qrcode.png",
    options?: QRCodeOptions
  ): Promise<void> {
    try {
      const dataUrl = await this.generateDataURL(text, options);

      // Create a temporary link element
      const link = document.createElement("a");
      link.download = filename;
      link.href = dataUrl;

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading QR code:", error);
      throw new Error("Failed to download QR code");
    }
  }
}

// Helper functions for common use cases
export const generateExperienceQR = (slug: string, options?: QRCodeOptions) =>
  QRCodeGenerator.generateExperienceQR(slug, undefined, options);

export const generateExperienceQRSVG = (
  slug: string,
  options?: QRCodeOptions
) => QRCodeGenerator.generateExperienceQRSVG(slug, undefined, options);

export const downloadExperienceQR = (
  slug: string,
  filename?: string,
  options?: QRCodeOptions
) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const url = `${baseUrl}/x/${slug}`;
  const finalFilename = filename || `${slug}-qr.png`;
  return QRCodeGenerator.downloadQR(url, finalFilename, options);
};
