import { Container, Point } from 'pixi.js';

/**
 * Manages camera transform state and coordinate conversions
 * Handles position, zoom, and applies transforms to the world container
 */
export class CameraTransform {
    private worldContainer: Container;
    
    // Current transform state
    public x = 0;
    public y = 0;
    public zoom = 1.0;

    constructor(worldContainer: Container) {
        this.worldContainer = worldContainer;
    }

    /**
     * Apply current transform state to the world container
     */
    applyTransform() {
        console.log('applyTransform', this.zoom, this.x, this.y);
        this.worldContainer.scale.set(this.zoom);
        this.worldContainer.position.set(this.x, this.y);
    }

    /**
     * Convert screen coordinates to world coordinates
     */
    screenToWorld(screenX: number, screenY: number): Point {
        const worldX = (screenX - this.x) / this.zoom;
        const worldY = (screenY - this.y) / this.zoom;
        return new Point(worldX, worldY);
    }

    /**
     * Convert world coordinates to screen coordinates
     */
    worldToScreen(worldX: number, worldY: number): Point {
        const screenX = worldX * this.zoom + this.x;
        const screenY = worldY * this.zoom + this.y;
        return new Point(screenX, screenY);
    }

    /**
     * Set position directly
     */
    setPosition(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    /**
     * Move by delta amount
     */
    translate(deltaX: number, deltaY: number) {
        this.x += deltaX;
        this.y += deltaY;
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
            zoom: this.zoom
        };
    }
}