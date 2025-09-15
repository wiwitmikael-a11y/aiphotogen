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
 * Sends the generation request to our secure serverless function.
 * The function will handle the Replicate API call.
 * @param image The uploaded face image.
 * @param options The user-defined generation options.
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
    if (err instanceof TypeError) { // This often indicates a network error (e.g., proxy not running)
        throw new Error("Failed to connect to the local AI server. Is it running?");
    }
    // Re-throw other errors
    throw err;
  }
}
