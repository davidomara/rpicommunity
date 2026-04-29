const GENERIC_GOVERNING_DOCUMENT_TITLE = "RPIC Community Constitution";
const FALLBACK_DOCUMENT_TITLE = "Untitled document";

export function deriveDocumentTitleFromFilename(filename: string | null | undefined) {
  const rawName = filename?.split(/[\\/]/).pop()?.trim();
  if (!rawName) return FALLBACK_DOCUMENT_TITLE;

  const withoutExtension = rawName.replace(/\.[^.]+$/, "");
  const normalized = withoutExtension.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();

  return normalized || FALLBACK_DOCUMENT_TITLE;
}

export function getGoverningDocumentDisplayTitle({
  title,
  originalName
}: {
  title: string | null | undefined;
  originalName: string | null | undefined;
}) {
  const trimmedTitle = title?.trim();

  if (!trimmedTitle || trimmedTitle === GENERIC_GOVERNING_DOCUMENT_TITLE) {
    return deriveDocumentTitleFromFilename(originalName);
  }

  return trimmedTitle;
}
