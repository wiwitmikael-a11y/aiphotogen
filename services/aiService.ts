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
 * Generate ultra photorealistic portrait using FLUX + PuLID
 * Enhanced with body parameter detection and uncensored mode
 * @param image The uploaded face image.
 * @param options The enhanced generation options.
 * @returns A URL to the generated image.
 */
export async function generateImage(
  image: UploadedImage,
  options: GenerationOptions,
): Promise<string> {
  try {
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
    return result.imageUrl;

  } catch (err) {
    if (err instanceof TypeError) {
      throw new Error("Failed to connect to the AI server. Is it running?");
    }
    throw err;
  }
}
