import { generateTerrain, drawTerrain, type TerrainData } from './Terrain';

describe('Terrain', () => {
  describe('generateTerrain', () => {
    it('should generate terrain with trees and forests at 1cm scale', () => {
      const terrain = generateTerrain(400, 400);
      
      expect(terrain).toBeDefined();
      expect(terrain.trees).toBeInstanceOf(Array);
      expect(terrain.grassColor).toBe('#8B7355');
      expect(terrain.treeColor).toBe('#2F4F2F');
      expect(terrain.forestColor).toBe('#1B3D1B');
      
      // Should have some trees
      expect(terrain.trees.length).toBeGreaterThan(0);
      
      // Check tree properties (1 pixel = 1cm scale)
      terrain.trees.forEach(tree => {
        expect(tree.x).toBeGreaterThanOrEqual(0);
        expect(tree.x).toBeLessThanOrEqual(400);
        expect(tree.y).toBeGreaterThanOrEqual(0);
        expect(tree.y).toBeLessThanOrEqual(400);
        expect(tree.radius).toBeGreaterThanOrEqual(8); // Minimum 8cm radius
        expect(tree.radius).toBeLessThanOrEqual(20); // Maximum 20cm radius
        expect(['single', 'forest']).toContain(tree.type);
      });
    });

    it('should generate different terrain on each call', () => {
      const terrain1 = generateTerrain(400, 400);
      const terrain2 = generateTerrain(400, 400);
      
      // Trees should be in different positions
      expect(terrain1.trees).not.toEqual(terrain2.trees);
    });

    it('should scale tree count with map size', () => {
      const smallTerrain = generateTerrain(200, 200);
      const largeTerrain = generateTerrain(800, 800);
      
      // Larger map should have more trees (roughly 16x more area)
      expect(largeTerrain.trees.length).toBeGreaterThan(smallTerrain.trees.length);
    });

    it('should generate realistic tree sizes for 1cm scale', () => {
      const terrain = generateTerrain(400, 400);
      
      terrain.trees.forEach(tree => {
        // Trees should be 16-40cm in diameter (8-20cm radius)
        expect(tree.radius).toBeGreaterThanOrEqual(8);
        expect(tree.radius).toBeLessThanOrEqual(20);
        
        if (tree.type === 'single') {
          // Single trees should be larger than forest trees
          expect(tree.radius).toBeGreaterThanOrEqual(12);
        }
      });
    });
  });

  describe('drawTerrain', () => {
    it('should not throw when drawing terrain', () => {
      const terrain = generateTerrain(400, 400);
      
      // Mock canvas context
      const mockContext = {
        fillStyle: '',
        fillRect: jest.fn(),
        beginPath: jest.fn(),
        arc: jest.fn(),
        fill: jest.fn(),
        strokeStyle: '',
        lineWidth: 0,
        stroke: jest.fn()
      } as unknown as CanvasRenderingContext2D;
      
      expect(() => {
        drawTerrain(mockContext, terrain, 400, 400);
      }).not.toThrow();
    });
  });
}); 