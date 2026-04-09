export function DocumentViewer({ src, mimeType, title }: { src: string; mimeType: string; title: string }) {
  if (mimeType.startsWith("image/")) {
    return (
      <div className="space-y-3">
        <div className="scroll-x rounded-lg border bg-white">
          <img src={src} alt={title} className="min-w-[640px] w-full rounded-lg bg-white object-contain sm:min-w-0" />
        </div>
        <a
          href={src}
          target="_blank"
          rel="noreferrer"
          className="inline-flex text-sm font-medium text-cyan-700 hover:text-cyan-800"
        >
          Open full image
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg border bg-white">
        <iframe
          src={src}
          title={title}
          className="h-[72vh] w-full rounded-lg border-0 bg-white sm:h-[78vh]"
        />
      </div>
    </div>
  );
}
