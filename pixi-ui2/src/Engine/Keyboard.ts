/**
 * Handles keyboard input state and events
 * Manages pressed keys and provides query methods for input checking
 */
export class Keyboard {
    private keysPressed = new Set<string>();

    // Bound methods for proper event listener cleanup
    private boundOnKeyDown = this.onKeyDown.bind(this);
    private boundOnKeyUp = this.onKeyUp.bind(this);
    private boundOnContextMenu = this.onContextMenu.bind(this);

    constructor() {
        this.setupEventListeners();
    }

    /**
     * Check if any key from the given array is currently pressed
     */
    isAnyKeyPressed(keys: readonly string[]): boolean {
        return keys.some(key => this.keysPressed.has(key.toLowerCase()));
    }

    /**
     * Check if a specific key is currently pressed
     */
    isKeyPressed(key: string): boolean {
        return this.keysPressed.has(key.toLowerCase());
    }

    /**
     * Get all currently pressed keys
     */
    getPressedKeys(): Set<string> {
        return new Set(this.keysPressed);
    }

    /**
     * Setup document-level keyboard event listeners
     */
    private setupEventListeners() {
        if (typeof document !== 'undefined') {
            document.addEventListener('keydown', this.boundOnKeyDown);
            document.addEventListener('keyup', this.boundOnKeyUp);
            document.addEventListener('contextmenu', this.boundOnContextMenu);
        }
    }

    /**
     * Handle keydown events
     */
    private onKeyDown(event: KeyboardEvent) {
        const key = event.key.toLowerCase();
        this.keysPressed.add(key);
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
     * Clean up event listeners and state
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