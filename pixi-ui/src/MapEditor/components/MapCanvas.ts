import { Container, Graphics } from 'pixi.js';
import { MapData, TreeData } from '../types/MapData';
import { generateRandomTree } from '../utils/TreeGenerator';

/**
 * Map canvas for rendering and interacting with the map
 */
export class MapCanvas extends Container {
    private mapData: MapData;
    private mapGraphics!: Graphics;
    private selectedTool = 'tree';
    private pixelsPerCm = 0.1; // Scale factor for display
    private onMapChange: (mapData: MapData) => void;

    constructor(mapData: MapData, onMapChange: (mapData: MapData) => void) {
        super();
        this.mapData = mapData;
        this.onMapChange = onMapChange;

        this.position.set(50, 140);
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

        // Draw map background
        this.mapGraphics.fill({ color: 0x2E5F3F, alpha: 0.8 }); // Dark green background
        this.mapGraphics.rect(
            0,
            0,
            this.mapData.width * this.pixelsPerCm,
            this.mapData.height * this.pixelsPerCm,
        );

        // Draw border
        this.mapGraphics.stroke({ color: 0xFFFFFF, width: 2 });
        this.mapGraphics.rect(
            0,
            0,
            this.mapData.width * this.pixelsPerCm,
            this.mapData.height * this.pixelsPerCm,
        );

        // Draw trees
        this.drawTrees();
    }

    private drawTrees(): void {
        this.mapData.trees.forEach((tree) => {
            // Draw canopy (lighter green circle)
            this.mapGraphics.fill({ color: 0x4CAF50, alpha: 0.6 });
            this.mapGraphics.circle(
                tree.position.x * this.pixelsPerCm,
                tree.position.y * this.pixelsPerCm,
                tree.canopyRadius * this.pixelsPerCm,
            );

            // Draw trunk (brown circle)
            this.mapGraphics.fill({ color: 0x8D6E63, alpha: 0.9 });
            this.mapGraphics.circle(
                tree.position.x * this.pixelsPerCm,
                tree.position.y * this.pixelsPerCm,
                tree.trunkRadius * this.pixelsPerCm,
            );
        });
    }

    private setupInteraction(): void {
        this.mapGraphics.eventMode = 'static';
        this.mapGraphics.cursor = 'pointer';

        this.mapGraphics.on('pointerdown', (event) => {
            const localPos = event.getLocalPosition(this.mapGraphics);
            const worldX = localPos.x / this.pixelsPerCm;
            const worldY = localPos.y / this.pixelsPerCm;

            if (this.selectedTool === 'tree') {
                this.placeTool(worldX, worldY);
            }
            else if (this.selectedTool === 'erase') {
                this.eraseTool(worldX, worldY);
            }
        });
    }

    private placeTool(x: number, y: number): void {
        if (this.selectedTool === 'tree') {
            // Check if click is within map bounds
            if (x >= 0 && x <= this.mapData.width && y >= 0 && y <= this.mapData.height) {
                const newTree = generateRandomTree(x, y);
                this.mapData.trees.push(newTree);
                this.redraw();
                this.onMapChange(this.mapData);
            }
        }
    }

    private eraseTool(x: number, y: number): void {
        // Find and remove trees at the clicked position
        const clickRadius = 50; // cm
        const treesToRemove = this.mapData.trees.filter((tree) => {
            const dx = tree.position.x - x;
            const dy = tree.position.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance <= clickRadius;
        });

        if (treesToRemove.length > 0) {
            this.mapData.trees = this.mapData.trees.filter(tree =>
                !treesToRemove.includes(tree),
            );
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
