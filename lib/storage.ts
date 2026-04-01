import { mkdir, writeFile, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const uploadRoot = process.env.UPLOAD_ROOT || path.join(process.cwd(), "storage/private");

export async function storePrivateFile(params: {
  folder: string;
  filename: string;
  bytes: Buffer;
}) {
  const safeName = params.filename.replace(/[^a-zA-Z0-9._-]/g, "-");
  const dir = path.join(uploadRoot, params.folder);
  await mkdir(dir, { recursive: true });
  const stored = `${Date.now()}-${randomUUID()}-${safeName}`;
  const fullPath = path.join(dir, stored);
  await writeFile(fullPath, params.bytes);
  return { storagePath: fullPath, filename: stored };
}

export async function readPrivateFile(storagePath: string) {
  return readFile(storagePath);
}

export async function getPrivateFileSize(storagePath: string) {
  const info = await stat(storagePath);
  return info.size;
}
