import { Container, Graphics, Sprite, Application, Texture } from 'pixi.js';
import { MapData, TreeData } from '../types/MapData';
import { canPlaceTree, generateRandomTree } from '../utils/TreeGenerator';
import { TreeTextureManager } from '../utils/TreeTextureManager';
import { QuadTree } from '../utils/QuadTree';

/**
 * Viewport bounds for frustum culling
 */
interface ViewportBounds {
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * Tree rendering info with LOD using Sprites
 */
interface TreeRenderInfo {
    tree: TreeData;
    sprite: Sprite;
    isVisible: boolean;
    currentLOD: number;
}

/**
 * Map canvas for rendering and interacting with the map
 * Scale: 1 pixel = 1 cm
 */
export class MapCanvas extends Container {
    private mapData: MapData;
    private mapGraphics!: Graphics;
    private treeRenderInfo: TreeRenderInfo[] = [];
    private selectedTool = 'none'; // Default to no tool selected
    private onMapChange: (mapData: MapData) => void;
    private viewportBounds: ViewportBounds = { x: 0, y: 0, width: 0, height: 0 };
    private lastZoom = 1;
    private pooledSprites: Sprite[] = [];
    private textureManager: TreeTextureManager;
    private app: Application;
    private treeBatchContainers = new Map<string, Container>();
    private quadTree: QuadTree;

    constructor(mapData: MapData, onMapChange: (mapData: MapData) => void, app: Application) {
        super();
        this.mapData = mapData;
        this.onMapChange = onMapChange;
        this.app = app;
        this.textureManager = TreeTextureManager.getInstance(app);
        this.quadTree = new QuadTree(0, { x: 0, y: 0, width: mapData.width, height: mapData.height });

        this.createMapCanvas();
        this.setupInteraction();
        this.initializeTextures();
    }

    private async initializeTextures(): Promise<void> {
        await this.textureManager.initialize();

        // Re-render trees once textures are ready
        if (this.mapData.trees.length > 0) {
            this.initializeTreeRenderInfo();
            this.updateTreeVisibility();
        }
    }

    private createMapCanvas(): void {
        this.mapGraphics = new Graphics();
        this.addChild(this.mapGraphics);
        this.initializeBatchContainers();
        this.redraw();
    }

    /**
     * Initialize batch containers for different tree types
     */
    private initializeBatchContainers(): void {
        const sizeCategories = ['small', 'medium', 'large'];

        // Create regular containers for high detail (LOD 1)
        for (const size of sizeCategories) {
            const key = `1_${size}`;
            const container = new Container();
            container.name = `TreeBatch_${key}`;
            this.treeBatchContainers.set(key, container);
            this.addChild(container);
        }

        // Create regular containers for low detail (LOD 0) as well for now
        // ParticleContainer API seems to have changed
        for (const size of sizeCategories) {
            const key = `0_${size}`;
            const container = new Container();
            container.name = `TreeBatch_${key}`;
            this.treeBatchContainers.set(key, container);
            this.addChild(container);
        }
    }

    private redraw(): void {
        this.mapGraphics.clear();

        // Draw map background with proper method chaining
        this.mapGraphics.rect(0, 0, this.mapData.width, this.mapData.height).fill({ color: 0x8B7355 });

        // Draw border
        this.mapGraphics.rect(0, 0, this.mapData.width, this.mapData.height).stroke({ color: 0xFFFFFF, width: 2 });

        // Initialize tree render info
        this.initializeTreeRenderInfo();

        // Update tree visibility based on current viewport
        this.updateTreeVisibility();
    }

    /**
     * Initialize tree render info for all trees
     */
    private initializeTreeRenderInfo(): void {
        // Clear existing render info and return sprites to pool
        this.treeRenderInfo.forEach((info) => {
            if (info.sprite.parent) {
                info.sprite.parent.removeChild(info.sprite);
            }
            this.returnSpriteToPool(info.sprite);
        });
        this.treeRenderInfo = [];

        // Rebuild quadtree
        this.quadTree.clear();
        this.quadTree = new QuadTree(0, { x: 0, y: 0, width: this.mapData.width, height: this.mapData.height });

        // Create render info for each tree and add to quadtree
        this.mapData.trees.forEach((tree) => {
            const sprite = this.getSpriteFromPool();
            sprite.position.set(tree.position.x, tree.position.y);
            sprite.anchor.set(0.5, 0.5); // Center the sprite

            this.treeRenderInfo.push({
                tree,
                sprite,
                isVisible: false,
                currentLOD: -1,
            });

            // Add tree to spatial index
            this.quadTree.insert(tree);
        });
    }

    /**
     * Update tree visibility based on viewport bounds and zoom level using spatial indexing
     */
    private updateTreeVisibility(): void {
        const currentZoom = this.lastZoom;
        // Dynamic buffer based on zoom level - more buffer when zoomed out
        const baseBuffer = 10000; // 100m base buffer (doubled from 50m)
        const buffer = baseBuffer / Math.max(currentZoom, 0.01); // Larger buffer when zoomed out

        // Use quadtree to get only potentially visible trees
        const queryBounds = {
            x: this.viewportBounds.x - buffer,
            y: this.viewportBounds.y - buffer,
            width: this.viewportBounds.width + (buffer * 2),
            height: this.viewportBounds.height + (buffer * 2),
        };

        const potentiallyVisibleTrees = this.quadTree.retrieve(queryBounds);

        // Create a lookup map for fast access to render info
        const treeToRenderInfo = new Map<TreeData, TreeRenderInfo>();
        this.treeRenderInfo.forEach((info) => {
            treeToRenderInfo.set(info.tree, info);
        });

        // First, mark all trees as potentially not visible
        const shouldBeVisible = new Set<TreeRenderInfo>();

        // Process only potentially visible trees
        potentiallyVisibleTrees.forEach((tree) => {
            const info = treeToRenderInfo.get(tree);
            if (!info) return;

            // Check if tree is actually within viewport bounds (with buffer)
            const isInViewport = (
                tree.position.x + tree.canopyRadius >= this.viewportBounds.x - buffer
                && tree.position.x - tree.canopyRadius <= this.viewportBounds.x + this.viewportBounds.width + buffer
                && tree.position.y + tree.canopyRadius >= this.viewportBounds.y - buffer
                && tree.position.y - tree.canopyRadius <= this.viewportBounds.y + this.viewportBounds.height + buffer
            );

            if (isInViewport) {
                shouldBeVisible.add(info);
            }
        });

        // Update visibility for all trees
        this.treeRenderInfo.forEach((info) => {
            const shouldShow = shouldBeVisible.has(info);
            const wasVisible = info.isVisible;

            if (shouldShow && !wasVisible) {
                // Tree should be visible but isn't - show it
                info.isVisible = true;
                const newLOD = this.calculateLOD(currentZoom);
                this.renderTree(info, newLOD);
                info.currentLOD = newLOD;
            }
            else if (!shouldShow && wasVisible) {
                // Tree should not be visible but is - hide it
                info.isVisible = false;
                if (info.sprite.parent) {
                    info.sprite.parent.removeChild(info.sprite);
                }
            }
            else if (shouldShow && wasVisible) {
                // Tree is visible and should remain visible - check if LOD changed
                const newLOD = this.calculateLOD(currentZoom);
                if (newLOD !== info.currentLOD) {
                    // Remove from old batch container
                    if (info.sprite.parent) {
                        info.sprite.parent.removeChild(info.sprite);
                    }
                    // Render with new LOD
                    this.renderTree(info, newLOD);
                    info.currentLOD = newLOD;
                }
            }
        });
    }

    /**
     * Calculate Level of Detail based on zoom level
     */
    private calculateLOD(zoom: number): number {
        if (zoom >= 0.1) return 1; // High detail - full tree
        return 0; // Low detail - canopy only
    }

    /**
     * Render a tree with specified LOD using sprites
     */
    private renderTree(info: TreeRenderInfo, lod: number): void {
        const sprite = info.sprite;
        const tree = info.tree;

        try {
            // Get appropriate texture based on LOD
            const isHighDetail = lod === 1;
            const texture = this.textureManager.getTreeTexture(
                tree.trunkRadius,
                tree.canopyRadius,
                isHighDetail,
            );

            // Update sprite texture
            sprite.texture = texture;

            // Scale sprite to match tree size
            // Since textures are pre-rendered with average sizes, we need to scale appropriately
            const targetSize = Math.max(tree.canopyRadius, tree.trunkRadius) * 2;
            const textureSize = Math.max(texture.width, texture.height);
            const scale = targetSize / textureSize;
            sprite.scale.set(scale, scale);

            // Add to appropriate batch container
            const sizeCategory = this.categorizeTreeSize(tree.trunkRadius, tree.canopyRadius);
            const batchKey = `${lod}_${sizeCategory}`;

            // Use regular Container for both LOD levels for now
            const batchContainer = this.treeBatchContainers.get(batchKey);
            if (batchContainer) {
                batchContainer.addChild(sprite);
            }
        }
        catch (error) {
            console.error('Error rendering tree:', error, 'tree:', tree, 'lod:', lod);
        }
    }

    /**
     * Categorize tree size for batching
     */
    private categorizeTreeSize(trunkRadius: number, canopyRadius: number): string {
        if (trunkRadius <= 50 && canopyRadius <= 500) {
            return 'small';
        }
        else if (trunkRadius <= 100 && canopyRadius <= 1000) {
            return 'medium';
        }
        else {
            return 'large';
        }
    }

    /**
     * Object pooling for sprites
     */
    private getSpriteFromPool(): Sprite {
        if (this.pooledSprites.length > 0) {
            const sprite = this.pooledSprites.pop()!;
            sprite.visible = true;
            return sprite;
        }
        return new Sprite();
    }

    private returnSpriteToPool(sprite: Sprite): void {
        sprite.visible = false;
        sprite.texture = Texture.EMPTY;
        sprite.scale.set(1, 1);
        this.pooledSprites.push(sprite);
    }

    /**
     * Update viewport bounds for frustum culling
     */
    updateViewportBounds(bounds: ViewportBounds, zoom: number): void {
        this.viewportBounds = bounds;
        this.lastZoom = zoom;

        // Only update if we have trees to render
        if (this.treeRenderInfo.length > 0) {
            this.updateTreeVisibility();
        }
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
                    this.initializeTreeRenderInfo();
                    this.updateTreeVisibility();
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
            this.initializeTreeRenderInfo();
            this.updateTreeVisibility();
            this.onMapChange(this.mapData);
        }
    }

    setSelectedTool(tool: string): void {
        this.selectedTool = tool;
        this.mapGraphics.cursor = tool === 'erase' ? 'not-allowed' : 'pointer';
    }

    updateMapData(mapData: MapData): void {
        this.mapData = mapData;
        this.initializeTreeRenderInfo();
        this.updateTreeVisibility();
    }

    setTrees(trees: TreeData[]): void {
        this.mapData.trees = trees;
        this.initializeTreeRenderInfo();
        this.updateTreeVisibility();
        this.onMapChange(this.mapData);
    }

    updateSize(width: number, height: number): void {
        this.mapData.width = width;
        this.mapData.height = height;
        this.redraw();
    }
}
