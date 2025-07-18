import { TreeData } from '../types/MapData';

/**
 * Rectangle bounds for spatial queries
 */
export interface Rectangle {
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * Point for spatial indexing
 */
export interface Point {
    x: number;
    y: number;
}

/**
 * Quadtree node for spatial indexing of trees
 */
export class QuadTree {
    private static readonly maxObjects = 25;
    private static readonly maxLevels = 8;

    private level: number;
    private objects: TreeData[] = [];
    private bounds: Rectangle;
    private nodes: QuadTree[] = [];

    constructor(level: number, bounds: Rectangle) {
        this.level = level;
        this.bounds = bounds;
    }

    /**
     * Clear the quadtree
     */
    clear(): void {
        this.objects = [];
        this.nodes.forEach((node) => {
            node.clear();
        });
        this.nodes = [];
    }

    /**
     * Split the node into 4 subnodes
     */
    private split(): void {
        const subWidth = this.bounds.width / 2;
        const subHeight = this.bounds.height / 2;
        const x = this.bounds.x;
        const y = this.bounds.y;

        // Top-right
        this.nodes[0] = new QuadTree(this.level + 1, {
            x: x + subWidth,
            y: y,
            width: subWidth,
            height: subHeight,
        });

        // Top-left
        this.nodes[1] = new QuadTree(this.level + 1, {
            x: x,
            y: y,
            width: subWidth,
            height: subHeight,
        });

        // Bottom-left
        this.nodes[2] = new QuadTree(this.level + 1, {
            x: x,
            y: y + subHeight,
            width: subWidth,
            height: subHeight,
        });

        // Bottom-right
        this.nodes[3] = new QuadTree(this.level + 1, {
            x: x + subWidth,
            y: y + subHeight,
            width: subWidth,
            height: subHeight,
        });
    }

    /**
     * Determine which node the tree belongs to
     */
    private getIndex(tree: TreeData): number {
        const verticalMidpoint = this.bounds.x + this.bounds.width / 2;
        const horizontalMidpoint = this.bounds.y + this.bounds.height / 2;

        const treeX = tree.position.x;
        const treeY = tree.position.y;

        // Tree can completely fit within the top quadrants
        const topQuadrant = treeY < horizontalMidpoint && treeY + tree.canopyRadius < horizontalMidpoint;
        // Tree can completely fit within the bottom quadrants
        const bottomQuadrant = treeY > horizontalMidpoint;

        // Tree can completely fit within the left quadrants
        if (treeX < verticalMidpoint && treeX + tree.canopyRadius < verticalMidpoint) {
            if (topQuadrant) {
                return 1; // Top-left
            }
            else if (bottomQuadrant) {
                return 2; // Bottom-left
            }
        }
        // Tree can completely fit within the right quadrants
        else if (treeX > verticalMidpoint) {
            if (topQuadrant) {
                return 0; // Top-right
            }
            else if (bottomQuadrant) {
                return 3; // Bottom-right
            }
        }

        return -1; // Tree doesn't fit completely in any quadrant
    }

    /**
     * Insert a tree into the quadtree
     */
    insert(tree: TreeData): void {
        if (this.nodes.length > 0) {
            const index = this.getIndex(tree);
            if (index !== -1) {
                this.nodes[index].insert(tree);
                return;
            }
        }

        this.objects.push(tree);

        if (this.objects.length > QuadTree.maxObjects && this.level < QuadTree.maxLevels) {
            if (this.nodes.length === 0) {
                this.split();
            }

            let i = 0;
            while (i < this.objects.length) {
                const index = this.getIndex(this.objects[i]);
                if (index !== -1) {
                    this.nodes[index].insert(this.objects.splice(i, 1)[0]);
                }
                else {
                    i++;
                }
            }
        }
    }

    /**
     * Retrieve all trees that could collide with the given bounds
     */
    retrieve(bounds: Rectangle): TreeData[] {
        const returnObjects: TreeData[] = [];

        if (this.nodes.length > 0) {
            const indexes = this.getIndexes(bounds);
            for (const index of indexes) {
                returnObjects.push(...this.nodes[index].retrieve(bounds));
            }
        }

        returnObjects.push(...this.objects);
        return returnObjects;
    }

    /**
     * Get all quadrant indexes that the bounds intersects
     */
    private getIndexes(bounds: Rectangle): number[] {
        const indexes: number[] = [];
        const verticalMidpoint = this.bounds.x + this.bounds.width / 2;
        const horizontalMidpoint = this.bounds.y + this.bounds.height / 2;

        const startIsNorth = bounds.y < horizontalMidpoint;
        const startIsWest = bounds.x < verticalMidpoint;
        const endIsEast = bounds.x + bounds.width > verticalMidpoint;
        const endIsSouth = bounds.y + bounds.height > horizontalMidpoint;

        // Top-right
        if (startIsNorth && endIsEast) {
            indexes.push(0);
        }
        // Top-left
        if (startIsNorth && startIsWest) {
            indexes.push(1);
        }
        // Bottom-left
        if (endIsSouth && startIsWest) {
            indexes.push(2);
        }
        // Bottom-right
        if (endIsSouth && endIsEast) {
            indexes.push(3);
        }

        return indexes;
    }

    /**
     * Get total number of objects in the quadtree
     */
    getTotalObjects(): number {
        let total = this.objects.length;
        for (const node of this.nodes) {
            total += node.getTotalObjects();
        }
        return total;
    }

    /**
     * Get debug information about the quadtree
     */
    getDebugInfo(): { level: number; objects: number; bounds: Rectangle; children: unknown[] } {
        return {
            level: this.level,
            objects: this.objects.length,
            bounds: this.bounds,
            children: this.nodes.map(node => node.getDebugInfo()),
        };
    }
}
