// Vercel serverless entry point — re-exports the Express app from backend/server.js
// This file lets Vercel auto-detect the API function without using legacy `builds` config.
export { default } from '../backend/server.js';
