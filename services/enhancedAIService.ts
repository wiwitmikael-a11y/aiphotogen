import type { UploadedImage, GenerationOptions } from '../types';
import AIModelService, { GenerationRequest } from './aiModelService';
import DatabaseService from './databaseService';

// Enhanced AI Service that integrates all uncensored models
class EnhancedAIService {
  private aiModelService: AIModelService;
  private dbService: DatabaseService;
  private currentUserId: string;

  constructor() {
    this.aiModelService = new AIModelService();
    this.dbService = new DatabaseService();
    this.currentUserId = this.generateUserId();
    this.init();
  }

  private async init() {
    await this.dbService.init();
  }

  private generateUserId(): string {
    let userId = localStorage.getItem('ai_user_id');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      localStorage.setItem('ai_user_id', userId);
    }
    return userId;
  }

  /**
   * Enhanced image generation with multiple model support
   */
  async generateImage(
    image: UploadedImage,
    options: GenerationOptions,
    onProgress?: (progress: any) => void
  ): Promise<string> {
    try {
      // Build enhanced prompt
      const enhancedPrompt = this.buildEnhancedPrompt(options);
      
      // Get optimal dimensions based on quality mode
      const dimensions = this.getOptimalDimensions(options.qualityMode);
      
      // Create generation request
      const request: GenerationRequest = {
        prompt: enhancedPrompt,
        negativePrompt: this.buildNegativePrompt(),
        sourceImage: image.base64,
        width: dimensions.width,
        height: dimensions.height,
        steps: this.getOptimalSteps(options.qualityMode),
        cfgScale: 7.5,
        sampler: 'DPM++ 2M Karras',
        seed: Math.floor(Math.random() * 1000000),
        strength: options.strength,
        model: 'current',
        enableNSFW: true
      };

      // Progress tracking
      if (onProgress) {
        onProgress({ progress: 0.1, message: 'Initializing generation...' });
      }

      // Generate with current model
      const imageUrl = await this.aiModelService.generateImage(request);

      if (onProgress) {
        onProgress({ progress: 1.0, message: 'Generation complete!' });
      }

      // Save to history
      await this.saveToHistory(enhancedPrompt, imageUrl, options);

      return imageUrl;

    } catch (error) {
      console.error('Enhanced generation error:', error);
      throw error;
    }
  }

  /**
   * Face swap generation with uncensored models
   */
  async generateFaceSwap(
    sourceImage: UploadedImage,
    options: GenerationOptions,
    onProgress?: (progress: any) => void
  ): Promise<string> {
    try {
      const targetPrompt = this.buildEnhancedPrompt(options);
      
      if (onProgress) {
        onProgress({ progress: 0.2, message: 'Preparing face swap...' });
      }

      const imageUrl = await this.aiModelService.generateFaceSwap(
        sourceImage.base64,
        targetPrompt,
        options
      );

      if (onProgress) {
        onProgress({ progress: 1.0, message: 'Face swap complete!' });
      }

      await this.saveToHistory(targetPrompt, imageUrl, options, true);
      return imageUrl;

    } catch (error) {
      console.error('Face swap error:', error);
      throw error;
    }
  }

  /**
   * Build enhanced prompt with artistic freedom
   */
  private buildEnhancedPrompt(options: GenerationOptions): string {
    const qualityTokens = {
      fast: 'high quality, detailed, photorealistic',
      balanced: 'ultra high quality, highly detailed, photorealistic, professional photography',
      high: 'masterpiece, ultra high resolution, hyper detailed, photorealistic, professional commercial photography, 8K, RAW photo quality'
    };

    const baseQuality = qualityTokens[options.qualityMode] || qualityTokens.balanced;
    
    const components = [
      baseQuality,
      `pose: ${options.pose}`,
      `background: ${options.background}`,
      `clothing: ${options.clothing}`,
      `lighting: ${options.lighting}`,
      `style: ${options.style}`,
      `body type: ${options.bodyType}`,
      'artistic photography, creative composition, professional lighting'
    ];

    return components.join(', ');
  }

  /**
   * Build negative prompt for better quality
   */
  private buildNegativePrompt(): string {
    return [
      'low quality', 'blurry', 'pixelated', 'distorted', 'deformed',
      'bad anatomy', 'extra limbs', 'missing limbs', 'mutated',
      'watermark', 'text', 'signature', 'logo', 'cartoon', '3d render',
      'digital art', 'painting', 'drawing', 'sketch', 'artificial',
      'plastic skin', 'waxy', 'over-smoothed', 'fake', 'cgi'
    ].join(', ');
  }

  /**
   * Get optimal dimensions for quality mode
   */
  private getOptimalDimensions(qualityMode: string) {
    switch (qualityMode) {
      case 'fast':
        return { width: 640, height: 896 };
      case 'balanced':
        return { width: 768, height: 1024 };
      case 'high':
        return { width: 1024, height: 1366 };
      default:
        return { width: 768, height: 1024 };
    }
  }

  /**
   * Get optimal steps for quality mode
   */
  private getOptimalSteps(qualityMode: string): number {
    switch (qualityMode) {
      case 'fast': return 8;
      case 'balanced': return 16;
      case 'high': return 24;
      default: return 16;
    }
  }

  /**
   * Save generation to history
   */
  private async saveToHistory(
    prompt: string,
    imageUrl: string,
    options: GenerationOptions,
    isFaceSwap = false
  ) {
    try {
      const currentModel = this.aiModelService.getAvailableModels()[0]; // Get current model
      
      await this.dbService.saveGeneration({
        userId: this.currentUserId,
        prompt,
        modelUsed: currentModel?.name || 'Unknown',
        imageUrl,
        parameters: options,
        isNSFW: this.detectNSFWContent(prompt),
        tags: this.extractTags(prompt, isFaceSwap)
      });
    } catch (error) {
      console.error('Failed to save to history:', error);
    }
  }

  /**
   * Detect NSFW content (basic implementation)
   */
  private detectNSFWContent(prompt: string): boolean {
    const nsfwKeywords = [
      'nude', 'naked', 'topless', 'bottomless', 'lingerie', 'bikini',
      'sensual', 'erotic', 'intimate', 'seductive', 'provocative'
    ];
    
    const lowerPrompt = prompt.toLowerCase();
    return nsfwKeywords.some(keyword => lowerPrompt.includes(keyword));
  }

  /**
   * Extract tags from prompt
   */
  private extractTags(prompt: string, isFaceSwap: boolean): string[] {
    const tags: string[] = [];
    
    if (isFaceSwap) tags.push('face-swap');
    
    // Extract style tags
    if (prompt.includes('portrait')) tags.push('portrait');
    if (prompt.includes('professional')) tags.push('professional');
    if (prompt.includes('artistic')) tags.push('artistic');
    if (prompt.includes('cinematic')) tags.push('cinematic');
    if (prompt.includes('studio')) tags.push('studio');
    
    return tags;
  }

  /**
   * Get generation statistics
   */
  async getStats() {
    return await this.dbService.getStats();
  }

  /**
   * Get generation history
   */
  async getHistory() {
    return await this.dbService.getGenerationHistory(this.currentUserId);
  }

  /**
   * Set AI model
   */
  setModel(modelName: string) {
    this.aiModelService.setModel(modelName);
  }

  /**
   * Get available models
   */
  getAvailableModels() {
    return this.aiModelService.getAvailableModels();
  }
}

export default EnhancedAIService;