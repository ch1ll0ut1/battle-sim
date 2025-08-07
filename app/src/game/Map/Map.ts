import { TickUpdate } from '../../engine/TickUpdate';
import { Terrain, TerrainState } from './Terrain/Terrain';

export interface MapState {
    width: number;
    height: number;
    terrain: TerrainState;
}

/**
 * A map is a 2D world that contains a terrain and a set of units.
 */
export class Map implements TickUpdate {
    public readonly terrain: Terrain;

    /**
     * The width of the map in cm.
     */
    public readonly width: number;

    /**
     * The height of the map in cm.
     */
    public readonly height: number;

    /**
     * Creates a new map with the given width and height.
     * @param width The width of the map in cm.
     * @param height The height of the map in cm.
     */
    public constructor(width: number, height: number, terrain?: Terrain) {
        this.terrain = terrain ?? new Terrain([]);
        this.width = width;
        this.height = height;
    }

    public update(_deltaTime: number): void {
        // noop
    }

    public getState(): MapState {
        return {
            width: this.width,
            height: this.height,
            terrain: this.terrain.getState(),
        };
    }
}
