import { MapData, TreeData } from '../types/MapData';

/**
 * Simple seeded random number generator (mulberry32).
 * Copied from backend MapGenerator.ts
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
 * Validates tree parameters
 */
function validateTree(trunkRadius: number, canopyRadius: number): void {
    if (trunkRadius < 25 || trunkRadius > 150) {
        throw new Error(`Trunk radius of "${trunkRadius}" must be between 25 and 150 cm`);
    }

    if (canopyRadius < 10 * trunkRadius || canopyRadius > 20 * trunkRadius) {
        throw new Error(`Canopy radius of "${canopyRadius}" must be between ${10 * trunkRadius} and ${20 * trunkRadius} cm`);
    }
}

/**
 * Creates a single tree with validation
 */
export function createTree(x: number, y: number, trunkRadius: number, canopyRadius: number): TreeData {
    validateTree(trunkRadius, canopyRadius);

    return {
        position: { x, y },
        trunkRadius,
        canopyRadius,
    };
}

/**
 * Generates a procedural forest map with dense forests at edges and sparse plains in center.
 * Copied and adapted from backend MapGenerator.ts
 */
export function generateTreesForMap(mapData: MapData, seed = 1): TreeData[] {
    const trees: TreeData[] = [];
    const rand = mulberry32(seed);
    const centerX = mapData.width / 2;
    const centerY = mapData.height / 2;
    const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);
    const spacing = 50; // cm between possible tree positions

    for (let x = spacing / 2; x < mapData.width; x += spacing) {
        for (let y = spacing / 2; y < mapData.height; y += spacing) {
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

                trees.push(createTree(x, y, trunkRadius, canopyRadius));
            }
        }
    }

    return trees;
}

/**
 * Generates a single random tree for manual placement
 */
export function generateRandomTree(x: number, y: number, seed?: number): TreeData {
    const rand = seed ? mulberry32(seed) : Math.random;
    const trunkRadius = 25 + Math.floor(rand() * 125); // 25-150cm
    const canopyRadius = trunkRadius * (10 + Math.floor(rand() * 10)); // 10-20 times trunk radius

    return createTree(x, y, trunkRadius, canopyRadius);
}
