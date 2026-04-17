import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";

function readEnvValue(contents: string, key: string) {
  const lines = contents.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const currentKey = trimmed.slice(0, separatorIndex).trim();
    if (currentKey !== key) continue;

    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    if (
      (rawValue.startsWith("\"") && rawValue.endsWith("\"")) ||
      (rawValue.startsWith("'") && rawValue.endsWith("'"))
    ) {
      return rawValue.slice(1, -1);
    }

    return rawValue;
  }

  return undefined;
}

function resolveDatabaseUrl() {
  const { loadedEnvFiles } = loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production", console, true);

  for (const envFile of loadedEnvFiles) {
    const value = readEnvValue(envFile.contents, "DATABASE_URL");
    if (value) {
      return value;
    }
  }

  return process.env.DATABASE_URL;
}

const datasourceUrl = resolveDatabaseUrl();

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  global.__prisma ||
  new PrismaClient(
    datasourceUrl
      ? {
          datasourceUrl
        }
      : undefined
  );

if (process.env.NODE_ENV !== "production") {
  global.__prisma = prisma;
}
