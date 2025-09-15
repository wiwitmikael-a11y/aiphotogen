import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import AdvancedControlPanel from './components/AdvancedControlPanel';
import { DisplayArea } from './components/DisplayArea';
import type { GenerationOptions, UploadedImage } from './types';
import EnhancedAIService from './services/enhancedAIService';

const App: React.FC = () => {
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [aiService] = useState(new EnhancedAIService());

  const handleGeneration = useCallback(async (options: GenerationOptions) => {
    if (!uploadedImage) {
      setError("Please upload an image first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      // Use enhanced AI service with multiple uncensored models
      const result = await aiService.generateImage(uploadedImage, options, (progress) => {
        console.log('Generation progress:', progress);
      });
      setGeneratedImage(result);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unknown error occurred during image generation.");
    } finally {
      setIsLoading(false);
    }
  }, [uploadedImage, aiService]);
  
  return (
    <div className="min-h-screen bg-base-100 text-text-primary font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 xl:col-span-3">
            <AdvancedControlPanel 
              onGenerate={handleGeneration} 
              isLoading={isLoading}
              uploadedImage={uploadedImage}
              setUploadedImage={setUploadedImage}
              isServerOnline={true}
            />
          </div>
          <div className="lg:col-span-8 xl:col-span-9">
            <DisplayArea 
              isLoading={isLoading}
              error={error}
              generatedImage={generatedImage}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
