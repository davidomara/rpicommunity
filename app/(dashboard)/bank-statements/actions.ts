"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getCurrentUserAuthorization, hasPermission } from "@/lib/rbac";
import { storePrivateFile } from "@/lib/storage";
import { protectedDocumentUploadSchema } from "@/lib/validators/uploads";
import { revalidatePath } from "next/cache";

export type ProtectedUploadFormState = {
  success: boolean;
  error: string;
  message: string;
};

export async function uploadBankStatementAction(
  _: ProtectedUploadFormState,
  formData: FormData
): Promise<ProtectedUploadFormState> {
  const session = await auth();
  const authorization = await getCurrentUserAuthorization();
  if (!session?.user || !authorization || !hasPermission(authorization, "bank_statements.manage")) {
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
      data: buffer,
      statementType: file.type === "application/pdf" ? "PDF" : "IMAGE",
      uploadedById: session.user.id,
    },
  });

  revalidatePath("/bank-statements");
  return {
    success: true,
    error: "",
    message: "Bank statement uploaded successfully."
  };
}
