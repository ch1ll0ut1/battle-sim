import { Application, Assets, BigPool, Container } from 'pixi.js';
import { Screen, ScreenConstructor } from './Screen';

export class ScreenManager {
    /** Application instance */
    private app: Application;

    /** Stage container - Root container for all screens */
    private stage: Container;

    /** Screen width */
    private screenWidth = 0;

    /** Screen height */
    private screenHeight = 0;

    /** Constant background view for all screens */
    public background?: Screen;

    /** Current screen being displayed */
    public currentScreen?: Screen;

    /** Current popup being displayed */
    public currentPopup?: Screen;

    constructor(app: Application) {
        this.app = app;
        this.stage = app.stage;
    }

    init() {
        console.log('Init ScreenManager');
    }

    resize(width: number, height: number) {
        console.log('Resize ScreenManager', width, height);
        this.screenWidth = width;
        this.screenHeight = height;
        this.currentScreen?.resize?.(width, height);
        this.currentPopup?.resize?.(width, height);
        this.background?.resize?.(width, height);
    }

    /**
   * Hide current screen (if there is one) and present a new screen.
   * Any class that matches AppScreen interface can be used here.
   */
    public async show(ctor: ScreenConstructor) {
        // Block interactivity in current screen
        if (this.currentScreen) {
            this.currentScreen.interactiveChildren = false;
        }

        // Load assets for the new screen, if available
        if (ctor.assetBundles) {
            // Load all assets required by this new screen
            await Assets.loadBundle(ctor.assetBundles, (progress) => {
                if (this.currentScreen?.onLoad) {
                    this.currentScreen.onLoad(progress * 100);
                }
            });
        }

        if (this.currentScreen?.onLoad) {
            this.currentScreen.onLoad(100);
        }

        // If there is a screen already created, hide and destroy it
        if (this.currentScreen) {
            await this.hideAndRemoveScreen(this.currentScreen);
        }

        // Create the new screen and add that to the stage
        this.currentScreen = BigPool.get(ctor);
        await this.addAndShowScreen(this.currentScreen);
    }

    /** Add screen to the stage, link update & resize functions */
    private async addAndShowScreen(screen: Screen) {
        // Add screen to stage
        this.stage.addChild(screen);

        // Setup things and pre-organise screen before showing
        if (screen.prepare) {
            screen.prepare();
        }

        // Add screen's resize handler, if available
        if (screen.resize) {
            // Trigger a first resize
            screen.resize(this.screenWidth, this.screenHeight);
        }

        // Add update function if available
        if (screen.update) {
            // eslint-disable-next-line @typescript-eslint/unbound-method
            this.app.ticker.add(screen.update, screen);
        }

        // Show the new screen
        screen.interactiveChildren = false;
        await screen.show();
        screen.interactiveChildren = true;
    }

    /** Remove screen from the stage, unlink update & resize functions */
    private async hideAndRemoveScreen(screen: Screen) {
        // Prevent interaction in the screen
        screen.interactiveChildren = false;

        // Hide screen if method is available
        await screen.hide();

        // Unlink update function if method is available
        if (screen.update) {
            // eslint-disable-next-line @typescript-eslint/unbound-method
            this.app.ticker.remove(screen.update, screen);
        }

        // Remove screen from its parent (usually app.stage, if not changed)
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (screen.parent) {
            screen.parent.removeChild(screen);
        }

        // Clean up the screen so that instance can be reused again later
        if (screen.reset) {
            screen.reset();
        }
    }
}
