import { Application, Container } from 'pixi.js';
import { ScreenType } from './ScreenType';

/**
 * Manages screen transitions using PixiJS scenes
 * Each screen is a PixiJS Container that can be added/removed from the stage
 */
export class ScreenManager {
    private currentScene: Container | null = null;
    private scenes = new Map<ScreenType, Container>();
    private app: Application;

    /**
   * Initialize the screen manager with the PixiJS application
   */
    constructor(app: Application) {
        this.app = app;
    }

    /**
   * Register a scene for a specific screen type
   */
    registerScene(screenType: ScreenType, scene: Container): void {
        this.scenes.set(screenType, scene);
    }

    /**
   * Switch to a different screen
   */
    switchTo(screenType: ScreenType): void {
        const newScene = this.scenes.get(screenType);
        if (!newScene) {
            console.error(`Scene not found for screen type: ${screenType}`);
            return;
        }

        // Remove current scene if it exists
        if (this.currentScene) {
            this.app.stage.removeChild(this.currentScene);
        }

        // Add new scene
        this.app.stage.addChild(newScene);
        this.currentScene = newScene;

        console.log(`Switched to screen: ${screenType}`);
    }

    /**
   * Get the current active scene
   */
    getCurrentScene(): Container | null {
        return this.currentScene;
    }

    /**
   * Check if a scene is registered
   */
    hasScene(screenType: ScreenType): boolean {
        return this.scenes.has(screenType);
    }
}
