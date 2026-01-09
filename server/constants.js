/**
 * Application constants
 */

const GENRE_MAP = {
  pop: 'Pop',
  'dance pop': 'Pop',
  'pop rap': 'Pop',
  electropop: 'Pop',
  rock: 'Rock',
  'alternative rock': 'Rock',
  'modern rock': 'Rock',
  'hard rock': 'Rock',
  'indie rock': 'Indie',
  'indie pop': 'Indie',
  'folk-pop': 'Indie',
  'folk rock': 'Indie',
  edm: 'Electronic',
  'electro house': 'Electronic',
  'progressive house': 'Electronic',
  house: 'Electronic',
  techno: 'Electronic',
  trance: 'Electronic',
  hiphop: 'Hip-Hop',
  'hip hop': 'Hip-Hop',
  rap: 'Hip-Hop',
  'trap music': 'Hip-Hop',
  'southern hip hop': 'Hip-Hop',
  rnb: 'R&B',
  'r&b': 'R&B',
  'neo soul': 'R&B',
  soul: 'R&B',
  jazz: 'Jazz',
  'vocal jazz': 'Jazz',
  classical: 'Classical',
  baroque: 'Classical',
  country: 'Country',
  'modern country rock': 'Country',
  'canadian country': 'Country',
  'k-pop': 'K-Pop',
  'j-pop': 'J-Pop',
};

const SPOTIFY_SCOPES = ['user-top-read'];

const MAX_LINKS_PER_NODE = 10;
const TOP_ARTISTS_LIMIT = 50;
const STATE_COOKIE_NAME = 'spotify_auth_state';

module.exports = {
  GENRE_MAP,
  SPOTIFY_SCOPES,
  MAX_LINKS_PER_NODE,
  TOP_ARTISTS_LIMIT,
  STATE_COOKIE_NAME,
};

