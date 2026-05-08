import { useState } from "react";
import { DocumentUpload, DocumentType } from "./DocumentUpload";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Info } from "lucide-react";
import { TabsContent } from "@radix-ui/react-tabs";

interface DocumentsViewProps {
  projectId: string;
}

export function DocumentsView({ projectId }: DocumentsViewProps) {
  // const [documents, setDocuments] = useState<DocumentType[]>([]);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-7 mt-16">
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Documents</CardTitle>
          <CardDescription>Manage your document settings.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Documents coming soon...</p>
        </CardContent>
      </Card>

      {/* 
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DocumentUpload projectId={projectId} />
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>About Project Documents</CardTitle>
              <CardDescription>
                How documents work in the Deviation Engine
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-5 w-5" />
                <AlertTitle>Context for AI Agents</AlertTitle>
                <AlertDescription>
                  Uploaded documents provide context for your AI agents. They can reference this information during conversations.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <h4 className="font-medium">Key Features:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Upload multiple document formats (PDF, TXT, DOC, etc.)</li>
                  <li>AI agents can reference document content</li>
                  <li>Organize information for your projects</li>
                  <li>Easily manage uploaded documents</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Best Practices:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Upload clear, well-structured documents</li>
                  <li>Use descriptive filenames</li>
                  <li>Break large documents into logical sections</li>
                  <li>Consider converting complex formats to PDF or TXT</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      */}
    </div>
  );
}
