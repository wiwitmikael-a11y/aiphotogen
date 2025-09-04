
import React, { useRef, useState, useCallback } from 'react';
import type { UploadedImage } from '../types';
import { UploadIcon } from './icons/UploadIcon';

interface ImageUploaderProps {
  uploadedImage: UploadedImage | null;
  setUploadedImage: (image: UploadedImage | null) => void;
}

const fileToDataUri = (file: File): Promise<UploadedImage> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1];
            if (base64) {
                resolve({ base64, mimeType: file.type });
            } else {
                reject(new Error("Failed to read file as base64."));
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
};

export const ImageUploader: React.FC<ImageUploaderProps> = ({ uploadedImage, setUploadedImage }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = useCallback(async (files: FileList | null) => {
    setError(null);
    if (files && files.length > 0) {
      const file = files[0];
      if (!file.type.startsWith('image/')) {
        setError("Please upload a valid image file.");
        return;
      }

      try {
        const imageData = await fileToDataUri(file);
        setUploadedImage(imageData);
        setPreviewUrl(URL.createObjectURL(file));
      } catch (err) {
        setError("Failed to process the image.");
        console.error(err);
      }
    }
  }, [setUploadedImage]);

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };
  
  const onDragLeave = () => setDragOver(false);
  
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    handleFileChange(e.dataTransfer.files);
  };

  const removeImage = () => {
    setUploadedImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  return (
    <div>
        {previewUrl ? (
            <div className="relative group">
                <img src={previewUrl} alt="Uploaded preview" className="w-full h-auto object-cover rounded-md" />
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md">
                    <button onClick={removeImage} className="bg-red-500 text-white font-bold py-2 px-4 rounded-md hover:bg-red-600 transition-colors">
                        Remove
                    </button>
                </div>
            </div>
        ) : (
            <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-md cursor-pointer transition-colors duration-200
                ${dragOver ? 'border-brand-primary bg-base-300' : 'border-base-300 hover:border-brand-light'}`}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => handleFileChange(e.target.files)}
                    accept="image/png, image/jpeg, image/webp"
                    className="hidden"
                />
                <UploadIcon className="w-10 h-10 text-text-secondary mb-2" />
                <p className="text-sm text-center text-text-secondary">
                    <span className="font-semibold text-brand-light">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-center text-gray-500">PNG, JPG, WEBP</p>
            </div>
        )}
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};
