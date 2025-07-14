/**
 * Terrain system for the battle map
 * Generates grass background and random trees/forests
 * Scale: 1 pixel = 1cm
 */

export interface Tree {
  x: number;
  y: number;
  radius: number;
  type: 'single' | 'forest';
}

export interface TerrainData {
  trees: Tree[];
  grassColor: string;
  treeColor: string;
  forestColor: string;
}

/**
 * Clamps a value between min and max
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Generates terrain data with random trees and forests
 * Scale: 1 pixel = 1cm, so trees are 20-50cm in diameter
 */
export function generateTerrain(width: number, height: number): TerrainData {
  const trees: Tree[] = [];
  
  // Total War Rome inspired colors
  const grassColor = '#8B7355'; // Earthy brown-gold
  const treeColor = '#2F4F2F'; // Dark forest green
  const forestColor = '#1B3D1B'; // Deeper forest green
  
  // Generate single trees (sparse)
  // With 1cm scale, we want fewer trees since they're now smaller
  const singleTreeCount = Math.floor((width * height) / 50000); // 1 tree per 50000 pixels (5m²)
  for (let i = 0; i < singleTreeCount; i++) {
    trees.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 8 + 12, // 12-20 radius (24-40cm diameter)
      type: 'single'
    });
  }
  
  // Generate forest clusters
  const forestCount = Math.floor((width * height) / 100000); // 1 forest per 100000 pixels (10m²)
  for (let i = 0; i < forestCount; i++) {
    const centerX = Math.random() * width;
    const centerY = Math.random() * height;
    const forestSize = Math.floor(Math.random() * 4) + 3; // 3-7 trees per forest
    
    for (let j = 0; j < forestSize; j++) {
      // Cluster trees around the center (closer together since trees are smaller)
      const offsetX = (Math.random() - 0.5) * 60; // 60cm spread
      const offsetY = (Math.random() - 0.5) * 60; // 60cm spread
      
      // Clamp positions to stay within bounds
      const treeX = clamp(centerX + offsetX, 0, width);
      const treeY = clamp(centerY + offsetY, 0, height);
      
      trees.push({
        x: treeX,
        y: treeY,
        radius: Math.random() * 6 + 8, // 8-14 radius (16-28cm diameter) for forest trees
        type: 'forest'
      });
    }
  }
  
  return {
    trees,
    grassColor,
    treeColor,
    forestColor
  };
}

/**
 * Draws the terrain on the canvas
 */
export function drawTerrain(
  ctx: CanvasRenderingContext2D,
  terrain: TerrainData,
  width: number,
  height: number
): void {
  // Draw grass background
  ctx.fillStyle = terrain.grassColor;
  ctx.fillRect(0, 0, width, height);
  
  // Draw trees
  terrain.trees.forEach(tree => {
    ctx.beginPath();
    ctx.arc(tree.x, tree.y, tree.radius, 0, 2 * Math.PI);
    
    if (tree.type === 'forest') {
      ctx.fillStyle = terrain.forestColor;
    } else {
      ctx.fillStyle = terrain.treeColor;
    }
    
    ctx.fill();
    
    // Add subtle outline for depth
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1;
    ctx.stroke();
  });
} 