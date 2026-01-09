import React from 'react';
import { interpolateBlues } from 'd3-scale-chromatic';
import { colors } from '../config';

/**
 * Genre bar chart component
 * @param {Object} props
 * @param {Array} props.nodes - Graph nodes with genre information
 * @param {boolean} props.isVisible - Whether sidebar is visible
 */
export default function GenreChart({ nodes, isVisible }) {
  // Count genres
  const genreCounts = {};
  nodes.forEach((node) => {
    const genres = node.genres || ['Other'];
    genres.forEach((genre) => {
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    });
  });

  const genreEntries = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]);

  const barWidth = 280;
  const barHeight = 24;
  const padding = 8;
  const maxCount = Math.max(...genreEntries.map(([, count]) => count), 1);
  const maxBarWidth = barWidth - 140; // Reserve space for label and count

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: isVisible ? '320px' : '0px',
        height: '100vh',
        backgroundColor: colors.sidebarBackground,
        fontFamily: 'sans-serif',
        overflow: 'hidden',
        transition: 'width 0.3s ease-in-out',
        display: 'flex',
        flexDirection: 'column',
        borderRight: `1px solid ${colors.border}`,
        zIndex: 1000,
        boxShadow: isVisible ? '2px 0 20px rgba(0, 0, 0, 0.3)' : 'none',
      }}
    >
      {isVisible && (
        <div
          style={{
            padding: '20px',
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
          className="genre-chart-container"
        >
          <h3
            style={{
              textAlign: 'center',
              marginBottom: '24px',
              fontSize: '18px',
              fontWeight: '600',
              color: colors.text,
            }}
          >
            Top Genres
          </h3>
          {genreEntries.length === 0 ? (
            <p
              style={{
                textAlign: 'center',
                color: colors.border,
                marginTop: '40px',
              }}
            >
              No genres found
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {genreEntries.map(([genre, count], i) => {
                const barLen = Math.min(
                  (count / maxCount) * maxBarWidth,
                  maxBarWidth
                );
                const percentage = ((count / maxCount) * 100).toFixed(0);

                return (
                  <div
                    key={genre}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '8px',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '12px',
                          color: colors.text,
                          fontWeight: '500',
                          flex: 1,
                          wordBreak: 'break-word',
                          lineHeight: '1.4',
                        }}
                      >
                        {genre}
                      </span>
                      <span
                        style={{
                          fontSize: '12px',
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontWeight: '600',
                          flexShrink: 0,
                          marginTop: '2px',
                        }}
                      >
                        {count}
                      </span>
                    </div>
                    <div
                      style={{
                        width: '100%',
                        height: `${barHeight}px`,
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      <div
                        style={{
                          width: `${barLen}px`,
                          height: '100%',
                          background: `linear-gradient(90deg, ${interpolateBlues(count / maxCount)}, ${interpolateBlues(count / maxCount + 0.1)})`,
                          borderRadius: '4px',
                          transition: 'width 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          paddingLeft: '8px',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                        }}
                      >
                        {barLen > 40 && (
                          <span
                            style={{
                              fontSize: '10px',
                              color: 'white',
                              fontWeight: '600',
                            }}
                          >
                            {percentage}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      
      <style>{`
        .genre-chart-container::-webkit-scrollbar {
          display: none;
          width: 0;
          background: transparent;
        }
        .genre-chart-container {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

