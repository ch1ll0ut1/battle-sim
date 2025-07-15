import { Position } from "../../Unit/Position";

export class Tree {
    /**
     * The position of the tree on the world map.
     */
    public position: Position

    /**
     * The radius of the tree's trunk in cm.
     */
    public trunkRadius: number;

    /**
     * The radius of the tree's canopy in cm.
     */
    public canopyRadius: number;

    public constructor(position: Position, trunkRadius: number) {
        this.position = position;
        this.trunkRadius = trunkRadius;
        this.canopyRadius = 15 * trunkRadius;

        this.validate();
    }

    private validate() {
        if (this.trunkRadius < 25 || this.trunkRadius > 150) {
            throw new Error(`Trunk radius of "${this.trunkRadius}" must be between 25 and 150 cm`);
        }
    }
}