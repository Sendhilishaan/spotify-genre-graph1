import { config } from '../config';

/**
 * API service for communicating with the backend
 */

/**
 * Fetches top artists graph data
 * @param {string} accessToken - Spotify access token
 * @returns {Promise<Object>} Graph data with nodes and links
 * @throws {Error} If the request fails
 */
export async function fetchTopArtistsGraph(accessToken) {
  try {
    const response = await fetch(config.topArtistsGraphUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();
    return {
      nodes: data.nodes || [],
      links: data.links || [],
    };
  } catch (error) {
    console.error('Error fetching graph data:', error);
    throw error;
  }
}

/**
 * Extracts access token from URL hash
 * @returns {string|null} Access token or null if not found
 */
export function extractTokenFromHash() {
  const hash = window.location.hash;
  if (!hash) return null;

  const params = new URLSearchParams(hash.slice(1));
  return params.get('access_token');
}

