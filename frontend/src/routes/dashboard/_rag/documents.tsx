import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";

import { FileText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/kokonutui/file-upload";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useOrganizationStore } from "@/hooks/use-organization";
import { useProjectStore } from "@/hooks/use-project";
import { toast } from "sonner";
import apiClient from "@/lib/axios";

export const Route = createFileRoute("/dashboard/_rag/documents")({
  loader: ({ context }) => {
    const org = context.getOrganization();
    const project = context.getProject();
    if (!org?.id || !project?.id) return { documents: [] };
    return apiClient
      .get(
        `/plugins/document-intelligence/recent_documents_info?organization_id=${org.id}&project_id=${project.id}`
      )
      .then((res) => ({ documents: res.data.items || [] }))
      .catch(() => ({ documents: [] }));
  },
  component: DocumentsPage,
});

interface UploadedDocument {
  document_id: string;
  document_uploaded_name: string;
  created_at: string;
  status: string;
  project_name: string;
}

function DocumentsPage() {
  const router = useRouter();
  const { currentOrganization } = useOrganizationStore();
  const { currentProject } = useProjectStore();
  const { documents: initialDocuments } = Route.useLoaderData();
  const [documents, setDocuments] =
    useState<UploadedDocument[]>(initialDocuments);

  useEffect(() => {
    setDocuments(initialDocuments);
  }, [initialDocuments]);

  const handleFileUpload = async (file: File) => {
    if (!currentOrganization || !currentProject) {
      toast.error("Please select an organization and project");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("document", file);
      formData.append("project_id", currentProject.id);

      await apiClient.post(
        `/plugins/document-intelligence/upload_document?organization_id=${currentOrganization.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success(`Document "${file.name}" uploaded successfully`);

      router.invalidate();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload document");
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!currentOrganization || !currentProject) return;

    try {
      await apiClient.delete(
        `/plugins/document-intelligence/delete_document?organization_id=${currentOrganization.id}&project_id=${currentProject.id}&document_id=${documentId}`
      );

      toast.success("Document deleted");
      router.invalidate();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete document");
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Documents</h1>
          <p className="text-muted-foreground">
            Upload and manage documents for RAG
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Document</CardTitle>
          <CardDescription>
            Upload PDF documents to use with AI chat
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentProject ? (
            <FileUpload
              onUploadSuccess={handleFileUpload}
              onUploadError={(error) => toast.error(error.message)}
              acceptedFileTypes={["application/pdf"]}
              maxFileSize={50 * 1024 * 1024}
              uploadDelay={0}
              className="max-w-full"
            />
          ) : (
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <p className="text-sm text-destructive">
                Please select a project first
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Uploaded Documents</CardTitle>
          <CardDescription>
            {documents.length} document(s) in current project
          </CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No documents uploaded yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.document_id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {doc.document_uploaded_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(doc.created_at).toLocaleDateString()} ·{" "}
                        {doc.status}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteDocument(doc.document_id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
