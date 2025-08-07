import { Application, Assets, BigPool, Container } from 'pixi.js';
import { Screen, ScreenConstructor } from './Screen';

/**
 * ScreenManager handles the lifecycle and transitions of application screens.
 * Responsible for showing, hiding, and resizing screens, as well as managing asset loading and event hooks.
 * Integrates with PixiJS Application and coordinates screen updates and resource management.
 */
export class ScreenManager {
    /**
     * Reference to the PixiJS Application instance.
     */
    private app: Application;

    /**
     * Root container for all screens managed by the ScreenManager.
     */
    private stage: Container;

    /**
     * Current width of the screen (used for resize events).
     */
    private screenWidth = 0;

    /**
     * Current height of the screen (used for resize events).
     */
    private screenHeight = 0;

    /**
     * Optional background screen, rendered behind all other screens.
     */
    public background?: Screen;

    /**
     * The currently active screen displayed to the user.
     */
    public currentScreen?: Screen;

    /**
     * The currently active popup screen, if any.
     */
    public currentPopup?: Screen;

    /**
     * Constructs the ScreenManager and attaches it to the given PixiJS Application.
     * @param app - The PixiJS Application instance.
     */
    constructor(app: Application) {
        this.app = app;
        this.stage = app.stage;
    }

    /**
     * Resize all managed screens and propagate new dimensions.
     * @param width - New width of the application.
     * @param height - New height of the application.
     */
    resize(width: number, height: number) {
        console.log('Resize ScreenManager', width, height);
        this.screenWidth = width;
        this.screenHeight = height;
        this.currentScreen?.resize?.(width, height);
        this.currentPopup?.resize?.(width, height);
        this.background?.resize?.(width, height);
    }

    /**
     * Transition to a new screen, hiding the current one and loading required assets.
     * Handles asset bundle loading, progress reporting, and screen instantiation.
     * @param ctor - The constructor for the new screen to display.
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
        this.currentScreen = BigPool.get(ctor, this);
        await this.addAndShowScreen(this.currentScreen);
    }

    /**
     * Add a new screen to the stage, prepare it, and animate it in.
     * Handles resize and update hooks for the new screen.
     * @param screen - The screen instance to add and show.
     */
    private async addAndShowScreen(screen: Screen) {
        // Add screen to stage
        this.stage.addChild(screen);

        // Setup things and pre-organise screen before showing
        if (screen.prepare) {
            await screen.prepare();
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

    /**
     * Hide and remove a screen from the stage, cleaning up event hooks and state.
     * Calls reset to allow the screen to unregister listeners and clear state for reuse.
     * @param screen - The screen instance to hide and remove.
     */
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
        BigPool.return(screen);
    }
}
