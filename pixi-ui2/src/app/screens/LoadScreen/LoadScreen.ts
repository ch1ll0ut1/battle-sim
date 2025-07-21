import { CircularProgressBar } from '@pixi/ui';
import { BitmapText } from 'pixi.js';
import { Screen } from '../../../Engine/Screen';
import { colors } from '../../config/colors';
import { font } from '../../config/font';

/**
 * LoadScreen displays a loading progress bar and text while assets are being loaded.
 * Inherits animation and lifecycle from the Screen base class.
 */
export class LoadScreen extends Screen {
    /**
     * Asset bundles required for the loading screen.
     * Used to preload essential assets before entering the main app.
     */
    static assetBundles = ['preload'];

    private progressBar: CircularProgressBar;
    private loadingText: BitmapText;

    /**
     * Constructs the LoadScreen, initializing the progress bar and loading text.
     */
    constructor() {
        super();
        console.log('LoadScreen init');

        this.progressBar = new CircularProgressBar({
            ...colors.progressBar,
            radius: 100,
            lineWidth: 15,
            value: 20,
            backgroundAlpha: 0.5,
            fillAlpha: 0.8,
            cap: 'round',
        });

        this.addChild(this.progressBar);

        this.loadingText = new BitmapText({
            text: 'Loading...',
            style: {
                ...font.subTitle,
            },
        });
        this.loadingText.anchor.set(0.4, 0.5);

        this.addChild(this.loadingText);
    }

    /**
     * Resize the loading screen and reposition UI elements.
     * @param width - New width of the screen.
     * @param height - New height of the screen.
     */
    resize(width: number, height: number): void {
        console.log('LoadScreen resize', width, height);

        this.loadingText.position.set(width * 0.5, height * 0.5 + 200);
        this.progressBar.position.set(width * 0.5, height * 0.5);
    }

    /**
     * Update the progress bar based on asset loading progress.
     * @param progress - Loading progress (0 to 1).
     */
    onLoad(progress: number) {
        console.log('LoadScreen onLoad', progress);
        this.progressBar.progress = progress;
    }
}
