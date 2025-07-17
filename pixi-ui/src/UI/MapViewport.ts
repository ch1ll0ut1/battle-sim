import { Container, FederatedPointerEvent, FederatedWheelEvent, Graphics, Point } from 'pixi.js';

/**
 * Viewport configuration
 */
export interface MapViewportConfig {
    width: number;
    height: number;
    worldWidth: number;
    worldHeight: number;
    minZoom?: number;
    maxZoom?: number;
    panSpeed?: number;
}

/**
 * MapViewport - A reusable component for pan/zoom map navigation
 * Handles coordinate transformation between world coordinates (cm) and screen coordinates (pixels)
 * Scale: 1 pixel = 1 cm at zoom level 1.0
 */
export class MapViewport extends Container {
    private config: MapViewportConfig;
    private worldContainer!: Container;
    private background!: Graphics;
    private zoom = 1.0;
    private panX = 0;
    private panY = 0;
    private isDragging = false;
    private lastPointerPosition: Point = new Point();
    private keyboardEnabled = true;
    private keysPressed = new Set<string>();
    private panAnimationId: number | null = null;

    constructor(config: MapViewportConfig) {
        super();
        this.config = {
            minZoom: 0.0001,
            maxZoom: 10.0,
            panSpeed: 10,
            ...config,
        };

        this.createBackground();
        this.createWorldContainer();
        this.setupInteraction();
        this.calculateInitialZoom(); // This sets the proper minZoom
        this.centerMap();
    }

    /**
     * Create black background that fills the viewport
     */
    private createBackground(): void {
        this.background = new Graphics();
        this.background.rect(0, 0, this.config.width, this.config.height).fill({ color: 0x000000 });
        this.addChild(this.background);
    }

    /**
     * Create the world container that holds the map content
     */
    private createWorldContainer(): void {
        this.worldContainer = new Container();

        // Create mask to clip world content to viewport bounds
        const mask = new Graphics();
        mask.rect(0, 0, this.config.width, this.config.height).fill({ color: 0xffffff });
        this.worldContainer.mask = mask;
        this.addChild(mask);

        this.addChild(this.worldContainer);
    }

    /**
     * Setup mouse and keyboard interaction
     */
    private setupInteraction(): void {
        this.eventMode = 'static';
        this.on('wheel', this.onWheel.bind(this));
        this.on('pointerdown', this.onPointerDown.bind(this));
        this.on('pointermove', this.onPointerMove.bind(this));
        this.on('pointerup', this.onPointerUp.bind(this));
        this.on('pointerupoutside', this.onPointerUp.bind(this));
        this.on('rightclick', this.onRightClick.bind(this));

        // Disable context menu on the canvas
        if (typeof document !== 'undefined') {
            document.addEventListener('contextmenu', this.onContextMenu.bind(this));
        }

        // Listen for keyboard events on the document
        if (this.keyboardEnabled) {
            document.addEventListener('keydown', this.onKeyDown.bind(this));
            document.addEventListener('keyup', this.onKeyUp.bind(this));
        }
    }

    /**
     * Handle mouse wheel zoom
     */
    private onWheel(event: FederatedWheelEvent): void {
        event.stopPropagation();

        // Use multiplicative zoom for smoother experience across zoom levels
        const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
        const newZoom = Math.max(this.config.minZoom ?? 0.0001, Math.min(this.config.maxZoom ?? 10.0, this.zoom * zoomFactor));

        if (newZoom !== this.zoom) {
            // Get mouse position relative to viewport
            const mouseX = event.global.x - this.x;
            const mouseY = event.global.y - this.y;

            // Calculate world position under mouse before zoom
            const worldPosBeforeZoom = this.screenToWorld(mouseX, mouseY);

            // Apply zoom
            this.zoom = newZoom;

            // Calculate world position under mouse after zoom
            const worldPosAfterZoom = this.screenToWorld(mouseX, mouseY);

            // Adjust pan to keep world position under mouse cursor
            this.panX += (worldPosAfterZoom.x - worldPosBeforeZoom.x) * this.zoom;
            this.panY += (worldPosAfterZoom.y - worldPosBeforeZoom.y) * this.zoom;

            this.updateWorldTransform();
        }
    }

    /**
     * Handle pointer down (start dragging)
     */
    private onPointerDown(event: FederatedPointerEvent): void {
        if (event.button === 2) { // Right click
            this.isDragging = true;
            this.lastPointerPosition.set(event.global.x, event.global.y);
        }
    }

    /**
     * Handle pointer move (dragging)
     */
    private onPointerMove(event: FederatedPointerEvent): void {
        if (this.isDragging) {
            const deltaX = event.global.x - this.lastPointerPosition.x;
            const deltaY = event.global.y - this.lastPointerPosition.y;

            this.panX += deltaX;
            this.panY += deltaY;

            this.lastPointerPosition.set(event.global.x, event.global.y);
            this.updateWorldTransform();
        }
    }

    /**
     * Handle pointer up (stop dragging)
     */
    private onPointerUp(): void {
        this.isDragging = false;
    }

    /**
     * Handle right click
     */
    private onRightClick(event: FederatedPointerEvent): void {
        event.preventDefault();
    }

    /**
     * Handle context menu to disable it
     */
    private onContextMenu(event: MouseEvent): void {
        event.preventDefault();
    }

    /**
     * Handle keyboard input for panning
     */
    private onKeyDown(event: KeyboardEvent): void {
        if (!this.keyboardEnabled) return;

        const key = event.key.toLowerCase();

        // Check if this is a panning key
        if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
            event.preventDefault();

            // Add key to pressed keys set
            this.keysPressed.add(key);

            // Start pan animation if not already running
            if (!this.panAnimationId) {
                this.startPanAnimation();
            }
        }
    }

    /**
     * Handle keyboard input release
     */
    private onKeyUp(event: KeyboardEvent): void {
        if (!this.keyboardEnabled) return;

        const key = event.key.toLowerCase();

        // Remove key from pressed keys set
        this.keysPressed.delete(key);

        // Stop pan animation if no keys are pressed
        if (this.keysPressed.size === 0 && this.panAnimationId) {
            cancelAnimationFrame(this.panAnimationId);
            this.panAnimationId = null;
        }
    }

    /**
     * Start smooth panning animation
     */
    private startPanAnimation(): void {
        const animate = () => {
            if (this.keysPressed.size === 0) {
                this.panAnimationId = null;
                return;
            }

            const panAmount = (this.config.panSpeed ?? 10) * 0.6; // Faster constant speed
            let panX = 0;
            let panY = 0;

            // Check which keys are pressed and calculate pan direction
            if (this.keysPressed.has('a') || this.keysPressed.has('arrowleft')) {
                panX += panAmount;
            }
            if (this.keysPressed.has('d') || this.keysPressed.has('arrowright')) {
                panX -= panAmount;
            }
            if (this.keysPressed.has('w') || this.keysPressed.has('arrowup')) {
                panY += panAmount;
            }
            if (this.keysPressed.has('s') || this.keysPressed.has('arrowdown')) {
                panY -= panAmount;
            }

            // Apply pan if there's movement
            if (panX !== 0 || panY !== 0) {
                this.panX += panX;
                this.panY += panY;
                this.updateWorldTransform();
            }

            // Continue animation
            this.panAnimationId = requestAnimationFrame(animate);
        };

        this.panAnimationId = requestAnimationFrame(animate);
    }

    /**
     * Update world container transform with bounds constraints
     */
    private updateWorldTransform(): void {
        // Constrain pan to keep map within viewport bounds
        this.constrainPan();

        this.worldContainer.scale.set(this.zoom);
        this.worldContainer.position.set(this.panX, this.panY);
    }

    /**
     * Constrain pan to keep the map within viewport bounds
     */
    private constrainPan(): void {
        const mapScreenWidth = this.config.worldWidth * this.zoom;
        const mapScreenHeight = this.config.worldHeight * this.zoom;

        // If map is smaller than viewport, center it
        if (mapScreenWidth <= this.config.width) {
            this.panX = (this.config.width - mapScreenWidth) / 2;
        }
        else {
            // Constrain horizontal panning
            const maxPanX = 0;
            const minPanX = this.config.width - mapScreenWidth;
            this.panX = Math.max(minPanX, Math.min(maxPanX, this.panX));
        }

        if (mapScreenHeight <= this.config.height) {
            this.panY = (this.config.height - mapScreenHeight) / 2;
        }
        else {
            // Constrain vertical panning
            const maxPanY = 0;
            const minPanY = this.config.height - mapScreenHeight;
            this.panY = Math.max(minPanY, Math.min(maxPanY, this.panY));
        }
    }

    /**
     * Calculate initial zoom level to fit the map in the viewport
     */
    private calculateInitialZoom(): void {
        // Set zoom to show the entire map in the viewport
        const scaleX = this.config.width / this.config.worldWidth;
        const scaleY = this.config.height / this.config.worldHeight;
        this.zoom = Math.min(scaleX, scaleY);

        // Update minimum zoom to prevent zooming out beyond map bounds
        this.config.minZoom = this.zoom;
    }

    /**
     * Center the map in the viewport
     */
    private centerMap(): void {
        const mapScreenWidth = this.config.worldWidth * this.zoom;
        const mapScreenHeight = this.config.worldHeight * this.zoom;

        this.panX = (this.config.width - mapScreenWidth) / 2;
        this.panY = (this.config.height - mapScreenHeight) / 2;

        this.updateWorldTransform();
    }

    /**
     * Convert screen coordinates to world coordinates
     */
    screenToWorld(screenX: number, screenY: number): Point {
        const worldX = (screenX - this.panX) / this.zoom;
        const worldY = (screenY - this.panY) / this.zoom;
        return new Point(worldX, worldY);
    }

    /**
     * Convert world coordinates to screen coordinates
     */
    worldToScreen(worldX: number, worldY: number): Point {
        const screenX = worldX * this.zoom + this.panX;
        const screenY = worldY * this.zoom + this.panY;
        return new Point(screenX, screenY);
    }

    /**
     * Add content to the world container
     */
    addWorldContent(content: Container): void {
        this.worldContainer.addChild(content);
    }

    /**
     * Get the world container for adding content
     */
    getWorldContainer(): Container {
        return this.worldContainer;
    }

    /**
     * Resize the viewport
     */
    resize(width: number, height: number): void {
        this.config.width = width;
        this.config.height = height;

        // Update background
        this.background.clear();
        this.background.rect(0, 0, width, height).fill({ color: 0x000000 });

        // Update mask
        if (this.worldContainer.mask) {
            (this.worldContainer.mask as Graphics).clear();
            (this.worldContainer.mask as Graphics).rect(0, 0, width, height).fill({ color: 0xffffff });
        }

        // Recalculate minimum zoom for new viewport size
        this.calculateInitialZoom();

        // If current zoom is below new minimum, reset to minimum
        if (this.zoom < this.config.minZoom!) {
            this.zoom = this.config.minZoom!;
        }

        // Re-center and constrain position
        this.centerMap();
    }

    /**
     * Update world size
     */
    updateWorldSize(worldWidth: number, worldHeight: number): void {
        this.config.worldWidth = worldWidth;
        this.config.worldHeight = worldHeight;
        this.calculateInitialZoom();

        // If current zoom is below new minimum, reset to minimum
        if (this.zoom < this.config.minZoom!) {
            this.zoom = this.config.minZoom!;
        }

        this.centerMap();
    }

    /**
     * Get current zoom level
     */
    getZoom(): number {
        return this.zoom;
    }

    /**
     * Set zoom level
     */
    setZoom(zoom: number): void {
        this.zoom = Math.max(this.config.minZoom ?? 0.0001, Math.min(this.config.maxZoom ?? 10.0, zoom));
        this.updateWorldTransform();
    }

    /**
     * Enable/disable keyboard controls
     */
    setKeyboardEnabled(enabled: boolean): void {
        this.keyboardEnabled = enabled;
    }

    /**
     * Clean up event listeners and animation frames
     */
    destroy(): void {
        // Clean up keyboard event listeners
        if (typeof document !== 'undefined') {
            document.removeEventListener('keydown', this.onKeyDown.bind(this));
            document.removeEventListener('keyup', this.onKeyUp.bind(this));
            document.removeEventListener('contextmenu', this.onContextMenu.bind(this));
        }

        // Stop pan animation
        if (this.panAnimationId) {
            cancelAnimationFrame(this.panAnimationId);
            this.panAnimationId = null;
        }

        // Clear pressed keys
        this.keysPressed.clear();

        super.destroy();
    }

    /**
     * Get viewport bounds in world coordinates
     */
    getViewportBounds(): { x: number; y: number; width: number; height: number } {
        const topLeft = this.screenToWorld(0, 0);
        const bottomRight = this.screenToWorld(this.config.width, this.config.height);

        return {
            x: topLeft.x,
            y: topLeft.y,
            width: bottomRight.x - topLeft.x,
            height: bottomRight.y - topLeft.y,
        };
    }
}
