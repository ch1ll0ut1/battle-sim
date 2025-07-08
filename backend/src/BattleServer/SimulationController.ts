import { BattleEngine } from '../BattleEngine/BattleEngine.js';
import { Logger } from '../utils/Logger.js';

/**
 * Manages the simulation loop, timing, and state transitions
 * Handles start/stop/pause/resume logic for battle simulations
 * Encapsulates the interval-based simulation loop logic
 */
export class SimulationController {
    private battleEngine: BattleEngine;
    private logger: Logger;
    private simulationInterval: NodeJS.Timeout | null = null;

    /**
     * Creates a new SimulationController instance
     * @param battleEngine - The battle engine to control
     * @param logger - Logger instance for recording simulation events
     */
    constructor(battleEngine: BattleEngine, logger: Logger) {
        this.battleEngine = battleEngine;
        this.logger = logger;
    }

    /**
     * Starts or continues the simulation based on current state
     * If battle is already running, continues the simulation
     * Otherwise, starts a new simulation
     */
    start(): void {
        switch (this.battleEngine.state) {
            case 'initialized':
            case 'paused':
                this.continueSimulation();
                break;
            case 'finished':
                this.startSimulation();
                break;
            case 'running':
                throw new Error('BattleEngine is already running');
            default:
                throw new Error(`Invalid state: ${this.battleEngine.state}`);
        }
    }

    /**
     * Stops the simulation and pauses the battle engine
     * Clears the simulation interval
     */
    stop(): void {
        this.battleEngine.pause();
        this.stopInterval();
        this.logger.debug('Simulation paused');
    }

    /**
     * Executes a single simulation tick
     * If battle is finished, restarts it before updating
     * Used for step-by-step simulation control
     */
    nextTick(): void {
        if (this.battleEngine.state === 'finished') {
            throw new Error('Battle is finished');
        }
        this.logger.debug('Simulation tick');
        this.battleEngine.update(true);
    }

    /**
     * Resets the simulation to initial state
     * Stops current simulation and restarts the battle engine.
     * Note: Does not restart the simulation interval
     */
    reset(): void {
        this.stopInterval();
        this.battleEngine.reset();
        this.logger.debug('Simulation reset');
    }

    /**
     * Starts a new simulation from the beginning
     * Initializes the battle engine and starts the simulation loop
     */
    private startSimulation(): void {
        this.logger.debug('Simulation started');
        this.battleEngine.reset();
        this.startInterval();
    }

    /**
     * Continues an existing simulation
     * Resumes the simulation loop without reinitializing the battle
     */
    private continueSimulation(): void {
        this.startInterval();
    }

    /**
     * Starts the simulation interval loop
     * Updates the battle engine every 100ms until the battle finishes
     */
    private startInterval(): void {
        this.simulationInterval = setInterval(() => {
            this.battleEngine.update();
            
            if (this.battleEngine.state === 'finished') {
                this.stopInterval();
            }
        }, 100);
    }

    /**
     * Stops the simulation interval loop
     * Clears the current interval and resets the interval reference
     */
    private stopInterval(): void {
        if (this.simulationInterval) {
            clearInterval(this.simulationInterval);
            this.simulationInterval = null;
        }
    }
} 