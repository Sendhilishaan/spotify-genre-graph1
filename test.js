// Project structure:
// - client/: React frontend
// - server/: Node.js backend with Express and Spotify OAuth

// ---- server/index.js ----
const express = require("express");
const request = require("request");
const cors = require("cors");
const querystring = require("querystring");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();
app.use(cors()).use(cookieParser());

const redirect_uri = "http://localhost:8888/callback";
const client_uri = "http://localhost:3000";

const generateRandomString = length => {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

app.get("/login", (req, res) => {
  const state = generateRandomString(16);
  res.cookie("spotify_auth_state", state);
  const scope = "user-top-read";
  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: process.env.SPOTIFY_CLIENT_ID,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state,
      })
  );
});

app.get("/callback", (req, res) => {
  const code = req.query.code || null;
  const authOptions = {
    url: "https://accounts.spotify.com/api/token",
    form: {
      code: code,
      redirect_uri: redirect_uri,
      grant_type: "authorization_code",
    },
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(
          process.env.SPOTIFY_CLIENT_ID + ":" + process.env.SPOTIFY_CLIENT_SECRET
        ).toString("base64"),
    },
    json: true,
  };

  request.post(authOptions, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      const access_token = body.access_token;
      res.redirect(client_uri + "?access_token=" + access_token);
    } else {
      res.redirect(client_uri + "?error=invalid_token");
    }
  });
});

app.listen(8888);

// ---- client/src/App.jsx ----
import React, { useEffect, useState } from "react";
import { ForceGraph2D } from "react-force-graph";

const App = () => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [token, setToken] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get("access_token");
    if (accessToken) {
      setToken(accessToken);
      fetchGenres(accessToken);
    }
  }, []);

  const fetchGenres = async (token) => {
    const res = await fetch("https://api.spotify.com/v1/me/top/artists?limit=50", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    const genreCount = {};
    const links = [];

    data.items.forEach((artist) => {
      const genres = artist.genres;
      genres.forEach((g) => {
        genreCount[g] = (genreCount[g] || 0) + 1;
      });
      for (let i = 0; i < genres.length; i++) {
        for (let j = i + 1; j < genres.length; j++) {
          links.push({ source: genres[i], target: genres[j] });
        }
      }
    });

    const nodes = Object.entries(genreCount).map(([id, value]) => ({ id, value }));
    setGraphData({ nodes, links });
  };

  return (
    <div className="p-4">
      {!token ? (
        <a
          href="http://localhost:8888/login"
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Login with Spotify
        </a>
      ) : (
        <ForceGraph2D
          graphData={graphData}
          nodeAutoColorBy="id"
          nodeVal="value"
          nodeLabel="id"
        />
      )}
    </div>
  );
};

export default App;

// ---- .env (in /server) ----
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

// ---- Notes ----
// 1. Install packages: express, request, cors, dotenv, react-force-graph
// 2. Use `npm run dev` in client and `node index.js` in server
// 3. Register Spotify redirect URI as http://localhost:8888/callback
// 4. Make sure to handle token expiry and refresh logic if expanding
