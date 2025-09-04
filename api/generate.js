// Vercel Serverless Function: /api/generate
// This function handles the secure call to the Replicate API.
import fetch from 'node-fetch';

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
// Specific IP-Adapter Face Model on Replicate
const REPLICATE_MODEL_VERSION = "a3a8323164a3e78453b708605c7f8f9702280d19c5c7d145c1106f23c6d7a4de";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!REPLICATE_API_TOKEN) {
    return response.status(500).json({ error: 'REPLICATE_API_TOKEN is not configured.' });
  }

  try {
    const { image, options } = request.body;
    if (!image || !options) {
      return response.status(400).json({ error: 'Missing image or options in request body.' });
    }

    const positive_prompt = `photo of a person, masterpiece, best quality, ultra-detailed, 8k, photorealistic, (${options.pose}), wearing ${options.clothing}, in the background: ${options.background}, lighting: ${options.lighting}, photo style: ${options.style}`;
    const negative_prompt = `deformed, distorted, disfigured, poorly drawn, bad anatomy, ugly, blurry, low resolution, pixelated, grainy, cartoon, 3d, fake, cgi, watermark, text`;
    const image_data_uri = `data:${image.mimeType};base64,${image.base64}`;

    // 1. Start prediction
    const startResponse = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: REPLICATE_MODEL_VERSION,
        input: {
          prompt: positive_prompt,
          negative_prompt: negative_prompt,
          image: image_data_uri,
          width: 768,
          height: 1024,
          ip_adapter_scale: 0.8,
        },
      }),
    });

    let prediction = await startResponse.json();
    if (startResponse.status !== 201) {
      return response.status(500).json({ error: prediction.detail || "Failed to start prediction job." });
    }

    // 2. Poll for result
    while (prediction.status !== "succeeded" && prediction.status !== "failed" && prediction.status !== "canceled") {
      await sleep(2000); // Wait 2 seconds between polls
      const pollResponse = await fetch(prediction.urls.get, {
        headers: { "Authorization": `Bearer ${REPLICATE_API_TOKEN}` }
      });
      prediction = await pollResponse.json();
    }

    if (prediction.status !== "succeeded") {
      return response.status(500).json({ error: prediction.error || "Prediction failed or was canceled." });
    }

    const finalImageUrl = prediction.output?.[0];
    if (!finalImageUrl) {
        return response.status(500).json({ error: "Prediction succeeded but no image URL was returned." });
    }

    response.status(200).json({ imageUrl: finalImageUrl });

  } catch (error) {
    console.error(error);
    response.status(500).json({ error: 'An unexpected server error occurred.' });
  }
}
