"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { canManageProtectedDocuments } from "@/lib/rbac";
import { storePrivateFile } from "@/lib/storage";
import { revalidatePath } from "next/cache";

const MAX_BYTES = 8 * 1024 * 1024;

export async function uploadBankStatementAction(formData: FormData) {
  const session = await auth();
  if (!session?.user || !canManageProtectedDocuments(session.user.role)) {
    throw new Error("Unauthorized");
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    throw new Error("File is required");
  }

  if (file.size > MAX_BYTES) {
    throw new Error("File exceeds 8MB limit");
  }

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
