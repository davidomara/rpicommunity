import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { readPrivateFile } from "@/lib/storage";

export async function GET() {
  const session = await auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const doc = await prisma.governingDocument.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "desc" }
  });
  if (!doc) return new Response("Not found", { status: 404 });

  const file = await readPrivateFile(doc.storagePath);
  return new Response(file, {
    status: 200,
    headers: {
      "Content-Type": doc.mimeType,
      "Content-Disposition": `inline; filename="${doc.originalName}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Accept-Ranges": "none"
    }
  });
}
