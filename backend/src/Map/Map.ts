import { TickUpdate } from '../utils/TickUpdate';
import { Terrain } from './Terrain/Terrain';

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
    public constructor(width: number, height: number) {
        this.terrain = new Terrain();
        this.width = width;
        this.height = height;
    }

    public update(_deltaTime: number): void {
        // noop
    }

    public getState() {
        return {
            width: this.width,
            height: this.height,
            terrain: this.terrain.getState(),
        };
    }
}
