import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { withBasePath } from "@/lib/app-path";
import { getGoverningDocumentDisplayTitle } from "@/lib/document-title";
import { getGoverningDocuments } from "@/lib/queries";
import { getUserAuthorization, hasPermission } from "@/lib/rbac";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabbedDocumentViewer } from "@/components/documents/tabbed-document-viewer";
import { uploadConstitutionAction } from "./actions";
import { ProtectedUploadForm } from "@/components/forms/protected-upload-form";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ConstitutionPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const authorization = await getUserAuthorization(session.user.id);
  if (!authorization || !hasPermission(authorization, "constitution.view")) redirect("/dashboard");

  const documents = await getGoverningDocuments();
  const canUpload = hasPermission(authorization, "constitution.manage");

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-cyan-700">Protected Governance Documents</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Governing Documents</h1>
      </div>
      {canUpload ? (
        <Card>
          <CardHeader><CardTitle>Upload Active Constitution</CardTitle></CardHeader>
          <CardContent>
            <ProtectedUploadForm
              action={uploadConstitutionAction}
              submitLabel="Upload Constitution"
              pendingLabel="Uploading..."
              hint="Uploading a new file automatically marks the previous governing document as inactive."
            />
          </CardContent>
        </Card>
      ) : null}
      <Card>
        <CardHeader><CardTitle>Governing Documents Library</CardTitle></CardHeader>
        <CardContent>
          <TabbedDocumentViewer
            ariaLabel="Governing documents"
            emptyMessage="No constitution or guidelines document has been uploaded yet."
            documents={documents.map((document) => ({
              id: document.id,
              title: getGoverningDocumentDisplayTitle({
                title: document.title,
                originalName: document.originalName
              }),
              originalName: document.originalName,
              mimeType: document.mimeType,
              src: withBasePath(`/api/documents/constitution?docId=${document.id}`),
              createdAt: document.createdAt.toISOString(),
              isActive: document.isActive
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
