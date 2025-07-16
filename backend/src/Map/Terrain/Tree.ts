import { Position } from '../../Unit/Position';

export class Tree {
    /**
     * The position of the tree on the world map.
     */
    public position: Position;

    /**
     * The radius of the tree's trunk in cm.
     */
    public trunkRadius: number;

    /**
     * The radius of the tree's canopy in cm.
     */
    public canopyRadius: number;

    public constructor(position: Position, trunkRadius: number, canopyRadius: number) {
        this.position = position;
        this.trunkRadius = trunkRadius;
        this.canopyRadius = canopyRadius;

        this.validate();
    }

    private validate() {
        if (this.trunkRadius < 25 || this.trunkRadius > 150) {
            throw new Error(`Trunk radius of "${this.trunkRadius}" must be between 25 and 150 cm`);
        }

        // Canopy radius must be between 10-20 times the trunk radius
        if (this.canopyRadius < 10 * this.trunkRadius || this.canopyRadius > 20 * this.trunkRadius) {
            throw new Error(`Canopy radius of "${this.canopyRadius}" must be between ${10 * this.trunkRadius} and ${20 * this.trunkRadius} cm`);
        }
    }
}
