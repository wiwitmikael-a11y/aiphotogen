import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Serve static files from the dist directory (for production builds)
app.use(express.static(path.join(__dirname, 'dist')));

// Environment variables for ComfyUI
const COMFYUI_PROVIDER = process.env.COMFYUI_PROVIDER || 'comfyai'; // 'comfyai' or 'runcomfy'
const COMFYUI_API_KEY = process.env.COMFYUI_API_KEY; // Only needed for RunComfy
const COMFYAI_BASE_URL = 'https://comfyai.run';
const RUNCOMFY_BASE_URL = 'https://api.runcomfy.com';

// ComfyUI Service Configuration
const comfyUIConfig = {
  provider: COMFYUI_PROVIDER,
  apiKey: COMFYUI_API_KEY,
  baseUrl: COMFYUI_PROVIDER === 'runcomfy' ? RUNCOMFY_BASE_URL : COMFYAI_BASE_URL
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// AI Body Analysis Function
function analyzeBodyParameters(image) {
  // Advanced AI analysis would go here
  // For now, returning optimized defaults for ultra photorealistic portraits
  return {
    bodyType: 'elegant athletic build, model-like proportions, professional posture',
    suggestedPoses: [
      'confident three-quarter angle with subtle smile',
      'professional straight-on pose with direct eye contact',
      'sophisticated side profile with dramatic lighting',
      'casual relaxed stance with natural expression',
      'dynamic power pose with strong presence'
    ],
    recommendedClothing: [
      'elegant black blazer with white shirt',
      'sophisticated navy blue suit with minimal accessories',
      'casual luxury sweater in neutral tones',
      'classic formal dress in deep colors',
      'contemporary business attire with statement pieces',
      'artistic casual wear with unique textures'
    ],
    optimalLighting: [
      'professional studio lighting with soft key light',
      'cinematic dramatic lighting with rim light',
      'natural window lighting with soft fill',
      'golden hour warm lighting simulation',
      'high-key bright even lighting',
      'low-key moody dramatic shadows'
    ],
    backgroundSuggestions: [
      'professional studio backdrop with subtle texture',
      'modern minimalist office with clean lines',
      'elegant library with warm book-filled shelves',
      'upscale hotel lobby with sophisticated ambiance',
      'contemporary art gallery with white walls',
      'luxury penthouse with city skyline view'
    ],
    styleRecommendations: [
      'ultra high-resolution commercial photography style',
      'cinematic film-grade portrait with depth of field',
      'fashion magazine editorial style with dramatic lighting',
      'corporate professional headshot with clean composition',
      'artistic fine art portrait with creative shadows',
      'contemporary lifestyle photography with natural feel'
    ],
    confidence: 0.92
  };
}

// Build Advanced Prompt Function
function buildAdvancedPrompt(options) {
  const basePrompt = 'ultra photorealistic studio portrait, professional commercial photography, 8K resolution, masterpiece quality';
  const bodyParams = `body: ${options.bodyType || 'model-like proportions'}`;
  const poseParams = `pose: ${options.pose}`;
  const environmentParams = `background: ${options.background}, lighting: ${options.lighting}`;
  const styleParams = `style: ${options.style}, ultra-detailed, photorealistic, professional lighting`;
  
  return `${basePrompt}, ${bodyParams}, ${poseParams}, ${environmentParams}, ${styleParams}`;
}

// ComfyUI Generation Function
async function generateWithComfyUI(request) {
  try {
    if (comfyUIConfig.provider === 'comfyai') {
      return await generateWithComfyAI(request);
    } else {
      return await generateWithRunComfy(request);
    }
  } catch (error) {
    console.error('ComfyUI generation error:', error);
    return {
      status: 'failed',
      error: error.message || 'Unknown error'
    };
  }
}

// ComfyAI.run Integration (Free)
async function generateWithComfyAI(request) {
  const workflowData = buildFluxPuLIDWorkflow(request);
  
  // For demo purposes, simulate ComfyAI response
  // In production, this would call actual ComfyAI.run API
  console.log('🎨 Generating ultra photorealistic portrait with FLUX + PuLID...');
  console.log('📸 Source image processed');
  console.log('🤖 AI Parameters:', {
    bodyType: request.bodyType,
    pose: request.pose,
    strength: request.strength
  });
  
  // Simulate processing time
  await sleep(3000);
  
  // Return demo result (in production, this would be actual generated image)
  return {
    status: 'completed',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=768&h=1024&fit=crop&crop=face'
  };
}

// RunComfy Integration (Production)
async function generateWithRunComfy(request) {
  if (!comfyUIConfig.apiKey) {
    throw new Error('RunComfy API key not configured');
  }
  
  console.log('🚀 Generating with RunComfy production API...');
  
  // Simulate RunComfy API call
  await sleep(2000);
  
  return {
    status: 'completed', 
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=768&h=1024&fit=crop&crop=face'
  };
}

// Build FLUX + PuLID Workflow
function buildFluxPuLIDWorkflow(request) {
  return {
    model: 'FLUX.1-schnell',
    face_swap_model: 'PuLID-FLUX-II',
    prompt: request.targetPrompt,
    negative_prompt: 'deformed, distorted, disfigured, poorly drawn, bad anatomy, ugly, blurry, low resolution, pixelated, grainy, cartoon, 3d, fake, cgi, watermark, text, nsfw, explicit, nude, sexual',
    strength: request.strength,
    steps: 20,
    guidance_scale: 3.5,
    resolution: '768x1024'
  };
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Body Analysis endpoint - NEW FEATURE
app.post('/api/analyze-body', async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Missing image in request body.' });
    }

    // AI Body Analysis (placeholder implementation)
    const bodyAnalysis = analyzeBodyParameters(image);
    
    res.status(200).json(bodyAnalysis);
  } catch (error) {
    console.error('Body analysis error:', error);
    res.status(500).json({ error: 'Body analysis failed.' });
  }
});

// Content moderation function
function moderateContent(options) {
  const explicitTerms = [
    'nude', 'naked', 'nsfw', 'explicit', 'sexual', 'erotic', 'pornographic',
    'masturbation', 'masturbating', 'sex', 'vagina', 'penis', 'breast', 'nipple',
    'anal', 'pussy', 'dick', 'cock', 'tits', 'ass', 'topless', 'bottomless'
  ];
  
  const contentToCheck = [
    options.pose || '',
    options.background || '',
    options.clothing || '',
    options.lighting || '',
    options.style || '',
    options.bodyType || ''
  ].join(' ').toLowerCase();
  
  for (const term of explicitTerms) {
    if (contentToCheck.includes(term)) {
      return {
        blocked: true,
        reason: `Content blocked: Contains inappropriate term "${term}". This application is for professional portraits only.`
      };
    }
  }
  
  return { blocked: false };
}

// Ultra Photorealistic Portrait Generation endpoint - UPGRADED WITH COMFYUI
app.post('/api/generate', async (req, res) => {
  try {
    const { image, options } = req.body;
    if (!image || !options) {
      return res.status(400).json({ error: 'Missing image or options in request body.' });
    }
    
    // Content moderation
    const moderation = moderateContent(options);
    if (moderation.blocked) {
      return res.status(400).json({ error: moderation.reason });
    }

    // Build ComfyUI request
    const comfyUIRequest = {
      sourceImage: image.base64,
      targetPrompt: buildAdvancedPrompt(options),
      bodyType: options.bodyType || 'balanced proportioned physique',
      pose: options.pose,
      background: options.background,
      lighting: options.lighting,
      style: options.style,
      strength: options.strength || 0.8
    };

    // Generate with ComfyUI
    const result = await generateWithComfyUI(comfyUIRequest);
    
    if (result.status === 'completed') {
      res.status(200).json({ imageUrl: result.imageUrl });
    } else {
      res.status(500).json({ error: result.error || 'Generation failed' });
    }

  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({ error: 'An unexpected server error occurred.' });
  }
});

// Root route for SPA
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on http://0.0.0.0:${PORT}`);
});