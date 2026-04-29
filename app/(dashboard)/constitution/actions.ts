"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { deriveDocumentTitleFromFilename } from "@/lib/document-title";
import { canDeleteGoverningDocuments, getCurrentUserAuthorization, hasPermission } from "@/lib/rbac";
import { deletePrivateFile, storePrivateFile } from "@/lib/storage";
import { protectedDocumentUploadSchema } from "@/lib/validators/uploads";
import { revalidatePath } from "next/cache";
import type { ProtectedUploadFormState } from "../bank-statements/actions";

function isMissingFileError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT";
}

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
      title: deriveDocumentTitleFromFilename(file.name),
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

export async function deleteConstitutionAction(
  _: ProtectedUploadFormState,
  formData: FormData
): Promise<ProtectedUploadFormState> {
  const session = await auth();
  const authorization = await getCurrentUserAuthorization();
  if (!session?.user || !authorization || !canDeleteGoverningDocuments(authorization)) {
    return { success: false, error: "Unauthorized", message: "" };
  }

  const documentId = String(formData.get("documentId") || "").trim();
  if (!documentId) {
    return { success: false, error: "Select a document to delete.", message: "" };
  }

  try {
    const deletedDocument = await prisma.$transaction(async (tx) => {
      const document = await tx.governingDocument.findUnique({
        where: { id: documentId },
        select: { id: true, storagePath: true }
      });

      if (!document) return null;

      await tx.governingDocument.delete({
        where: { id: document.id }
      });

      const activeDocument = await tx.governingDocument.findFirst({
        where: { isActive: true },
        select: { id: true }
      });

      if (!activeDocument) {
        const nextDocument = await tx.governingDocument.findFirst({
          orderBy: { createdAt: "desc" },
          select: { id: true }
        });

        if (nextDocument) {
          await tx.governingDocument.update({
            where: { id: nextDocument.id },
            data: { isActive: true }
          });
        }
      }

      return document;
    });

    if (!deletedDocument) {
      return { success: false, error: "Document was not found.", message: "" };
    }

    try {
      await deletePrivateFile(deletedDocument.storagePath);
    } catch (error) {
      if (!isMissingFileError(error)) {
        console.error("Failed to delete governing document file.", error);
      }
    }

    revalidatePath("/constitution");
    return {
      success: true,
      error: "",
      message: "Document deleted successfully."
    };
  } catch {
    return { success: false, error: "Document could not be deleted.", message: "" };
  }
}
