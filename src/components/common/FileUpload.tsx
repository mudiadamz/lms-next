import { useRef, useState, DragEvent } from 'react';
import { Button } from './Button';
import './FileUpload.css';

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  maxFiles?: number;
  label?: string;
  error?: string;
}

export const FileUpload = ({
  onFileSelect,
  accept,
  multiple = false,
  maxSize = 10,
  maxFiles = 1,
  label = 'Upload File',
  error,
}: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFiles = (files: File[]): string | null => {
    if (!multiple && files.length > 1) {
      return 'Hanya boleh upload 1 file';
    }

    if (maxFiles && files.length > maxFiles) {
      return `Maksimal ${maxFiles} file`;
    }

    for (const file of files) {
      if (file.size > maxSize * 1024 * 1024) {
        return `File ${file.name} terlalu besar. Maksimal ${maxSize}MB`;
      }
    }

    return null;
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const validationError = validateFiles(fileArray);

    if (validationError) {
      alert(validationError);
      return;
    }

    setSelectedFiles(fileArray);
    onFileSelect(fileArray);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFileSelect(newFiles);
  };

  return (
    <div className="file-upload">
      {label && <label className="file-upload-label">{label}</label>}
      
      <div
        className={`file-upload-area ${isDragging ? 'file-upload-area--dragging' : ''} ${error ? 'file-upload-area--error' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          className="file-upload-input"
        />
        <div className="file-upload-content">
          <span className="file-upload-icon">📎</span>
          <p className="file-upload-text">
            {isDragging
              ? 'Lepaskan file di sini'
              : 'Klik atau drag file ke sini untuk upload'}
          </p>
          <p className="file-upload-hint">
            Maksimal {maxSize}MB{multiple && maxFiles ? `, maksimal ${maxFiles} file` : ''}
          </p>
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="file-upload-list">
          {selectedFiles.map((file, index) => (
            <div key={index} className="file-upload-item">
              <span className="file-upload-item-name">{file.name}</span>
              <span className="file-upload-item-size">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </span>
              <button
                className="file-upload-item-remove"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                aria-label="Remove file"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <span className="file-upload-error">{error}</span>}
    </div>
  );
};

