import React, { useState, useCallback, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { DocumentSidebar, Document, ChatHistory } from '@/components/DocumentSidebar';
import { ChatArea, ChatMessage } from '@/components/ChatArea';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useToast } from '@/hooks/use-toast';

// --- INTERFACES ---
interface ChatSession {
  id: string;
  documentId?: string;
  messages: ChatMessage[];
  title: string;
}

interface AnalyzePayload {
  documentText: string;
}

interface AnalyzeResponse {
  analysis: string;
}


// --- API CALL FUNCTION ---
async function analyzeDocument(payload: AnalyzePayload): Promise<AnalyzeResponse> {
  const response = await fetch("http://127.0.0.1:8000/api/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "An error occurred during analysis.");
  }

  return response.json();
}


const Index = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeDocumentId, setActiveDocumentId] = useState<string>();
  const [activeChatId, setActiveChatId] = useState<string>();
  const { toast } = useToast();
  
  // --- 1. CREATE A REF FOR THE FILE INPUT ---
  const fileInputRef = useRef<HTMLInputElement>(null);


  const mutation = useMutation({
    mutationFn: analyzeDocument,
    onSuccess: (data, variables) => {
      const aiMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        type: 'ai',
        content: data.analysis,
        timestamp: new Date(),
      };
      
      let currentSessionId = activeChatId;
       if (activeDocumentId) {
         const existingSession = chatSessions.find(session => session.documentId === activeDocumentId);
         currentSessionId = existingSession?.id;
       }

      setChatSessions(prev => {
        const updatedSessions = [...prev];
        const sessionIndex = updatedSessions.findIndex(session =>
          session.id === currentSessionId || session.documentId === activeDocumentId
        );
        if (sessionIndex !== -1) {
          updatedSessions[sessionIndex].messages.push(aiMessage);
        }
        return updatedSessions;
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    },
  });

  const generateChatId = () => `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const generateDocumentId = () => `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const handleDocumentUpload = useCallback(async (files: File[]) => {
    const newDocuments: Document[] = files.map(file => ({
      id: generateDocumentId(),
      name: file.name,
      size: file.size,
      type: file.name.split('.').pop()?.toLowerCase() || '',
      uploadedAt: new Date(),
    }));

    setDocuments(prev => [...prev, ...newDocuments]);
    toast({
      title: "Documents uploaded successfully",
      description: `${files.length} document(s) added.`,
    });
  }, [toast]);
  
  const handleDocumentSelect = useCallback((document: Document) => {
    setActiveDocumentId(document.id);
    setActiveChatId(undefined);
    const existingSession = chatSessions.find(session => session.documentId === document.id);
    if (!existingSession) {
      const newSession: ChatSession = {
        id: generateChatId(),
        documentId: document.id,
        messages: [],
        title: `Analysis: ${document.name}`,
      };
      setChatSessions(prev => [...prev, newSession]);
    }
  }, [chatSessions]);

  const handleChatSelect = useCallback((chat: ChatHistory) => {
    setActiveChatId(chat.id);
    setActiveDocumentId(chat.documentId);
  }, []);

  const handleNewChat = useCallback(() => {
    setActiveDocumentId(undefined);
    setActiveChatId(generateChatId());
  }, []);

  const handleDocumentDelete = useCallback((documentId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    setChatSessions(prev => prev.filter(session => session.documentId !== documentId));
    if (activeDocumentId === documentId) {
      setActiveDocumentId(undefined);
      setActiveChatId(undefined);
    }
    toast({
      title: "Document deleted",
      description: "Document and associated chat have been removed.",
    });
  }, [activeDocumentId, toast]);

  const handleSendMessage = useCallback(async (message: string) => {
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      type: 'user',
      content: message,
      timestamp: new Date(),
    };

    let currentSessionId = activeChatId;
    if (activeDocumentId) {
        const doc = documents.find(d => d.id === activeDocumentId);
        if(doc) {
            message = `Based on the document "${doc.name}", please answer the following: ${message}`;
        }
      const existingSession = chatSessions.find(session => session.documentId === activeDocumentId);
      currentSessionId = existingSession?.id;
    }

    setChatSessions(prev => {
        const updatedSessions = [...prev];
        const sessionIndex = updatedSessions.findIndex(session => session.id === currentSessionId || session.documentId === activeDocumentId);

        if (sessionIndex >= 0) {
            updatedSessions[sessionIndex].messages.push(userMessage);
        } else {
            const newSession: ChatSession = {
                id: currentSessionId || generateChatId(),
                messages: [userMessage],
                title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
            };
            updatedSessions.push(newSession);
            if (!currentSessionId) {
                setActiveChatId(newSession.id);
            }
        }
        return updatedSessions;
    });

    mutation.mutate({ documentText: message });

  }, [activeChatId, activeDocumentId, chatSessions, documents, mutation]);
  
  // --- 2. CREATE A FUNCTION TO TRIGGER THE FILE UPLOAD ---
  const handleFileUploadTrigger = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const currentMessages = chatSessions.find(session => 
    activeDocumentId ? session.documentId === activeDocumentId : session.id === activeChatId
  )?.messages || [];

  const currentDocument = documents.find(doc => doc.id === activeDocumentId);
  
  const chatHistory: ChatHistory[] = chatSessions.map(session => ({
    id: session.id,
    title: session.title,
    lastMessage: session.messages[session.messages.length - 1]?.content.substring(0, 100) + '...' || 'No messages yet',
    timestamp: session.messages[session.messages.length - 1]?.timestamp || new Date(),
    documentId: session.documentId,
  }));

  return (
    <div className="h-screen flex bg-background">
      <DocumentSidebar
        // --- 3. PASS THE REF TO THE SIDEBAR ---
        fileInputRef={fileInputRef}
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        documents={documents}
        chatHistory={chatHistory}
        activeDocumentId={activeDocumentId}
        activeChatId={activeChatId}
        onDocumentSelect={handleDocumentSelect}
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
        onDocumentDelete={handleDocumentDelete}
        onDocumentUpload={handleDocumentUpload}
      />
      <div className="flex-1 flex flex-col">
        <div className="absolute top-4 right-4 z-10">
          <ThemeToggle />
        </div>
        <ChatArea
          messages={currentMessages}
          onSendMessage={handleSendMessage}
          // --- 4. PASS THE TRIGGER FUNCTION TO THE CHAT AREA ---
          onFileUpload={handleFileUploadTrigger}
          isLoading={mutation.isPending}
          documentName={currentDocument?.name}
        />
      </div>
    </div>
  );
};

export default Index;