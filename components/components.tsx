
import React, { useState, useCallback } from 'react';
import { ImageInfo } from '../types';

// Header: A simple header component for the application.
export function Header(): React.ReactNode {
    return (
        <header className="py-6 bg-base-200/50 backdrop-blur-lg border-b border-base-300">
            <div className="container mx-auto text-center px-4">
                <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-secondary to-cyan-400">
                    Visionary
                </h1>
                <p className="mt-2 text-lg text-text-secondary">AI-Powered Image Description</p>
            </div>
        </header>
    );
}

// ImageUploader: A component for uploading images.
interface ImageUploaderProps {
  onImageUpload: (info: ImageInfo | null) => void;
}

const fileToImageInfo = (file: File): Promise<ImageInfo> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        const dataUrl = event.target.result;
        const [header, base64Data] = dataUrl.split(',');
        const mimeTypeMatch = header.match(/:(.*?);/);

        if (!mimeTypeMatch || !mimeTypeMatch[1]) {
          return reject(new Error('Could not determine image MIME type.'));
        }
        
        resolve({
          base64Data,
          mimeType: mimeTypeMatch[1],
          previewUrl: dataUrl,
        });
      } else {
        reject(new Error('Failed to read file as a data URL.'));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

export function ImageUploader({ onImageUpload }: ImageUploaderProps): React.ReactNode {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const handleFileChange = useCallback(async (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      try {
        const info = await fileToImageInfo(file);
        setPreview(info.previewUrl);
        onImageUpload(info);
      } catch (error) {
        console.error(error);
        onImageUpload(null);
        setPreview(null);
        alert('Could not process the selected file. Please try another image.');
      }
    }
  }, [onImageUpload]);

  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  };

  return (
    <div className="w-full max-w-md">
      <label
        htmlFor="image-upload"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`relative block w-full aspect-video rounded-lg border-2 border-dashed border-base-300 p-6 text-center cursor-pointer transition-colors duration-200 ${isDragging ? 'bg-brand-primary/20 border-brand-secondary' : 'hover:border-brand-secondary'}`}
      >
        {preview ? (
          <img src={preview} alt="Image preview" className="object-contain w-full h-full rounded-md" />
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <svg className="mx-auto h-12 w-12 text-text-secondary" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="mt-2 block text-sm font-medium text-text-primary">
              Drag & Drop an image or <span className="text-brand-secondary">click to upload</span>
            </span>
            <p className="text-xs text-text-secondary mt-1">PNG, JPG, GIF up to 10MB</p>
          </div>
        )}
      </label>
      <input
        id="image-upload"
        name="image-upload"
        type="file"
        className="sr-only"
        accept="image/png, image/jpeg, image/gif, image/webp"
        onChange={(e) => handleFileChange(e.target.files)}
      />
    </div>
  );
}

// DescriptionDisplay: A component for displaying the generated description.
interface DescriptionDisplayProps {
  description: string;
}

export function DescriptionDisplay({ description }: DescriptionDisplayProps): React.ReactNode {
  if (!description) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-text-secondary text-center leading-relaxed">
          Upload an image and click "Generate Description" to see the magic happen!
          <br/><br/>
          <strong className="text-text-primary">Required Local Setup:</strong>
          <br/>
          1. Make sure Ollama is running with the <code>llava</code> model (run <code>ollama pull llava</code>).
          <br/>
          2. For browser access, restart the Ollama server with CORS enabled:
          <br/>
          <code className="bg-base-300 text-text-primary px-2 py-1 rounded-md text-sm mt-1 inline-block">OLLAMA_ORIGINS='*' ollama serve</code>
        </p>
      </div>
    );
  }

  return (
    <div className="prose prose-invert prose-lg text-text-primary max-w-none whitespace-pre-wrap">
      {description}
    </div>
  );
}

// Loader: A simple loading spinner.
export function Loader(): React.ReactNode {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-base-200/50 backdrop-blur-sm z-10">
        <svg className="animate-spin h-10 w-10 text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    </div>
  );
}

// ErrorAlert: A component for displaying error messages.
interface ErrorAlertProps {
  message: string;
}

export function ErrorAlert({ message }: ErrorAlertProps): React.ReactNode {
  return (
    <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative" role="alert">
      <strong className="font-bold">Error: </strong>
      <span className="block sm:inline">{message}</span>
    </div>
  );
}
