import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getPrivateFileStat, streamPrivateFile } from "@/lib/storage";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const { searchParams } = new URL(request.url);
  const docId = searchParams.get("docId");

  const doc = docId
    ? await prisma.governingDocument.findUnique({ where: { id: docId } })
    : await prisma.governingDocument.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: "desc" }
      });
  if (!doc) return new Response("Not found", { status: 404 });

  try {
    const info = await getPrivateFileStat(doc.storagePath);
    const range = request.headers.get("range");
    const headers = new Headers({
      "Content-Type": doc.mimeType,
      "Content-Disposition": `inline; filename="${doc.originalName}"`,
      "Cache-Control": "private, max-age=60, stale-while-revalidate=300",
      "X-Content-Type-Options": "nosniff",
      "Accept-Ranges": "bytes"
    });

    if (range) {
      const match = /bytes=(\d*)-(\d*)/.exec(range);
      if (!match) {
        return new Response("Invalid range", { status: 416, headers });
      }

      const start = match[1] ? Number(match[1]) : 0;
      const end = match[2] ? Number(match[2]) : info.size - 1;

      if (Number.isNaN(start) || Number.isNaN(end) || start > end || start >= info.size) {
        headers.set("Content-Range", `bytes */${info.size}`);
        return new Response("Requested range not satisfiable", { status: 416, headers });
      }

      const boundedEnd = Math.min(end, info.size - 1);
      headers.set("Content-Range", `bytes ${start}-${boundedEnd}/${info.size}`);
      headers.set("Content-Length", String(boundedEnd - start + 1));

      return new Response(streamPrivateFile(doc.storagePath, start, boundedEnd), {
        status: 206,
        headers
      });
    }

    headers.set("Content-Length", String(info.size));

    return new Response(streamPrivateFile(doc.storagePath), {
      status: 200,
      headers
    });
  } catch {
    return new Response("Stored file is missing. Re-upload the document.", { status: 404 });
  }
}
