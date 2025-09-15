/**
 * Database Service for AI Model Management
 * Stores generation history, model preferences, and API keys
 */

export interface GenerationHistory {
  id: string;
  userId?: string;
  prompt: string;
  negativePrompt?: string;
  modelUsed: string;
  imageUrl: string;
  parameters: any;
  createdAt: Date;
  isNSFW: boolean;
  tags: string[];
}

export interface UserPreferences {
  id: string;
  userId: string;
  preferredModel: string;
  defaultParameters: any;
  nsfwEnabled: boolean;
  apiKeys: { [provider: string]: string };
  createdAt: Date;
  updatedAt: Date;
}

class DatabaseService {
  private dbName = 'ai_portrait_generator';
  private version = 1;
  private db: IDBDatabase | null = null;

  /**
   * Initialize IndexedDB database
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Generation history store
        if (!db.objectStoreNames.contains('generations')) {
          const generationStore = db.createObjectStore('generations', { keyPath: 'id' });
          generationStore.createIndex('userId', 'userId', { unique: false });
          generationStore.createIndex('modelUsed', 'modelUsed', { unique: false });
          generationStore.createIndex('createdAt', 'createdAt', { unique: false });
          generationStore.createIndex('isNSFW', 'isNSFW', { unique: false });
        }

        // User preferences store
        if (!db.objectStoreNames.contains('preferences')) {
          const prefStore = db.createObjectStore('preferences', { keyPath: 'id' });
          prefStore.createIndex('userId', 'userId', { unique: true });
        }

        // API keys store (encrypted)
        if (!db.objectStoreNames.contains('apiKeys')) {
          const keyStore = db.createObjectStore('apiKeys', { keyPath: 'provider' });
        }
      };
    });
  }

  /**
   * Save generation to history
   */
  async saveGeneration(generation: Omit<GenerationHistory, 'id' | 'createdAt'>): Promise<string> {
    if (!this.db) await this.init();

    const id = `gen_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    const record: GenerationHistory = {
      ...generation,
      id,
      createdAt: new Date()
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['generations'], 'readwrite');
      const store = transaction.objectStore('generations');
      const request = store.add(record);

      request.onsuccess = () => resolve(id);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get generation history
   */
  async getGenerationHistory(userId?: string, limit = 50): Promise<GenerationHistory[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['generations'], 'readonly');
      const store = transaction.objectStore('generations');
      const index = store.index('createdAt');
      const request = index.openCursor(null, 'prev');
      
      const results: GenerationHistory[] = [];
      let count = 0;

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor && count < limit) {
          const record = cursor.value as GenerationHistory;
          if (!userId || record.userId === userId) {
            results.push(record);
            count++;
          }
          cursor.continue();
        } else {
          resolve(results);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Save user preferences
   */
  async savePreferences(preferences: Omit<UserPreferences, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    if (!this.db) await this.init();

    const id = `pref_${preferences.userId}`;
    const record: UserPreferences = {
      ...preferences,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['preferences'], 'readwrite');
      const store = transaction.objectStore('preferences');
      const request = store.put(record);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get user preferences
   */
  async getPreferences(userId: string): Promise<UserPreferences | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['preferences'], 'readonly');
      const store = transaction.objectStore('preferences');
      const index = store.index('userId');
      const request = index.get(userId);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Store API key securely
   */
  async storeAPIKey(provider: string, apiKey: string): Promise<void> {
    if (!this.db) await this.init();

    // Simple encryption (in production, use proper encryption)
    const encrypted = btoa(apiKey);

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['apiKeys'], 'readwrite');
      const store = transaction.objectStore('apiKeys');
      const request = store.put({ provider, key: encrypted });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get stored API key
   */
  async getAPIKey(provider: string): Promise<string | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['apiKeys'], 'readonly');
      const store = transaction.objectStore('apiKeys');
      const request = store.get(provider);

      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          // Decrypt
          resolve(atob(result.key));
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear all data
   */
  async clearAll(): Promise<void> {
    if (!this.db) await this.init();

    const stores = ['generations', 'preferences', 'apiKeys'];
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(stores, 'readwrite');
      let completed = 0;

      stores.forEach(storeName => {
        const store = transaction.objectStore(storeName);
        const request = store.clear();
        
        request.onsuccess = () => {
          completed++;
          if (completed === stores.length) {
            resolve();
          }
        };
        request.onerror = () => reject(request.error);
      });
    });
  }

  /**
   * Get statistics
   */
  async getStats(): Promise<any> {
    if (!this.db) await this.init();

    const history = await this.getGenerationHistory();
    const modelUsage: { [key: string]: number } = {};
    let nsfwCount = 0;

    history.forEach(gen => {
      modelUsage[gen.modelUsed] = (modelUsage[gen.modelUsed] || 0) + 1;
      if (gen.isNSFW) nsfwCount++;
    });

    return {
      totalGenerations: history.length,
      modelUsage,
      nsfwGenerations: nsfwCount,
      mostUsedModel: Object.keys(modelUsage).reduce((a, b) => 
        modelUsage[a] > modelUsage[b] ? a : b, Object.keys(modelUsage)[0]
      )
    };
  }
}

export default DatabaseService;