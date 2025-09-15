import React, { useState, useEffect } from 'react';
import DatabaseService from '../services/databaseService';

interface APIKeyManagerProps {
  onKeysUpdated: () => void;
}

const APIKeyManager: React.FC<APIKeyManagerProps> = ({ onKeysUpdated }) => {
  const [apiKeys, setApiKeys] = useState<{ [provider: string]: string }>({});
  const [showKeys, setShowKeys] = useState<{ [provider: string]: boolean }>({});
  const [dbService] = useState(new DatabaseService());

  const providers = [
    {
      name: 'huggingface',
      label: 'Hugging Face',
      description: 'Free tier available, get token from huggingface.co/settings/tokens',
      required: false,
      placeholder: 'hf_xxxxxxxxxxxxxxxxxxxxxxxxx'
    },
    {
      name: 'replicate',
      label: 'Replicate',
      description: 'Free tier with credits, get token from replicate.com/account/api-tokens',
      required: false,
      placeholder: 'r8_xxxxxxxxxxxxxxxxxxxxxxxxx'
    },
    {
      name: 'together',
      label: 'Together AI',
      description: 'Free tier available, get token from api.together.xyz',
      required: false,
      placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxx'
    }
  ];

  useEffect(() => {
    loadStoredKeys();
  }, []);

  const loadStoredKeys = async () => {
    const keys: { [provider: string]: string } = {};
    for (const provider of providers) {
      const key = await dbService.getAPIKey(provider.name);
      if (key) {
        keys[provider.name] = key;
      }
    }
    setApiKeys(keys);
  };

  const handleKeyChange = (provider: string, value: string) => {
    setApiKeys(prev => ({
      ...prev,
      [provider]: value
    }));
  };

  const saveKey = async (provider: string) => {
    const key = apiKeys[provider];
    if (key && key.trim()) {
      await dbService.storeAPIKey(provider, key.trim());
      onKeysUpdated();
      
      // Show success feedback
      const element = document.getElementById(`save-${provider}`);
      if (element) {
        element.textContent = '✓ Saved';
        element.className = element.className.replace('bg-brand-primary', 'bg-green-500');
        setTimeout(() => {
          element.textContent = 'Save';
          element.className = element.className.replace('bg-green-500', 'bg-brand-primary');
        }, 2000);
      }
    }
  };

  const toggleKeyVisibility = (provider: string) => {
    setShowKeys(prev => ({
      ...prev,
      [provider]: !prev[provider]
    }));
  };

  const testKey = async (provider: string) => {
    const key = apiKeys[provider];
    if (!key) return;

    // Simple test based on provider
    try {
      let testUrl = '';
      let headers: any = {};

      switch (provider) {
        case 'huggingface':
          testUrl = 'https://api-inference.huggingface.co/models/gpt2';
          headers = { 'Authorization': `Bearer ${key}` };
          break;
        case 'replicate':
          testUrl = 'https://api.replicate.com/v1/models';
          headers = { 'Authorization': `Token ${key}` };
          break;
        case 'together':
          testUrl = 'https://api.together.xyz/v1/models';
          headers = { 'Authorization': `Bearer ${key}` };
          break;
      }

      const response = await fetch(testUrl, { headers });
      const element = document.getElementById(`test-${provider}`);
      
      if (element) {
        if (response.ok) {
          element.textContent = '✓ Valid';
          element.className = element.className.replace('bg-yellow-500', 'bg-green-500');
        } else {
          element.textContent = '✗ Invalid';
          element.className = element.className.replace('bg-yellow-500', 'bg-red-500');
        }
        
        setTimeout(() => {
          element.textContent = 'Test';
          element.className = element.className.replace(/bg-(green|red)-500/, 'bg-yellow-500');
        }, 3000);
      }
    } catch (error) {
      console.error('Key test failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-primary">🔑 API Key Management</h3>
        <button
          onClick={loadStoredKeys}
          className="px-3 py-1 text-xs bg-base-300 text-text-secondary rounded-md hover:bg-base-200 transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="p-4 bg-blue-900/30 border border-blue-700 rounded-lg text-blue-300 text-sm">
        <p className="font-bold mb-2">💡 Free Tier Information</p>
        <ul className="space-y-1 text-xs">
          <li>• <strong>Pollinations AI:</strong> Completely free, no API key needed</li>
          <li>• <strong>Hugging Face:</strong> Free tier with rate limits</li>
          <li>• <strong>Replicate:</strong> Free credits monthly</li>
          <li>• <strong>Together AI:</strong> Free tier available</li>
        </ul>
      </div>

      <div className="space-y-4">
        {providers.map((provider) => (
          <div key={provider.name} className="p-4 bg-base-200 rounded-lg border border-base-300">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-text-primary">{provider.label}</h4>
              {!provider.required && (
                <span className="px-2 py-1 text-xs bg-green-500 text-white rounded-full">
                  Optional
                </span>
              )}
            </div>
            
            <p className="text-xs text-text-secondary mb-3">{provider.description}</p>
            
            <div className="space-y-2">
              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <input
                    type={showKeys[provider.name] ? 'text' : 'password'}
                    value={apiKeys[provider.name] || ''}
                    onChange={(e) => handleKeyChange(provider.name, e.target.value)}
                    placeholder={provider.placeholder}
                    className="w-full bg-base-300 border border-base-200 rounded-md py-2 px-3 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                  <button
                    type="button"
                    onClick={() => toggleKeyVisibility(provider.name)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary"
                  >
                    {showKeys[provider.name] ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                
                <button
                  id={`save-${provider.name}`}
                  onClick={() => saveKey(provider.name)}
                  disabled={!apiKeys[provider.name]?.trim()}
                  className="px-3 py-2 bg-brand-primary text-white text-sm rounded-md hover:bg-brand-secondary disabled:bg-base-300 disabled:cursor-not-allowed transition-colors"
                >
                  Save
                </button>
                
                <button
                  id={`test-${provider.name}`}
                  onClick={() => testKey(provider.name)}
                  disabled={!apiKeys[provider.name]?.trim()}
                  className="px-3 py-2 bg-yellow-500 text-white text-sm rounded-md hover:bg-yellow-600 disabled:bg-base-300 disabled:cursor-not-allowed transition-colors"
                >
                  Test
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-xs">
        <p className="font-bold">🔒 Security Notice</p>
        <p>API keys are stored locally in your browser's encrypted storage. They are never sent to our servers.</p>
      </div>
    </div>
  );
};

export default APIKeyManager;