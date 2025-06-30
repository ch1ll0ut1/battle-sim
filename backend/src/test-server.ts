import { Battle } from './battle/battle.js';
import { Unit } from './units/unit.js';
import { Position } from './common/position.js';
import { BattleWebSocketServer } from './websocket-server.js';

// Create some test units
const units = [
  new Unit(1, 'Knight', 0.8, 80, 70, new Position(10, 10)),
  new Unit(2, 'Men-at-arms', 0.4, 60, 50, new Position(90, 10)),
  new Unit(3, 'Viking', 0.7, 75, 65, new Position(10, 90)),
  new Unit(4, 'Shield-maiden', 0.3, 50, 40, new Position(90, 90))
];

// Create battle
const battle = new Battle(units);

// Create websocket server
const wsServer = new BattleWebSocketServer(8080, battle);

console.log('Battle simulation server started on port 8080');

// Add some initial log entries
wsServer.addLogEntry('Battle simulation started');
wsServer.addLogEntry('Units deployed to battlefield');

// Simulation loop
let isRunning = false;
let simulationInterval: NodeJS.Timeout | null = null;

const startSimulation = () => {
  if (isRunning) return;
  isRunning = true;
  wsServer.addLogEntry('Simulation started');
  
  simulationInterval = setInterval(() => {
    battle.update(0.1); // 100ms per tick
    wsServer.broadcastBattleState();
    
    if (!battle.isActive) {
      stopSimulation();
      wsServer.addLogEntry('Battle ended');
    }
  }, 100);
};

const stopSimulation = () => {
  if (!isRunning) return;
  isRunning = false;
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
  }
  wsServer.addLogEntry('Simulation paused');
};

const resetSimulation = () => {
  stopSimulation();
  // Reset battle state
  battle.time = 0;
  battle.isActive = true;
  units.forEach(unit => {
    unit.position = new Position(
      Math.random() * 80 + 10,
      Math.random() * 80 + 10
    );
    unit.direction = Math.random() * Math.PI * 2;
  });
  wsServer.broadcastBattleState();
  wsServer.addLogEntry('Simulation reset');
};

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  stopSimulation();
  wsServer.close();
  process.exit(0);
});

// Export control functions for potential future use
export { startSimulation, stopSimulation, resetSimulation }; 