import { z } from "zod";

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const allowedMimeTypes = new Set(["application/pdf"]);

export const protectedDocumentUploadSchema = z.object({
  file: z
    .instanceof(File, { message: "File is required" })
    .refine((file) => file.size > 0, "File is required")
    .refine((file) => file.size <= MAX_UPLOAD_BYTES, "File exceeds 8MB limit")
    .refine(
      (file) => file.type.startsWith("image/") || allowedMimeTypes.has(file.type),
      "Only PDF or image files are allowed"
    )
});
