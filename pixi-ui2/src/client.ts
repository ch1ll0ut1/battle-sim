import { LoadScreen } from './client/screens/LoadScreen/LoadScreen';
import { MenuScreen } from './client/screens/MenuScreen/MenuScreen';
import { Renderer } from './engine/Renderer/Renderer';
import { gameClient } from './game/GameClient';

/**
 * Importing these modules will automatically register their plugins with the engine.
 */

(async () => {
    const engine = new Renderer();
    await engine.init();
    await gameClient.connect('ws://localhost:8081');

    // Show the load screen
    await engine.screens.show(LoadScreen);

    // Show the menu screen once the load screen is dismissed
    await engine.screens.show(MenuScreen);
})().catch(console.error);
