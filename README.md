# AI Photorealistic Portrait Generator v5.0 (Vercel Serverless Architecture)

This application has been upgraded to a professional, serverless architecture using Vercel. This is the modern, secure, and scalable way to build and deploy web applications.

**Forget local servers and `npm start`. Welcome to the future of web development.**

---

## How It Works (Serverless Architecture)

1.  **Frontend (React App)**: The user interface you see in the browser. It's the "static" part of your site.
2.  **Serverless Functions (Vercel)**: Your backend code (image generation, API key handling) now lives in the `/api` directory. Vercel automatically deploys these as individual serverless functions in the cloud. They only run when a request is made, making them highly efficient. Your API key is stored securely in Vercel's environment variables, never exposed to the frontend.

---

## Step 1: Get the Code on GitHub (Required)

This workflow requires your project to be in a GitHub repository.

**1. Create a `.gitignore` file:**
Before you upload your code, create a file named `.gitignore` in your project's root directory. This is **CRITICAL** for security. Copy and paste the following into it:
```
# Dependencies
/node_modules

# Environment Variables
.env
.env*.local

# Vercel
.vercel
```

**2. Create a GitHub Repository:**
- Go to [GitHub](https://github.com) and create a new, empty repository.
- Follow GitHub's instructions to push your existing local project to the new repository.

---

## Step 2: Deploy to Vercel (Go Live!)

1.  **Sign Up for Vercel:** Go to [vercel.com](https://vercel.com) and sign up with your GitHub account. It's free.
2.  **Import Project:**
    - On your Vercel dashboard, click "Add New... -> Project".
    - Select your GitHub repository. Vercel will automatically detect that it's a static project with serverless functions.
3.  **Configure Environment Variable (CRITICAL):**
    - Expand the "Environment Variables" section.
    - Add a new variable:
      - **Name:** `REPLICATE_API_TOKEN`
      - **Value:** Paste your secret Replicate API token here (the one that starts with `r8_...`).
4.  **Deploy:** Click the "Deploy" button.

Wait a few moments, and Vercel will provide you with a live URL (e.g., `your-project-name.vercel.app`). **Your application is now live on the internet!**

---

## Step 3: Local Development (The New Way)

You no longer need to run a separate server. Vercel provides a powerful tool to simulate the entire cloud environment on your local machine.

1.  **Install Vercel CLI:**
    - Open your terminal and run this command once: `npm install -g vercel`
2.  **Link Your Project:**
    - In your project directory in the terminal, run: `vercel link`
    - Follow the prompts to link your local folder to the Vercel project you created.
3.  **Run the Development Server:**
    - Instead of `npm start`, you will now use this command:
      ```
      vercel dev
      ```
    - This single command starts a local server that runs both your frontend AND your serverless functions, exactly as they would run in production. It will even use a local version of your environment variables.
4.  **Open the App:** Your application will be running at a local URL, typically `http://localhost:3000`.

---

## Troubleshooting

### "Server Connection Issue" on Local Development

This error means the `vercel dev` command is not running.

**Solution:**
1.  Make sure you have installed the Vercel CLI (`npm install -g vercel`).
2.  **You must run `vercel dev` in your terminal and keep that terminal window open while you use the application locally.**
3.  The first time you run `vercel dev`, it might ask to link the project and download your environment variables. Say yes (`Y`) to these prompts.