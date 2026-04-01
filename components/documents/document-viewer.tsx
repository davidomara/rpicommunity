export function DocumentViewer({ src, mimeType, title }: { src: string; mimeType: string; title: string }) {
  if (mimeType.startsWith("image/")) {
    return <img src={src} alt={title} className="w-full rounded-lg border bg-white object-contain" />;
  }

  return <iframe src={src} title={title} className="h-[75vh] w-full rounded-lg border bg-white" />;
}
