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
 * Check if a new tree would collide with existing trees (trunk collision only)
 */
function checkTreeCollision(newTree: TreeData, existingTrees: TreeData[]): boolean {
    return existingTrees.some((existingTree) => {
        const dx = newTree.position.x - existingTree.position.x;
        const dy = newTree.position.y - existingTree.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = newTree.trunkRadius + existingTree.trunkRadius + 10; // 10cm minimum gap
        return distance < minDistance;
    });
}

/**
 * Generates a procedural forest map with natural tree distribution
 * Uses random positioning with trunk collision detection
 */
export async function generateTreesForMap(
    mapData: MapData,
    seed = 1,
    onProgress?: (current: number, total: number) => void,
): Promise<TreeData[]> {
    const trees: TreeData[] = [];
    const rand = mulberry32(seed);
    const centerX = mapData.width / 2;
    const centerY = mapData.height / 2;
    const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);

    // Calculate tree density based on map size - much lower density to prevent freezing
    const mapArea = mapData.width * mapData.height; // cm²
    const baseDensity = 0.000001; // trees per cm² - reduced by 10x
    const targetTreeCount = Math.min(Math.floor(mapArea * baseDensity), 2000); // Cap at 2000 trees

    let attempts = 0;
    const maxAttempts = targetTreeCount * 10; // Prevent infinite loops
    const batchSize = 50; // Process trees in batches to prevent freezing

    while (trees.length < targetTreeCount && attempts < maxAttempts) {
        // Process a batch of attempts
        for (let i = 0; i < batchSize && trees.length < targetTreeCount && attempts < maxAttempts; i++) {
            attempts++;

            // Random position
            const x = rand() * mapData.width;
            const y = rand() * mapData.height;

            // Calculate distance from center for density variation
            const dx = x - centerX;
            const dy = y - centerY;
            const dist = Math.sqrt(dx * dx + dy * dy) / maxDist;

            // Higher probability at edges, lower at center
            const baseProb = 0.7 * dist + 0.05; // 0.05 in center, up to 0.75 at edge

            // Add some noise for natural look
            const noise = (rand() - 0.5) * 0.2; // +/- 0.1
            const prob = Math.max(0, Math.min(1, baseProb + noise));

            if (rand() < prob) {
                // Generate tree parameters
                const trunkRadius = 25 + Math.floor(rand() * 125); // 25-150cm
                const canopyRadius = trunkRadius * (10 + Math.floor(rand() * 10)); // 10-20 times trunk radius

                const newTree = createTree(x, y, trunkRadius, canopyRadius);

                // Check for trunk collision
                if (!checkTreeCollision(newTree, trees)) {
                    trees.push(newTree);
                }
            }
        }

        // Update progress
        if (onProgress) {
            onProgress(trees.length, targetTreeCount);
        }

        // Yield control to prevent blocking the UI
        await new Promise(resolve => setTimeout(resolve, 0));
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

/**
 * Check if a tree can be placed at the given position (no trunk collision)
 */
export function canPlaceTree(x: number, y: number, trunkRadius: number, existingTrees: TreeData[]): boolean {
    const newTree = { position: { x, y }, trunkRadius, canopyRadius: 0 };
    return !checkTreeCollision(newTree, existingTrees);
}
