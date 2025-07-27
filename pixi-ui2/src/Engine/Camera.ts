import { Container, Graphics, Ticker } from 'pixi.js';
import { camera as cameraConfig } from '../app/config/camera';
import { CameraBounds } from './CameraBounds';
import { CameraInput } from './CameraInput';
import { CameraInterpolator } from './CameraInterpolator';
import { CameraTransform } from './CameraTransform';

/**
 * Main camera class that composes all camera functionality
 * Accepts world Container via dependency injection and provides tick-based updates
 * Acts as a pure composer - components handle their own responsibilities
 * Note: world size can not be retrieved from container.bounds() after a mask has been applied, so we need to pass it in.
 */
export class Camera extends Container {
    private worldContainer: Container;
    public worldWidth: number;
    public worldHeight: number;
    private background: Graphics;

    // Composed components
    public transform: CameraTransform;
    private input: CameraInput;
    private bounds: CameraBounds;
    public interpolator: CameraInterpolator;

    constructor(worldContainer: Container, worldWidth: number, worldHeight: number) {
        super();

        this.worldContainer = worldContainer;
        this.worldWidth = worldWidth;
        this.worldHeight = worldHeight;

        this.background = this.createBackground();
        this.setupWorldContainer();

        // Make camera interactive for mouse events
        this.eventMode = 'static';

        // Initialize components
        this.transform = new CameraTransform(this.worldContainer);
        this.input = new CameraInput();
        this.bounds = new CameraBounds();
        this.interpolator = new CameraInterpolator();
    }

    /**
     * Initialize camera after construction - sets up component connections
     * Call this after construction and after first resize to avoid circular dependency issues
     */
    init() {
        // Initialize all components with camera reference
        this.input.init(this);
        this.bounds.init(this);
        this.interpolator.init(this);

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
        this.worldContainer.mask = mask;
        this.addChild(mask);

        this.addChild(this.worldContainer);
    }

    /**
     * Initialize camera to centered position with fit-to-screen zoom
     */
    private initializePosition() {
        const minZoom = this.bounds.getMinZoom();
        const centeredPos = this.bounds.getCenteredPosition(minZoom);

        // Set both transform and interpolator target
        this.transform.setState(centeredPos.x, centeredPos.y, minZoom);
        this.interpolator.setTarget(centeredPos.x, centeredPos.y, minZoom);

        this.transform.applyTransform();
    }

    /**
     * Update camera every tick - called from Screen.update()
     * Pure composition - just calls component update methods
     */
    update(ticker: Ticker) {
        // Process input (applies directly to transform/interpolator)
        this.input.update(ticker.deltaTime);

        // Apply smooth interpolation only if enabled
        if (cameraConfig.smoothMovement) {
            this.interpolator.update(ticker.deltaTime);
        }

        // Apply bounds constraints
        this.bounds.applyConstraints();

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

        // Update bounds component with current viewport and world sizes
        this.bounds.updateSizes(width, height, this.worldWidth, this.worldHeight);

        // Initialize position if this is the first resize (camera just created)
        const currentState = this.transform.getState();
        if (currentState.zoom === 1 && currentState.x === 0 && currentState.y === 0) {
            this.initializePosition();
        }
        else {
            // Apply constraints with new viewport size
            this.bounds.applyConstraints();
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
}
