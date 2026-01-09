# Environment Variables Setup

This document explains how to set up environment variables for the server.

## Create .env File

Create a `.env` file in the `server/` directory with the following content:

```env
# Required: Spotify API Credentials
# Get these from https://developer.spotify.com/dashboard/applications
SPOTIFY_CLIENT_ID=your_spotify_client_id_here
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here

# Optional: Server Configuration
PORT=8888
REDIRECT_URI=http://127.0.0.1:8888/callback
FRONTEND_URI=http://127.0.0.1:3000

# Optional: Node Environment
NODE_ENV=development
```

## Required Variables

- **SPOTIFY_CLIENT_ID**: Your Spotify app's Client ID
- **SPOTIFY_CLIENT_SECRET**: Your Spotify app's Client Secret

## Optional Variables

- **PORT**: Server port (default: 8888)
- **REDIRECT_URI**: OAuth callback URL (default: http://127.0.0.1:8888/callback)
- **FRONTEND_URI**: Frontend application URL (default: http://127.0.0.1:3000)
- **NODE_ENV**: Environment mode - 'development' or 'production' (default: development)

## Getting Spotify Credentials

1. Visit [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/applications)
2. Log in with your Spotify account
3. Click "Create App"
4. Fill in:
   - App name: Any name
   - Redirect URI: `http://127.0.0.1:8888/callback`
5. Copy your Client ID and Client Secret to the `.env` file

## Security Notes

- **Never commit `.env` files to version control**
- The `.gitignore` file is configured to protect `.env` files
- Keep your Client Secret secure and never share it
- If you accidentally commit a `.env` file, rotate your credentials immediately

