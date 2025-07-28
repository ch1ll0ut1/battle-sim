import { initDevtools } from '@pixi/devtools';
import { Application } from 'pixi.js';
import { colors } from '../app/config/colors';
import { ScreenManager } from './ScreenManager';

export class Engine {
    public app: Application;
    public screens: ScreenManager;

    constructor() {
        this.app = new Application();
        this.screens = new ScreenManager(this.app);
    }

    async init() {
        console.log('Init Engine');

        await this.app.init({
            background: colors.background,
            resizeTo: window,
            antialias: true,
            autoDensity: true,
            resolution: window.devicePixelRatio,
            roundPixels: true,
        });

        // Initialize the devtools
        await initDevtools(this.app);

        // Append the application canvas to the document body
        document.getElementById('pixi-container')?.appendChild(this.app.canvas);

        // Initialize the scene manager
        this.setupResize();
    }

    setupResize() {
        console.log('Init Resize');
        this.app.renderer.on('resize', (width, height) => {
            this.screens.resize(width, height);
        });

        this.screens.resize(this.app.screen.width, this.app.screen.height);
    }

    /**
     * Clean up engine resources
     */
    destroy() {
        this.app.destroy();
    }
}
