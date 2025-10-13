// components/UploadBlock.tsx
import React, { useRef } from 'react';
import { type UploadBlockProps, type UploadedFile } from '../types/upload';

const UploadBlock: React.FC<UploadBlockProps> = ({
  title,
  description,
  accept,
  multiple = false,
  maxFiles = 10,
  maxSize = 10,
  onFilesChange,
  uploadedFiles
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: File[]) => {
    // Validate file size
    const validFiles = files.filter(file => {
      const sizeInMB = file.size / (1024 * 1024);
      if (sizeInMB > maxSize) {
        alert(`File ${file.name} exceeds maximum size of ${maxSize}MB`);
        return false;
      }
      return true;
    });

    // Validate max files
    if (uploadedFiles.length + validFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const newFiles: UploadedFile[] = validFiles.map(file => ({
      id: Math.random().toString(36).substring(2, 9),
      file,
      status: 'ready'
    }));

    onFilesChange([...uploadedFiles, ...newFiles]);
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    handleFileSelect(selectedFiles);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (id: string) => {
    const updatedFiles = uploadedFiles.filter(file => file.id !== id);
    onFilesChange(updatedFiles);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.classList.add('border-blue-500', 'bg-blue-50');
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
    
    const files = Array.from(event.dataTransfer.files);
    handleFileSelect(files);
  };

  const getStatusColor = (status: UploadedFile['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };

  const getStatusText = (status: UploadedFile['status']) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'error': return 'Error';
      default: return 'Ready';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
        <p className="text-xs text-gray-500 mt-1">
          Max {maxFiles} files, {maxSize}MB each
        </p>
      </div>

      {/* Drop Zone */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer transition-colors hover:border-gray-400 hover:bg-gray-50"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center justify-center">
          <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-sm text-gray-600">
            Drag and drop your files here or click to browse
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Accepted: {accept}
          </p>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>

      {/* File List - Simplified without progress bars */}
      {uploadedFiles.length > 0 && (
        <div className="mt-4 space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Selected Files:</h4>
          {uploadedFiles.map((file) => (
            <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(file.status)}`}></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {file.file.name}
                  </p>
                  <p className={`text-xs mt-1 ${
                    file.status === 'error' ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {file.error || getStatusText(file.status)}
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(file.id);
                }}
                className="flex-shrink-0 text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                type="button"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UploadBlock;