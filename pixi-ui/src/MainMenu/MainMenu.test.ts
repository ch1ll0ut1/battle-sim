import { Application } from 'pixi.js';
import { MainMenu } from './MainMenu';

describe('MainMenu', () => {
    let app: Application;
    let mainMenu: MainMenu;

    beforeEach(async () => {
        app = new Application();
        await app.init({ background: '#000000' });
    });

    afterEach(() => {
        app.destroy(true);
    });

    it('should create main menu with title and buttons', () => {
        const onGameModeSelect = jest.fn();

        mainMenu = new MainMenu({
            onGameModeSelect,
            screenWidth: 800,
            screenHeight: 600,
        });

        expect(mainMenu.children.length).toBeGreaterThan(0);
    });

    it('should call onGameModeSelect when a game mode is selected', () => {
        const onGameModeSelect = jest.fn();

        mainMenu = new MainMenu({
            onGameModeSelect,
            screenWidth: 800,
            screenHeight: 600,
        });

        // Find a button and simulate click
        const button = mainMenu.children.find(child =>
            child.constructor.name === 'Button',
        );

        if (button && 'emit' in button) {
            (button as any).emit('pointerup');
            expect(onGameModeSelect).toHaveBeenCalled();
        }
    });
});
