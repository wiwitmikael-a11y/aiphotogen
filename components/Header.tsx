
import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

export const Header: React.FC = () => {
  return (
    <header className="bg-base-200/50 backdrop-blur-sm sticky top-0 z-10 border-b border-base-300">
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-center">
        <SparklesIcon className="w-8 h-8 text-brand-primary" />
        <h1 className="ml-3 text-2xl font-bold tracking-tight text-text-primary">
          AI Photorealistic Portrait Generator
        </h1>
      </div>
    </header>
  );
};
