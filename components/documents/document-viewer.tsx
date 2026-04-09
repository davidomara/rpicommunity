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
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 sm:hidden">
        <p className="text-sm font-medium text-slate-900">Open Document</p>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          Mobile browsers can drop inline PDF previews after reload. Open the document directly for a stable view.
        </p>
        <a
          href={src}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex h-10 items-center justify-center rounded-md bg-[#2f5f93] px-4 text-sm font-medium text-white transition-colors hover:bg-[#274f79]"
        >
          Open full document
        </a>
      </div>
      <div className="hidden rounded-lg border bg-white sm:block">
        <iframe
          src={src}
          title={title}
          className="h-[72vh] w-full rounded-lg border-0 bg-white"
        />
      </div>
      <a
        href={src}
        target="_blank"
        rel="noreferrer"
        className="hidden text-sm font-medium text-cyan-700 hover:text-cyan-800 sm:inline-flex"
      >
        Open full document
      </a>
    </div>
  );
}
