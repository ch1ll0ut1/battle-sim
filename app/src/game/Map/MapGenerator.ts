/**
 * MapGenerator module for creating predefined maps for testing and gameplay.
 * Provides functions to generate Map instances with specific layouts and to serialize them for persistence.
 */
import { Map } from './Map';
import { Tree } from './Terrain/Tree';

/**
 * Simple seeded random number generator (mulberry32).
 * @param seed Seed value
 * @returns Function that returns a pseudo-random number between 0 and 1
 */
function mulberry32(seed: number): () => number {
    return function () {
        let t = seed += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

/**
 * Generates a procedural map with dense forests at the edges and sparse plains in the center.
 * Uses a seeded random number generator for reproducibility.
 * @param width Width of the map in cm
 * @param height Height of the map in cm
 * @param seed Seed for random number generator
 * @returns Map instance with trees placed naturally
 * @todo Add random clearings in the forests
 * @todo Add rivers and lakes
 */
export function generateForestMap(width: number, height: number, seed: number): Map {
    const map = new Map(width, height);
    const rand = mulberry32(seed);
    const centerX = width / 2;
    const centerY = height / 2;
    const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);
    const spacing = 50; // cm between possible tree positions

    for (let x = spacing / 2; x < width; x += spacing) {
        for (let y = spacing / 2; y < height; y += spacing) {
            // Calculate normalized distance from center (0 = center, 1 = edge)
            const dx = x - centerX;
            const dy = y - centerY;
            const dist = Math.sqrt(dx * dx + dy * dy) / maxDist;

            // Base probability: high at edges, low at center
            const baseProb = 0.7 * dist + 0.05; // 0.05 in center, up to 0.75 at edge

            // Add some noise for natural look
            const noise = (rand() - 0.5) * 0.2; // +/- 0.1
            const prob = Math.max(0, Math.min(1, baseProb + noise));

            if (rand() < prob) {
                // Vary trunk radius a bit for realism
                const trunkRadius = 25 + Math.floor(rand() * 125); // 25-150cm
                const canopyRadius = trunkRadius * (10 + Math.floor(rand() * 10)); // 10-20 times the trunk radius
                map.terrain.trees.push(new Tree({ x, y }, trunkRadius, canopyRadius));
            }
        }
    }
    return map;
}

/**
 * Serializes a Map instance to a JSON string for saving to disk.
 * @param map Map instance to serialize
 * @returns JSON string representing the map
 */
export function serializeMapToJson(map: Map): string {
    return JSON.stringify(map.getState(), null, 2);
}
