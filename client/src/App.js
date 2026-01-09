import React, { useState, useEffect, useRef, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { interpolateBlues } from 'd3-scale-chromatic';
import * as d3Force from 'd3-force';

import LoginScreen from './components/LoginScreen';
import LoadingScreen from './components/LoadingScreen';
import GenreChart from './components/GenreChart';
import { fetchTopArtistsGraph, extractTokenFromHash } from './services/api';
import { setupGraphPhysics, renderNode } from './utils/graphSetup';
import { config, graphConfig, colors } from './config';

/**
 * Main application component
 */
export default function App() {
  const [accessToken, setAccessToken] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  // Fixed dimensions - never change to prevent graph reset
  const graphDimensions = useMemo(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }), []);
  const fgRef = useRef();
  const imageCache = useRef({});

  // Handle window resize - update center force only (width/height are props, not methods)
  useEffect(() => {
    const handleResize = () => {
      if (fgRef.current && fgRef.current.d3Force) {
        // Update center force to new center when window resizes
        fgRef.current.d3Force('center', 
          d3Force.forceCenter(window.innerWidth / 2, window.innerHeight / 2)
        );
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Extract token from URL hash on mount
  useEffect(() => {
    const token = extractTokenFromHash();
    if (token) {
      setAccessToken(token);
      // Clean up URL
      window.history.replaceState({}, document.title, '/');
    }
  }, []);

  // Fetch graph data when token is available
  useEffect(() => {
    if (!accessToken) return;

    setIsLoading(true);
    setError(null);

    fetchTopArtistsGraph(accessToken)
      .then((data) => {
        setGraphData(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching graph data:', err);
        setError(err.message || 'Failed to load graph data');
        setIsLoading(false);
      });
  }, [accessToken]);

  // Setup graph physics when graph data is available
  useEffect(() => {
    if (!graphData || !fgRef.current) return;

    const cleanup = setupGraphPhysics(fgRef);
    return cleanup;
  }, [graphData]);

  // Memoize the graph component to prevent re-render on sidebar toggle
  // Must be called before any early returns (React Hooks rules)
  // Only re-render when graphData actually changes, not when sidebar toggles
  const graphComponent = useMemo(() => {
    if (!graphData || !graphData.nodes) return null;
    
    const graphDataForRender = {
      nodes: graphData.nodes || [],
      links: graphData.links || [],
    };
    
    return (
      <ForceGraph2D
        ref={fgRef}
        graphData={graphDataForRender}
        nodeAutoColorBy="genre"
        nodeRelSize={graphConfig.nodeRelSize}
        width={graphDimensions.width}
        height={graphDimensions.height}
        linkWidth={(link) =>
          Math.min(graphConfig.maxLinkWidth, (link.weight || 1) * 2)
        }
        linkDirectionalParticles={graphConfig.linkParticleCount}
        linkDirectionalParticleSpeed={graphConfig.linkParticleSpeed}
        linkDirectionalParticleWidth={graphConfig.linkParticleWidth}
        linkColor={(link) => {
          const weight = link.weight || 1;
          const intensity = Math.min(weight / 5, 1);
          return interpolateBlues(intensity);
        }}
        nodeCanvasObject={(node, ctx, globalScale) => {
          renderNode(node, ctx, globalScale, imageCache, setGraphData, colors);
        }}
        onNodeHover={(node) => {
          if (node) {
            document.body.style.cursor = 'grab';
          } else {
            document.body.style.cursor = 'default';
          }
        }}
        onNodeDragStart={(node) => {
          // When drag starts, temporarily unfix the node being dragged
          if (node) {
            node.fx = undefined;
            node.fy = undefined;
            document.body.style.cursor = 'grabbing';
          }
        }}
        onNodeDrag={(node) => {
          // While dragging, keep other nodes fixed by not setting fx/fy
          // Only the dragged node moves
          document.body.style.cursor = 'grabbing';
        }}
        onNodeDragEnd={(node) => {
          // After dragging ends, fix the node at its new position
          if (node && node.x !== undefined && node.y !== undefined) {
            node.fx = node.x;
            node.fy = node.y;
            document.body.style.cursor = 'default';
          }
        }}
        onEngineStop={() => {
          // When simulation stops (stabilizes), fix all nodes in place
          if (graphData && graphData.nodes) {
            graphData.nodes.forEach((node) => {
              if (node.x !== undefined && node.y !== undefined && node.fx === undefined) {
                node.fx = node.x;
                node.fy = node.y;
              }
            });
            // Update state to reflect fixed positions (only if not already fixed)
            setGraphData((prev) => {
              if (!prev || !prev.nodes) return prev;
              let needsUpdate = false;
              const updatedNodes = prev.nodes.map((node) => {
                if (node.x !== undefined && node.y !== undefined && node.fx === undefined) {
                  needsUpdate = true;
                  return { ...node, fx: node.x, fy: node.y };
                }
                return node;
              });
              return needsUpdate ? { ...prev, nodes: updatedNodes } : prev;
            });
          }
        }}
      />
    );
  }, [graphData, graphDimensions]);

  // Show login screen if no token
  if (!accessToken) {
    return <LoginScreen />;
  }

  // Show loading screen
  if (isLoading || !graphData) {
    return <LoadingScreen />;
  }

  // Show error screen
  if (error) {
    return (
      <div
        style={{
          background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #1e3c72 100%)',
          color: colors.text,
          display: 'flex',
          height: '100vh',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            padding: '40px',
            background: 'rgba(0, 0, 0, 0.4)',
            borderRadius: '20px',
            backdropFilter: 'blur(10px)',
            maxWidth: '500px',
          }}
        >
          <h1
            style={{
              fontSize: '32px',
              fontWeight: 'bold',
              marginBottom: '20px',
              background: 'linear-gradient(135deg, #1DB954 0%, #1ed760 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Spotify Genre Graph
          </h1>
          <h2 style={{ fontSize: '24px', marginBottom: '15px' }}>Error loading graph data</h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '30px' }}>{error}</p>
          <button
            onClick={() => {
              setAccessToken(null);
              setError(null);
              setGraphData(null);
            }}
            style={{
              padding: '12px 30px',
              background: colors.spotifyGreen,
              color: colors.text,
              border: 'none',
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#1ed760';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = colors.spotifyGreen;
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Ensure we have valid data
  const safeGraphData = {
    nodes: graphData.nodes || [],
    links: graphData.links || [],
  };

  return (
    <div
      style={{
        position: 'relative',
        backgroundColor: colors.background,
        color: colors.text,
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
      }}
    >
      {/* Floating Title */}
      <div
        style={{
          position: 'absolute',
          top: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 100,
          pointerEvents: 'none',
        }}
      >
        <h1
          style={{
            fontSize: '32px',
            fontWeight: '700',
            margin: '0',
            color: '#ffffff',
            letterSpacing: '-1px',
            textShadow: '0 2px 20px rgba(0, 0, 0, 0.5)',
          }}
        >
          Spotify Genre Graph
        </h1>
      </div>

      {/* Overlay Sidebar Genre Chart */}
      <GenreChart nodes={safeGraphData.nodes} isVisible={sidebarVisible} />

      {/* Toggle Button */}
      <button
        onClick={() => setSidebarVisible(!sidebarVisible)}
        style={{
          position: 'absolute',
          left: sidebarVisible ? '305px' : '15px',
          top: '30px',
          zIndex: 1001,
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: colors.sidebarBackground,
          border: `2px solid ${colors.border}`,
          color: colors.text,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          transition: 'all 0.3s ease',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = colors.spotifyGreen;
          e.target.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = colors.sidebarBackground;
          e.target.style.transform = 'scale(1)';
        }}
        title={sidebarVisible ? 'Hide sidebar' : 'Show sidebar'}
        aria-label={sidebarVisible ? 'Hide sidebar' : 'Show sidebar'}
      >
        {sidebarVisible ? '←' : '→'}
      </button>

      {/* Main Graph - Full Screen - Memoized to prevent re-render on sidebar toggle */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
        }}
      >
        {graphComponent}
      </div>
    </div>
  );
}
