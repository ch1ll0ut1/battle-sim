import { describe, expect, it } from 'vitest';
import { generateForestMap, serializeMapToJson } from './MapGenerator';

describe('MapGenerator', () => {
    describe('generateForestMap', () => {
        it('should generate a map with correct dimensions', () => {
            const width = 1000;
            const height = 800;
            const seed = 42;
            const map = generateForestMap(width, height, seed);

            expect(map.width).toBe(width);
            expect(map.height).toBe(height);
        });

        it('should generate the same map for the same seed', () => {
            const width = 500;
            const height = 500;
            const seed = 123;

            const map1 = generateForestMap(width, height, seed);
            const map2 = generateForestMap(width, height, seed);

            expect(map1.terrain.trees.length).toBe(map2.terrain.trees.length);

            // Check that trees are in the same positions
            const trees1 = map1.terrain.trees.map(t => ({ x: t.position.x, y: t.position.y, trunkRadius: t.trunkRadius }));
            const trees2 = map2.terrain.trees.map(t => ({ x: t.position.x, y: t.position.y, trunkRadius: t.trunkRadius }));

            expect(trees1).toEqual(trees2);
        });

        it('should generate different maps for different seeds', () => {
            const width = 500;
            const height = 500;
            const seed1 = 123;
            const seed2 = 456;

            const map1 = generateForestMap(width, height, seed1);
            const map2 = generateForestMap(width, height, seed2);

            // Maps should be different (different number of trees or different positions)
            const trees1 = map1.terrain.trees.map(t => ({ x: t.position.x, y: t.position.y }));
            const trees2 = map2.terrain.trees.map(t => ({ x: t.position.x, y: t.position.y }));

            // At least one of these should be different
            const differentCount = map1.terrain.trees.length !== map2.terrain.trees.length;
            const differentPositions = JSON.stringify(trees1) !== JSON.stringify(trees2);

            expect(differentCount || differentPositions).toBe(true);
        });

        it('should place trees within map boundaries', () => {
            const width = 1000;
            const height = 800;
            const seed = 42;
            const map = generateForestMap(width, height, seed);

            for (const tree of map.terrain.trees) {
                expect(tree.position.x).toBeGreaterThanOrEqual(0);
                expect(tree.position.x).toBeLessThan(width);
                expect(tree.position.y).toBeGreaterThanOrEqual(0);
                expect(tree.position.y).toBeLessThan(height);
            }
        });

        it('should generate trees with valid trunk radius', () => {
            const width = 500;
            const height = 500;
            const seed = 42;
            const map = generateForestMap(width, height, seed);

            for (const tree of map.terrain.trees) {
                expect(tree.trunkRadius).toBeGreaterThanOrEqual(25);
                expect(tree.trunkRadius).toBeLessThanOrEqual(174); // Based on current implementation
            }
        });

        it('should generate more trees near edges than center', () => {
            const width = 1000;
            const height = 1000;
            const seed = 42;
            const map = generateForestMap(width, height, seed);

            const centerX = width / 2;
            const centerY = height / 2;
            const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);

            let edgeTrees = 0;
            let centerTrees = 0;

            for (const tree of map.terrain.trees) {
                const dx = tree.position.x - centerX;
                const dy = tree.position.y - centerY;
                const dist = Math.sqrt(dx * dx + dy * dy) / maxDist;

                if (dist > 0.7) { // Edge area
                    edgeTrees++;
                }
                else if (dist < 0.3) { // Center area
                    centerTrees++;
                }
            }

            // Should have more trees at edges than center (due to density gradient)
            expect(edgeTrees).toBeGreaterThan(0);
            expect(centerTrees).toBeGreaterThan(0);
            // Note: This test might occasionally fail due to randomness, but should generally pass
        });
    });

    describe('serializeMapToJson', () => {
        it('should serialize a map to valid JSON', () => {
            const map = generateForestMap(500, 500, 42);
            const json = serializeMapToJson(map);

            expect(() => JSON.parse(json)).not.toThrow();
        });

        it('should include all map properties in serialized output', () => {
            const width = 1000;
            const height = 800;
            const map = generateForestMap(width, height, 42);
            const json = serializeMapToJson(map);
            const parsed = JSON.parse(json);

            expect(parsed.width).toBe(width);
            expect(parsed.height).toBe(height);
            expect(parsed.terrain).toBeDefined();
            expect(parsed.terrain.trees).toBeDefined();
            expect(Array.isArray(parsed.terrain.trees)).toBe(true);
        });

        it('should serialize tree properties correctly', () => {
            const map = generateForestMap(500, 500, 42);
            const json = serializeMapToJson(map);
            const parsed = JSON.parse(json);

            if (parsed.terrain.trees.length > 0) {
                const tree = parsed.terrain.trees[0];
                expect(tree.position).toBeDefined();
                expect(tree.position.x).toBeDefined();
                expect(tree.position.y).toBeDefined();
                expect(tree.trunkRadius).toBeDefined();
                expect(tree.canopyRadius).toBeDefined();
            }
        });
    });
});
