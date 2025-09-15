/**
 * ComfyUI Cloud Service Integration
 * Supports ComfyAI.run (free) and RunComfy (production)
 * Uses FLUX + PuLID-FLUX II for ultra photorealistic face swapping
 */

export interface ComfyUIConfig {
  provider: 'comfyai' | 'runcomfy';
  apiKey?: string;
  workflowId?: string;
  baseUrl: string;
}

export interface FaceSwapRequest {
  sourceImage: string; // base64
  targetPrompt: string;
  bodyType: string;
  pose: string;
  background: string;
  lighting: string;
  style: string;
  nsfwMode: boolean;
  strength: number; // 0-1 for face similarity
}

export interface ComfyUIResponse {
  status: 'queued' | 'processing' | 'completed' | 'failed';
  imageUrl?: string;
  error?: string;
  queuePosition?: number;
}

class ComfyUIService {
  private config: ComfyUIConfig;

  constructor(config: ComfyUIConfig) {
    this.config = config;
  }

  /**
   * Generate ultra photorealistic portrait using FLUX + PuLID
   */
  async generatePortrait(request: FaceSwapRequest): Promise<ComfyUIResponse> {
    try {
      if (this.config.provider === 'comfyai') {
        return await this.generateWithComfyAI(request);
      } else {
        return await this.generateWithRunComfy(request);
      }
    } catch (error) {
      console.error('ComfyUI generation error:', error);
      return {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * ComfyAI.run integration (Free serverless)
   */
  private async generateWithComfyAI(request: FaceSwapRequest): Promise<ComfyUIResponse> {
    const workflowData = this.buildFluxPuLIDWorkflow(request);
    
    const response = await fetch(`${this.config.baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workflow: workflowData,
        queue_prompt: true
      })
    });

    if (!response.ok) {
      throw new Error(`ComfyAI generation failed: ${response.statusText}`);
    }

    const result = await response.json();
    return this.pollForCompletion(result.queue_id);
  }

  /**
   * RunComfy integration (Production API)
   */
  private async generateWithRunComfy(request: FaceSwapRequest): Promise<ComfyUIResponse> {
    const response = await fetch(`${this.config.baseUrl}/v2/comfyui/run`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workflow_id: this.config.workflowId || 'realistic-face-swapping-with-flux-pulid',
        inputs: {
          source_image: request.sourceImage,
          prompt: this.buildAdvancedPrompt(request),
          strength: request.strength,
          steps: 20,
          guidance_scale: 3.5
        }
      })
    });

    if (!response.ok) {
      throw new Error(`RunComfy generation failed: ${response.statusText}`);
    }

    const result = await response.json();
    return this.pollRunComfyStatus(result.run_id);
  }

  /**
   * Build FLUX + PuLID workflow for ComfyAI
   */
  private buildFluxPuLIDWorkflow(request: FaceSwapRequest) {
    return {
      "3": {
        "class_type": "KSampler",
        "inputs": {
          "seed": Math.floor(Math.random() * 1000000),
          "steps": 20,
          "cfg": 3.5,
          "sampler_name": "euler",
          "scheduler": "simple",
          "denoise": 1,
          "model": ["22", 0],
          "positive": ["6", 0],
          "negative": ["7", 0],
          "latent_image": ["5", 0]
        }
      },
      "4": {
        "class_type": "CheckpointLoaderSimple",
        "inputs": {
          "ckpt_name": "flux1-dev.safetensors"
        }
      },
      "5": {
        "class_type": "EmptyLatentImage", 
        "inputs": {
          "width": 768,
          "height": 1024,
          "batch_size": 1
        }
      },
      "6": {
        "class_type": "CLIPTextEncode",
        "inputs": {
          "text": this.buildAdvancedPrompt(request),
          "clip": ["4", 1]
        }
      },
      "7": {
        "class_type": "CLIPTextEncode",
        "inputs": {
          "text": "deformed, distorted, disfigured, poorly drawn, bad anatomy, ugly, blurry, low resolution, pixelated, grainy, cartoon, 3d, fake, cgi, watermark, text",
          "clip": ["4", 1]
        }
      },
      "8": {
        "class_type": "VAEDecode",
        "inputs": {
          "samples": ["3", 0],
          "vae": ["4", 2]
        }
      },
      "9": {
        "class_type": "SaveImage",
        "inputs": {
          "filename_prefix": "flux_pulid_portrait",
          "images": ["8", 0]
        }
      },
      "20": {
        "class_type": "PulidFluxModelLoader",
        "inputs": {
          "pulid_file": "flux/pulid_flux_v0.9.1.safetensors"
        }
      },
      "21": {
        "class_type": "LoadImage",
        "inputs": {
          "image": request.sourceImage
        }
      },
      "22": {
        "class_type": "ApplyPulidFlux",
        "inputs": {
          "model": ["4", 0],
          "pulid": ["20", 0],
          "image": ["21", 0],
          "weight": request.strength,
          "start_at": 0,
          "end_at": 1000
        }
      }
    };
  }

  /**
   * Build advanced prompt with AI-detected body parameters
   */
  private buildAdvancedPrompt(request: FaceSwapRequest): string {
    const { targetPrompt, bodyType, pose, background, lighting, style } = request;
    
    const basePrompt = `ultra photorealistic studio portrait, professional photography, ${targetPrompt}`;
    const bodyParams = `body type: ${bodyType}, pose: ${pose}`;
    const environmentParams = `background: ${background}, lighting: ${lighting}`;
    const styleParams = `style: ${style}, 8K resolution, masterpiece, best quality`;
    
    return `${basePrompt}, ${bodyParams}, ${environmentParams}, ${styleParams}`;
  }

  /**
   * Poll for completion status
   */
  private async pollForCompletion(queueId: string): Promise<ComfyUIResponse> {
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      
      try {
        const statusResponse = await fetch(`${this.config.baseUrl}/api/status/${queueId}`);
        const status = await statusResponse.json();
        
        if (status.status === 'completed') {
          return {
            status: 'completed',
            imageUrl: status.output_url
          };
        } else if (status.status === 'failed') {
          return {
            status: 'failed',
            error: status.error || 'Generation failed'
          };
        }
        
        attempts++;
      } catch (error) {
        console.error('Polling error:', error);
        attempts++;
      }
    }
    
    return {
      status: 'failed',
      error: 'Generation timeout'
    };
  }

  /**
   * Poll RunComfy status
   */
  private async pollRunComfyStatus(runId: string): Promise<ComfyUIResponse> {
    let attempts = 0;
    const maxAttempts = 60;
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      try {
        const statusResponse = await fetch(`${this.config.baseUrl}/v2/comfyui/status/${runId}`, {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
          }
        });
        
        const status = await statusResponse.json();
        
        if (status.status === 'SUCCEEDED') {
          return {
            status: 'completed',
            imageUrl: status.outputs?.[0]?.data?.images?.[0]?.url
          };
        } else if (status.status === 'FAILED') {
          return {
            status: 'failed',
            error: status.error || 'Generation failed'
          };
        }
        
        attempts++;
      } catch (error) {
        console.error('RunComfy polling error:', error);
        attempts++;
      }
    }
    
    return {
      status: 'failed',
      error: 'Generation timeout'
    };
  }
}

export default ComfyUIService;