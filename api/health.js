// Vercel Serverless Function: /api/health
// This function checks if the backend is alive.

export default function handler(request, response) {
  response.status(200).json({ status: 'ok' });
}
