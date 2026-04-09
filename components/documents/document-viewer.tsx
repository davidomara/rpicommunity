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
        <object
          data={src}
          type={mimeType}
          aria-label={title}
          className="h-[72vh] w-full rounded-lg bg-white sm:h-[78vh]"
        >
          <div className="flex h-full min-h-[320px] items-center justify-center p-6 text-center">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-900">Document preview unavailable.</p>
              <p className="text-sm leading-6 text-slate-500">
                Your browser could not display this document inline. Open it directly instead.
              </p>
              <a
                href={src}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center justify-center rounded-md bg-[#2f5f93] px-4 text-sm font-medium text-white transition-colors hover:bg-[#274f79]"
              >
                Open full document
              </a>
            </div>
          </div>
        </object>
      </div>
      <a href={src} target="_blank" rel="noreferrer" className="inline-flex text-sm font-medium text-cyan-700 hover:text-cyan-800">
        Open full document
      </a>
    </div>
  );
}
