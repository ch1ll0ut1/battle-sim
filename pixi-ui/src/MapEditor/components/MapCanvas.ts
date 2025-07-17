import { Container, Graphics } from 'pixi.js';
import { MapData, TreeData } from '../types/MapData';
import { canPlaceTree, generateRandomTree } from '../utils/TreeGenerator';

/**
 * Map canvas for rendering and interacting with the map
 * Scale: 1 pixel = 1 cm
 */
export class MapCanvas extends Container {
    private mapData: MapData;
    private mapGraphics!: Graphics;
    private treeContainers: Container[] = [];
    private selectedTool = 'none'; // Default to no tool selected
    private onMapChange: (mapData: MapData) => void;

    constructor(mapData: MapData, onMapChange: (mapData: MapData) => void) {
        super();
        this.mapData = mapData;
        this.onMapChange = onMapChange;

        this.createMapCanvas();
        this.setupInteraction();
    }

    private createMapCanvas(): void {
        this.mapGraphics = new Graphics();
        this.addChild(this.mapGraphics);
        this.redraw();
    }

    private redraw(): void {
        this.mapGraphics.clear();

        // Clear existing tree containers
        this.treeContainers.forEach(container => this.removeChild(container));
        this.treeContainers = [];

        // Draw map background with proper method chaining
        this.mapGraphics.rect(0, 0, this.mapData.width, this.mapData.height).fill({ color: 0x8B7355 });

        // Draw border
        this.mapGraphics.rect(0, 0, this.mapData.width, this.mapData.height).stroke({ color: 0xFFFFFF, width: 2 });

        // Draw trees
        this.drawTrees();
    }

    private drawTrees(): void {
        this.mapData.trees.forEach((tree) => {
            // Create tree container
            const treeContainer = new Container();
            treeContainer.position.set(tree.position.x, tree.position.y);

            // Create canopy graphics
            const canopyGraphics = new Graphics();
            canopyGraphics.circle(0, 0, tree.canopyRadius).fill({ color: 0x2F4F2F, alpha: 0.5 });
            treeContainer.addChild(canopyGraphics);

            // Create trunk graphics
            const trunkGraphics = new Graphics();
            trunkGraphics.circle(0, 0, tree.trunkRadius).fill({ color: 0x8D6E63 });
            treeContainer.addChild(trunkGraphics);

            // Add tree container to the canvas and track it
            this.addChild(treeContainer);
            this.treeContainers.push(treeContainer);
        });
    }

    private setupInteraction(): void {
        this.mapGraphics.eventMode = 'static';
        this.mapGraphics.cursor = 'pointer';

        this.mapGraphics.on('pointerdown', (event) => {
            // Only handle left click for tools (right click is for viewport panning)
            if (event.button === 0) {
                const localPos = event.getLocalPosition(this.mapGraphics);
                const worldX = localPos.x; // 1 pixel = 1 cm
                const worldY = localPos.y; // 1 pixel = 1 cm

                if (this.selectedTool === 'tree') {
                    this.placeTool(worldX, worldY);
                }
                else if (this.selectedTool === 'erase') {
                    this.eraseTool(worldX, worldY);
                }
            }
        });
    }

    private placeTool(x: number, y: number): void {
        if (this.selectedTool === 'tree') {
            // Check if click is within map bounds
            if (x >= 0 && x <= this.mapData.width && y >= 0 && y <= this.mapData.height) {
                const newTree = generateRandomTree(x, y);

                // Check for trunk collision before placing
                if (canPlaceTree(x, y, newTree.trunkRadius, this.mapData.trees)) {
                    this.mapData.trees.push(newTree);
                    this.redraw();
                    this.onMapChange(this.mapData);
                }
                // If collision detected, don't place tree (could add visual feedback here)
            }
        }
    }

    private eraseTool(x: number, y: number): void {
        // Find and remove trees at the clicked position
        const clickRadius = 5000; // 50m radius in cm
        const initialTreeCount = this.mapData.trees.length;

        this.mapData.trees = this.mapData.trees.filter((tree) => {
            const dx = tree.position.x - x;
            const dy = tree.position.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance > clickRadius;
        });

        if (this.mapData.trees.length !== initialTreeCount) {
            this.redraw();
            this.onMapChange(this.mapData);
        }
    }

    setSelectedTool(tool: string): void {
        this.selectedTool = tool;
        this.mapGraphics.cursor = tool === 'erase' ? 'not-allowed' : 'pointer';
    }

    updateMapData(mapData: MapData): void {
        this.mapData = mapData;
        this.redraw();
    }

    setTrees(trees: TreeData[]): void {
        this.mapData.trees = trees;
        this.redraw();
        this.onMapChange(this.mapData);
    }

    updateSize(width: number, height: number): void {
        this.mapData.width = width;
        this.mapData.height = height;
        this.redraw();
    }
}
