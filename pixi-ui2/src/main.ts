import { LoadScreen } from './app/screens/LoadScreen/LoadScreen';
import { MenuScreen } from './app/screens/MenuScreen/MenuScreen';
import { Engine } from './Engine/Engine';

/**
 * Importing these modules will automatically register their plugins with the engine.
 */

(async () => {
    const engine = new Engine();
    await engine.init();

    // Show the load screen
    await engine.screens.show(LoadScreen);

    // Show the menu screen once the load screen is dismissed
    await engine.screens.show(MenuScreen);
})().catch(console.error);
