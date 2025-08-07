import { Container, Graphics, Ticker } from 'pixi.js';
import { camera as cameraConfig } from '../../../config/camera';
import { CameraInput } from './CameraInput';
import { CameraTransform } from './CameraTransform';

/**
 * Main camera class that composes all camera functionality
 * Accepts world Container via dependency injection and provides tick-based updates
 * Acts as a pure composer - components handle their own responsibilities
 * Note: world size can not be retrieved from container.bounds() after a mask has been applied, so we need to pass it in.
 */
export class Camera extends Container {
    public worldWidth: number;
    public worldHeight: number;
    public viewportWidth = 0;
    public viewportHeight = 0;

    private worldContainer: Container;
    private background: Graphics;

    // Composed components
    public transform: CameraTransform;
    private input: CameraInput;

    constructor(worldContainer: Container, worldWidth: number, worldHeight: number) {
        super();

        this.worldContainer = worldContainer;
        this.worldWidth = worldWidth;
        this.worldHeight = worldHeight;

        this.background = this.createBackground();
        this.background.label = 'camera-background';
        this.setupWorldContainer();

        // Make camera interactive for mouse events
        this.eventMode = 'static';

        // Initialize components
        this.transform = new CameraTransform(this.worldContainer);
        this.input = new CameraInput();
    }

    /**
     * Initialize camera after construction - sets up component connections
     * Call this after construction and after first resize to avoid circular dependency issues
     */
    init() {
        // Initialize all components with camera reference
        this.transform.init(this);
        this.input.init(this);

        // Initial position will be set after first resize() call
    }

    /**
     * Create black background that fills the viewport
     * Size will be set during resize()
     */
    private createBackground() {
        const background = new Graphics();
        this.addChild(background);
        return background;
    }

    /**
     * Setup the injected world container with masking
     * Mask size will be set during resize()
     */
    private setupWorldContainer() {
        // Create mask to clip world content to viewport bounds
        const mask = new Graphics();
        mask.label = 'camera-mask';
        this.worldContainer.mask = mask;
        this.addChild(mask);

        this.addChild(this.worldContainer);
    }

    /**
     * Initialize camera to centered position with fit-to-screen zoom
     */
    private initializePosition() {
        const minZoom = this.getMinZoom();
        const centeredPos = this.getCenteredPosition(minZoom);

        // Set transform state
        this.transform.setState(centeredPos.x, centeredPos.y, minZoom);

        this.transform.applyTransform();
    }

    /**
     * Update camera every tick - called from Screen.update()
     * Pure composition - just calls component update methods
     */
    update(ticker: Ticker) {
        // Process input (applies directly to transform)
        this.input.update(ticker.deltaTime);

        // Apply final transform to world container
        this.transform.applyTransform();
    }

    /**
     * Resize the camera viewport - automatically gets size from camera dimensions
     */
    resize(width: number, height: number) {
        console.log('Camera resize', width, height);
        // Update background
        this.background.clear();
        this.background.rect(0, 0, width, height).fill({ color: 0x000000 });

        // Update mask
        const mask = this.worldContainer.mask;
        if (mask && mask instanceof Graphics) {
            mask.clear();
            mask.rect(0, 0, width, height).fill({ color: 0xffffff });
        }

        // Update viewport dimensions
        this.viewportWidth = width;
        this.viewportHeight = height;

        // Initialize position if this is the first resize (camera just created)
        const currentState = this.transform.getState();
        if (currentState.zoom === 1 && currentState.x === 0 && currentState.y === 0) {
            this.initializePosition();
        }
        else {
            // Apply transform with new viewport size
            this.transform.applyTransform();
        }
    }

    /**
     * Clean up resources and event listeners
     */
    destroy() {
        console.log('Camera destroy');
        this.input.destroy();
        super.destroy({ children: true });
    }

    /**
     * Get minimum zoom level to fit world in viewport
     */
    getMinZoom() {
        const scaleX = this.viewportWidth / this.worldWidth;
        const scaleY = this.viewportHeight / this.worldHeight;
        const calculatedMinZoom = Math.min(scaleX, scaleY);
        return Math.max(calculatedMinZoom, cameraConfig.minZoom);
    }

    /**
     * Calculate initial centered position for given zoom
     */
    private getCenteredPosition(zoom: number) {
        const worldScreenWidth = this.worldWidth * zoom;
        const worldScreenHeight = this.worldHeight * zoom;

        return {
            x: (this.viewportWidth - worldScreenWidth) / 2,
            y: (this.viewportHeight - worldScreenHeight) / 2,
        };
    }
}
