
import { useState, ChangeEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileText, Upload, File, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export interface DocumentType {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: Date;
  projectId: string;
}

interface DocumentUploadProps {
  projectId: string;
}

export function DocumentUpload({ projectId }: DocumentUploadProps) {
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  // Supported file types
  const supportedTypes = [
    'application/pdf', // PDF
    'text/plain', // TXT
    'application/msword', // DOC
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
    'text/markdown', // MD
    'text/csv', // CSV
    'application/json', // JSON
  ];

  // Function to handle file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    const files = Array.from(e.target.files);
    let hasInvalidFile = false;

    // Check for unsupported file types
    files.forEach(file => {
      if (!supportedTypes.includes(file.type)) {
        hasInvalidFile = true;
        toast({
          title: "Unsupported file type",
          description: `${file.name} is not a supported file type.`,
          variant: "destructive"
        });
      }
    });

    if (hasInvalidFile) return;

    setIsUploading(true);
    
    // Simulate upload process
    setTimeout(() => {
      const newDocs = files.map(file => ({
        id: Math.random().toString(36).substring(2, 11),
        name: file.name,
        type: file.type,
        size: file.size,
        uploadedAt: new Date(),
        projectId
      }));
      
      setDocuments(prev => [...prev, ...newDocs]);
      setIsUploading(false);
      
      toast({
        title: "Files uploaded",
        description: `${files.length} file(s) have been uploaded successfully.`
      });
      
      // Reset the input
      e.target.value = '';
    }, 1500);
  };

  const removeDocument = (id: string) => {
    setDocuments(docs => docs.filter(doc => doc.id !== id));
    toast({
      title: "Document removed",
      description: "The document has been removed from your project."
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) {
      return <FileText className="h-6 w-6 text-red-500" />;
    } else if (type.includes('word') || type.includes('doc')) {
      return <FileText className="h-6 w-6 text-blue-500" />;
    } else if (type.includes('text') || type.includes('markdown')) {
      return <FileText className="h-6 w-6 text-gray-500" />;
    } else {
      return <File className="h-6 w-6 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Project Documents</CardTitle>
        <CardDescription>
          Upload documents that your AI agents can reference during conversations. 
          Supported formats: PDF, TXT, DOC, DOCX, MD, CSV, JSON.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <label
            htmlFor="document-upload"
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="h-8 w-8 mb-2 text-gray-400" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-medium">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                PDF, TXT, DOC, DOCX, MD, CSV, JSON (Max 20MB)
              </p>
            </div>
            <Input
              id="document-upload"
              type="file"
              className="hidden"
              multiple
              onChange={handleFileChange}
              accept=".pdf,.txt,.doc,.docx,.md,.csv,.json"
              disabled={isUploading}
            />
          </label>
        </div>

        {isUploading && (
          <div className="flex items-center justify-center text-sm text-gray-500 mb-4">
            <div className="mr-2 h-4 w-4 rounded-full border-2 border-current border-r-transparent animate-spin" />
            Uploading...
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-md font-medium">Uploaded Documents ({documents.length})</h3>
          
          {documents.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              No documents uploaded yet. Upload documents to provide context for your AI agents.
            </div>
          ) : (
            documents.map(doc => (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  {getFileIcon(doc.type)}
                  <div className="ml-3">
                    <p className="font-medium text-sm">{doc.name}</p>
                    <div className="flex items-center mt-1">
                      <Badge variant="outline" className="mr-2 text-xs">
                        {formatFileSize(doc.size)}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(doc.uploadedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => removeDocument(doc.id)}
                  className="text-gray-500 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
