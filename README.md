# AI Photorealistic Portrait Generator - Uncensored Edition

A professional portrait generation application that creates photorealistic images using multiple advanced uncensored AI models. Supports artistic freedom with NSFW content generation for creative and artistic purposes.

## Features

- **🎨 Multiple Uncensored AI Models**: FLUX, Stable Diffusion XL, Realistic Vision, and more
- **🔞 Artistic Freedom Mode**: Uncensored content generation for artistic purposes
- **🤖 Smart Model Selection**: Automatic selection of best model for your needs
- **📚 Generation History**: Local storage of all your creations with NSFW filtering
- **🔑 API Key Management**: Secure local storage of API keys with testing
- **⚡ Free Tier Support**: Works with free tiers from multiple providers
- **🎭 Style Presets**: Quick presets for different artistic styles
- **📱 Responsive Design**: Works on desktop and mobile devices

## Architecture

- **Frontend**: React 19 with TypeScript, modern UI components
- **Backend**: Express.js server with multiple AI model integrations
- **AI Models**: Multiple providers (Pollinations, Hugging Face, Replicate, Together AI)
- **Database**: IndexedDB for local storage, no server database required
- **Deployment**: Optimized for Vercel with serverless functions

## Supported AI Models

### Free Models (No API Key Required)
- **Pollinations FLUX**: Completely free, uncensored, high quality
- **Hugging Face Models**: Free tier with rate limits

### Premium Models (Free Tier Available)
- **FLUX.1-dev**: Ultra high quality, uncensored
- **Stable Diffusion XL**: Professional quality, artistic freedom
- **Realistic Vision V6.0**: Photorealistic portraits with face swap
- **SDXL Lightning**: Fast generation, high quality

## Quick Start

1. **Clone and Install**
   ```bash
   git clone <repository>
   cd ai-portrait-generator
   npm install
   ```

2. **Start Development**
   ```bash
   npm run start
   ```
   This starts both frontend (port 5000) and backend (port 3001)

3. **Deploy to Vercel**
   ```bash
   npm run build
   vercel --prod
   ```

## API Keys Setup (Optional)

While the app works without API keys using free models, you can add keys for better performance:

1. **Hugging Face** (Free tier): Get token from [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
2. **Replicate** (Free credits): Get token from [replicate.com/account/api-tokens](https://replicate.com/account/api-tokens)
3. **Together AI** (Free tier): Get token from [api.together.xyz](https://api.together.xyz)

Add keys in the app's API Key Management tab or create a `.env` file:

```env
HUGGINGFACE_API_KEY=hf_your_token_here
REPLICATE_API_TOKEN=r8_your_token_here
TOGETHER_API_KEY=your_together_key_here
```

## Usage

1. **Upload Image**: Upload a source photo in the Generate tab
2. **Enable Artistic Mode**: Toggle the 🔞 Artistic Freedom Mode for uncensored content
3. **Select Model**: Choose from available AI models in the Models tab
4. **Customize**: Use style presets or manual controls to describe your vision
5. **Generate**: Click "Generate Uncensored Portrait" to create your image
6. **History**: View and reuse previous generations in the History tab

## Model Comparison

| Model | Quality | Speed | NSFW | Face Swap | Free Tier |
|-------|---------|-------|------|-----------|-----------|
| Pollinations FLUX | Ultra | Fast | ✅ | ❌ | ✅ Unlimited |
| FLUX.1-dev | Ultra | Medium | ✅ | ❌ | ✅ Rate Limited |
| Realistic Vision | High | Medium | ✅ | ✅ | ✅ Rate Limited |
| SDXL Lightning | High | Fast | ✅ | ❌ | ✅ Credits |

## Features Overview

### 🎨 Generation Modes
- **Artistic**: Creative and experimental styles
- **Professional**: Business and corporate portraits  
- **Glamour**: Fashion and beauty photography
- **Creative**: Experimental and unique compositions

### 🔞 Content Policy
This application supports uncensored artistic content generation. It's designed for:
- Artistic and creative projects
- Professional photography simulation
- Educational and research purposes
- Personal creative expression

**Important**: Users are responsible for complying with local laws and platform terms of service.

### 📊 Advanced Features
- **Quality Modes**: Fast, Balanced, and High quality options
- **Strength Control**: Adjust face similarity (0.1-1.0)
- **Progress Tracking**: Real-time generation progress
- **Caching**: Intelligent result caching to save resources
- **Error Handling**: Graceful fallbacks and error recovery

## Technical Architecture

### Frontend Components
- `AdvancedControlPanel`: Main control interface with tabs
- `ModelSelector`: AI model selection and configuration
- `APIKeyManager`: Secure API key storage and testing
- `GenerationHistory`: Local history with NSFW filtering
- `DisplayArea`: Image display with download functionality

### Backend Services
- `AIModelService`: Multi-provider AI model integration
- `DatabaseService`: IndexedDB for local data storage
- `EnhancedAIService`: Orchestrates generation workflow

### AI Providers Integration
- **Pollinations**: Direct URL-based generation (no auth required)
- **Hugging Face**: Inference API with model selection
- **Replicate**: Prediction API with polling
- **Together AI**: Direct generation API

## Deployment

### Vercel Deployment
The app is optimized for Vercel with:
- Serverless functions for API endpoints
- Static file serving for the React app
- Environment variable management
- Automatic HTTPS and CDN

### Environment Variables
Set these in your Vercel dashboard:
- `HUGGINGFACE_API_KEY`: Optional, for Hugging Face models
- `REPLICATE_API_TOKEN`: Optional, for Replicate models  
- `TOGETHER_API_KEY`: Optional, for Together AI models

## Content Policy

This application supports artistic freedom and uncensored content generation. It's intended for:

- **Artistic Projects**: Creative and experimental art
- **Professional Photography**: Simulating professional photo shoots
- **Educational Use**: Learning about AI and photography
- **Personal Expression**: Creative self-expression

**Responsibility**: Users must comply with local laws and use the application responsibly. The developers are not responsible for user-generated content.

## Legal Notice

This software is provided for educational and artistic purposes. Users are solely responsible for:
- Compliance with local laws and regulations
- Appropriate use of generated content
- Respecting platform terms of service
- Obtaining necessary permissions for commercial use

## Technologies Used

- **React 19** with TypeScript for modern UI
- **Vite** for fast development and building  
- **Express.js** backend with multiple AI integrations
- **IndexedDB** for local data storage
- **Multiple AI Models** for diverse generation capabilities
- **Tailwind CSS** for responsive design
- **Vercel** for deployment and hosting

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License. See LICENSE file for details.

## Support

For support, feature requests, or bug reports:
- Open an issue on GitHub
- Check the documentation
- Review the troubleshooting guide

---

**⚠️ Disclaimer**: This application is for artistic and educational purposes. Users are responsible for appropriate and legal use of generated content.