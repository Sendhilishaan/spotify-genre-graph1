/**
 * Server configuration module
 * Validates and exports environment variables
 */

require('dotenv').config();

/**
 * Validates that all required environment variables are set
 * @throws {Error} If any required variable is missing
 */
function validateEnv() {
  const required = [
    'SPOTIFY_CLIENT_ID',
    'SPOTIFY_CLIENT_SECRET',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please create a .env file in the server directory with these variables.'
    );
  }
}

// Validate on module load
validateEnv();

module.exports = {
  port: parseInt(process.env.PORT || '8888', 10),
  redirectUri: process.env.REDIRECT_URI || 'http://127.0.0.1:8888/callback',
  frontendUri: process.env.FRONTEND_URI || 'http://127.0.0.1:3000',
  spotify: {
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    authUrl: 'https://accounts.spotify.com/authorize',
    tokenUrl: 'https://accounts.spotify.com/api/token',
    apiUrl: 'https://api.spotify.com/v1',
  },
  nodeEnv: process.env.NODE_ENV || 'development',
};

