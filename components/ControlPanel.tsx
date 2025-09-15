import React, { useState } from 'react';
import type { GenerationOptions, UploadedImage } from '../types';
import { ImageUploader } from './ImageUploader';
import { SparklesIcon } from './icons/SparklesIcon';

interface ControlPanelProps {
  onGenerate: (options: GenerationOptions) => void;
  isLoading: boolean;
  uploadedImage: UploadedImage | null;
  setUploadedImage: (image: UploadedImage | null) => void;
  isServerOnline: boolean;
}

const ServerStatusIndicator: React.FC<{ isOnline: boolean }> = ({ isOnline }) => {
  if (isOnline) {
    return null;
  }
  return (
    <div className="p-4 mb-6 bg-yellow-900/30 border border-yellow-700 rounded-lg text-yellow-300 animate-fade-in" role="alert">
      <h3 className="font-bold text-md">Server Connection Issue</h3>
      <p className="text-sm mt-1">
        Could not connect to the backend server. Please ensure the application is running properly.
      </p>
    </div>
  );
};


const ControlInput: React.FC<{
    id: keyof GenerationOptions;
    label: string;
    value: string;
    placeholder: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ id, label, value, placeholder, onChange }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-text-secondary mb-1">
            {label}
        </label>
        <input
            type="text"
            id={id}
            name={id}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-base-200 border border-base-300 rounded-md shadow-sm py-2 px-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary transition duration-150"
        />
    </div>
);

export const ControlPanel: React.FC<ControlPanelProps> = ({ 
  onGenerate, 
  isLoading, 
  uploadedImage, 
  setUploadedImage,
  isServerOnline,
}) => {
  const [options, setOptions] = useState<GenerationOptions>({
    pose: 'Smiling, looking at the camera',
    background: 'A cozy, sunlit cafe',
    clothing: 'A casual black turtleneck sweater',
    lighting: 'Soft, natural window light',
    style: 'Shallow depth of field, cinematic, photorealistic',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setOptions(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(options);
  };

  return (
    <div className="bg-base-200 p-6 rounded-lg shadow-lg sticky top-24">
      <ServerStatusIndicator isOnline={isServerOnline} />
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div>
            <h2 className="text-xl font-semibold text-text-primary mb-2">1. Upload Face Photo</h2>
            <ImageUploader uploadedImage={uploadedImage} setUploadedImage={setUploadedImage} />
            <div className="mt-3 p-3 bg-green-900/30 border border-green-700 rounded-md text-xs text-green-300">
              <span className="font-bold">Face Transfer Activated:</span> The AI will use the face from your uploaded photo and place it into the new scene described below.
            </div>
        </div>
        
        <div>
            <h2 className="text-xl font-semibold text-text-primary pt-4 border-t border-base-300">2. Customize Portrait</h2>
            <ControlInput 
                id="pose"
                label="Pose & Expression"
                value={options.pose}
                onChange={handleChange}
                placeholder="e.g., Looking thoughtful, laughing"
            />
            <div className="space-y-4 mt-4">
                <ControlInput 
                    id="background"
                    label="Background"
                    value={options.background}
                    onChange={handleChange}
                    placeholder="e.g., Autumn park, modern office"
                />
                <ControlInput 
                    id="clothing"
                    label="Clothing"
                    value={options.clothing}
                    onChange={handleChange}
                    placeholder="e.g., Blue denim jacket, formal suit"
                />
                <ControlInput 
                    id="lighting"
                    label="Lighting"
                    value={options.lighting}
                    onChange={handleChange}
                    placeholder="e.g., Golden hour, studio lighting"
                />
                <ControlInput 
                    id="style"
                    label="Photo Style"
                    value={options.style}
                    onChange={handleChange}
                    placeholder="e.g., Black and white, vintage film"
                />
            </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !uploadedImage || !isServerOnline}
          className="w-full flex items-center justify-center bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3 px-4 rounded-md transition duration-200 ease-in-out disabled:bg-base-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            'Generating...'
          ) : (
            <>
              <SparklesIcon className="w-5 h-5 mr-2" />
              Generate Image
            </>
          )}
        </button>
      </form>
    </div>
  );
};