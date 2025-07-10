import { BattleServer } from './BattleServer/BattleServer.js';
import { serverConfig } from './config/server.js';
import { units1v1 } from './testData.js';

// Create and start the battle server
const battleServer = new BattleServer(serverConfig.port, units1v1);

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  battleServer.shutdown();
  process.exit(0);
});

console.log('Battle simulation server started on port 8080');