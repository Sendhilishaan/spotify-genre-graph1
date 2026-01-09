import React from 'react';
import { colors } from '../config';

/**
 * Loading screen component
 */
export default function LoadingScreen() {
  return (
    <div
      style={{
        background: '#0a0a0a',
        color: colors.text,
        display: 'flex',
        height: '100vh',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle animated background gradient */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at 50% 50%, rgba(29, 185, 84, 0.03) 0%, transparent 70%)',
          animation: 'pulse 3s ease-in-out infinite',
        }}
      />

      <div
        style={{
          textAlign: 'center',
          zIndex: 1,
          padding: '60px 40px',
        }}
      >
        <h1
          style={{
            fontSize: '48px',
            fontWeight: '700',
            marginBottom: '20px',
            color: '#ffffff',
            letterSpacing: '-2px',
            marginBottom: '15px',
          }}
        >
          Spotify Genre Graph
        </h1>
        <p
          style={{
            fontSize: '14px',
            color: '#666666',
            fontWeight: '400',
            marginBottom: '50px',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
          }}
        >
          A project by Ishaan Sendhil
        </p>
        
        <div
          style={{
            width: '50px',
            height: '50px',
            border: `3px solid #1a1a1a`,
            borderTopColor: '#1DB954',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 30px',
          }}
        />
        
        <p
          style={{
            fontSize: '16px',
            color: '#888888',
            fontWeight: '400',
            letterSpacing: '0.3px',
          }}
        >
          Loading your artist graph...
        </p>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}

