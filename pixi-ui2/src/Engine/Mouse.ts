const DEFAULT_BROWSER_FONT_SIZE = 16;

/**
 * Wheel event delta modes from DOM specification
 */
enum WheelDeltaMode {
    pixel = 0, // DOM_DELTA_PIXEL (trackpad)
    line = 1, // DOM_DELTA_LINE (mouse wheel)
    page = 2, // DOM_DELTA_PAGE
}

class Mouse {
    private scrollLineHeight: number;

    constructor() {
        this.scrollLineHeight = this.getScrollLineHeight();
    }

    /**
     * Normalize wheel event delta to pixel units
     * Converts line and page deltas to consistent pixel units
     */
    normalizeWheelDelta(deltaY: number, deltaMode: WheelDeltaMode): number {
        switch (deltaMode) {
            case WheelDeltaMode.pixel:
                return deltaY; // Already in pixels
            case WheelDeltaMode.line:
                return deltaY * this.scrollLineHeight;
            case WheelDeltaMode.page:
                return deltaY * this.getPageHeight();
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
}

export const mouse = new Mouse();
