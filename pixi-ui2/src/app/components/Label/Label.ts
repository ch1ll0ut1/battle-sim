import { BitmapText } from 'pixi.js';
import { font } from '../../config/font';

/**
 * A Text extension pre-formatted for this app, starting centred by default,
 * because it is the most common use in the app.
 */
export class Label extends BitmapText {
    constructor(style: keyof typeof font, text: string) {
        super({
            text,
            style: {
                ...font[style],
            },
        });
        this.anchor.set(0.5, 0.5);
    }

    setStyle(style: keyof typeof font) {
        this.style = {
            ...font[style],
        };
    }

    setColor(color: string) {
        this.style.fill = color;
    }
}
