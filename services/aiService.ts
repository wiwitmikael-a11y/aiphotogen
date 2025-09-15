import type { UploadedImage, GenerationOptions } from '../types';

// Use relative paths that will be proxied by Vite in development
// and served directly by the backend in production
const GENERATE_URL = '/api/generate';
const HEALTH_URL = '/api/health';

/**
 * Checks if the serverless backend is running and accessible.
 * @returns A boolean indicating if the server is online.
 */
export async function checkServerStatus(): Promise<boolean> {
  try {
    const response = await fetch(HEALTH_URL);
    return response.ok;
  } catch (error) {
    return false;
  }
}


/**
 * Analyze uploaded image for optimal body parameters
 * @param image The uploaded face image
 * @returns AI-generated body analysis with suggestions
 */
export async function analyzeBodyParameters(image: UploadedImage): Promise<any> {
  try {
    const response = await fetch('/api/analyze-body', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Body analysis failed with status ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    if (err instanceof TypeError) {
      throw new Error("Failed to connect to the AI server for body analysis.");
    }
    throw err;
  }
}

/**
 * Generate ultra photorealistic portrait using FLUX + PuLID with progress tracking
 * @param image The uploaded face image.
 * @param options The enhanced generation options.
 * @param onProgress Callback for progress updates.
 * @returns A URL to the generated image.
 */
export async function generateImage(
  image: UploadedImage,
  options: GenerationOptions,
  onProgress?: (progress: any) => void
): Promise<string> {
  try {
    // Start generation and get request ID
    const response = await fetch(GENERATE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image, options }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    const result = await response.json();
    const requestId = result.requestId;
    
    if (!requestId) {
      throw new Error('No request ID received from server');
    }

    // Set up progress tracking via SSE
    return new Promise((resolve, reject) => {
      const eventSource = new EventSource(`/api/generate/progress/${requestId}`);
      
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (onProgress) {
            onProgress(data);
          }
          
          if (data.type === 'result' && data.status === 'completed') {
            eventSource.close();
            resolve(data.imageUrl);
          } else if (data.type === 'error' || data.status === 'failed') {
            eventSource.close();
            reject(new Error(data.error || 'Generation failed'));
          }
        } catch (err) {
          console.error('Error parsing progress data:', err);
        }
      };
      
      eventSource.onerror = (error) => {
        console.error('SSE error:', error);
        eventSource.close();
        reject(new Error('Connection to generation service lost'));
      };
      
      // Timeout after 5 minutes
      setTimeout(() => {
        eventSource.close();
        reject(new Error('Generation timeout'));
      }, 300000);
    });

  } catch (err) {
    if (err instanceof TypeError) {
      throw new Error("Failed to connect to the AI server. Is it running?");
    }
    throw err;
  }
}
