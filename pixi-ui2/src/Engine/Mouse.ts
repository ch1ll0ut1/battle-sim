import { Container, FederatedMouseEvent, FederatedWheelEvent } from 'pixi.js';

const DEFAULT_BROWSER_FONT_SIZE = 16;

/**
 * Wheel event delta modes from DOM specification
 */
export enum WheelDeltaMode {
    pixel = 0, // DOM_DELTA_PIXEL (trackpad)
    line = 1, // DOM_DELTA_LINE (mouse wheel)
    page = 2, // DOM_DELTA_PAGE
}

/**
 * Mouse button constants from DOM specification
 */
export enum MouseButton {
    left = 0, // Primary button (usually left)
    middle = 1, // Auxiliary button (usually wheel/middle)
    right = 2, // Secondary button (usually right)
}

interface MouseCallbacks {
    /** Called when mouse wheel is scrolled - normalizedDelta in pixels, screenX/Y is current mouse position */
    onWheel?: (normalizedDelta: number, screenX: number, screenY: number) => void;
    /** Called when mouse button is pressed down - screenX/Y is where drag started, button is mouse button number */
    onDragStart?: (screenX: number, screenY: number, button: MouseButton) => void;
    /** Called during mouse drag - deltaX/Y is movement since last frame in pixels, screenX/Y is new mouse position */
    onDragMove?: (deltaX: number, deltaY: number, screenX: number, screenY: number) => void;
    /** Called when mouse button is released to end dragging */
    onDragEnd?: () => void;
}

export class Mouse {
    private scrollLineHeight: number;
    private pageHeight: number;
    private isDragging = false;
    private lastPointerX = 0;
    private lastPointerY = 0;
    private callbacks: MouseCallbacks = {};
    private targetElement: Container | null = null;

    // Bind methods for event listeners
    private boundOnWheel = this.onWheel.bind(this);
    private boundOnPointerDown = this.onPointerDown.bind(this);
    private boundOnPointerMove = this.onPointerMove.bind(this);
    private boundOnPointerUp = this.onPointerUp.bind(this);
    private boundOnRightClick = this.onRightClick.bind(this);

    constructor() {
        this.scrollLineHeight = this.getScrollLineHeight();
        this.pageHeight = this.getPageHeight();
    }

    /**
     * Initialize mouse event handling on a target element
     */
    init(targetElement: Container, callbacks: MouseCallbacks) {
        this.targetElement = targetElement;
        this.callbacks = callbacks;
        this.setupEventListeners();
    }

    /**
     * Clean up event listeners
     */
    destroy() {
        if (this.targetElement) {
            this.targetElement.off('wheel', this.boundOnWheel);
            this.targetElement.off('pointerdown', this.boundOnPointerDown);
            this.targetElement.off('pointermove', this.boundOnPointerMove);
            this.targetElement.off('pointerup', this.boundOnPointerUp);
            this.targetElement.off('pointerupoutside', this.boundOnPointerUp);
            this.targetElement.off('rightclick', this.boundOnRightClick);
        }

        this.targetElement = null;
        this.callbacks = {};
    }

    /**
     * Setup event listeners on the target element
     */
    private setupEventListeners() {
        if (!this.targetElement) {
            throw new Error('Mouse.init() not called');
        };

        this.targetElement.on('wheel', this.boundOnWheel);
        this.targetElement.on('pointerdown', this.boundOnPointerDown);
        this.targetElement.on('pointermove', this.boundOnPointerMove);
        this.targetElement.on('pointerup', this.boundOnPointerUp);
        this.targetElement.on('pointerupoutside', this.boundOnPointerUp);
        this.targetElement.on('rightclick', this.boundOnRightClick);
    }

    /**
     * Handle wheel events
     */
    private onWheel(event: FederatedWheelEvent) {
        event.stopPropagation();

        if (this.callbacks.onWheel) {
            const normalizedDelta = this.normalizeWheelDelta(event.deltaY, event.deltaMode);
            this.callbacks.onWheel(normalizedDelta, event.global.x, event.global.y);
        }
    }

    /**
     * Normalize wheel event delta to pixel units
     * Converts line and page deltas to consistent pixel units
     */
    private normalizeWheelDelta(deltaY: number, deltaMode: WheelDeltaMode): number {
        switch (deltaMode) {
            case WheelDeltaMode.pixel:
                return deltaY; // Already in pixels
            case WheelDeltaMode.line:
                return deltaY * this.scrollLineHeight;
            case WheelDeltaMode.page:
                return deltaY * this.pageHeight;
            default:
                throw new Error(`Invalid delta mode: ${deltaMode}`);
        }
    }

    /**
     * Get the browser's scroll line height based on font size
     */
    private getScrollLineHeight() {
        const el = document.createElement('div');
        el.style.fontSize = 'initial';
        el.style.display = 'none';
        document.body.appendChild(el);
        const fontSize = window.getComputedStyle(el).fontSize;
        document.body.removeChild(el);
        return fontSize ? window.parseInt(fontSize) : DEFAULT_BROWSER_FONT_SIZE;
    }

    /**
     * Get the current viewport height as page size
     */
    private getPageHeight(): number {
        return window.innerHeight || document.documentElement.clientHeight || 600;
    }

    /**
     * Handle pointer up events
     */
    private onPointerUp() {
        this.isDragging = false;

        if (this.callbacks.onDragEnd) {
            this.callbacks.onDragEnd();
        }
    }

    /**
     * Handle pointer down events
     */
    private onPointerDown(event: FederatedMouseEvent) {
        this.isDragging = true;
        this.lastPointerX = event.global.x;
        this.lastPointerY = event.global.y;

        if (this.callbacks.onDragStart) {
            this.callbacks.onDragStart(event.global.x, event.global.y, event.button);
        }
    }

    /**
     * Handle pointer move events
     */
    private onPointerMove(event: FederatedMouseEvent) {
        if (!this.isDragging) return;

        const deltaX = event.global.x - this.lastPointerX;
        const deltaY = event.global.y - this.lastPointerY;

        this.lastPointerX = event.global.x;
        this.lastPointerY = event.global.y;

        if (this.callbacks.onDragMove) {
            this.callbacks.onDragMove(deltaX, deltaY, event.global.x, event.global.y);
        }
    }

    /**
     * Handle right click to prevent context menu
     */
    private onRightClick(event: FederatedMouseEvent) {
        event.preventDefault();
    }
}
