"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/rbac";
import { storePrivateFile } from "@/lib/storage";
import { revalidatePath } from "next/cache";

const MAX_BYTES = 8 * 1024 * 1024;

export async function uploadConstitutionAction(formData: FormData) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) {
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
