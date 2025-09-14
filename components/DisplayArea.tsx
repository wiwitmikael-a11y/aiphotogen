import React from 'react';
import { LoaderIcon } from './icons/LoaderIcon';

interface DisplayAreaProps {
  isLoading: boolean;
  error: string | null;
  generatedImage: string | null;
}

const Placeholder: React.FC = () => (
  <div className="text-center">
    <div className="w-24 h-24 bg-base-300 rounded-full mx-auto mb-4 flex items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-base-100" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2.5-4.5h5v-2h-5v2zm0-4h5V9h-5v2.5z"/></svg>
    </div>
    <h3 className="text-xl font-semibold text-text-primary">Your generated portrait will appear here</h3>
    <p className="text-text-secondary mt-2">Upload a photo and fill in the details on the left to get started.</p>
  </div>
);

const LoadingState: React.FC = () => (
  <div className="text-center animate-fade-in">
    <LoaderIcon className="w-16 h-16 text-brand-primary mx-auto animate-spin" />
    <h3 className="text-xl font-semibold text-text-primary mt-4">Generating your masterpiece...</h3>
    <p className="text-text-secondary mt-2">This may take a moment. The AI is working its magic!</p>
  </div>
);

const ErrorState: React.FC<{ message: string }> = ({ message }) => {
  const isAuthError = /authentication|token|authorization/i.test(message);
  const isSafetyError = message.includes("blocked by safety policies");
  const modelResponseMessage = message.startsWith("Model response:") ? message.replace("Model response:", "").trim() : null;

  return (
    <div className="text-center animate-fade-in p-6 bg-red-900/20 border border-red-500 rounded-lg max-w-2xl mx-auto">
      <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-red-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h3 className="text-xl font-semibold text-red-300">Generation Failed</h3>
      
      {isAuthError ? (
        <div className="mt-4 text-left bg-base-300/50 p-4 rounded-md">
          <h4 className="font-bold text-yellow-300">Authentication Error Detected</h4>
          <p className="text-yellow-400 mt-1 italic">"{message}"</p>
          <p className="text-text-secondary mt-3">
            This likely means your Replicate API Token is missing or incorrect. Please follow these steps:
          </p>
          <ul className="list-disc list-inside space-y-2 mt-3 text-text-secondary text-sm">
            <li>
              <strong>For the live website:</strong> Go to your project settings on Vercel, find "Environment Variables", and ensure `REPLICATE_API_TOKEN` is set correctly. You may need to redeploy.
            </li>
            <li>
              <strong>For local development:</strong> Ensure you have a `.env` file in your project root with the line `REPLICATE_API_TOKEN=r8_...` and restart your `vercel dev` server.
            </li>
          </ul>
           <p className="text-xs text-gray-400 mt-3">
            Refer to the `README.md` file for more detailed instructions.
          </p>
        </div>
      ) : modelResponseMessage ? (
        <div className="mt-4 text-left bg-base-300/50 p-3 rounded-md">
          <p className="font-semibold text-text-secondary">The AI model responded with a message:</p>
          <p className="text-red-400 mt-1 italic">"{modelResponseMessage}"</p>
        </div>
      ) : (
         <p className="text-red-400 mt-2">{message}</p>
      )}

      {(!isAuthError && (isSafetyError || modelResponseMessage)) && (
        <div className="mt-6 text-left text-text-secondary text-sm space-y-2">
           <h4 className="font-semibold text-text-primary">What you can try:</h4>
           <ul className="list-disc list-inside space-y-1">
             <li>Adjust the text prompts (pose, clothing, etc.) to be more general and neutral.</li>
             <li>Try uploading a different photo with a clear, forward-facing view of the face.</li>
             <li>Avoid prompts that could be interpreted as sensitive or controversial.</li>
           </ul>
        </div>
      )}
    </div>
  );
};


const GeneratedImage: React.FC<{ src: string }> = ({ src }) => (
    <div className="w-full animate-fade-in">
        <img src={src} alt="Generated photorealistic portrait" className="w-full h-auto object-contain rounded-lg shadow-2xl" />
        <div className="mt-4 text-center">
            <a 
                href={src} 
                download="ai-portrait.png"
                className="inline-block bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-6 rounded-md transition duration-200"
            >
                Download Image
            </a>
        </div>
    </div>
);


export const DisplayArea: React.FC<DisplayAreaProps> = ({ isLoading, error, generatedImage }) => {
  return (
    <div className="bg-base-200 p-4 md:p-8 rounded-lg shadow-lg min-h-[400px] lg:min-h-[calc(100vh-150px)] flex items-center justify-center sticky top-24">
      {isLoading && <LoadingState />}
      {!isLoading && error && <ErrorState message={error} />}
      {!isLoading && !error && generatedImage && <GeneratedImage src={generatedImage} />}
      {!isLoading && !error && !generatedImage && <Placeholder />}
    </div>
  );
};