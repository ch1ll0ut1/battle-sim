import { Application } from 'pixi.js';
import { MainMenu } from './MainMenu/MainMenu';
import { MapEditor } from './MapEditor/MapEditor';
import { ScreenManager } from './Navigation/ScreenManager';
import { ScreenType } from './Navigation/ScreenType';

/**
 * Main application class
 */
class BattleSimApp {
    private app!: Application;
    private screenManager!: ScreenManager;

    /**
     * Initialize the application
     */
    async init(): Promise<void> {
        // Create a new application
        this.app = new Application();

        // Initialize the application
        await this.app.init({
            background: '#2c3e50',
            resizeTo: window,
            antialias: true,
            autoDensity: true,
            resolution: window.devicePixelRatio,
        });

        // Append the application canvas to the document body
        document.getElementById('pixi-container')?.appendChild(this.app.canvas);

        // Initialize screen manager
        this.screenManager = new ScreenManager(this.app);

        // Create and register screens
        this.createScreens();

        // Start with main menu
        this.screenManager.switchTo(ScreenType.mainMenu);
    }

    /**
     * Create and register all screens
     */
    private createScreens(): void {
        // Main Menu
        const mainMenu = new MainMenu({
            onGameModeSelect: (gameModeId: string) => {
                console.log(`Selected game mode: ${gameModeId}`);
                if (gameModeId === 'map_editor') {
                    this.screenManager.switchTo(ScreenType.mapEditor);
                }
                // TODO: Handle other game modes
            },
            screenWidth: this.app.screen.width,
            screenHeight: this.app.screen.height,
        });
        this.screenManager.registerScene(ScreenType.mainMenu, mainMenu);

        // Map Editor
        const mapEditor = new MapEditor({
            onBack: () => {
                this.screenManager.switchTo(ScreenType.mainMenu);
            },
            onSave: (mapData) => {
                console.log('Saving map:', mapData);
                // TODO: Implement map saving
                alert('Map saved! (Not implemented yet)');
            },
            screenWidth: this.app.screen.width,
            screenHeight: this.app.screen.height,
        });
        this.screenManager.registerScene(ScreenType.mapEditor, mapEditor);
    }
}

// Initialize the application
(async () => {
    const battleSimApp = new BattleSimApp();
    await battleSimApp.init();
})().catch(console.error);
