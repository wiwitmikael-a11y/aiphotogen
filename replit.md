# Overview

This is an AI-powered photorealistic portrait generation application that creates professional portraits from uploaded face photos. The application uses React with TypeScript for the frontend and Express.js for the backend, integrating with ComfyUI services (ComfyAI.run and RunComfy) to generate ultra-realistic portraits using FLUX and PuLID-FLUX II models. Users can upload a face photo and the AI analyzes it to suggest optimal poses, lighting, clothing, and styling options for generating professional-quality portraits.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React 19** with TypeScript for type safety and modern React features
- **Vite** as the build tool and development server with hot module replacement
- **Tailwind CSS** via CDN for styling with custom design tokens and animations
- **Component-based structure** with reusable UI components (Header, ImageUploader, ControlPanel, DisplayArea)
- **Custom hooks and state management** using React's built-in useState and useCallback
- **Development proxy** configured in Vite to forward `/api/*` requests to the backend server

## Backend Architecture
- **Express.js server** running on port 3001 with CORS enabled for cross-origin requests
- **Serverless-ready design** with both traditional Express routes and Vercel serverless functions
- **File upload handling** with 50MB limit for base64 encoded images
- **Health check endpoints** for monitoring server status
- **Static file serving** for production builds from the dist directory

## AI Integration Layer
- **ComfyUI Service Integration** supporting both ComfyAI.run (free tier) and RunComfy (production)
- **FLUX + PuLID-FLUX II models** for ultra-photorealistic face swapping and portrait generation
- **Body Analysis Service** for analyzing uploaded photos and suggesting optimal parameters
- **Gemini AI integration** (via @google/genai) for additional AI-powered analysis capabilities

## Image Processing Pipeline
- **Client-side image handling** with drag-and-drop upload interface
- **Base64 encoding** for image transmission between frontend and backend
- **AI-powered face analysis** to extract features like age, gender, ethnicity, face shape, and skin tone
- **Parameter optimization** based on facial analysis to suggest poses, lighting, and styling

## Development and Deployment
- **Replit-optimized configuration** with concurrent frontend and backend startup
- **Dual deployment strategy** supporting both traditional server hosting and serverless functions
- **Environment variable configuration** for API keys and service providers
- **Production build optimization** with static asset serving

# External Dependencies

## AI Services
- **ComfyAI.run** - Free tier ComfyUI cloud service for AI image generation
- **RunComfy** - Production-grade ComfyUI service requiring API key authentication
- **Google Gemini AI** - Advanced AI capabilities through @google/genai package

## Core Technologies
- **React 19** and **React DOM 19** - Modern React framework with latest features
- **Vite 6.2.0** - Fast build tool and development server
- **TypeScript 5.8.2** - Type safety and enhanced developer experience
- **Express.js 5.1.0** - Backend web framework
- **Node Fetch 3.3.2** - HTTP client for making API requests to external services

## Development Tools
- **Tailwind CSS** - Utility-first CSS framework loaded via CDN
- **CORS middleware** - Cross-origin resource sharing for API access
- **Vercel deployment** - Configured for serverless function deployment with memory and timeout optimizations

## Image Processing
- **FileReader API** - Browser-native file reading and base64 conversion
- **Drag and Drop API** - Modern file upload interface
- **Canvas API** - Image manipulation and analysis capabilities

The architecture prioritizes modularity, scalability, and ease of deployment while maintaining high performance for AI-powered image generation workflows.