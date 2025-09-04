
export interface GenerationOptions {
  pose: string;
  background: string;
  clothing: string;
  lighting: string;
  style: string;
}

export interface UploadedImage {
  base64: string;
  mimeType: string;
}
