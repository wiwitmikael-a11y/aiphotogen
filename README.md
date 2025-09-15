# AI Photorealistic Portrait Generator - Replit Edition

A professional portrait generation application that creates photorealistic images using advanced AI models. Now optimized for Replit deployment with ComfyUI integration.

## Features

- **Face-based Portrait Generation**: Upload a photo and generate professional portraits
- **AI Body Analysis**: Automatic analysis of optimal poses, lighting, and styling
- **Professional Quality**: Ultra-photorealistic results using FLUX + PuLID models
- **Real-time Preview**: Live feedback and generation status
- **Replit Optimized**: Configured for seamless Replit deployment

## Architecture

- **Frontend**: React with TypeScript, Vite build system
- **Backend**: Express.js server with ComfyUI integration
- **AI Engine**: ComfyUI with FLUX and PuLID models for photorealistic generation
- **Deployment**: Optimized for Replit hosting

## Local Development in Replit

The application is already configured for Replit. Simply click "Run" to start both the frontend and backend servers.

- Frontend runs on port 5000 (user-facing)
- Backend API runs on port 3001 (internal)
- Vite automatically proxies API requests

## API Endpoints

- `GET /api/health` - Health check endpoint
- `POST /api/analyze-body` - AI body analysis for uploaded images
- `POST /api/generate` - Generate photorealistic portraits

## Configuration

The application uses ComfyUI for image generation. You can configure:

- `COMFYUI_PROVIDER`: 'comfyai' (free) or 'runcomfy' (production)
- `COMFYUI_API_KEY`: Required for RunComfy provider
- `PORT`: Backend port (defaults to 3001)

## Usage

1. Upload a face photo using the image uploader
2. Choose from AI-suggested poses, lighting, and styling options
3. Click "Generate Portrait" to create a professional photorealistic image
4. Download or share your generated portrait

## Content Policy

This application is designed for creating professional, artistic portraits suitable for business use, social media profiles, and creative projects. Content generation is limited to appropriate, non-explicit imagery.

## Technologies Used

- React 19 with TypeScript
- Vite for fast development and building
- Express.js backend
- ComfyUI for AI image generation
- FLUX and PuLID models for face preservation