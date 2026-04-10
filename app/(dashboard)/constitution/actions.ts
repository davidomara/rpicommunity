"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { canManageProtectedDocuments } from "@/lib/rbac";
import { storePrivateFile } from "@/lib/storage";
import { protectedDocumentUploadSchema } from "@/lib/validators/uploads";
import { revalidatePath } from "next/cache";

export async function uploadConstitutionAction(formData: FormData) {
  const session = await auth();
  if (!session?.user || !canManageProtectedDocuments(session.user.role)) {
    throw new Error("Unauthorized");
  }

  const parsed = protectedDocumentUploadSchema.safeParse({
    file: formData.get("file")
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Invalid file");
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
      storagePath: stored.storagePath,
      isActive: true,
      uploadedById: session.user.id,
    },
  });

  revalidatePath("/constitution");
}
