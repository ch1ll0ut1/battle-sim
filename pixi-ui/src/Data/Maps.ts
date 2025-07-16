/**
 * Map data structure
 */
export interface MapData {
    id: string;
    name: string;
    description: string;
    width: number;
    height: number;
    terrain: TerrainType[][];
    preview?: string;
}

/**
 * Terrain types
 */
export enum TerrainType {
    grass = 'grass',
    forest = 'forest',
    mountain = 'mountain',
    water = 'water',
    road = 'road',
}

/**
 * Create a terrain array filled with a specific terrain type
 */
function createTerrainArray(width: number, height: number, terrainType: TerrainType): TerrainType[][] {
    const terrain: TerrainType[][] = [];
    for (let y = 0; y < height; y++) {
        const row: TerrainType[] = [];
        for (let x = 0; x < width; x++) {
            row.push(terrainType);
        }
        terrain.push(row);
    }
    return terrain;
}

/**
 * Dummy maps data
 */
export const MAPS: MapData[] = [
    {
        id: 'plains',
        name: 'Open Plains',
        description: 'Wide open battlefield with minimal obstacles',
        width: 20,
        height: 15,
        terrain: createTerrainArray(20, 15, TerrainType.grass),
    },
    {
        id: 'forest_clearing',
        name: 'Forest Clearing',
        description: 'Dense forest with a central clearing',
        width: 25,
        height: 20,
        terrain: createTerrainArray(25, 20, TerrainType.forest),
    },
    {
        id: 'mountain_pass',
        name: 'Mountain Pass',
        description: 'Narrow pass between mountain ranges',
        width: 30,
        height: 12,
        terrain: createTerrainArray(30, 12, TerrainType.mountain),
    },
];

/**
 * Get a map by ID
 */
export function getMap(id: string): MapData | undefined {
    return MAPS.find(map => map.id === id);
}

/**
 * Get all available maps
 */
export function getAllMaps(): MapData[] {
    return MAPS;
}
