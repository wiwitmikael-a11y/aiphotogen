import React, { useState, useEffect } from 'react';
import type { GenerationOptions, UploadedImage } from '../types';
import { ImageUploader } from './ImageUploader';
import ModelSelector from './ModelSelector';
import APIKeyManager from './APIKeyManager';
import GenerationHistoryComponent from './GenerationHistory';
import { SparklesIcon } from './icons/SparklesIcon';
import EnhancedAIService from '../services/enhancedAIService';
import { AIModelConfig } from '../services/aiModelService';

interface AdvancedControlPanelProps {
  onGenerate: (options: GenerationOptions) => void;
  isLoading: boolean;
  uploadedImage: UploadedImage | null;
  setUploadedImage: (image: UploadedImage | null) => void;
  isServerOnline: boolean;
}

const AdvancedControlPanel: React.FC<AdvancedControlPanelProps> = ({
  onGenerate,
  isLoading,
  uploadedImage,
  setUploadedImage,
  isServerOnline
}) => {
  const [options, setOptions] = useState<GenerationOptions>({
    pose: 'confident portrait pose with natural expression',
    background: 'professional studio backdrop with artistic lighting',
    clothing: 'elegant modern attire, stylish and sophisticated',
    lighting: 'professional studio lighting with dramatic shadows',
    style: 'ultra photorealistic, commercial photography style',
    bodyType: 'athletic build, model proportions',
    strength: 0.8,
    qualityMode: 'balanced',
    enableHQRefinement: false,
  });

  const [activeTab, setActiveTab] = useState<'generate' | 'models' | 'keys' | 'history'>('generate');
  const [selectedModel, setSelectedModel] = useState<AIModelConfig | null>(null);
  const [aiService] = useState(new EnhancedAIService());
  const [nsfwEnabled, setNsfwEnabled] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    // Set default model
    const models = aiService.getAvailableModels();
    if (models.length > 0) {
      setSelectedModel(models[0]);
      aiService.setModel(models[0].name);
    }
  }, [aiService]);

  const handleInputChange = (field: keyof GenerationOptions, value: any) => {
    setOptions(prev => ({ ...prev, [field]: value }));
  };

  const handleModelChange = (model: AIModelConfig) => {
    setSelectedModel(model);
    aiService.setModel(model.name);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(options);
  };

  const handleImageSelect = (imageUrl: string, prompt: string) => {
    // Use selected image from history
    setOptions(prev => ({ ...prev, pose: prompt }));
    setActiveTab('generate');
  };

  const presetPrompts = {
    artistic: {
      pose: 'artistic pose with creative expression',
      background: 'abstract artistic backdrop with creative lighting',
      clothing: 'avant-garde fashion, artistic styling',
      lighting: 'dramatic artistic lighting with creative shadows',
      style: 'fine art photography, artistic composition'
    },
    professional: {
      pose: 'professional business pose, confident stance',
      background: 'modern office environment, corporate setting',
      clothing: 'professional business attire, executive styling',
      lighting: 'clean professional lighting, corporate standard',
      style: 'corporate headshot style, professional photography'
    },
    glamour: {
      pose: 'glamorous pose with elegant expression',
      background: 'luxury setting with sophisticated ambiance',
      clothing: 'high-end fashion, glamorous styling',
      lighting: 'glamour lighting with soft highlights',
      style: 'fashion photography, glamour portrait style'
    },
    creative: {
      pose: 'creative experimental pose, unique expression',
      background: 'creative artistic environment, unconventional setting',
      clothing: 'creative fashion, experimental styling',
      lighting: 'experimental lighting, creative shadows',
      style: 'experimental photography, creative artistic style'
    }
  };

  const applyPreset = (preset: keyof typeof presetPrompts) => {
    const presetData = presetPrompts[preset];
    setOptions(prev => ({ ...prev, ...presetData }));
  };

  const tabs = [
    { id: 'generate', label: '🎨 Generate', icon: '🎨' },
    { id: 'models', label: '🤖 Models', icon: '🤖' },
    { id: 'keys', label: '🔑 API Keys', icon: '🔑' },
    { id: 'history', label: '📚 History', icon: '📚' }
  ];

  return (
    <div className="bg-base-200 rounded-lg shadow-lg sticky top-24 max-h-[90vh] overflow-hidden flex flex-col">
      {/* Tab Navigation */}
      <div className="flex border-b border-base-300">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 px-3 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-brand-primary text-white'
                : 'text-text-secondary hover:text-text-primary hover:bg-base-300'
            }`}
          >
            <span className="block text-lg mb-1">{tab.icon}</span>
            <span className="text-xs">{tab.label.split(' ')[1]}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'generate' && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Model Status */}
            <div className="p-3 bg-green-900/30 border border-green-700 rounded-lg text-green-300">
              <h3 className="font-bold text-sm">🚀 {selectedModel?.name || 'AI Model'} Ready</h3>
              <p className="text-xs mt-1">
                {selectedModel?.isUncensored ? 'Uncensored' : 'Standard'} • 
                {selectedModel?.qualityLevel.toUpperCase()} Quality • 
                {selectedModel?.supportsNSFW ? 'NSFW Supported' : 'Safe Content Only'}
              </p>
            </div>

            {/* NSFW Toggle */}
            <div className="flex items-center justify-between p-3 bg-red-900/30 border border-red-700 rounded-lg">
              <div>
                <h4 className="font-bold text-red-300">🔞 Artistic Freedom Mode</h4>
                <p className="text-xs text-red-400">Enable uncensored artistic content generation</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={nsfwEnabled}
                  onChange={(e) => setNsfwEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-base-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
              </label>
            </div>

            {/* Image Upload */}
            <div>
              <h2 className="text-xl font-semibold text-text-primary mb-3">📸 Upload Source Image</h2>
              <ImageUploader uploadedImage={uploadedImage} setUploadedImage={setUploadedImage} />
            </div>

            {/* Preset Buttons */}
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-3">🎭 Style Presets</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(presetPrompts).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => applyPreset(preset as keyof typeof presetPrompts)}
                    className="px-3 py-2 text-sm bg-base-300 text-text-secondary rounded-md hover:bg-brand-primary hover:text-white transition-colors capitalize"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Controls */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-text-primary">🎛️ Manual Controls</h3>
              
              {[
                { key: 'pose', label: 'Pose & Expression', placeholder: 'Describe the pose and facial expression...' },
                { key: 'background', label: 'Background Setting', placeholder: 'Describe the background environment...' },
                { key: 'clothing', label: 'Clothing & Style', placeholder: 'Describe clothing and accessories...' },
                { key: 'lighting', label: 'Lighting Setup', placeholder: 'Describe the lighting conditions...' },
                { key: 'style', label: 'Photography Style', placeholder: 'Describe the overall photo style...' }
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-text-secondary mb-1">{label}</label>
                  <textarea
                    value={options[key as keyof GenerationOptions] as string}
                    onChange={(e) => handleInputChange(key as keyof GenerationOptions, e.target.value)}
                    placeholder={placeholder}
                    rows={2}
                    className="w-full bg-base-300 border border-base-200 rounded-md py-2 px-3 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
                  />
                </div>
              ))}
            </div>

            {/* Advanced Settings */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center text-sm font-medium text-brand-light hover:text-brand-primary transition duration-150"
              >
                ⚙️ Advanced Settings {showAdvanced ? '▼' : '▶'}
              </button>
              
              {showAdvanced && (
                <div className="mt-4 space-y-4 p-4 bg-base-300/50 rounded-lg">
                  {/* Quality Mode */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">Quality Mode</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['fast', 'balanced', 'high'].map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => handleInputChange('qualityMode', mode)}
                          className={`px-3 py-2 text-xs rounded-md border transition duration-150 ${
                            options.qualityMode === mode
                              ? 'bg-brand-primary border-brand-primary text-white'
                              : 'bg-base-200 border-base-300 text-text-secondary hover:border-brand-light'
                          }`}
                        >
                          <div className="font-medium capitalize">{mode}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Strength Slider */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Face Similarity Strength ({options.strength})
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.1"
                      value={options.strength}
                      onChange={(e) => handleInputChange('strength', parseFloat(e.target.value))}
                      className="w-full h-2 bg-base-300 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* HQ Refinement */}
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="enableHQRefinement"
                      checked={options.enableHQRefinement}
                      onChange={(e) => handleInputChange('enableHQRefinement', e.target.checked)}
                      className="rounded border-base-300 text-brand-primary focus:ring-brand-primary"
                    />
                    <label htmlFor="enableHQRefinement" className="text-sm font-medium text-text-secondary">
                      ✨ Enable HQ Refinement
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Generate Button */}
            <button
              type="submit"
              disabled={isLoading || !uploadedImage}
              className="w-full flex items-center justify-center bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-secondary hover:to-brand-primary text-white font-bold py-4 px-6 rounded-lg transition duration-200 ease-in-out disabled:bg-base-300 disabled:cursor-not-allowed disabled:opacity-50 shadow-lg"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Generating Artistic Portrait...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-5 h-5 mr-2" />
                  Generate Uncensored Portrait
                </>
              )}
            </button>
          </form>
        )}

        {activeTab === 'models' && (
          <ModelSelector
            onModelChange={handleModelChange}
            selectedModel={selectedModel?.name}
          />
        )}

        {activeTab === 'keys' && (
          <APIKeyManager onKeysUpdated={() => {}} />
        )}

        {activeTab === 'history' && (
          <GenerationHistoryComponent onImageSelect={handleImageSelect} />
        )}
      </div>
    </div>
  );
};

export default AdvancedControlPanel;