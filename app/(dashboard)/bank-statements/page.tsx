import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getLatestBankStatement } from "@/lib/queries";
import { canManageProtectedDocuments } from "@/lib/rbac";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentViewer } from "@/components/documents/document-viewer";
import { uploadBankStatementAction } from "./actions";
import { ProtectedUploadForm } from "@/components/forms/protected-upload-form";

export default async function BankStatementsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const latest = await getLatestBankStatement();
  const canUpload = canManageProtectedDocuments(session.user.role);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-cyan-700">Protected Financial Documents</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Bank Statements</h1>
      </div>
      {canUpload ? (
        <Card>
          <CardHeader><CardTitle>Upload Latest Statement</CardTitle></CardHeader>
          <CardContent>
            <ProtectedUploadForm
              action={uploadBankStatementAction}
              submitLabel="Upload Statement"
              pendingLabel="Uploading..."
              hint="The latest statement becomes the current protected preview for logged-in users."
            />
          </CardContent>
        </Card>
      ) : null}
      <Card>
        <CardHeader><CardTitle>Current Statement Preview</CardTitle></CardHeader>
        <CardContent>
          {latest ? (
            <DocumentViewer src={`/api/bank-statements/${latest.id}/file`} mimeType={latest.mimeType} title={latest.originalName} />
          ) : (
            <p className="text-sm text-slate-500">No bank statement has been uploaded yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
