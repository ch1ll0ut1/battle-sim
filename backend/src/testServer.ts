import { Logger } from './utils/Logger.js';
import { BattleEngine, Unit } from './BattleEngine/BattleEngine.js';
import { WebsocketServer } from './utils/WebsocketServer.js';
import { BattleBroadcaster } from './BattleEngine/BattleBroadcaster.js';

// Create test units
const units: Unit[] = [
  // Team 1
  {
    id: 1,
    name: 'Knight',
    health: 100,
    attack: 15,
    defense: 10,
    team: 1
  },
  {
    id: 2,
    name: 'Archer',
    health: 80,
    attack: 20,
    defense: 5,
    team: 1
  },
  // Team 2
  {
    id: 3,
    name: 'Warrior',
    health: 90,
    attack: 18,
    defense: 8,
    team: 2
  },
  {
    id: 4,
    name: 'Mage',
    health: 70,
    attack: 25,
    defense: 3,
    team: 2
  }
];

// Create components
const logger = new Logger();
const engine = new BattleEngine(units, logger);
const wsServer = new WebsocketServer(8080);
const broadcaster = new BattleBroadcaster(wsServer, engine, logger);

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