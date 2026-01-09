/**
 * Client configuration
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8888';
const LOGIN_URL = `${API_BASE_URL}/login`;

export const config = {
  apiBaseUrl: API_BASE_URL,
  loginUrl: LOGIN_URL,
  topArtistsGraphUrl: `${API_BASE_URL}/top-artists-graph`,
};

export const graphConfig = {
  nodeRelSize: 6,
  linkDistance: 120,
  linkStrength: 0.5,
  chargeStrength: -50,
  collisionRadius: 50,
  maxLinkWidth: 8,
  linkParticleCount: 1,
  linkParticleSpeed: 0.005,
  linkParticleWidth: 1,
  zoomToFitDelay: 1000,
  imageSize: 50,
};

export const colors = {
  background: '#000',
  sidebarBackground: '#111',
  text: '#ffffff',
  spotifyGreen: '#1DB954',
  border: '#444',
  placeholder: '#ccc',
};

