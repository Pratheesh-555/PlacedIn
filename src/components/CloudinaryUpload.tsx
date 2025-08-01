import React, { useState } from 'react';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';

interface CloudinaryUploadProps {
  onUploadSuccess: (file: File) => void;
  onUploadError: (error: string) => void;
  accept?: string;
  maxSize?: number; // in MB
  uploadLabel?: string;
}

const CloudinaryUpload: React.FC<CloudinaryUploadProps> = ({
  onUploadSuccess,
  onUploadError,
  accept = ".pdf,.doc,.docx",
  maxSize = 5,
  uploadLabel = "Upload Document"
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      onUploadError('Invalid file type. Only PDF and Word documents are allowed.');
      return;
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      onUploadError(`File size must be less than ${maxSize}MB.`);
      return;
    }

    setSelectedFile(file);
    onUploadSuccess(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      {!selectedFile ? (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 ${
            dragActive 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept={accept}
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <Upload size={24} className="text-gray-400" />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-700">{uploadLabel}</p>
              <p className="text-sm text-gray-500 mt-1">
                Drag and drop your file here, or click to browse
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Supports: PDF, DOC, DOCX (Max {maxSize}MB)
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg p-4 bg-green-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <FileText size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
              </div>
              <CheckCircle size={16} className="text-green-500" />
            </div>
            <button
              type="button"
              onClick={removeFile}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <X size={16} className="text-gray-400 hover:text-gray-600" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CloudinaryUpload;
