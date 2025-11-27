import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Upload, FileText, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const { currentOrganization } = useOrganizationStore();
  const { currentProject } = useProjectStore();
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (!currentOrganization || !currentProject) {
      toast.error("Please select an organization and project");
      return;
    }

    setUploading(true);

    try {
      const file = files[0];
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

      await fetchDocuments();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload document");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const fetchDocuments = async () => {
    if (!currentOrganization || !currentProject) return;

    try {
      const response = await apiClient.get(
        `/plugins/document-intelligence/recent_documents_info?organization_id=${currentOrganization.id}&project_id=${currentProject.id}`
      );

      setDocuments(response.data.items || []);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!currentOrganization || !currentProject) return;

    try {
      await apiClient.delete(
        `/plugins/document-intelligence/delete_document?organization_id=${currentOrganization.id}&project_id=${currentProject.id}&document_id=${documentId}`
      );

      toast.success("Document deleted");
      await fetchDocuments();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete document");
    }
  };

  useEffect(() => {
    const loadDocuments = async () => {
      await fetchDocuments();
    };
    loadDocuments();
  }, [currentOrganization, currentProject]);

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
            Upload documents to use with AI chat (PDF, DOCX, TXT, MD)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileUpload}
              accept=".pdf,.docx,.txt,.md"
              disabled={uploading || !currentProject}
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center space-y-2"
            >
              {uploading ? (
                <Loader2 className="h-12 w-12 text-muted-foreground animate-spin" />
              ) : (
                <Upload className="h-12 w-12 text-muted-foreground" />
              )}
              <p className="text-sm font-medium">
                {uploading
                  ? "Uploading..."
                  : "Click to upload or drag and drop"}
              </p>
              <p className="text-xs text-muted-foreground">
                PDF, DOCX, TXT, MD (max 10MB)
              </p>
            </label>
          </div>
          {!currentProject && (
            <p className="text-sm text-destructive mt-2">
              Please select a project first
            </p>
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
