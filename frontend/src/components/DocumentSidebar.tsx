import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  MessageSquarePlus, 
  FileText, 
  History, 
  Upload,
  Trash2,
  PanelLeftClose,
  PanelLeftOpen,
  File,
  FileType,
  Sheet
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FileUpload } from './FileUpload';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export interface Document {
  id: string;
  name: string;
  size: number;
  type: string;
  preview?: string;
  uploadedAt: Date;
}

export interface ChatHistory {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  documentId?: string;
}

// --- 1. UPDATE THE PROPS INTERFACE ---
// We've added fileInputRef here to accept the reference from the parent component.
interface DocumentSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  documents: Document[];
  chatHistory: ChatHistory[];
  activeDocumentId?: string;
  activeChatId?: string;
  onDocumentSelect: (document: Document) => void;
  onChatSelect: (chat: ChatHistory) => void;
  onNewChat: () => void;
  onDocumentDelete: (documentId: string) => void;
  onDocumentUpload: (files: File[]) => void;
  fileInputRef: React.RefObject<HTMLInputElement>; // This line is new
}

const getFileIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'pdf':
      return <FileType className="h-4 w-4 text-red-500" />;
    case 'docx':
    case 'doc':
      return <FileText className="h-4 w-4 text-blue-500" />;
    case 'txt':
      return <File className="h-4 w-4 text-gray-500" />;
    case 'csv':
      return <Sheet className="h-4 w-4 text-green-500" />;
    default:
      return <File className="h-4 w-4 text-gray-500" />;
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const DocumentSidebar: React.FC<DocumentSidebarProps> = ({
  isCollapsed,
  onToggle,
  documents,
  chatHistory,
  activeDocumentId,
  activeChatId,
  onDocumentSelect,
  onChatSelect,
  onNewChat,
  onDocumentDelete,
  onDocumentUpload,
  fileInputRef, // Destructure the new prop
}) => {
  const [activeTab, setActiveTab] = useState<'documents' | 'history'>('documents');
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      onDocumentUpload(Array.from(event.target.files));
      // Clear the input value to allow uploading the same file again
      event.target.value = ''; 
    }
  };

  if (isCollapsed) {
    // Collapsed sidebar view (remains the same)
    return (
      <div className="w-sidebar-collapsed h-full bg-card border-r border-border flex flex-col items-center py-4 space-y-4">
        <Button variant="ghost" size="icon" onClick={onToggle} className="hover:bg-accent">
          <PanelLeftOpen className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onNewChat} className="hover:bg-accent">
          <MessageSquarePlus className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-sidebar h-full bg-card border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-border">
        <h2 className="font-semibold text-foreground">Legal Analyzer</h2>
        <Button variant="ghost" size="icon" onClick={onToggle} className="hover:bg-accent">
          <PanelLeftClose className="h-4 w-4" />
        </Button>
      </div>

      {/* New Chat Button */}
      <div className="p-4">
        <Button onClick={onNewChat} className="w-full legal-gradient text-white hover:opacity-90 transition-smooth" size="lg">
          <MessageSquarePlus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>

      <Separator />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'documents' | 'history')} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2 mx-4 mt-4">
          <TabsTrigger value="documents" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <FileText className="h-4 w-4 mr-2" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <History className="h-4 w-4 mr-2" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="flex-1 flex flex-col m-0 p-4 pt-2">
          {/* --- 2. UPDATE THE UPLOAD BUTTON --- */}
          {/* This button now programmatically clicks the hidden file input. */}
          <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full mb-4 hover:bg-accent transition-smooth">
            <Upload className="h-4 w-4 mr-2" />
            Upload Documents
          </Button>

          {/* Documents List */}
          <ScrollArea className="flex-1">
            <div className="space-y-2">
              {documents.map((doc) => (
                <div key={doc.id} className={cn("p-3 rounded-lg border cursor-pointer transition-smooth hover:bg-accent", activeDocumentId === doc.id ? "bg-primary/10 border-primary" : "bg-card border-border")} onClick={() => onDocumentSelect(doc)}>
                   <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      {getFileIcon(doc.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(doc.size)}</p>
                      </div>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-destructive hover:text-destructive-foreground" onClick={(e) => e.stopPropagation()}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Document</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this document? This will also delete its chat history.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDocumentDelete(doc.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
              {documents.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No documents uploaded yet</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="history" className="flex-1 flex flex-col m-0 p-4 pt-2">
            {/* History content remains the same */}
            <ScrollArea className="flex-1">
              <div className="space-y-2">
                  {chatHistory.map((chat) => (
                      <div key={chat.id} className={cn("p-3 rounded-lg border cursor-pointer transition-smooth hover:bg-accent", activeChatId === chat.id ? "bg-primary/10 border-primary" : "bg-card border-border")} onClick={() => onChatSelect(chat)}>
                         <p className="text-sm font-medium truncate">{chat.title}</p>
                      </div>
                  ))}
                   {chatHistory.length === 0 && (
                     <div className="text-center py-8 text-muted-foreground">
                        <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No chat history yet</p>
                    </div>
                  )}
              </div>
            </ScrollArea>
        </TabsContent>
      </Tabs>
      
      {/* --- 3. ADD THE HIDDEN FILE INPUT --- */}
      {/* This input is invisible but will be triggered by the ref. */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        className="hidden"
        accept=".pdf,.doc,.docx,.txt,.csv"
      />
    </div>
  );
};

