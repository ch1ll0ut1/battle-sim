import { Graphics, RenderTexture, Texture, Application } from 'pixi.js';

/**
 * Tree texture types for different detail levels
 */
export enum TreeTextureType {
    HIGH_DETAIL = 'high_detail',
    LOW_DETAIL = 'low_detail',
}

/**
 * Tree texture variation based on size categories
 */
export enum TreeSizeCategory {
    SMALL = 'small', // trunk: 25-50cm, canopy: 250-500cm
    MEDIUM = 'medium', // trunk: 50-100cm, canopy: 500-1000cm
    LARGE = 'large', // trunk: 100-150cm, canopy: 1000-3000cm
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
        if (!TreeTextureManager.instance) {
            TreeTextureManager.instance = new TreeTextureManager(app);
        }
        return TreeTextureManager.instance;
    }

    /**
     * Initialize all tree textures
     */
    async initialize(): Promise<void> {
        if (this.initialized) return;

        // Create textures for each combination of detail level and size category
        const detailLevels = [TreeTextureType.HIGH_DETAIL, TreeTextureType.LOW_DETAIL];
        const sizeCategories = [TreeSizeCategory.SMALL, TreeSizeCategory.MEDIUM, TreeSizeCategory.LARGE];

        for (const detail of detailLevels) {
            for (const size of sizeCategories) {
                await this.createTreeTexture(detail, size);
            }
        }

        this.initialized = true;
    }

    /**
     * Create a single tree texture for given detail and size
     */
    private async createTreeTexture(detail: TreeTextureType, size: TreeSizeCategory): Promise<void> {
        const { trunkRadius, canopyRadius } = this.getSizeParameters(size);

        // Create graphics for rendering
        const graphics = new Graphics();

        if (detail === TreeTextureType.HIGH_DETAIL) {
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
        this.app.renderer.render(graphics, { renderTexture });

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
            case TreeSizeCategory.SMALL:
                return { trunkRadius: 37, canopyRadius: 375 }; // Average of 25-50 trunk, 250-500 canopy
            case TreeSizeCategory.MEDIUM:
                return { trunkRadius: 75, canopyRadius: 750 }; // Average of 50-100 trunk, 500-1000 canopy
            case TreeSizeCategory.LARGE:
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
        const detail = isHighDetail ? TreeTextureType.HIGH_DETAIL : TreeTextureType.LOW_DETAIL;
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
            return TreeSizeCategory.SMALL;
        }
        else if (trunkRadius <= 100 && canopyRadius <= 1000) {
            return TreeSizeCategory.MEDIUM;
        }
        else {
            return TreeSizeCategory.LARGE;
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
        this.textures.forEach((texture) => { texture.destroy(); });
        this.textures.clear();
        this.initialized = false;
    }
}
