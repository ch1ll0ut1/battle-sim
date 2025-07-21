import { LoadScreen } from './app/screens/LoadScreen/LoadScreen';
import { Engine } from './Engine/Engine';

/**
 * Importing these modules will automatically register there plugins with the engine.
 */

(async () => {
    const engine = new Engine();
    await engine.init();

    // Show the load screen
    await engine.screens.show(LoadScreen);

    // Show the main screen once the load screen is dismissed
    // await engine.navigation.showScreen(MainScreen);
})().catch(console.error);
