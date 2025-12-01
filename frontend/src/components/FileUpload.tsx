import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, X, File, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onUpload: (files: File[]) => void;
  onClose: () => void;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

const ACCEPTED_FILE_TYPES = ['.docx', '.pdf', '.txt', '.csv'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 5;

export const FileUpload: React.FC<FileUploadProps> = ({ onUpload, onClose }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFiles = (files: File[]): { valid: File[]; errors: string[] } => {
    const errors: string[] = [];
    const valid: File[] = [];

    if (files.length > MAX_FILES) {
      errors.push('Cannot add more files.');
      return { valid: [], errors };
    }

    files.forEach((file) => {
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!ACCEPTED_FILE_TYPES.includes(extension)) {
        errors.push(`${file.name}: Unsupported file type. Accepted: ${ACCEPTED_FILE_TYPES.join(', ')}`);
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: File too large. Maximum size: 10MB`);
        return;
      }

      valid.push(file);
    });

    return { valid, errors };
  };

  const simulateUpload = (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          
          setUploadingFiles(prev => prev.map(f => 
            f.file === file 
              ? { ...f, progress: 100, status: 'success' }
              : f
          ));
          
          resolve();
        } else {
          setUploadingFiles(prev => prev.map(f => 
            f.file === file 
              ? { ...f, progress }
              : f
          ));
        }
      }, 100 + Math.random() * 200);
    });
  };

  const handleFiles = async (files: File[]) => {
    setError(null);
    const { valid, errors } = validateFiles(files);

    if (errors.length > 0) {
      setError(errors.join('\n'));
      return;
    }

    // Initialize uploading files
    const uploadingFiles: UploadingFile[] = valid.map(file => ({
      file,
      progress: 0,
      status: 'uploading'
    }));

    setUploadingFiles(uploadingFiles);

    // Simulate uploads
    try {
      await Promise.all(valid.map(file => simulateUpload(file)));
      
      // After all uploads complete, call onUpload and close
      setTimeout(() => {
        onUpload(valid);
        onClose();
      }, 500);
      
    } catch (error) {
      setError('Upload failed. Please try again.');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Legal Documents</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Drop Zone */}
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
              dragActive 
                ? "border-primary bg-primary/5" 
                : "border-border hover:border-primary/50"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleButtonClick();
              }
            }}
            aria-label="File upload dropzone"
          >
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <div className="space-y-2">
              <p className="text-sm font-medium">
                Drop files here or{' '}
                <button
                  onClick={handleButtonClick}
                  className="text-primary hover:underline"
                >
                  browse
                </button>
              </p>
              <p className="text-xs text-muted-foreground">
                Supports: {ACCEPTED_FILE_TYPES.join(', ')} (max 10MB each)
              </p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={ACCEPTED_FILE_TYPES.join(',')}
            onChange={handleInputChange}
            className="hidden"
          />

          {/* Error Messages */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="whitespace-pre-line">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Uploading Files */}
          {uploadingFiles.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Uploading Files</h4>
              {uploadingFiles.map((uploadingFile, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <File className="h-4 w-4" />
                      <span className="truncate">{uploadingFile.file.name}</span>
                      {uploadingFile.status === 'success' && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(uploadingFile.file.size)}
                    </span>
                  </div>
                  <Progress 
                    value={uploadingFile.progress} 
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};