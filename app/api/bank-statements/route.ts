import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/rbac";
import { storePrivateFile } from "@/lib/storage";
import { NextResponse } from "next/server";

const MAX_BYTES = 8 * 1024 * 1024;

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const latest = await prisma.bankStatement.findFirst({ orderBy: { createdAt: "desc" } });
  if (!latest) return NextResponse.json({}, { status: 204 });
  return NextResponse.json(latest);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File exceeds 8MB limit" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const stored = await storePrivateFile({ folder: "bank-statements", filename: file.name, bytes: buffer });
  const statementType = file.type === "application/pdf" ? "PDF" : "IMAGE";

  const row = await prisma.bankStatement.create({
    data: {
      filename: stored.filename,
      originalName: file.name,
      mimeType: file.type || (statementType === "PDF" ? "application/pdf" : "image/jpeg"),
      sizeBytes: file.size,
      storagePath: stored.storagePath,
      statementType,
      uploadedById: session.user.id
    }
  });

  return NextResponse.json(row, { status: 201 });
}
