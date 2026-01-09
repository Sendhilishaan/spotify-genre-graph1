/**
 * Spotify Genre Graph Server
 * Express server for Spotify OAuth and API integration
 */

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const querystring = require('querystring');

const config = require('./config');
const constants = require('./constants');
const { generateRandomState, validateState, STATE_COOKIE_NAME } = require('./utils/auth');
const { exchangeCodeForTokens, getTopArtists } = require('./utils/spotify');
const {
  calculateGenreFrequency,
  createArtistLinks,
  filterLinks,
  createGraphNodes,
} = require('./utils/graph');

const app = express();

// Middleware
app.use(cors({
  origin: config.frontendUri,
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

// Request logging middleware (development only)
if (config.nodeEnv === 'development') {
  app.use((req, res, next) => {
    // Log request method and path in development
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

/**
 * Login route - Redirects user to Spotify authorization
 */
app.get('/login', (req, res) => {
  try {
    const scope = constants.SPOTIFY_SCOPES.join(' ');
    const state = generateRandomState();

    // Store state in cookie for verification
    res.cookie(STATE_COOKIE_NAME, state, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: 600000, // 10 minutes
    });

    const authQueryParams = querystring.stringify({
      response_type: 'code',
      client_id: config.spotify.clientId,
      scope,
      redirect_uri: config.redirectUri,
      state,
    });

    res.redirect(`${config.spotify.authUrl}?${authQueryParams}`);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to initiate login' });
  }
});

/**
 * Callback route - Handles Spotify OAuth callback
 */
app.get('/callback', async (req, res) => {
  try {
    const code = req.query.code;
    const receivedState = req.query.state;
    const storedState = req.cookies[STATE_COOKIE_NAME];

    if (!code) {
      return res.status(400).json({ error: 'Missing authorization code' });
    }

    // Verify state parameter to prevent CSRF attacks
    if (!validateState(receivedState, storedState)) {
      console.warn('State mismatch - possible CSRF attack');
      res.clearCookie(STATE_COOKIE_NAME);
      return res.status(403).json({ error: 'Invalid state parameter' });
    }

    // Clear the state cookie
    res.clearCookie(STATE_COOKIE_NAME);

    // Exchange code for tokens
    const tokenData = await exchangeCodeForTokens(code);

    if (!tokenData.access_token) {
      return res.status(500).json({ error: 'No access token received' });
    }

    // Redirect to frontend with tokens in URL hash fragment
    const frontendUrl = `${config.frontendUri}/#access_token=${tokenData.access_token}&refresh_token=${tokenData.refresh_token || ''}`;
    res.redirect(frontendUrl);
  } catch (error) {
    console.error('Callback error:', error.message);
    res.status(500).json({
      error: 'Authentication failed',
      message: error.message,
    });
  }
});

/**
 * Top Artists Graph route - Fetches and processes user's top artists
 */
app.get('/top-artists-graph', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization token' });
    }

    const accessToken = authHeader.split(' ')[1];

    if (!accessToken) {
      return res.status(401).json({ error: 'Missing access token' });
    }

    // Fetch top artists from Spotify
    const artists = await getTopArtists(accessToken);

    if (!Array.isArray(artists) || artists.length === 0) {
      return res.status(404).json({ error: 'No artists found' });
    }

    // Transform artist data
    const transformedArtists = artists.map((artist) => ({
      id: artist.id,
      name: artist.name,
      popularity: artist.popularity,
      genres: artist.genres || [],
      images: artist.images || [],
    }));

    // Calculate genre frequency
    const genreFrequency = calculateGenreFrequency(transformedArtists);

    // Create links between artists
    const allLinks = createArtistLinks(transformedArtists);

    // Filter links to limit connections per node
    const filteredLinks = filterLinks(allLinks);

    // Get set of connected artist IDs
    const connectedIds = new Set();
    filteredLinks.forEach((link) => {
      connectedIds.add(link.source);
      connectedIds.add(link.target);
    });

    // Create graph nodes (only include connected artists)
    const nodes = createGraphNodes(transformedArtists, genreFrequency, connectedIds);

    res.json({ nodes, links: filteredLinks });
  } catch (error) {
    console.error('Top artists graph error:', error.message);
    
    if (error.message.includes('401')) {
      return res.status(401).json({ error: 'Invalid or expired access token' });
    }

    res.status(500).json({
      error: 'Failed to fetch top artists graph',
      message: error.message,
    });
  }
});

/**
 * Health check route
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * Error handling middleware
 */
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: config.nodeEnv === 'development' ? err.message : 'An unexpected error occurred',
  });
});

/**
 * 404 handler
 */
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`Frontend URL: ${config.frontendUri}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});
