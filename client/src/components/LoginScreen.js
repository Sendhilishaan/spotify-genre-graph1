import React from 'react';
import { config, colors } from '../config';

/**
 * Login screen component
 */
export default function LoginScreen() {
  return (
    <div
      style={{
        background: '#0a0a0a',
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        color: colors.text,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle grid pattern */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          opacity: 0.5,
        }}
      />

      {/* Subtle gradient overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at 50% 50%, rgba(29, 185, 84, 0.03) 0%, transparent 70%)',
        }}
      />

      <div
        style={{
          textAlign: 'center',
          zIndex: 1,
          padding: '0 20px',
          maxWidth: '600px',
        }}
      >
        <h1
          style={{
            fontSize: '56px',
            fontWeight: '700',
            marginBottom: '20px',
            color: '#ffffff',
            letterSpacing: '-2px',
            lineHeight: '1.1',
          }}
        >
          Spotify Genre Graph
        </h1>
        <p
          style={{
            fontSize: '18px',
            color: '#888888',
            marginBottom: '60px',
            fontWeight: '400',
            letterSpacing: '0.3px',
            lineHeight: '1.6',
          }}
        >
          Visualize your musical taste through an interactive network graph
        </p>
        <a href={config.loginUrl} style={{ textDecoration: 'none' }}>
          <button
            style={{
              padding: '18px 50px',
              fontSize: '16px',
              background: colors.spotifyGreen,
              color: '#000000',
              border: 'none',
              borderRadius: '30px',
              cursor: 'pointer',
              fontWeight: '700',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 20px rgba(29, 185, 84, 0.3)',
              letterSpacing: '0.5px',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#1ed760';
              e.target.style.transform = 'translateY(-3px) scale(1.02)';
              e.target.style.boxShadow = '0 8px 30px rgba(29, 185, 84, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = colors.spotifyGreen;
              e.target.style.transform = 'translateY(0) scale(1)';
              e.target.style.boxShadow = '0 4px 20px rgba(29, 185, 84, 0.3)';
            }}
          >
            Login with Spotify
          </button>
        </a>
      </div>
    </div>
  );
}

