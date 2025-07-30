/**
 * Color utility functions for auto-generating button color palettes
 * from a single base color using color theory principles.
 */

import { colors } from '../config/colors';

/**
 * Converts hex color to HSL values
 * @param hex - Hex color string (e.g., '#FF0000')
 * @returns HSL object with h, s, l values (0-360, 0-100, 0-100)
 */
function hexToHsl(hex: string): { h: number; s: number; l: number } {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
}

/**
 * Converts HSL values to hex color
 * @param h - Hue (0-360)
 * @param s - Saturation (0-100)
 * @param l - Lightness (0-100)
 * @returns Hex color string
 */
function hslToHex(h: number, s: number, l: number): string {
    h = h % 360;
    s = Math.max(0, Math.min(100, s)) / 100;
    l = Math.max(0, Math.min(100, l)) / 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;

    let r = 0;
    let g = 0;
    let b = 0;

    if (0 <= h && h < 60) {
        r = c;
        g = x;
        b = 0;
    }
    else if (60 <= h && h < 120) {
        r = x;
        g = c;
        b = 0;
    }
    else if (120 <= h && h < 180) {
        r = 0;
        g = c;
        b = x;
    }
    else if (180 <= h && h < 240) {
        r = 0;
        g = x;
        b = c;
    }
    else if (240 <= h && h < 300) {
        r = x;
        g = 0;
        b = c;
    }
    else if (300 <= h && h < 360) {
        r = c;
        g = 0;
        b = x;
    }

    const rHex = Math.round((r + m) * 255).toString(16).padStart(2, '0');
    const gHex = Math.round((g + m) * 255).toString(16).padStart(2, '0');
    const bHex = Math.round((b + m) * 255).toString(16).padStart(2, '0');

    return `#${rHex}${gHex}${bHex}`;
}

/**
 * Adjusts the lightness of a color
 * @param hex - Base hex color
 * @param amount - Amount to adjust lightness (-100 to 100)
 * @returns Adjusted hex color
 */
export function adjustLightness(hex: string, amount: number): string {
    const hsl = hexToHsl(hex);
    hsl.l = Math.max(0, Math.min(100, hsl.l + amount));
    return hslToHex(hsl.h, hsl.s, hsl.l);
}

/**
 * Adjusts the saturation of a color
 * @param hex - Base hex color
 * @param amount - Amount to adjust saturation (-100 to 100)
 * @returns Adjusted hex color
 */
export function adjustSaturation(hex: string, amount: number): string {
    const hsl = hexToHsl(hex);
    hsl.s = Math.max(0, Math.min(100, hsl.s + amount));
    return hslToHex(hsl.h, hsl.s, hsl.l);
}

/**
 * Calculates luminance of a color to determine contrast
 * @param hex - Hex color string
 * @returns Luminance value (0-1)
 */
function getLuminance(hex: string): number {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const gamma = (c: number) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

    return 0.2126 * gamma(r) + 0.7152 * gamma(g) + 0.0722 * gamma(b);
}

/**
 * Gets appropriate text color (black/white) based on background color contrast
 * @param backgroundHex - Background color in hex format
 * @returns Contrasting text color (black or white)
 */
export function getContrastTextColor(backgroundHex: string): string {
    const luminance = getLuminance(backgroundHex);
    return luminance > 0.5 ? colors.black : colors.white;
}
