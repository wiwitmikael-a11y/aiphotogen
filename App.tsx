import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ControlPanel } from './components/ControlPanel';
import { DisplayArea } from './components/DisplayArea';
import type { GenerationOptions, UploadedImage } from './types';
import { generateImage, checkServerStatus } from './services/aiService';

const App: React.FC = () => {
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isServerOnline, setIsServerOnline] = useState<boolean>(true);

  // Periodically check if the local proxy server is running
  useEffect(() => {
    const checkStatus = async () => {
      const status = await checkServerStatus();
      setIsServerOnline(status);
    };

    checkStatus(); // Check immediately on load
    const intervalId = setInterval(checkStatus, 5000); // And every 5 seconds

    return () => clearInterval(intervalId); // Cleanup on component unmount
  }, []);
  
  const handleGeneration = useCallback(async (options: GenerationOptions) => {
    if (!uploadedImage) {
      setError("Please upload an image first.");
      return;
    }
    if (!isServerOnline) {
      setError("Cannot generate image. The local AI server is not running.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      // The service now calls our secure backend proxy
      const result = await generateImage(uploadedImage, options);
      setGeneratedImage(result);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unknown error occurred during image generation.");
    } finally {
      setIsLoading(false);
    }
  }, [uploadedImage, isServerOnline]);
  
  return (
    <div className="min-h-screen bg-base-100 text-text-primary font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 xl:col-span-3">
            <ControlPanel 
              onGenerate={handleGeneration} 
              isLoading={isLoading}
              uploadedImage={uploadedImage}
              setUploadedImage={setUploadedImage}
              isServerOnline={isServerOnline}
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
