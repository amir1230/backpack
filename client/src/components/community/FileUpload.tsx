import { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Paperclip, X, Image, FileText, File, Loader2 } from 'lucide-react';

interface FileUploadPreview {
  file: File;
  id: string;
  preview?: string;
  type: 'image' | 'document' | 'other';
}

interface FileUploadProps {
  onFilesSelected: (files: FileUploadPreview[]) => void;
  onFileRemove: (fileId: string) => void;
  selectedFiles: FileUploadPreview[];
  uploading?: boolean;
  maxFiles?: number;
  maxSizeBytes?: number;
  disabled?: boolean;
}

const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf', 'text/plain', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

export function FileUpload({ 
  onFilesSelected, 
  onFileRemove, 
  selectedFiles, 
  uploading = false,
  maxFiles = 5,
  maxSizeBytes = 10 * 1024 * 1024, // 10MB
  disabled = false
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const getFileType = (file: File): 'image' | 'document' | 'other' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type === 'application/pdf' || 
        file.type.includes('document') || 
        file.type.includes('sheet') ||
        file.type.includes('text')) return 'document';
    return 'other';
  };

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `File type ${file.type} is not allowed`;
    }
    if (file.size > maxSizeBytes) {
      return `File size too large. Max size is ${Math.round(maxSizeBytes / 1024 / 1024)}MB`;
    }
    return null;
  };

  const createPreview = async (file: File): Promise<FileUploadPreview> => {
    const id = Math.random().toString(36).substring(2, 15);
    const type = getFileType(file);
    
    let preview: string | undefined;
    if (type === 'image') {
      preview = URL.createObjectURL(file);
    }

    return { file, id, preview, type };
  };

  const handleFileSelect = async (files: FileList) => {
    if (disabled || uploading) return;
    
    const fileArray = Array.from(files);
    
    // Check total file count
    if (selectedFiles.length + fileArray.length > maxFiles) {
      alert(`You can only upload up to ${maxFiles} files at once`);
      return;
    }

    const validFiles: File[] = [];
    const errors: string[] = [];

    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    }

    if (errors.length > 0) {
      alert(`Some files were rejected:\n${errors.join('\n')}`);
    }

    if (validFiles.length > 0) {
      const previews = await Promise.all(validFiles.map(createPreview));
      onFilesSelected([...selectedFiles, ...previews]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: 'image' | 'document' | 'other') => {
    switch (type) {
      case 'image': return <Image className="w-4 h-4" />;
      case 'document': return <FileText className="w-4 h-4" />;
      default: return <File className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-3">
      {/* File Input Trigger */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading || selectedFiles.length >= maxFiles}
          className="p-2"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Paperclip className="w-4 h-4" />
          )}
        </Button>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ALLOWED_TYPES.join(',')}
          onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
          className="hidden"
        />
        
        {selectedFiles.length > 0 && (
          <span className="text-sm text-gray-600">
            {selectedFiles.length}/{maxFiles} files
          </span>
        )}
      </div>

      {/* Drag & Drop Area (when active) */}
      {selectedFiles.length === 0 && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
            dragOver 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <Paperclip className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600">
            Drop files here or click to select
          </p>
          <p className="text-xs text-gray-400">
            Images, PDFs, documents up to {Math.round(maxSizeBytes / 1024 / 1024)}MB
          </p>
        </div>
      )}

      {/* File Previews */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          {selectedFiles.map((filePreview) => (
            <div
              key={filePreview.id}
              className="flex items-center gap-3 p-2 bg-gray-50 rounded border"
            >
              {/* File Preview/Icon */}
              <div className="flex-shrink-0">
                {filePreview.type === 'image' && filePreview.preview ? (
                  <img
                    src={filePreview.preview}
                    alt={filePreview.file.name}
                    className="w-10 h-10 object-cover rounded"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                    {getFileIcon(filePreview.type)}
                  </div>
                )}
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {filePreview.file.name}
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {filePreview.type}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {formatFileSize(filePreview.file.size)}
                  </span>
                </div>
              </div>

              {/* Remove Button */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onFileRemove(filePreview.id)}
                disabled={uploading}
                className="p-1 h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Progress (if needed) */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Uploading files...</span>
            <span>Please wait</span>
          </div>
          <Progress value={undefined} className="w-full" />
        </div>
      )}
    </div>
  );
}