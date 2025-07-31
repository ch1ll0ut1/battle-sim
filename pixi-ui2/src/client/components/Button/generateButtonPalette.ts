import { getContrastTextColor, adjustLightness, adjustSaturation } from '../../utils/colorUtils';

/**
 * Generates a complete button color palette from a single base color
 * @param baseColor - Base hex color for the button
 * @returns Complete button color theme object
 */

export function generateButtonPalette(baseColor: string) {
    const baseText = getContrastTextColor(baseColor);
    const hoverBg = adjustLightness(baseColor, 15);
    const activeBg = adjustLightness(baseColor, -15);
    const disabledBg = adjustSaturation(adjustLightness(baseColor, 30), -50);

    return {
        background: baseColor,
        text: baseText,
        hover: {
            background: hoverBg,
            text: getContrastTextColor(hoverBg),
        },
        active: {
            background: activeBg,
            text: getContrastTextColor(activeBg),
        },
        disabled: {
            background: disabledBg,
            text: '#A9A28F',
        },
    };
}
