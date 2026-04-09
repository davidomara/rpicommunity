import { createReadStream } from "node:fs";
import { mkdir, writeFile, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { Readable } from "node:stream";

const uploadRoot = process.env.UPLOAD_ROOT || path.join(process.cwd(), "storage/private");
const normalizedUploadRoot = path.resolve(uploadRoot);

function resolveStoragePath(storagePath: string) {
  if (path.isAbsolute(storagePath)) {
    return storagePath;
  }

  const resolved = path.resolve(normalizedUploadRoot, storagePath);
  const relativeToRoot = path.relative(normalizedUploadRoot, resolved);
  if (relativeToRoot.startsWith("..") || path.isAbsolute(relativeToRoot)) {
    throw new Error("Invalid storage path");
  }

  return resolved;
}

export async function storePrivateFile(params: {
  folder: string;
  filename: string;
  bytes: Buffer;
}) {
  const safeName = params.filename.replace(/[^a-zA-Z0-9._-]/g, "-");
  const dir = path.join(normalizedUploadRoot, params.folder);
  await mkdir(dir, { recursive: true });
  const stored = `${Date.now()}-${randomUUID()}-${safeName}`;
  const relativePath = path.join(params.folder, stored);
  const fullPath = path.join(normalizedUploadRoot, relativePath);
  await writeFile(fullPath, params.bytes);
  return { storagePath: relativePath, filename: stored };
}

export async function readPrivateFile(storagePath: string) {
  return readFile(resolveStoragePath(storagePath));
}

export async function getPrivateFileSize(storagePath: string) {
  const info = await stat(resolveStoragePath(storagePath));
  return info.size;
}

export async function getPrivateFileStat(storagePath: string) {
  return stat(resolveStoragePath(storagePath));
}

export function streamPrivateFile(storagePath: string, start?: number, end?: number) {
  return Readable.toWeb(createReadStream(resolveStoragePath(storagePath), { start, end })) as ReadableStream;
}
