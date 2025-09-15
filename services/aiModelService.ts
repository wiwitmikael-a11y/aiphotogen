/**
 * Advanced AI Model Service
 * Integrates multiple uncensored AI models for artistic content generation
 * Supports FLUX, Stable Diffusion, and other open-source models
 */

export interface AIModelConfig {
  name: string;
  provider: string;
  apiUrl: string;
  apiKey?: string;
  modelId: string;
  maxResolution: string;
  supportsFaceSwap: boolean;
  supportsNSFW: boolean;
  isUncensored: boolean;
  qualityLevel: 'high' | 'ultra' | 'professional';
}

export interface GenerationRequest {
  prompt: string;
  negativePrompt?: string;
  sourceImage?: string;
  width: number;
  height: number;
  steps: number;
  cfgScale: number;
  sampler: string;
  seed?: number;
  strength?: number;
  model: string;
  enableNSFW?: boolean;
}

class AIModelService {
  private models: AIModelConfig[] = [
    // Hugging Face - Free uncensored models
    {
      name: 'FLUX.1-dev Uncensored',
      provider: 'huggingface',
      apiUrl: 'https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev',
      modelId: 'black-forest-labs/FLUX.1-dev',
      maxResolution: '1024x1024',
      supportsFaceSwap: false,
      supportsNSFW: true,
      isUncensored: true,
      qualityLevel: 'ultra'
    },
    {
      name: 'Stable Diffusion XL Uncensored',
      provider: 'huggingface',
      apiUrl: 'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
      modelId: 'stabilityai/stable-diffusion-xl-base-1.0',
      maxResolution: '1024x1024',
      supportsFaceSwap: false,
      supportsNSFW: true,
      isUncensored: true,
      qualityLevel: 'high'
    },
    {
      name: 'Realistic Vision V6.0',
      provider: 'huggingface',
      apiUrl: 'https://api-inference.huggingface.co/models/SG161222/Realistic_Vision_V6.0_B1_noVAE',
      modelId: 'SG161222/Realistic_Vision_V6.0_B1_noVAE',
      maxResolution: '768x768',
      supportsFaceSwap: true,
      supportsNSFW: true,
      isUncensored: true,
      qualityLevel: 'professional'
    },
    // Replicate - Free tier with uncensored models
    {
      name: 'FLUX Schnell Uncensored',
      provider: 'replicate',
      apiUrl: 'https://api.replicate.com/v1/predictions',
      modelId: 'black-forest-labs/flux-schnell',
      maxResolution: '1024x1024',
      supportsFaceSwap: false,
      supportsNSFW: true,
      isUncensored: true,
      qualityLevel: 'ultra'
    },
    {
      name: 'SDXL Lightning Uncensored',
      provider: 'replicate',
      apiUrl: 'https://api.replicate.com/v1/predictions',
      modelId: 'bytedance/sdxl-lightning-4step',
      maxResolution: '1024x1024',
      supportsFaceSwap: false,
      supportsNSFW: true,
      isUncensored: true,
      qualityLevel: 'high'
    },
    // Pollinations AI - Completely free and uncensored
    {
      name: 'Pollinations FLUX',
      provider: 'pollinations',
      apiUrl: 'https://image.pollinations.ai/prompt',
      modelId: 'flux',
      maxResolution: '1024x1024',
      supportsFaceSwap: false,
      supportsNSFW: true,
      isUncensored: true,
      qualityLevel: 'ultra'
    },
    // Together AI - Free tier
    {
      name: 'FLUX.1 Schnell Together',
      provider: 'together',
      apiUrl: 'https://api.together.xyz/v1/images/generations',
      modelId: 'black-forest-labs/FLUX.1-schnell-Free',
      maxResolution: '1024x1024',
      supportsFaceSwap: false,
      supportsNSFW: true,
      isUncensored: true,
      qualityLevel: 'ultra'
    }
  ];

  private currentModel: AIModelConfig;

  constructor() {
    // Default to best free uncensored model
    this.currentModel = this.models.find(m => m.name === 'Pollinations FLUX') || this.models[0];
  }

  /**
   * Get all available uncensored models
   */
  getAvailableModels(): AIModelConfig[] {
    return this.models.filter(m => m.isUncensored);
  }

  /**
   * Set active model for generation
   */
  setModel(modelName: string): void {
    const model = this.models.find(m => m.name === modelName);
    if (model) {
      this.currentModel = model;
    }
  }

  /**
   * Generate image with current model
   */
  async generateImage(request: GenerationRequest): Promise<string> {
    switch (this.currentModel.provider) {
      case 'pollinations':
        return this.generateWithPollinations(request);
      case 'huggingface':
        return this.generateWithHuggingFace(request);
      case 'replicate':
        return this.generateWithReplicate(request);
      case 'together':
        return this.generateWithTogether(request);
      default:
        throw new Error(`Unsupported provider: ${this.currentModel.provider}`);
    }
  }

  /**
   * Pollinations AI - Completely free, no API key needed, uncensored
   */
  private async generateWithPollinations(request: GenerationRequest): Promise<string> {
    const params = new URLSearchParams({
      model: this.currentModel.modelId,
      width: request.width.toString(),
      height: request.height.toString(),
      seed: (request.seed || Math.floor(Math.random() * 1000000)).toString(),
      enhance: 'true',
      nologo: 'true'
    });

    // Pollinations uses URL-based generation
    const imageUrl = `${this.currentModel.apiUrl}/${encodeURIComponent(request.prompt)}?${params}`;
    
    // Verify image is generated
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error('Failed to generate image with Pollinations');
    }

    return imageUrl;
  }

  /**
   * Hugging Face Inference API - Free tier, uncensored models
   */
  private async generateWithHuggingFace(request: GenerationRequest): Promise<string> {
    const response = await fetch(this.currentModel.apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY || 'hf_demo'}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: request.prompt,
        parameters: {
          negative_prompt: request.negativePrompt,
          width: request.width,
          height: request.height,
          num_inference_steps: request.steps,
          guidance_scale: request.cfgScale,
          seed: request.seed
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.statusText}`);
    }

    const blob = await response.blob();
    const base64 = await this.blobToBase64(blob);
    return `data:image/jpeg;base64,${base64}`;
  }

  /**
   * Replicate API - Free tier available
   */
  private async generateWithReplicate(request: GenerationRequest): Promise<string> {
    const response = await fetch(this.currentModel.apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: this.getReplicateVersion(),
        input: {
          prompt: request.prompt,
          width: request.width,
          height: request.height,
          num_inference_steps: request.steps,
          guidance_scale: request.cfgScale,
          seed: request.seed
        }
      })
    });

    const prediction = await response.json();
    return this.pollReplicateResult(prediction.id);
  }

  /**
   * Together AI - Free tier
   */
  private async generateWithTogether(request: GenerationRequest): Promise<string> {
    const response = await fetch(this.currentModel.apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.currentModel.modelId,
        prompt: request.prompt,
        width: request.width,
        height: request.height,
        steps: request.steps,
        seed: request.seed
      })
    });

    const result = await response.json();
    return result.data[0].url;
  }

  /**
   * Face swap with uncensored models
   */
  async generateFaceSwap(sourceImage: string, targetPrompt: string, options: any): Promise<string> {
    // Use InstantID or similar face swap model
    const faceSwapModel = this.models.find(m => m.supportsFaceSwap && m.isUncensored);
    if (!faceSwapModel) {
      throw new Error('No face swap model available');
    }

    const request: GenerationRequest = {
      prompt: targetPrompt,
      sourceImage: sourceImage,
      width: 768,
      height: 1024,
      steps: 20,
      cfgScale: 7.5,
      sampler: 'DPM++ 2M Karras',
      strength: options.strength || 0.8,
      model: faceSwapModel.modelId,
      enableNSFW: true
    };

    return this.generateImage(request);
  }

  // Helper methods
  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private getReplicateVersion(): string {
    const versions: { [key: string]: string } = {
      'black-forest-labs/flux-schnell': 'f2ab8a5569070ad0648a80b8b3e7c5e0ec0b7b8b',
      'bytedance/sdxl-lightning-4step': '5f24084160c9089501c1b3545d9be3c27883ae2239b6f412990e82d4a6210f8f'
    };
    return versions[this.currentModel.modelId] || '';
  }

  private async pollReplicateResult(predictionId: string): Promise<string> {
    let attempts = 0;
    const maxAttempts = 60;

    while (attempts < maxAttempts) {
      const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        }
      });

      const prediction = await response.json();

      if (prediction.status === 'succeeded') {
        return prediction.output[0];
      } else if (prediction.status === 'failed') {
        throw new Error('Replicate generation failed');
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;
    }

    throw new Error('Replicate generation timeout');
  }
}

export default AIModelService;