/* eslint-disable @typescript-eslint/unbound-method */
import { FederatedPointerEvent, FederatedWheelEvent, Point } from 'pixi.js';
import { controls } from '../app/config/controls';
import { camera as cameraConfig } from '../app/config/camera';
import { Camera } from './Camera';
import { mouse } from './Mouse';

/**
 * Handles all input events for camera control
 * Manages keyboard, mouse, and wheel input state
 * Applies input directly to camera transform
 */
export class CameraInput {
    #camera: Camera | null = null;
    private keysPressed = new Set<string>();
    private isDragging = false;
    private lastPointerPosition = new Point();

    constructor() {
        this.onWheel = this.onWheel.bind(this);
        this.onPointerDown = this.onPointerDown.bind(this);
        this.onPointerMove = this.onPointerMove.bind(this);
        this.onPointerUp = this.onPointerUp.bind(this);
        this.onRightClick = this.onRightClick.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);
        this.onContextMenu = this.onContextMenu.bind(this);
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

        this.setupMouseEventListeners();
        this.setupKeyboardEventListeners();
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

        if (this.isKeyPressed(controls.up)) {
            deltaY += moveAmount;
        }
        if (this.isKeyPressed(controls.down)) {
            deltaY -= moveAmount;
        }
        if (this.isKeyPressed(controls.left)) {
            deltaX += moveAmount;
        }
        if (this.isKeyPressed(controls.right)) {
            deltaX -= moveAmount;
        }

        if (deltaX !== 0 || deltaY !== 0) {
            if (cameraConfig.smoothMovement) {
                this.camera.interpolator.moveTarget(deltaX, deltaY);
            }
            else {
                this.camera.transform.translate(deltaX, deltaY);
            }
        }
    }

    /**
     * Check if any key from the given array is pressed
     */
    private isKeyPressed(keys: readonly string[]): boolean {
        return keys.some(key => this.keysPressed.has(key.toLowerCase()));
    }

    /**
     * Setup camera-specific event listeners for mouse events
     */
    private setupMouseEventListeners() {
        this.camera.on('wheel', this.onWheel);
        this.camera.on('pointerdown', this.onPointerDown);
        this.camera.on('pointermove', this.onPointerMove);
        this.camera.on('pointerup', this.onPointerUp);
        this.camera.on('pointerupoutside', this.onPointerUp);
        this.camera.on('rightclick', this.onRightClick);
    }

    /**
     * Setup document-level keyboard event listeners
     */
    private setupKeyboardEventListeners() {
        console.log('setupKeyboardEventListeners', document);
        if (typeof document !== 'undefined') {
            document.addEventListener('keydown', this.onKeyDown);
            document.addEventListener('keyup', this.onKeyUp);
            document.addEventListener('contextmenu', this.onContextMenu);
        }
    }

    /**
     * Handle mouse wheel zoom events
     */
    private onWheel(event: FederatedWheelEvent) {
        event.stopPropagation();

        // Normalize delta to line-based units for consistent behavior across devices
        const normalizedDelta = mouse.normalizeWheelDelta(event.deltaY, event.deltaMode);

        // Calculate zoom factor using sensitivity and reducing overall speed by 99%
        const zoomDelta = -normalizedDelta * controls.zoomSensitivity * 0.01;

        if (cameraConfig.smoothMovement) {
            const currentTarget = this.camera.interpolator.getTarget();
            const newZoom = currentTarget.zoom * (1 + zoomDelta);
            const zoomTarget = this.calculateZoomToPoint(event, newZoom);
            this.camera.interpolator.setTarget(zoomTarget.x, zoomTarget.y, zoomTarget.zoom);
        }
        else {
            const currentState = this.camera.transform.getState();
            const newZoom = currentState.zoom * (1 + zoomDelta);
            const zoomTarget = this.calculateZoomToPoint(event, newZoom);
            this.camera.transform.setState(zoomTarget.x, zoomTarget.y, zoomTarget.zoom);
        }
    }

    /**
     * Calculate camera position for zooming to a specific screen point
     */
    private calculateZoomToPoint(event: FederatedWheelEvent, newZoom: number) {
        // Calculate zoom target position
        const mouseX = event.global.x;
        const mouseY = event.global.y;

        // Convert screen point to world coordinates at current zoom
        const worldPoint = this.camera.transform.screenToWorld(mouseX, mouseY);

        // Calculate new camera position to keep world point under cursor
        const newCameraX = mouseX - worldPoint.x * newZoom;
        const newCameraY = mouseY - worldPoint.y * newZoom;

        return { x: newCameraX, y: newCameraY, zoom: newZoom };
    }

    /**
     * Handle pointer down events
     */
    private onPointerDown(event: FederatedPointerEvent) {
        if (event.button !== controls.dragButton) return;

        this.isDragging = true;
        this.lastPointerPosition.copyFrom(event.global);
    }

    /**
     * Handle pointer move events
     */
    private onPointerMove(event: FederatedPointerEvent) {
        if (!this.isDragging) return;

        const deltaX = event.global.x - this.lastPointerPosition.x;
        const deltaY = event.global.y - this.lastPointerPosition.y;

        if (cameraConfig.smoothMovement) {
            this.camera.interpolator.moveTarget(deltaX, deltaY);
        }
        else {
            this.camera.transform.translate(deltaX, deltaY);
        }
        this.lastPointerPosition.copyFrom(event.global);
    }

    /**
     * Handle pointer up events
     */
    private onPointerUp() {
        this.isDragging = false;
    }

    /**
     * Handle right click to prevent context menu
     */
    private onRightClick(event: FederatedPointerEvent) {
        event.preventDefault();
    }

    /**
     * Handle keydown events
     */
    private onKeyDown(event: KeyboardEvent) {
        const key = event.key.toLowerCase();
        console.log('onKeyDown', key);
        // Check if this key is configured for camera controls
        const allControlKeys = [
            ...controls.up,
            ...controls.down,
            ...controls.left,
            ...controls.right,
        ].map(k => k.toLowerCase());

        if (allControlKeys.includes(key)) {
            event.preventDefault();
            this.keysPressed.add(key);
        }
    }

    /**
     * Handle keyup events
     */
    private onKeyUp(event: KeyboardEvent) {
        const key = event.key.toLowerCase();
        this.keysPressed.delete(key);
    }

    /**
     * Prevent context menu
     */
    private onContextMenu(event: MouseEvent) {
        event.preventDefault();
    }

    /**
     * Clean up event listeners
     */
    destroy() {
        if (typeof document !== 'undefined') {
            document.removeEventListener('keydown', this.onKeyDown);
            document.removeEventListener('keyup', this.onKeyUp);
            document.removeEventListener('contextmenu', this.onContextMenu);
        }

        this.keysPressed.clear();
    }
}
