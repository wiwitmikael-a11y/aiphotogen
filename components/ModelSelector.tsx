import React, { useState, useEffect } from 'react';
import AIModelService, { AIModelConfig } from '../services/aiModelService';

interface ModelSelectorProps {
  onModelChange: (model: AIModelConfig) => void;
  selectedModel?: string;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ onModelChange, selectedModel }) => {
  const [models, setModels] = useState<AIModelConfig[]>([]);
  const [aiService] = useState(new AIModelService());

  useEffect(() => {
    const availableModels = aiService.getAvailableModels();
    setModels(availableModels);
  }, [aiService]);

  const handleModelSelect = (model: AIModelConfig) => {
    aiService.setModel(model.name);
    onModelChange(model);
  };

  const getModelIcon = (provider: string) => {
    switch (provider) {
      case 'pollinations': return '🌸';
      case 'huggingface': return '🤗';
      case 'replicate': return '🔄';
      case 'together': return '🤝';
      default: return '🤖';
    }
  };

  const getQualityBadge = (level: string) => {
    const colors = {
      high: 'bg-blue-500',
      ultra: 'bg-purple-500',
      professional: 'bg-green-500'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-text-primary">🎨 AI Model Selection</h3>
      
      <div className="grid grid-cols-1 gap-3">
        {models.map((model) => (
          <div
            key={model.name}
            onClick={() => handleModelSelect(model)}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
              selectedModel === model.name
                ? 'border-brand-primary bg-brand-primary/10'
                : 'border-base-300 bg-base-200 hover:border-brand-light'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-xl">{getModelIcon(model.provider)}</span>
                  <h4 className="font-semibold text-text-primary">{model.name}</h4>
                  {model.isUncensored && (
                    <span className="px-2 py-1 text-xs bg-red-500 text-white rounded-full">
                      Uncensored
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`px-2 py-1 text-xs text-white rounded-full ${getQualityBadge(model.qualityLevel)}`}>
                    {model.qualityLevel.toUpperCase()}
                  </span>
                  <span className="text-xs text-text-secondary">
                    Max: {model.maxResolution}
                  </span>
                  {model.supportsFaceSwap && (
                    <span className="px-2 py-1 text-xs bg-yellow-500 text-white rounded-full">
                      Face Swap
                    </span>
                  )}
                </div>

                <p className="text-xs text-text-secondary capitalize">
                  Provider: {model.provider}
                </p>
              </div>

              <div className="flex flex-col items-end space-y-1">
                <div className="flex items-center space-x-1">
                  {model.supportsNSFW && (
                    <span className="text-xs text-green-400">✓ NSFW</span>
                  )}
                  <span className="text-xs text-green-400">✓ Free</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 bg-yellow-900/30 border border-yellow-700 rounded-lg text-yellow-300 text-xs">
        <p className="font-bold">🎭 Artistic Freedom Mode</p>
        <p>All models support uncensored artistic content generation. Use responsibly and in accordance with local laws.</p>
      </div>
    </div>
  );
};

export default ModelSelector;