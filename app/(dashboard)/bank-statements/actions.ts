"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { canManageProtectedDocuments } from "@/lib/rbac";
import { storePrivateFile } from "@/lib/storage";
import { protectedDocumentUploadSchema } from "@/lib/validators/uploads";
import { revalidatePath } from "next/cache";

export async function uploadBankStatementAction(formData: FormData) {
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
    folder: "bank-statements",
    filename: file.name,
    bytes: buffer,
  });

  await prisma.bankStatement.create({
    data: {
      filename: stored.filename,
      originalName: file.name,
      mimeType: file.type || "application/octet-stream",
      sizeBytes: file.size,
      storagePath: stored.storagePath,
      statementType: file.type === "application/pdf" ? "PDF" : "IMAGE",
      uploadedById: session.user.id,
    },
  });

  revalidatePath("/bank-statements");
}
