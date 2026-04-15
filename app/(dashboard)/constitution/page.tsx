import { auth } from "@/auth";
import { withBasePath } from "@/lib/app-path";
import { redirect } from "next/navigation";
import { getActiveConstitution } from "@/lib/queries";
import { canManageProtectedDocuments } from "@/lib/rbac";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentViewer } from "@/components/documents/document-viewer";
import { uploadConstitutionAction } from "./actions";
import { ProtectedUploadForm } from "@/components/forms/protected-upload-form";

export default async function ConstitutionPage() {
  const session = await auth();
  if (!session?.user) redirect(withBasePath("/login"));

  const doc = await getActiveConstitution();
  const canUpload = canManageProtectedDocuments(session.user.role);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-cyan-700">Protected Governance Document</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Community Constitution</h1>
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
        <CardHeader><CardTitle>Current Governing Document</CardTitle></CardHeader>
        <CardContent>
          {doc ? (
            <DocumentViewer src={`/api/documents/constitution?docId=${doc.id}`} mimeType={doc.mimeType} title={doc.title} />
          ) : (
            <p className="text-sm text-slate-500">No constitution or guidelines document has been uploaded yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
