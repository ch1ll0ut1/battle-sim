import { Battle } from './_OLD/battle/battle.js';
import { Unit } from './_OLD/units/unit.js';
import { Position } from './_OLD/common/position.js';
import { BattleWebSocketServer } from './websocket-server.js';

// Create some test units positioned in team areas (500x500 coordinates)
const units = [
  // Team 1 (left side - 0-165px of map width)
  new Unit(1, 'Knight', 0.8, 80, 70, new Position(75, 75), 1),
  new Unit(2, 'Men-at-arms', 0.4, 60, 50, new Position(150, 75), 1),
  
  // Team 2 (right side - 335-500px of map width)
  new Unit(3, 'Viking', 0.7, 75, 65, new Position(425, 75), 2),
  new Unit(4, 'Shield-maiden', 0.3, 50, 40, new Position(350, 75), 2)
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
  // Reset battle state with team-based positioning (500x500 coordinates)
  battle.time = 0;
  battle.isActive = true;
  
  // Team 1 (left side)
  units[0].position = new Position(75, 75);
  units[1].position = new Position(150, 75);
  
  // Team 2 (right side)
  units[2].position = new Position(425, 75);
  units[3].position = new Position(350, 75);
  
  // Reset directions to face each other
  units[0].direction = 0; // Facing right
  units[1].direction = 0; // Facing right
  units[2].direction = Math.PI; // Facing left
  units[3].direction = Math.PI; // Facing left
  
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