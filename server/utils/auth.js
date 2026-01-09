/**
 * Authentication utility functions
 */

const crypto = require('crypto');
const { STATE_COOKIE_NAME } = require('../constants');

/**
 * Generates a cryptographically secure random string for state parameter
 * @param {number} length - Length of the random string
 * @returns {string} Random string
 */
function generateRandomState(length = 32) {
  return crypto.randomBytes(length).toString('base64url');
}

/**
 * Validates state parameter to prevent CSRF attacks
 * @param {string} receivedState - State received from callback
 * @param {string} storedState - State stored in cookie
 * @returns {boolean} True if state is valid
 */
function validateState(receivedState, storedState) {
  if (!receivedState || !storedState) {
    return false;
  }
  
  // Ensure buffers are the same length for timing-safe comparison
  const receivedBuffer = Buffer.from(receivedState);
  const storedBuffer = Buffer.from(storedState);
  
  if (receivedBuffer.length !== storedBuffer.length) {
    return false;
  }
  
  // Use constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(receivedBuffer, storedBuffer);
}

module.exports = {
  generateRandomState,
  validateState,
  STATE_COOKIE_NAME,
};

