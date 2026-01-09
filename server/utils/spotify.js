/**
 * Spotify API utility functions
 */

const axios = require('axios');
const config = require('../config');

/**
 * Exchanges authorization code for access and refresh tokens
 * @param {string} code - Authorization code from callback
 * @returns {Promise<Object>} Token response with access_token and refresh_token
 */
async function exchangeCodeForTokens(code) {
  const credentials = Buffer.from(
    `${config.spotify.clientId}:${config.spotify.clientSecret}`
  ).toString('base64');

  try {
    const response = await axios.post(
      config.spotify.tokenUrl,
      new URLSearchParams({
        code,
        redirect_uri: config.redirectUri,
        grant_type: 'authorization_code',
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${credentials}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        `Spotify API error: ${error.response.status} - ${
          error.response.data?.error_description || error.response.data?.error || 'Unknown error'
        }`
      );
    }
    throw new Error(`Network error: ${error.message}`);
  }
}

/**
 * Fetches user's top artists from Spotify API
 * @param {string} accessToken - User's access token
 * @returns {Promise<Array>} Array of artist objects
 */
async function getTopArtists(accessToken) {
  try {
    const response = await axios.get(
      `${config.spotify.apiUrl}/me/top/artists`,
      {
        params: {
          limit: 50,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.data.items || [];
  } catch (error) {
    if (error.response) {
      throw new Error(
        `Spotify API error: ${error.response.status} - ${
          error.response.data?.error?.message || 'Failed to fetch top artists'
        }`
      );
    }
    throw new Error(`Network error: ${error.message}`);
  }
}

module.exports = {
  exchangeCodeForTokens,
  getTopArtists,
};

