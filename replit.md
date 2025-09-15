# Overview

AI Photorealistic Portrait Generator is a React-based web application that creates professional portraits from uploaded face photos using advanced AI models. The application leverages ComfyUI with FLUX and PuLID models to generate ultra-photorealistic images with customizable poses, lighting, backgrounds, and styling options. It's designed for seamless deployment on Replit with both development and production configurations.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 19 with TypeScript for type safety and modern component patterns
- **Build System**: Vite for fast development and optimized production builds
- **Styling**: Tailwind CSS with custom design tokens for consistent theming
- **Component Structure**: Modular components including Header, EnhancedControlPanel, DisplayArea, and ImageUploader
- **State Management**: React hooks (useState, useEffect, useCallback) for local state management
- **Asset Handling**: Base64 encoding for image uploads and browser-native File API

## Backend Architecture
- **Server**: Express.js with CORS middleware for cross-origin requests
- **API Design**: RESTful endpoints with JSON request/response format
- **File Processing**: Support for 50MB file uploads with base64 encoding
- **Health Monitoring**: Periodic server status checks every 5 seconds
- **Static Serving**: Express serves built frontend assets in production

## AI Integration Architecture
- **Primary Engine**: ComfyUI with FLUX + PuLID-FLUX II models for photorealistic generation
- **Provider Support**: Dual provider support (ComfyAI.run for free tier, RunComfy for production)
- **Body Analysis**: AI-powered analysis of uploaded faces to suggest optimal poses, lighting, and styling
- **Face Swapping**: Advanced face replacement technology maintaining photorealistic quality

## Development vs Production Setup
- **Development**: Vite dev server on port 5000 with proxy to Express backend on port 3001
- **Production**: Single Express server serving static files and API endpoints
- **Deployment**: Optimized for Replit with concurrent frontend/backend startup scripts

## Error Handling and Resilience
- **Connection Monitoring**: Real-time server status indication with visual feedback
- **Graceful Degradation**: Fallback UI states for offline/error conditions
- **User Feedback**: Comprehensive error messages with troubleshooting guidance
- **Loading States**: Progressive loading indicators during AI generation

# External Dependencies

## Core Dependencies
- **React 19**: Latest React with concurrent features and improved TypeScript support
- **Express.js 5**: Backend server framework with modern async/await support
- **Vite 6**: Next-generation frontend build tool with HMR
- **TypeScript 5.8**: Static typing for improved developer experience

## AI Services
- **ComfyUI Providers**: Integration with ComfyAI.run (free) and RunComfy (production) APIs
- **FLUX Models**: State-of-the-art diffusion models for photorealistic image generation
- **PuLID-FLUX II**: Advanced face identity preservation technology

## Utility Libraries
- **node-fetch**: HTTP client for server-side API calls to ComfyUI services
- **cors**: Cross-origin resource sharing middleware for API access
- **@google/genai**: Google's Generative AI SDK for potential future integrations

## Development Tools
- **Tailwind CSS**: Utility-first CSS framework loaded via CDN
- **TypeScript Types**: Comprehensive type definitions for Express and CORS

## Deployment Platforms
- **Replit**: Primary deployment target with optimized configuration
- **Vercel**: Alternative deployment with serverless function support
- **Local Development**: Full-stack development environment with hot reloading

## Environment Configuration
- **COMFYUI_PROVIDER**: Selects between 'comfyai' (free) or 'runcomfy' (production)
- **COMFYUI_API_KEY**: Authentication for RunComfy production API
- **PORT**: Configurable server port (defaults to 3001)