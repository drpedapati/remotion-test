// config/speechify.config.example.ts
// Copy this file to speechify.config.ts and add your API key

export const SPEECHIFY_CONFIG = {
  apiKey: process.env.REMOTION_SPEECHIFY_API_KEY || '',
  // Add your Speechify API key here:
  // apiKey: 'your_api_key_here',
};
