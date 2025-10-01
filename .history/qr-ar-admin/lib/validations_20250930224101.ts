import { z } from "zod";
import { AssetKind } from "@/types";

// Asset validation schemas
export const assetCreateSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(200, "El nombre no puede exceder 200 caracteres"),
  kind: z.enum(["message", "video", "image", "model3d"] as const),
  url: z.string().url("URL inválida").optional().nullable(),
  mimeType: z.string().optional().nullable(),
  fileSizeBytes: z.number().min(0).optional().nullable(),
  text: z
    .string()
    .max(2000, "El texto no puede exceder 2000 caracteres")
    .optional()
    .nullable(),
});

// Experience validation schemas
export const experienceCreateSchema = z.object({
  title: z
    .string()
    .min(1, "El título es requerido")
    .max(200, "El título no puede exceder 200 caracteres"),
  slug: z.string().optional().nullable(),
  description: z
    .string()
    .max(1000, "La descripción no puede exceder 1000 caracteres")
    .optional()
    .nullable(),
  assets: z.array(assetCreateSchema).optional().nullable(),
});

export const experienceUpdateSchema = z.object({
  title: z
    .string()
    .min(1, "El título es requerido")
    .max(200, "El título no puede exceder 200 caracteres"),
  slug: z.string().optional().nullable(),
  description: z
    .string()
    .max(1000, "La descripción no puede exceder 1000 caracteres")
    .optional()
    .nullable(),
  isActive: z.boolean(),
  assets: z.array(assetCreateSchema).optional().nullable(),
});

// Form schemas for client-side validation
export const experienceFormSchema = z.object({
  title: z
    .string()
    .min(1, "El título es requerido")
    .max(200, "El título no puede exceder 200 caracteres"),
  slug: z.string().optional(),
  description: z
    .string()
    .max(1000, "La descripción no puede exceder 1000 caracteres")
    .optional(),
  isActive: z.boolean(),
  assets: z.array(
    z.object({
      id: z.string().optional(),
      name: z
        .string()
        .min(1, "El nombre es requerido")
        .max(200, "El nombre no puede exceder 200 caracteres"),
      kind: z.enum(["message", "video", "image", "model3d"] as const),
      url: z.string().optional(),
      mimeType: z.string().optional(),
      fileSizeBytes: z.number().optional(),
      text: z
        .string()
        .max(2000, "El texto no puede exceder 2000 caracteres")
        .optional(),
    })
  ),
});

export type ExperienceFormData = z.infer<typeof experienceFormSchema>;
export type AssetFormData = z.infer<typeof experienceFormSchema>["assets"][0];

// Analytics validation
export const analyticsEventSchema = z.object({
  eventType: z.string().min(1, "El tipo de evento es requerido"),
  experienceId: z.string().uuid("ID de experiencia inválido"),
  userAgent: z.string().optional().nullable(),
  ipAddress: z.string().optional().nullable(),
  referrer: z.string().optional().nullable(),
  additionalData: z.string().optional().nullable(),
});

// File validation helpers
export const validateAssetFile = (
  file: File,
  assetKind: AssetKind
): string | null => {
  const mimeTypeMap: Record<AssetKind, string[]> = {
    model3d: [
      "model/gltf-binary",
      "model/gltf+json",
      "application/octet-stream",
    ],
    image: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    video: ["video/mp4", "video/webm", "video/ogg"],
    message: [], // No files for message assets
  };

  const maxSizeMap: Record<AssetKind, number> = {
    model3d: 50 * 1024 * 1024, // 50MB
    image: 10 * 1024 * 1024, // 10MB
    video: 100 * 1024 * 1024, // 100MB
    message: 0, // No files for message assets
  };

  const allowedTypes = mimeTypeMap[assetKind];
  const maxSize = maxSizeMap[assetKind];

  if (!allowedTypes.includes(file.type)) {
    return `Tipo de archivo no válido. Tipos permitidos: ${allowedTypes.join(
      ", "
    )}`;
  }

  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    return `El archivo es demasiado grande. Tamaño máximo: ${maxSizeMB}MB`;
  }

  return null; // Valid file
};
