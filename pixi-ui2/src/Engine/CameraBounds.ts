import { camera as cameraConfig } from '../app/config/camera';
import { Camera } from './Camera';

/**
 * Manages viewport bounds and constraints for camera movement
 * Handles zoom limits and position constraints to keep content visible
 * Automatically applies constraints to camera transform
 * Gets viewport and world sizes dynamically
 */
export class CameraBounds {
    private camera: Camera | null = null;
    private viewportWidth = 800;
    private viewportHeight = 600;
    private worldWidth = 1000;
    private worldHeight = 1000;
    private calculatedMinZoom = 0.1;

    /**
     * Initialize with camera instance after construction
     */
    init(camera: Camera) {
        this.camera = camera;
    }

    /**
     * Update all sizes and recalculate minimum zoom
     */
    updateSizes(viewportWidth: number, viewportHeight: number, worldWidth: number, worldHeight: number) {
        this.viewportWidth = viewportWidth;
        this.viewportHeight = viewportHeight;
        this.worldWidth = worldWidth;
        this.worldHeight = worldHeight;
        this.calculatedMinZoom = this.calculateMinZoom();
    }

    /**
     * Calculate minimum zoom to fit world in viewport
     */
    private calculateMinZoom(): number {
        const scaleX = this.viewportWidth / this.worldWidth;
        const scaleY = this.viewportHeight / this.worldHeight;
        return Math.min(scaleX, scaleY);
    }

    /**
     * Apply constraints to camera transform
     * Called automatically to keep camera within bounds
     */
    applyConstraints(): void {
        if (!this.camera) return;

        const currentState = this.camera.transform.getState();

        // Constrain zoom
        const minZoom = Math.max(this.calculatedMinZoom, cameraConfig.minZoom);
        const constrainedZoom = Math.max(minZoom, Math.min(cameraConfig.maxZoom, currentState.zoom));

        // Constrain position
        const constrainedPos = this.constrainPosition(currentState.x, currentState.y, constrainedZoom);

        // Apply constraints if needed
        if (constrainedZoom !== currentState.zoom
          || constrainedPos.x !== currentState.x
          || constrainedPos.y !== currentState.y
        ) {
            this.camera.transform.setState(constrainedPos.x, constrainedPos.y, constrainedZoom);
        }
    }

    /**
     * Constrain camera position to keep world content visible with buffer
     */
    private constrainPosition(x: number, y: number, zoom: number): { x: number; y: number } {
        // console.log('constrainPosition', { x, worldWidth: this.worldWidth, zoom, viewportWidth: this.viewportWidth });
        const worldScreenWidth = this.worldWidth * zoom;
        const worldScreenHeight = this.worldHeight * zoom;

        // Calculate buffer as percentage of viewport size
        const bufferX = this.viewportWidth * cameraConfig.boundaryBufferPercent;
        const bufferY = this.viewportHeight * cameraConfig.boundaryBufferPercent;

        let constrainedX = x;
        let constrainedY = y;

        // Horizontal constraints with buffer
        const maxX = bufferX;
        const minX = this.viewportWidth - worldScreenWidth - bufferX;
        constrainedX = Math.max(minX, Math.min(maxX, x));

        // Vertical constraints with buffer
        const maxY = bufferY;
        const minY = this.viewportHeight - worldScreenHeight - bufferY;
        constrainedY = Math.max(minY, Math.min(maxY, y));

        return { x: constrainedX, y: constrainedY };
    }

    /**
     * Get viewport bounds in world coordinates
     */
    getViewportBounds(x: number, y: number, zoom: number) {
        const topLeft = this.screenToWorld(0, 0, x, y, zoom);
        const bottomRight = this.screenToWorld(this.viewportWidth, this.viewportHeight, x, y, zoom);

        return {
            x: topLeft.x,
            y: topLeft.y,
            width: bottomRight.x - topLeft.x,
            height: bottomRight.y - topLeft.y,
        };
    }

    /**
     * Calculate initial centered position for given zoom
     */
    getCenteredPosition(zoom: number): { x: number; y: number } {
        const worldScreenWidth = this.worldWidth * zoom;
        const worldScreenHeight = this.worldHeight * zoom;

        return {
            x: (this.viewportWidth - worldScreenWidth) / 2,
            y: (this.viewportHeight - worldScreenHeight) / 2,
        };
    }

    /**
     * Helper method for coordinate conversion
     */
    private screenToWorld(screenX: number, screenY: number, camX: number, camY: number, zoom: number) {
        return {
            x: (screenX - camX) / zoom,
            y: (screenY - camY) / zoom,
        };
    }

    /**
     * Get current sizes
     */
    getSizes() {
        return {
            viewportWidth: this.viewportWidth,
            viewportHeight: this.viewportHeight,
            worldWidth: this.worldWidth,
            worldHeight: this.worldHeight,
        };
    }

    /**
     * Get calculated minimum zoom level
     */
    getMinZoom(): number {
        return Math.max(this.calculatedMinZoom, cameraConfig.minZoom);
    }
}
