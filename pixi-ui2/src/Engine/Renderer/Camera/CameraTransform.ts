import { Container, Point } from 'pixi.js';
import { camera as cameraConfig } from '../../../config/camera';
import { Camera } from './Camera';

/**
 * Manages camera transform state and coordinate conversions
 * Handles position, zoom, and applies transforms to the world container
 */
export class CameraTransform {
    #camera: Camera | null = null;
    private worldContainer: Container;

    // Current transform state
    public x = 0;
    public y = 0;
    public zoom = 1.0;

    constructor(worldContainer: Container) {
        this.worldContainer = worldContainer;
    }

    get camera() {
        if (!this.#camera) {
            throw new Error('CameraTransform.init() not called');
        }
        return this.#camera;
    }

    /**
     * Initialize with camera instance after construction
     */
    init(camera: Camera) {
        this.#camera = camera;
    }

    /**
     * Apply current transform state to the world container
     */
    applyTransform() {
        this.worldContainer.scale.set(this.zoom);
        this.worldContainer.position.set(this.x, this.y);
    }

    /**
     * Convert screen coordinates to world coordinates
     */
    screenToWorld(screenX: number, screenY: number) {
        const worldX = (screenX - this.x) / this.zoom;
        const worldY = (screenY - this.y) / this.zoom;
        return new Point(worldX, worldY);
    }

    /**
     * Convert world coordinates to screen coordinates
     */
    worldToScreen(worldX: number, worldY: number) {
        const screenX = worldX * this.zoom + this.x;
        const screenY = worldY * this.zoom + this.y;
        return new Point(screenX, screenY);
    }

    /**
     * Set position directly with bounds checking
     */
    setPosition(x: number, y: number, zoom?: number) {
        const zoomLevel = zoom ?? this.zoom;
        const constrained = this.constrainPosition(x, y, zoomLevel);

        this.x = constrained.x;
        this.y = constrained.y;
        this.zoom = constrained.zoom;
    }

    /**
     * Move by delta amount with bounds checking
     */
    translate(deltaX: number, deltaY: number) {
        const newX = this.x + deltaX;
        const newY = this.y + deltaY;
        this.setPosition(newX, newY);
    }

    /**
     * Set zoom level
     */
    setZoom(zoom: number) {
        this.zoom = zoom;
    }

    /**
     * Set complete camera state
     */
    setState(x: number, y: number, zoom: number) {
        this.x = x;
        this.y = y;
        this.zoom = zoom;
    }

    /**
     * Get current state as object
     */
    getState() {
        return {
            x: this.x,
            y: this.y,
            zoom: this.zoom,
        };
    }

    /**
     * Constrain zoom level to min/max bounds
     */
    constrainZoom(zoom: number) {
        const minZoom = this.camera.getMinZoom();
        return Math.max(minZoom, Math.min(cameraConfig.maxZoom, zoom));
    }

    /**
     * Constrain position along a single axis with buffer
     */
    private constrainAxis(
        position: number,
        worldSize: number,
        viewportSize: number,
        zoom: number,
    ) {
        const worldScreenSize = worldSize * zoom;
        const buffer = viewportSize * cameraConfig.boundaryBufferPercent;

        const max = buffer;
        const min = viewportSize - worldScreenSize - buffer;

        return Math.max(min, Math.min(max, position));
    }

    /**
     * Constrain camera position and zoom to keep world content visible with buffer
     */
    private constrainPosition(x: number, y: number, zoom: number) {
        // Constrain zoom to possible bounds
        const constrainedZoom = this.constrainZoom(zoom);

        const { viewportWidth, viewportHeight } = this.camera;

        // Constrain both axes using the helper method
        const constrainedX = this.constrainAxis(x, this.camera.worldWidth, viewportWidth, constrainedZoom);
        const constrainedY = this.constrainAxis(y, this.camera.worldHeight, viewportHeight, constrainedZoom);

        return { x: constrainedX, y: constrainedY, zoom: constrainedZoom };
    }
}
