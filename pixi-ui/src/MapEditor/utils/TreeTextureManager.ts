import { Graphics, RenderTexture, Texture, Application } from 'pixi.js';

/**
 * Tree texture types for different detail levels
 */
export enum TreeTextureType {
    highDetail = 'high_detail',
    lowDetail = 'low_detail',
}

/**
 * Tree texture variation based on size categories
 */
export enum TreeSizeCategory {
    small = 'small', // trunk: 25-50cm, canopy: 250-500cm
    medium = 'medium', // trunk: 50-100cm, canopy: 500-1000cm
    large = 'large', // trunk: 100-150cm, canopy: 1000-3000cm
}

/**
 * Manages pre-rendered tree textures for GPU-optimized rendering
 */
export class TreeTextureManager {
    private static instance: TreeTextureManager;
    private textures = new Map<string, Texture>();
    private app: Application;
    private initialized = false;

    private constructor(app: Application) {
        this.app = app;
    }

    static getInstance(app: Application): TreeTextureManager {
        // TypeScript can't infer static member is non-null after assignment
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!TreeTextureManager.instance) {
            TreeTextureManager.instance = new TreeTextureManager(app);
        }
        return TreeTextureManager.instance;
    }

    /**
     * Initialize all tree textures
     */
    initialize(): void {
        if (this.initialized) return;

        // Create textures for each combination of detail level and size category
        const detailLevels = [TreeTextureType.highDetail, TreeTextureType.lowDetail];
        const sizeCategories = [TreeSizeCategory.small, TreeSizeCategory.medium, TreeSizeCategory.large];

        for (const detail of detailLevels) {
            for (const size of sizeCategories) {
                this.createTreeTexture(detail, size);
            }
        }

        this.initialized = true;
    }

    /**
     * Create a single tree texture for given detail and size
     */
    private createTreeTexture(detail: TreeTextureType, size: TreeSizeCategory): void {
        const { trunkRadius, canopyRadius } = this.getSizeParameters(size);

        // Create graphics for rendering
        const graphics = new Graphics();

        if (detail === TreeTextureType.highDetail) {
            // High detail: canopy + trunk
            graphics.circle(0, 0, canopyRadius).fill({ color: 0x2F4F2F, alpha: 0.5 });
            graphics.circle(0, 0, trunkRadius).fill({ color: 0x8D6E63 });
        }
        else {
            // Low detail: canopy only
            graphics.circle(0, 0, canopyRadius).fill({ color: 0x2F4F2F, alpha: 0.5 });
        }

        // Create render texture
        const maxRadius = Math.max(trunkRadius, canopyRadius);
        const textureSize = maxRadius * 2 + 4; // Add padding
        const renderTexture = RenderTexture.create({ width: textureSize, height: textureSize });

        // Position graphics in center of texture
        graphics.position.set(textureSize / 2, textureSize / 2);

        // Render to texture
        this.app.renderer.render({ container: graphics, target: renderTexture });

        // Store texture
        const key = this.getTextureKey(detail, size);
        this.textures.set(key, renderTexture);

        // Clean up
        graphics.destroy();
    }

    /**
     * Get size parameters for a size category
     */
    private getSizeParameters(size: TreeSizeCategory): { trunkRadius: number; canopyRadius: number } {
        switch (size) {
            case TreeSizeCategory.small:
                return { trunkRadius: 37, canopyRadius: 375 }; // Average of 25-50 trunk, 250-500 canopy
            case TreeSizeCategory.medium:
                return { trunkRadius: 75, canopyRadius: 750 }; // Average of 50-100 trunk, 500-1000 canopy
            case TreeSizeCategory.large:
                return { trunkRadius: 125, canopyRadius: 1500 }; // Average of 100-150 trunk, 1000-3000 canopy
        }
    }

    /**
     * Get texture key for caching
     */
    private getTextureKey(detail: TreeTextureType, size: TreeSizeCategory): string {
        return `${detail}_${size}`;
    }

    /**
     * Get texture for a specific tree based on its properties
     */
    getTreeTexture(trunkRadius: number, canopyRadius: number, isHighDetail: boolean): Texture {
        const detail = isHighDetail ? TreeTextureType.highDetail : TreeTextureType.lowDetail;
        const size = this.categorizeTreeSize(trunkRadius, canopyRadius);
        const key = this.getTextureKey(detail, size);

        const texture = this.textures.get(key);
        if (!texture) {
            throw new Error(`Texture not found for key: ${key}`);
        }

        return texture;
    }

    /**
     * Categorize tree size based on trunk and canopy radius
     */
    private categorizeTreeSize(trunkRadius: number, canopyRadius: number): TreeSizeCategory {
        if (trunkRadius <= 50 && canopyRadius <= 500) {
            return TreeSizeCategory.small;
        }
        else if (trunkRadius <= 100 && canopyRadius <= 1000) {
            return TreeSizeCategory.medium;
        }
        else {
            return TreeSizeCategory.large;
        }
    }

    /**
     * Get all available texture keys (for debugging)
     */
    getAvailableTextures(): string[] {
        return Array.from(this.textures.keys());
    }

    /**
     * Clean up all textures
     */
    destroy(): void {
        this.textures.forEach((texture) => {
            texture.destroy();
        });
        this.textures.clear();
        this.initialized = false;
    }
}
