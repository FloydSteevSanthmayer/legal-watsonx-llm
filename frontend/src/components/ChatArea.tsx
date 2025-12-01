import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Paperclip, Scale, Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  attachments?: string[];
}

interface ChatAreaProps {
  messages: ChatMessage[];
  onSendMessage: (message: string, files?: File[]) => void;
  onFileUpload: () => void;
  isLoading?: boolean;
  documentName?: string;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  onSendMessage,
  onFileUpload,
  isLoading = false,
  documentName
}) => {
  const [inputValue, setInputValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim() || isLoading) return;
    
    onSendMessage(inputValue.trim());
    setInputValue('');
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card p-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Scale className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Legal Document Analyzer</h1>
            <p className="text-sm text-muted-foreground">
              AI-powered contract and document analysis
              {documentName && (
                <>
                  {' • '}
                  <Badge variant="secondary" className="ml-1">
                    {documentName}
                  </Badge>
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-6 max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-4 bg-primary/5 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Scale className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Welcome to Legal Document Analyzer</h3>
              <p className="text-muted-foreground mb-4">
                Upload legal documents and ask questions to get AI-powered analysis and insights.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto text-sm">
                <div className="p-3 bg-card border border-border rounded-lg">
                  <p className="font-medium mb-1">Contract Analysis</p>
                  <p className="text-muted-foreground">Identify key terms, obligations, and potential risks</p>
                </div>
                <div className="p-3 bg-card border border-border rounded-lg">
                  <p className="font-medium mb-1">Legal Research</p>
                  <p className="text-muted-foreground">Get insights on legal precedents and compliance</p>
                </div>
                <div className="p-3 bg-card border border-border rounded-lg">
                  <p className="font-medium mb-1">Document Comparison</p>
                  <p className="text-muted-foreground">Compare clauses and terms across documents</p>
                </div>
                <div className="p-3 bg-card border border-border rounded-lg">
                  <p className="font-medium mb-1">Risk Assessment</p>
                  <p className="text-muted-foreground">Evaluate potential legal and financial risks</p>
                </div>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex w-full animate-fade-in",
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div className={cn(
                  "flex max-w-[80%] space-x-3",
                  message.type === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
                )}>
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className={cn(
                      message.type === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-secondary text-secondary-foreground'
                    )}>
                      {message.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className={cn(
                    "rounded-2xl px-4 py-3 shadow-sm",
                    message.type === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-secondary text-secondary-foreground'
                  )}>
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-wrap m-0">{message.content}</p>
                    </div>
                    
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {message.attachments.map((filename, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {filename}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <div className={cn(
                      "text-xs mt-2 opacity-70",
                      message.type === 'user' ? 'text-primary-foreground' : 'text-muted-foreground'
                    )}>
                      {message.type === 'user' ? 'You' : 'Legal AI'} • {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          
          {isLoading && (
            <div className="flex justify-start w-full animate-fade-in">
              <div className="flex max-w-[80%] space-x-3">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarFallback className="bg-secondary text-secondary-foreground">
                    <Bot className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-secondary text-secondary-foreground rounded-2xl px-4 py-3 shadow-sm">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-muted-foreground">Analyzing...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Composer */}
      <div className="border-t border-border bg-card p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={onFileUpload}
              className="flex-shrink-0 mb-1"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={inputValue}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your legal documents..."
                className="min-h-[44px] max-h-[120px] resize-none pr-12"
                disabled={isLoading}
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                className="absolute right-1 bottom-1 h-8 w-8"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
};