import { camera as cameraConfig } from '../app/config/camera';
import { Camera } from './Camera';

/**
 * Handles smooth interpolation between camera positions
 * Provides smooth movement instead of instant position changes
 * Automatically applies interpolation to camera transform
 */
export class CameraInterpolator {
    private camera: Camera | null = null;

    // Target state
    public targetX = 0;
    public targetY = 0;
    public targetZoom = 1;

    /**
     * Initialize with camera instance after construction
     */
    init(camera: Camera) {
        this.camera = camera;

        // Initialize target to current camera state
        const currentState = camera.transform.getState();
        this.targetX = currentState.x;
        this.targetY = currentState.y;
        this.targetZoom = currentState.zoom;
    }

    /**
     * Set target position for interpolation
     */
    setTarget(x: number, y: number, zoom: number): void {
        this.targetX = x;
        this.targetY = y;
        this.targetZoom = zoom;
    }

    /**
     * Move target by delta amount
     */
    moveTarget(deltaX: number, deltaY: number): void {
        this.targetX += deltaX;
        this.targetY += deltaY;
    }

    /**
     * Set target zoom level
     */
    setTargetZoom(zoom: number): void {
        this.targetZoom = zoom;
    }

    /**
     * Update interpolation - applies smooth movement to camera
     * Call this every frame to handle interpolation
     */
    update(deltaTime: number): void {
        if (!this.camera) return;

        const currentState = this.camera.transform.getState();

        if (!cameraConfig.smoothMovement) {
            // Instant movement - snap to target
            this.camera.transform.setState(this.targetX, this.targetY, this.targetZoom);
            return;
        }

        // Check if we're close enough to target (avoid infinite small movements)
        if (this.isNearTarget(currentState.x, currentState.y, currentState.zoom)) {
            this.camera.transform.setState(this.targetX, this.targetY, this.targetZoom);
            return;
        }

        // Smooth interpolation
        const speed = cameraConfig.interpolationSpeed * deltaTime * 0.016; // Normalize for 60fps
        const newX = currentState.x + (this.targetX - currentState.x) * speed;
        const newY = currentState.y + (this.targetY - currentState.y) * speed;
        const newZoom = currentState.zoom + (this.targetZoom - currentState.zoom) * speed;

        this.camera.transform.setState(newX, newY, newZoom);
    }

    /**
     * Instantly snap to target (useful for immediate positioning)
     */
    snapToTarget() {
        if (!this.camera) return;

        this.camera.transform.setState(this.targetX, this.targetY, this.targetZoom);
    }

    /**
     * Check if camera is close enough to target (useful for stopping interpolation)
     */
    private isNearTarget(currentX: number, currentY: number, currentZoom: number, threshold = 0.1): boolean {
        const distanceX = Math.abs(this.targetX - currentX);
        const distanceY = Math.abs(this.targetY - currentY);
        const distanceZoom = Math.abs(this.targetZoom - currentZoom);

        return distanceX < threshold && distanceY < threshold && distanceZoom < threshold * 0.01;
    }

    /**
     * Get current target state
     */
    getTarget() {
        return {
            x: this.targetX,
            y: this.targetY,
            zoom: this.targetZoom,
        };
    }
}
