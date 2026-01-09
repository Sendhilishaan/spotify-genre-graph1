import * as d3Force from 'd3-force';
import { graphConfig } from '../config';

/**
 * Configures the force graph physics
 * @param {Object} graphRef - Reference to the ForceGraph2D component
 */
export function setupGraphPhysics(graphRef) {
  if (!graphRef.current) return;

  const fg = graphRef.current;

  fg.d3Force('collide', d3Force.forceCollide(graphConfig.collisionRadius));
  fg.d3Force('link')
    .distance(graphConfig.linkDistance)
    .strength(graphConfig.linkStrength);
  fg.d3Force('charge').strength(graphConfig.chargeStrength);
  fg.d3Force('center', d3Force.forceCenter(
    window.innerWidth / 2,
    window.innerHeight / 2
  ));
  fg.d3ReheatSimulation();

  // Auto-zoom to fit after a delay
  const timeout = setTimeout(() => {
    if (fg && typeof fg.zoomToFit === 'function') {
      fg.zoomToFit(400);
    }
  }, graphConfig.zoomToFitDelay);

  return () => clearTimeout(timeout);
}

/**
 * Renders a node on the canvas
 * @param {Object} node - Node object
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} globalScale - Current zoom level
 * @param {Object} imageCache - Reference to image cache object
 * @param {Function} updateGraph - Function to trigger graph update
 * @param {Object} colors - Color configuration
 */
export function renderNode(node, ctx, globalScale, imageCache, updateGraph, colors) {
  const imgSize = graphConfig.imageSize;
  const fontSize = 12 / globalScale;
  const label = node.name;

  if (node.img) {
    if (!imageCache.current[node.id]) {
      // Load image asynchronously
      const img = new Image();
      img.src = node.img;
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        imageCache.current[node.id] = img;
        updateGraph((data) => ({ ...data }));
      };
      img.onerror = () => {
        console.warn(`Failed to load image for ${node.name}`);
      };
    } else {
      // Draw cached image
      const img = imageCache.current[node.id];
      ctx.save();
      ctx.beginPath();
      ctx.arc(node.x, node.y, imgSize / 2, 0, 2 * Math.PI);
      ctx.clip();
      ctx.drawImage(
        img,
        node.x - imgSize / 2,
        node.y - imgSize / 2,
        imgSize,
        imgSize
      );
      ctx.restore();
    }
  } else {
    // Draw placeholder circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, imgSize / 2, 0, 2 * Math.PI);
    ctx.fillStyle = node.color || colors.placeholder;
    ctx.fill();
    ctx.strokeStyle = colors.border;
    ctx.stroke();
  }

  // Draw label
  ctx.font = `${fontSize}px Sans-Serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillStyle = colors.text;
  ctx.fillText(label, node.x, node.y - imgSize / 2 - 5);
}

