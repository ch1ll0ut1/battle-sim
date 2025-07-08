import { Logger } from './utils/Logger.js';
import { BattleEngine, Unit } from './BattleEngine/BattleEngine.js';
import { WebsocketServer } from './utils/WebsocketServer.js';
import { BattleBroadcaster } from './BattleEngine/BattleBroadcaster.js';
import { units1v1 } from './testData.js';

// Create components
const logger = new Logger();
const engine = new BattleEngine(units1v1, logger);
const wsServer = new WebsocketServer(8080);
const broadcaster = new BattleBroadcaster(wsServer, engine, logger);

logger.on('log', (message) => wsServer.broadcast('log', message));

// Simulation loop
let isRunning = false;
let simulationInterval: NodeJS.Timeout | null = null;

function startSimulation() {
  if (isRunning) return;
  isRunning = true;
  logger.log('Simulation started');
  
  engine.start();

  simulationInterval = setInterval(() => {
    const isActive = engine.update();
    broadcaster.broadcastUpdates();

    if (!isActive) {
      stopSimulation();
    }
  }, 100);
}

function stopSimulation() {
  if (!isRunning) return;

  isRunning = false;

  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
  }
  
  logger.log('Simulation paused');
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  stopSimulation();
  wsServer.close();
  process.exit(0);
});

console.log('Battle simulation server started on port 8080');

// Export control functions
export { startSimulation, stopSimulation }; 