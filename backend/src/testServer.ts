import { GameServer } from './GameServer/GameServer.js';
import { serverConfig } from './config/server.js';
import { units1v1 } from './testData.js';

// Create and start the battle server
const gameServer = new GameServer(serverConfig.port, units1v1);

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  gameServer.shutdown();
  process.exit(0);
});

console.log('Battle simulation server started on port 8080');