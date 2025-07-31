import { camera as cameraConfig } from '../../../config/camera';
import { controls } from '../../../config/controls';
import { Keyboard } from '../Input/Keyboard';
import { Mouse } from '../Input/Mouse';
import { Camera } from './Camera';

/**
 * Handles all input events for camera control
 * Manages keyboard, mouse, and wheel input state
 * Applies input directly to camera transform
 */
export class CameraInput {
    #camera: Camera | null = null;
    private keyboard: Keyboard;
    private mouse: Mouse;

    constructor() {
        this.keyboard = new Keyboard();
        this.mouse = new Mouse();
    }

    get camera() {
        if (!this.#camera) {
            throw new Error('CameraInput.init() not called');
        }
        return this.#camera;
    }

    /**
     * Initialize with camera instance after construction
     */
    init(camera: Camera) {
        this.#camera = camera;

        this.mouse.init(this.camera, {
            onWheel: this.handleWheel.bind(this),
            onDragMove: this.handleDragMove.bind(this),
        });
    }

    /**
     * Process input state and apply to camera transform
     * Call this every frame to handle continuous input
     */
    update(deltaTime: number) {
        this.processKeyboardInput(deltaTime);
    }

    /**
     * Process continuous keyboard input and apply to camera
     */
    private processKeyboardInput(deltaTime: number) {
        const moveAmount = cameraConfig.panSpeed * deltaTime * 0.016; // Normalize for 60fps
        let deltaX = 0;
        let deltaY = 0;

        if (this.keyboard.isAnyKeyPressed(controls.up)) {
            deltaY += moveAmount;
        }
        if (this.keyboard.isAnyKeyPressed(controls.down)) {
            deltaY -= moveAmount;
        }
        if (this.keyboard.isAnyKeyPressed(controls.left)) {
            deltaX += moveAmount;
        }
        if (this.keyboard.isAnyKeyPressed(controls.right)) {
            deltaX -= moveAmount;
        }

        if (deltaX !== 0 || deltaY !== 0) {
            this.camera.transform.translate(deltaX, deltaY);
        }
    }

    /**
     * Handle mouse wheel zoom events via callback
     */
    private handleWheel(normalizedDelta: number, mouseX: number, mouseY: number) {
        // Calculate zoom factor using sensitivity and reducing overall speed by 99%
        const zoomDelta = -normalizedDelta * controls.zoomSensitivity * 0.01;

        const currentState = this.camera.transform.getState();
        const newZoom = currentState.zoom * (1 + zoomDelta);

        // Constrain zoom first to get the actual zoom that will be applied
        const constrainedZoom = this.camera.transform.constrainZoom(newZoom);

        // Only calculate new position if zoom actually changed
        if (constrainedZoom !== currentState.zoom) {
            const zoomTarget = this.calculateZoomToPoint(mouseX, mouseY, constrainedZoom);
            this.camera.transform.setPosition(zoomTarget.x, zoomTarget.y, constrainedZoom);
        }
    }

    /**
     * Handle mouse drag movement via callback from Mouse class
     */
    private handleDragMove(deltaX: number, deltaY: number) {
        this.camera.transform.translate(deltaX, deltaY);
    }

    /**
     * Calculate camera position for zooming to a specific screen point
     */
    private calculateZoomToPoint(mouseX: number, mouseY: number, zoom: number) {
        // Convert screen point to world coordinates at current zoom
        const worldPoint = this.camera.transform.screenToWorld(mouseX, mouseY);

        // Calculate new camera position to keep world point under cursor
        const newCameraX = mouseX - worldPoint.x * zoom;
        const newCameraY = mouseY - worldPoint.y * zoom;

        return { x: newCameraX, y: newCameraY };
    }

    /**
     * Clean up input resources and event listeners
     */
    destroy() {
        this.keyboard.destroy();
        this.mouse.destroy();
    }
}
