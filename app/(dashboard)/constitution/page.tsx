import { auth } from "@/auth";
import { getActiveConstitution } from "@/lib/queries";
import { isAdmin } from "@/lib/rbac";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentViewer } from "@/components/documents/document-viewer";
import { uploadConstitutionAction } from "./actions";
import { SubmitButton } from "@/components/forms/submit-button";

export default async function ConstitutionPage() {
  const session = await auth();
  if (!session?.user) return null;

  const doc = await getActiveConstitution();
  const canUpload = isAdmin(session.user.role);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-cyan-700">Protected Governance Document</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">Community Constitution</h1>
      </div>
      {canUpload ? (
        <Card>
          <CardHeader><CardTitle>Upload Active Constitution</CardTitle></CardHeader>
          <CardContent>
            <form action={uploadConstitutionAction} className="flex flex-col gap-4 md:flex-row md:items-center">
              <input type="file" name="file" accept=".pdf,image/*" required className="block text-sm" />
              <SubmitButton label="Upload Constitution" pendingLabel="Uploading..." />
            </form>
            <p className="mt-3 text-xs text-slate-500">Uploading a new file automatically marks the previous governing document as inactive.</p>
          </CardContent>
        </Card>
      ) : null}
      <Card>
        <CardHeader><CardTitle>Current Governing Document</CardTitle></CardHeader>
        <CardContent>
          {doc ? (
            <DocumentViewer src="/api/documents/constitution" mimeType={doc.mimeType} title={doc.title} />
          ) : (
            <p className="text-sm text-slate-500">No constitution or guidelines document has been uploaded yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
