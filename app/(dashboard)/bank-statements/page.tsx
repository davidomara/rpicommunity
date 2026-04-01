import { auth } from "@/auth";
import { getLatestBankStatement } from "@/lib/queries";
import { isAdmin } from "@/lib/rbac";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentViewer } from "@/components/documents/document-viewer";
import { uploadBankStatementAction } from "./actions";
import { SubmitButton } from "@/components/forms/submit-button";

export default async function BankStatementsPage() {
  const session = await auth();
  if (!session?.user) return null;

  const latest = await getLatestBankStatement();
  const canUpload = isAdmin(session.user.role);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-cyan-700">Protected Financial Documents</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">Bank Statements</h1>
      </div>
      {canUpload ? (
        <Card>
          <CardHeader><CardTitle>Upload Latest Statement</CardTitle></CardHeader>
          <CardContent>
            <form action={uploadBankStatementAction} className="flex flex-col gap-4 md:flex-row md:items-center">
              <input type="file" name="file" accept=".pdf,image/*" required className="block text-sm" />
              <SubmitButton label="Upload Statement" pendingLabel="Uploading..." />
            </form>
            <p className="mt-3 text-xs text-slate-500">The latest statement becomes the current protected preview for logged-in users.</p>
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
