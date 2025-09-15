
export interface GenerationOptions {
  pose: string;
  background: string;
  clothing: string;
  lighting: string;
  style: string;
  bodyType: string;
  strength: number;
}

export interface UploadedImage {
  file?: File;
  base64: string;
  mimeType: string;
}

export interface BodyAnalysis {
  bodyType: string;
  suggestedPoses: string[];
  recommendedClothing: string[];
  optimalLighting: string[];
  backgroundSuggestions: string[];
  styleRecommendations: string[];
  confidence: number;
}
