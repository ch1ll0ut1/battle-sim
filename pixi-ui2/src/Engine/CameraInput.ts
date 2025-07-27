import { FederatedPointerEvent, FederatedWheelEvent, Point } from 'pixi.js';
import { controls } from '../app/config/controls';
import { camera as cameraConfig } from '../app/config/camera';
import { Camera } from './Camera';

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

    // Bound methods for proper event listener cleanup
    private boundOnKeyDown = this.onKeyDown.bind(this);
    private boundOnKeyUp = this.onKeyUp.bind(this);
    private boundOnContextMenu = this.onContextMenu.bind(this);

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
            } else {
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
        this.camera.on('wheel', (event: FederatedWheelEvent) => this.onWheel(event));
        this.camera.on('pointerdown', (event: FederatedPointerEvent) => this.onPointerDown(event));
        this.camera.on('pointermove', (event: FederatedPointerEvent) => this.onPointerMove(event));
        this.camera.on('pointerup', () => this.onPointerUp());
        this.camera.on('pointerupoutside', () => this.onPointerUp());
        this.camera.on('rightclick', (event: FederatedPointerEvent) => this.onRightClick(event));
    }

    /**
     * Setup document-level keyboard event listeners
     */
    private setupKeyboardEventListeners() {
        console.log('setupKeyboardEventListeners', document);
        if (typeof document !== 'undefined') {
            document.addEventListener('keydown', this.boundOnKeyDown);
            document.addEventListener('keyup', this.boundOnKeyUp);
            document.addEventListener('contextmenu', this.boundOnContextMenu);
        }
    }

    /**
     * Handle mouse wheel zoom events
     */
    private onWheel(event: FederatedWheelEvent) {
        event.stopPropagation();
        
        // Calculate zoom factor using sensitivity
        const zoomDelta = event.deltaY > 0 ? -controls.zoomSensitivity : controls.zoomSensitivity;
        
        if (cameraConfig.smoothMovement) {
            const currentTarget = this.camera.interpolator.getTarget();
            const newZoom = currentTarget.zoom * (1 + zoomDelta);
            this.camera.interpolator.setTargetZoom(newZoom);
        } else {
            const currentState = this.camera.transform.getState();
            const newZoom = currentState.zoom * (1 + zoomDelta);
            this.camera.transform.setZoom(newZoom);
        }
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
        } else {
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
            ...controls.right
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
            document.removeEventListener('keydown', this.boundOnKeyDown);
            document.removeEventListener('keyup', this.boundOnKeyUp);
            document.removeEventListener('contextmenu', this.boundOnContextMenu);
        }
        
        this.keysPressed.clear();
    }
}