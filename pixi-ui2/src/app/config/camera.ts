/**
 * Centralized camera configuration
 * Defines camera behavior settings for movement, zoom, and interpolation
 */
export const camera = {
    /**
     * Pan speed for keyboard controls (pixels per second)
     */
    panSpeed: 1000,

    /**
     * Whether to enable smooth movement interpolation
     */
    smoothMovement: false,

    /**
     * Interpolation speed (0-1, higher = faster convergence)
     */
    interpolationSpeed: 0.8,

    /**
     * Minimum zoom level (will be auto-calculated to fit world if not overridden)
     */
    minZoom: 0.01,

    /**
     * Maximum zoom level
     */
    maxZoom: 5.0,

    /**
     * Buffer around world boundaries (percentage of viewport size)
     * Allows panning beyond world edges for better content centering
     * 0.3 means 30% of viewport on each side can show empty space
     */
    boundaryBufferPercent: 0.3,
};
