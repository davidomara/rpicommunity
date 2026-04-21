"use client";

import { useEffect, useMemo, useState } from "react";
import { DocumentViewer } from "@/components/documents/document-viewer";
import { cn, formatDate } from "@/lib/utils";

export type TabbedDocument = {
  id: string;
  title: string;
  src: string;
  mimeType: string;
  originalName?: string;
  createdAt?: string;
  isActive?: boolean;
};

type TabbedDocumentViewerProps = {
  documents: TabbedDocument[];
  ariaLabel?: string;
  emptyMessage?: string;
  defaultDocumentId?: string;
};

export function TabbedDocumentViewer({
  documents,
  ariaLabel = "Documents",
  emptyMessage = "No documents are available yet.",
  defaultDocumentId
}: TabbedDocumentViewerProps) {
  const firstDocumentId = documents[0]?.id;
  const preferredDocumentId =
    defaultDocumentId || documents.find((document) => document.isActive)?.id || firstDocumentId;
  const [activeDocumentId, setActiveDocumentId] = useState<string | undefined>(preferredDocumentId);

  useEffect(() => {
    setActiveDocumentId(preferredDocumentId);
  }, [preferredDocumentId]);

  useEffect(() => {
    if (!documents.some((document) => document.id === activeDocumentId)) {
      setActiveDocumentId(preferredDocumentId);
    }
  }, [activeDocumentId, documents, preferredDocumentId]);

  const activeDocument = useMemo(
    () => documents.find((document) => document.id === activeDocumentId) || documents[0],
    [activeDocumentId, documents]
  );

  if (!documents.length) {
    return <p className="text-sm text-slate-500">{emptyMessage}</p>;
  }

  if (!activeDocument) {
    return <p className="text-sm text-slate-500">The selected document is no longer available.</p>;
  }

  const duplicateTitleCount = documents.filter((document) => document.title === activeDocument.title).length;

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label={ariaLabel}>
          {documents.map((document) => {
            const active = document.id === activeDocument.id;
            const meta = document.isActive ? "Current" : document.createdAt ? formatDate(document.createdAt) : undefined;
            const showOriginalName = document.originalName && document.originalName !== document.title;

            return (
              <button
                key={document.id}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls={`document-panel-${document.id}`}
                id={`document-tab-${document.id}`}
                onClick={() => setActiveDocumentId(document.id)}
                className={cn(
                  "rounded-full border px-4 py-2 text-left text-sm font-medium transition",
                  active
                    ? "border-cyan-300 bg-cyan-50 text-cyan-950"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                )}
              >
                <span className="block">{document.title}</span>
                {meta || showOriginalName ? (
                  <span className={cn("mt-1 block text-xs", active ? "text-cyan-800" : "text-slate-500")}>
                    {[meta, showOriginalName ? document.originalName : undefined].filter(Boolean).join(" • ")}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <span className="font-medium text-slate-700">{activeDocument.title}</span>
          {activeDocument.isActive ? (
            <span className="rounded-full bg-cyan-50 px-2 py-0.5 text-xs font-medium text-cyan-800">Current</span>
          ) : null}
          {activeDocument.createdAt ? <span>Uploaded {formatDate(activeDocument.createdAt)}</span> : null}
          {duplicateTitleCount > 1 && activeDocument.originalName && activeDocument.originalName !== activeDocument.title ? (
            <span>{activeDocument.originalName}</span>
          ) : null}
        </div>
      </div>

      <div
        role="tabpanel"
        id={`document-panel-${activeDocument.id}`}
        aria-labelledby={`document-tab-${activeDocument.id}`}
      >
        <DocumentViewer src={activeDocument.src} mimeType={activeDocument.mimeType} title={activeDocument.title} />
      </div>
    </div>
  );
}
