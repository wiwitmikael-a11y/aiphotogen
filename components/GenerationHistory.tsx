import React, { useState, useEffect } from 'react';
import DatabaseService, { GenerationHistory } from '../services/databaseService';

interface GenerationHistoryProps {
  onImageSelect?: (imageUrl: string, prompt: string) => void;
}

const GenerationHistoryComponent: React.FC<GenerationHistoryProps> = ({ onImageSelect }) => {
  const [history, setHistory] = useState<GenerationHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'nsfw' | 'safe'>('all');
  const [dbService] = useState(new DatabaseService());

  useEffect(() => {
    loadHistory();
  }, [filter]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const allHistory = await dbService.getGenerationHistory();
      const filtered = allHistory.filter(item => {
        if (filter === 'nsfw') return item.isNSFW;
        if (filter === 'safe') return !item.isNSFW;
        return true;
      });
      setHistory(filtered);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    if (confirm('Are you sure you want to clear all generation history?')) {
      await dbService.clearAll();
      setHistory([]);
    }
  };

  const downloadImage = async (imageUrl: string, prompt: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-portrait-${prompt.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-primary">📚 Generation History</h3>
        <div className="flex items-center space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 py-1 bg-base-300 border border-base-200 rounded-md text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            <option value="all">All ({history.length})</option>
            <option value="safe">Safe Content</option>
            <option value="nsfw">NSFW Content</option>
          </select>
          <button
            onClick={clearHistory}
            className="px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-8 text-text-secondary">
          <p>No generation history found.</p>
          <p className="text-sm mt-2">Start generating images to see your history here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
          {history.map((item) => (
            <div key={item.id} className="bg-base-200 rounded-lg overflow-hidden border border-base-300">
              <div className="relative group">
                <img
                  src={item.imageUrl}
                  alt={item.prompt}
                  className="w-full h-32 object-cover cursor-pointer"
                  onClick={() => onImageSelect?.(item.imageUrl, item.prompt)}
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                  <button
                    onClick={() => onImageSelect?.(item.imageUrl, item.prompt)}
                    className="px-2 py-1 bg-brand-primary text-white text-xs rounded hover:bg-brand-secondary"
                  >
                    Use
                  </button>
                  <button
                    onClick={() => downloadImage(item.imageUrl, item.prompt)}
                    className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                  >
                    Download
                  </button>
                </div>
                {item.isNSFW && (
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                      NSFW
                    </span>
                  </div>
                )}
              </div>
              
              <div className="p-3">
                <p className="text-xs text-text-primary font-medium mb-1 line-clamp-2">
                  {item.prompt}
                </p>
                <div className="flex items-center justify-between text-xs text-text-secondary">
                  <span>{item.modelUsed}</span>
                  <span>{formatDate(item.createdAt)}</span>
                </div>
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-base-300 text-text-secondary text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GenerationHistoryComponent;