import { animate, ObjectTarget } from 'motion';
import { Container, Ticker } from 'pixi.js';
import { Poolable } from './Poolable';
import { ScreenManager } from './ScreenManager';

/**
 * Interface for screen constructors used in the app.
 * Implementing classes should extend Screen and can optionally specify required asset bundles.
 */
export interface ScreenConstructor {
    new(): Screen;

    /** List of assets bundles required by the screen */
    assetBundles?: string[];
}

/**
 * Base class for all application screens.
 * Handles common functionality such as asset bundle requirements, show/hide animations, and lifecycle hooks.
 * Extend this class to implement custom screens for the app.
 */
export class Screen extends Container implements Poolable<ScreenManager> {
    /**
     * List of asset bundle names required by this screen.
     * Override in subclasses to specify dependencies for preloading.
     */
    static assetBundles?: string[];

    screenManager!: ScreenManager;

    /**
     * Animate the screen in (fade in).
     * Override if you need custom show animation.
     * @returns Promise that resolves when the animation completes.
     */
    async show() {
        console.log('Screen show');
        this.alpha = 0;
        const toAnimate: ObjectTarget<Screen> = {
            alpha: 1,
        };
        await animate(this, toAnimate, {
            duration: 0.3,
            ease: 'linear',
            delay: 1,
        });
    }

    /**
     * Animate the screen out (fade out).
     * Override if you need custom hide animation.
     * @returns Promise that resolves when the animation completes.
     */
    async hide() {
        console.log('Screen hide');

        const toAnimate: ObjectTarget<Screen> = {
            alpha: 0,
        };
        await animate(this, toAnimate, {
            duration: 0.3,
            ease: 'linear',
            delay: 1,
        });
    }

    /**
     * This method is called by BigPool when the object is initialized from the pool.
     * Note: Do not call this method manually or override it in subclasses. Use prepare() instead.
     */
    init(data: ScreenManager): void {
        this.screenManager = data;
    }

    /**
     * Prepare the screen before it is shown.
     * Override to update latest state.
     * Generally setting up of UI elements is done in the constructor.
     * In combination with reset() can be used to register & unregister event listeners.
     */
    prepare?(): void;

    /**
     * Reset the screen after it is hidden.
     * Override to clean up or reset state after hiding.
     * Should be used in combination with prepare() for state and event listeners.
     */
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    reset(): void {

    }

    /**
     * Update the screen each frame.
     * Override to implement per-frame logic.
     * @param time - The Ticker instance providing delta time.
     */
    update?(time: Ticker): void;

    /**
     * Resize the screen and its contents.
     * Override to reposition or scale UI elements.
     * @param width - New width of the screen.
     * @param height - New height of the screen.
     */
    resize?(width: number, height: number): void;

    /**
     * React to asset loading progress.
     * Override to update loading indicators or progress bars.
     * @param progress - Loading progress (0 to 100). 100 is when all assets are loaded.
     */
    onLoad?(progress: number): void;
}
