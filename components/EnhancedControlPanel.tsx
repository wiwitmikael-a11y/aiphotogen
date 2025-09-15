import React, { useState, useEffect } from 'react';
import type { GenerationOptions, UploadedImage, BodyAnalysis } from '../types';
import { ImageUploader } from './ImageUploader';
import { SparklesIcon } from './icons/SparklesIcon';
import { analyzeBodyParameters } from '../services/aiService';

interface EnhancedControlPanelProps {
  onGenerate: (options: GenerationOptions) => void;
  isLoading: boolean;
  uploadedImage: UploadedImage | null;
  setUploadedImage: (image: UploadedImage | null) => void;
  isServerOnline: boolean;
}

const ServerStatusIndicator: React.FC<{ isOnline: boolean }> = ({ isOnline }) => {
  if (isOnline) {
    return (
      <div className="p-3 mb-4 bg-green-900/30 border border-green-700 rounded-lg text-green-300">
        <h3 className="font-bold text-sm">🚀 Ultra AI Studio Ready</h3>
        <p className="text-xs mt-1">FLUX + PuLID-FLUX II model loaded • Professional portraits only</p>
      </div>
    );
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

const AdvancedSlider: React.FC<{
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  description: string;
}> = ({ id, label, value, min, max, step, onChange, description }) => (
  <div className="space-y-2">
    <label htmlFor={id} className="block text-sm font-medium text-text-secondary">
      {label} <span className="text-brand-primary">({value})</span>
    </label>
    <input
      type="range"
      id={id}
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-2 bg-base-300 rounded-lg appearance-none cursor-pointer slider"
    />
    <p className="text-xs text-text-secondary opacity-75">{description}</p>
  </div>
);

const SuggestionChips: React.FC<{
  title: string;
  suggestions: string[];
  onSelect: (suggestion: string) => void;
  selected?: string;
}> = ({ title, suggestions, onSelect, selected }) => (
  <div className="space-y-2">
    <h4 className="text-sm font-medium text-text-secondary">{title}</h4>
    <div className="flex flex-wrap gap-1">
      {suggestions.slice(0, 3).map((suggestion, index) => (
        <button
          key={index}
          type="button"
          onClick={() => onSelect(suggestion)}
          className={`px-2 py-1 text-xs rounded-full border transition duration-150 ${
            selected === suggestion
              ? 'bg-brand-primary border-brand-primary text-white'
              : 'bg-base-300 border-base-300 text-text-secondary hover:border-brand-light'
          }`}
        >
          {suggestion.length > 30 ? `${suggestion.substring(0, 30)}...` : suggestion}
        </button>
      ))}
    </div>
  </div>
);

export const EnhancedControlPanel: React.FC<EnhancedControlPanelProps> = ({ 
  onGenerate, 
  isLoading, 
  uploadedImage, 
  setUploadedImage,
  isServerOnline,
}) => {
  const [options, setOptions] = useState<GenerationOptions>({
    pose: 'confident three-quarter angle with subtle smile',
    background: 'professional studio backdrop with subtle texture', 
    clothing: 'elegant black blazer with white shirt',
    lighting: 'professional studio lighting with soft key light',
    style: 'ultra high-resolution commercial photography style',
    bodyType: 'elegant athletic build, model-like proportions',
    strength: 0.8,
  });

  const [bodyAnalysis, setBodyAnalysis] = useState<BodyAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Auto-analyze when image is uploaded
  useEffect(() => {
    if (uploadedImage && isServerOnline) {
      handleBodyAnalysis();
    }
  }, [uploadedImage, isServerOnline]);

  const handleBodyAnalysis = async () => {
    if (!uploadedImage) return;
    
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeBodyParameters(uploadedImage);
      setBodyAnalysis(analysis);
      
      // Auto-apply AI suggestions
      setOptions(prev => ({
        ...prev,
        bodyType: analysis.bodyType,
        pose: analysis.suggestedPoses[0] || prev.pose,
        clothing: analysis.recommendedClothing[0] || prev.clothing,
        lighting: analysis.optimalLighting[0] || prev.lighting,
        background: analysis.backgroundSuggestions[0] || prev.background,
        style: analysis.styleRecommendations[0] || prev.style,
      }));
    } catch (error) {
      console.error('Body analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleInputChange = (field: keyof GenerationOptions, value: any) => {
    setOptions(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(options);
  };

  return (
    <div className="bg-base-200 p-6 rounded-lg shadow-lg sticky top-24 max-h-[90vh] overflow-y-auto">
      <ServerStatusIndicator isOnline={isServerOnline} />
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Image Upload Section */}
        <div>
          <h2 className="text-xl font-semibold text-text-primary mb-3">📸 Upload Face Photo</h2>
          <ImageUploader uploadedImage={uploadedImage} setUploadedImage={setUploadedImage} />
          
          {uploadedImage && (
            <div className="mt-3 space-y-2">
              <div className="p-3 bg-blue-900/30 border border-blue-700 rounded-md text-xs text-blue-300">
                <span className="font-bold">🧠 AI Face Analysis:</span> Advanced body parameter detection active
              </div>
              
              {isAnalyzing && (
                <div className="p-2 bg-yellow-900/30 border border-yellow-700 rounded-md text-xs text-yellow-300">
                  🤖 Analyzing facial features and suggesting optimal parameters...
                </div>
              )}
              
              {bodyAnalysis && (
                <div className="p-2 bg-green-900/30 border border-green-700 rounded-md text-xs text-green-300">
                  ✅ AI Analysis Complete • Confidence: {Math.round(bodyAnalysis.confidence * 100)}%
                </div>
              )}
            </div>
          )}
        </div>

        {/* AI Suggestions Section */}
        {bodyAnalysis && (
          <div className="border-t border-base-300 pt-4">
            <h3 className="text-lg font-semibold text-text-primary mb-3">🤖 AI Suggestions</h3>
            <div className="space-y-3">
              <SuggestionChips
                title="💃 Poses"
                suggestions={bodyAnalysis.suggestedPoses}
                onSelect={(pose) => handleInputChange('pose', pose)}
                selected={options.pose}
              />
              <SuggestionChips
                title="👔 Clothing"
                suggestions={bodyAnalysis.recommendedClothing}
                onSelect={(clothing) => handleInputChange('clothing', clothing)}
                selected={options.clothing}
              />
              <SuggestionChips
                title="💡 Lighting"
                suggestions={bodyAnalysis.optimalLighting}
                onSelect={(lighting) => handleInputChange('lighting', lighting)}
                selected={options.lighting}
              />
            </div>
          </div>
        )}

        {/* Manual Controls */}
        <div className="border-t border-base-300 pt-4">
          <h3 className="text-lg font-semibold text-text-primary mb-3">🎛️ Manual Controls</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Pose & Expression</label>
              <input
                type="text"
                value={options.pose}
                onChange={(e) => handleInputChange('pose', e.target.value)}
                className="w-full bg-base-200 border border-base-300 rounded-md shadow-sm py-2 px-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                placeholder="Describe the pose and expression..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Background</label>
              <input
                type="text"
                value={options.background}
                onChange={(e) => handleInputChange('background', e.target.value)}
                className="w-full bg-base-200 border border-base-300 rounded-md shadow-sm py-2 px-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                placeholder="Describe the background setting..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Clothing & Style</label>
              <input
                type="text"
                value={options.clothing}
                onChange={(e) => handleInputChange('clothing', e.target.value)}
                className="w-full bg-base-200 border border-base-300 rounded-md shadow-sm py-2 px-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                placeholder="Describe the clothing and accessories..."
              />
            </div>
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="border-t border-base-300 pt-4">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center text-sm font-medium text-brand-light hover:text-brand-primary transition duration-150"
          >
            ⚙️ Advanced Settings {showAdvanced ? '▼' : '▶'}
          </button>
          
          {showAdvanced && (
            <div className="mt-4 space-y-4 p-4 bg-base-300/50 rounded-lg">
              <AdvancedSlider
                id="strength"
                label="Face Similarity Strength"
                value={options.strength}
                min={0.1}
                max={1.0}
                step={0.1}
                onChange={(value) => handleInputChange('strength', value)}
                description="How closely the generated image matches the uploaded face"
              />
              
              <div className="p-3 bg-blue-900/30 border border-blue-700 rounded-md text-xs text-blue-300">
                <span className="font-bold">🔒 Content Policy:</span> Professional portraits only. Explicit content is not permitted.
              </div>
            </div>
          )}
        </div>

        {/* Generate Button */}
        <button
          type="submit"
          disabled={isLoading || !uploadedImage || !isServerOnline}
          className="w-full flex items-center justify-center bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-secondary hover:to-brand-primary text-white font-bold py-4 px-6 rounded-lg transition duration-200 ease-in-out disabled:bg-base-300 disabled:cursor-not-allowed disabled:opacity-50 shadow-lg"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Generating Ultra Photorealistic Portrait...
            </>
          ) : (
            <>
              <SparklesIcon className="w-5 h-5 mr-2" />
              Generate Professional Portrait
            </>
          )}
        </button>
        
        {uploadedImage && isServerOnline && (
          <p className="text-xs text-center text-text-secondary">
            Using FLUX.1 + PuLID-FLUX II • Professional Mode
          </p>
        )}
      </form>
    </div>
  );
};

export default EnhancedControlPanel;