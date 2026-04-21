"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getCurrentUserAuthorization, hasPermission } from "@/lib/rbac";
import { storePrivateFile } from "@/lib/storage";
import { protectedDocumentUploadSchema } from "@/lib/validators/uploads";
import { revalidatePath } from "next/cache";
import type { ProtectedUploadFormState } from "../bank-statements/actions";

export async function uploadConstitutionAction(
  _: ProtectedUploadFormState,
  formData: FormData
): Promise<ProtectedUploadFormState> {
  const session = await auth();
  const authorization = await getCurrentUserAuthorization();
  if (!session?.user || !authorization || !hasPermission(authorization, "constitution.manage")) {
    return { success: false, error: "Unauthorized", message: "" };
  }

  const parsed = protectedDocumentUploadSchema.safeParse({
    file: formData.get("file")
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid file", message: "" };
  }
  const file = parsed.data.file;

  const buffer = Buffer.from(await file.arrayBuffer());
  const stored = await storePrivateFile({
    folder: "documents",
    filename: file.name,
    bytes: buffer,
  });

  await prisma.governingDocument.updateMany({
    where: { isActive: true },
    data: { isActive: false },
  });

  await prisma.governingDocument.create({
    data: {
      title: "RPIC Community Constitution",
      filename: stored.filename,
      originalName: file.name,
      mimeType: file.type || "application/octet-stream",
      sizeBytes: file.size,
      storagePath: stored.storagePath,
      data: buffer,
      isActive: true,
      uploadedById: session.user.id,
    },
  });

  revalidatePath("/constitution");
  return {
    success: true,
    error: "",
    message: "Constitution uploaded successfully."
  };
}
