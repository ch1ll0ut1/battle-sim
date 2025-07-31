import { serverConfig } from './config/server';
import { GameServer } from './engine/GameServer/GameServer';

// Create and start the battle server
const gameServer = new GameServer(serverConfig.port);

// Handle process termination
process.on('SIGINT', () => {
    console.log('Shutting down server...');
    gameServer.shutdown();
    process.exit(0);
});

console.log(`Battle simulation server started on port ${serverConfig.port}`);
