/**
 * Graph data processing utilities
 */

const { MAX_LINKS_PER_NODE, GENRE_MAP } = require('../constants');

/**
 * Processes artists data to extract genre frequency
 * @param {Array} artists - Array of artist objects
 * @returns {Object} Genre frequency map
 */
function calculateGenreFrequency(artists) {
  const genreFrequency = {};

  artists.forEach((artist) => {
    const genres = artist.genres || [];
    genres.forEach((genre) => {
      const parentGenre = GENRE_MAP[genre.toLowerCase()] || genre.toLowerCase();
      genreFrequency[parentGenre] = (genreFrequency[parentGenre] || 0) + 1;
    });
  });

  return genreFrequency;
}

/**
 * Creates links between artists based on shared genres
 * @param {Array} artists - Array of artist objects
 * @returns {Array} Array of link objects
 */
function createArtistLinks(artists) {
  const links = [];

  for (let i = 0; i < artists.length; i++) {
    for (let j = i + 1; j < artists.length; j++) {
      const sharedGenres = artists[i].genres.filter((g) =>
        artists[j].genres.includes(g)
      );

      if (sharedGenres.length > 0) {
        links.push({
          source: artists[i].id,
          target: artists[j].id,
          weight: sharedGenres.length,
        });
      }
    }
  }

  return links;
}

/**
 * Filters links to limit the number of connections per node
 * @param {Array} links - Array of all links
 * @returns {Array} Filtered array of links
 */
function filterLinks(links) {
  const linksBySource = {};

  // Group links by source
  links.forEach((link) => {
    if (!linksBySource[link.source]) {
      linksBySource[link.source] = [];
    }
    linksBySource[link.source].push(link);
  });

  // Filter to keep only top N links per source (by weight)
  const filteredLinks = [];
  Object.values(linksBySource).forEach((linkArray) => {
    linkArray
      .sort((a, b) => b.weight - a.weight)
      .slice(0, MAX_LINKS_PER_NODE)
      .forEach((link) => filteredLinks.push(link));
  });

  return filteredLinks;
}

/**
 * Transforms raw Spotify artist data into graph node format
 * @param {Array} artists - Raw artist data from Spotify API
 * @param {Object} genreFrequency - Genre frequency map
 * @param {Set} connectedIds - Set of artist IDs that are connected via links
 * @returns {Array} Array of node objects for the graph
 */
function createGraphNodes(artists, genreFrequency, connectedIds) {
  return artists
    .filter((artist) => connectedIds.has(artist.id))
    .map((artist) => {
      // Find the genre with the highest frequency
      let topGenre = 'Other';
      let maxCount = 0;

      artist.genres.forEach((g) => {
        const count = genreFrequency[g] || 0;
        if (count > maxCount) {
          maxCount = count;
          topGenre = g;
        }
      });

      return {
        id: artist.id,
        name: artist.name,
        val: artist.popularity || 0,
        img: (artist.images && artist.images[0]?.url) || null,
        genre: artist.genres[0] || 'Other',
        genres: artist.genres || [],
      };
    });
}

module.exports = {
  calculateGenreFrequency,
  createArtistLinks,
  filterLinks,
  createGraphNodes,
};

