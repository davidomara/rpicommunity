import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { readPrivateFile } from "@/lib/storage";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const row = await prisma.bankStatement.findUnique({ where: { id: params.id } });
  if (!row) return new Response("Not found", { status: 404 });

  const file = await readPrivateFile(row.storagePath);
  return new Response(file, {
    status: 200,
    headers: {
      "Content-Type": row.mimeType,
      "Content-Disposition": `inline; filename="${row.originalName}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Accept-Ranges": "none"
    }
  });
}
