import QRCode from "qrcode";

export interface QRCodeOptions {
  size?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

export async function generateQRCode(
  text: string, 
  options: QRCodeOptions = {}
): Promise<string> {
  const {
    size = 256,
    margin = 4,
    color = {
      dark: "#000000",
      light: "#FFFFFF"
    }
  } = options;

  try {
    const qrCodeDataURL = await QRCode.toDataURL(text, {
      width: size,
      margin,
      color,
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      rendererOpts: {
        quality: 0.92
      }
    });

    return qrCodeDataURL;
  } catch (error) {
    throw new Error(`Error generando código QR: ${error}`);
  }
}

export async function generateQRCodeForExperience(
  experienceId: string,
  baseUrl?: string
): Promise<string> {
  const url = baseUrl || (typeof window !== "undefined" ? window.location.origin : "");
  const arUrl = `${url}/ar/${experienceId}`;
  
  return generateQRCode(arUrl, {
    size: 256,
    color: {
      dark: "#1e293b", // slate-800
      light: "#f8fafc"  // slate-50
    }
  });
}

export function downloadQRCode(dataUrl: string, filename: string = "qr-code.png") {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}