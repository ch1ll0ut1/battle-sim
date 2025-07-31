import { GameEngine } from '../GameEngine/GameEngine';
import { Logger } from '../ServerLogger';

/**
 * Manages the simulation loop, timing, and state transitions
 * Handles start/stop/pause/resume logic for game simulations
 * Encapsulates the interval-based simulation loop logic
 */
export class SimulationController {
    private engine: GameEngine;
    private logger: Logger;
    private simulationInterval: NodeJS.Timeout | null = null;

    /**
     * Creates a new SimulationController instance
     * @param gameEngine - The game engine to control
     * @param logger - Logger instance for recording simulation events
     */
    constructor(engine: GameEngine, logger: Logger) {
        this.engine = engine;
        this.logger = logger;
    }

    /**
     * Starts or continues the simulation based on current state
     * If game is already running, continues the simulation
     * Otherwise, starts a new simulation
     */
    start(): void {
        switch (this.engine.phase) {
            case 'initialized':
            case 'paused':
                this.continueSimulation();
                break;
            case 'finished':
                this.startSimulation();
                break;
            case 'running':
                throw new Error('GameEngine is already running');
            default:
                throw new Error(`Invalid state: ${this.engine.phase}`);
        }
    }

    /**
     * Stops the simulation and pauses the game engine
     * Clears the simulation interval
     */
    stop(): void {
        this.engine.pause();
        this.stopInterval();
        this.logger.debug('Simulation paused');
    }

    isRunning(): boolean {
        return this.engine.phase === 'running';
    }

    /**
     * Executes a single simulation tick
     * If game is finished, restarts it before updating
     * Used for step-by-step simulation control
     */
    nextTick(): void {
        if (this.engine.phase === 'finished') {
            throw new Error('Game is finished');
        }
        this.logger.debug('Simulation tick');
        this.engine.update(this.engine.turnInterval, true);
    }

    /**
     * Resets the simulation to initial state
     * Stops current simulation and restarts the game engine.
     * Note: Does not restart the simulation interval
     */
    reset(): void {
        this.stopInterval();
        this.engine.reset();
        this.logger.debug('Simulation reset');
    }

    /**
     * Starts a new simulation from the beginning
     * Initializes the game engine and starts the simulation loop
     */
    private startSimulation(): void {
        this.logger.debug('Simulation started');
        this.engine.reset();
        this.startInterval();
    }

    /**
     * Continues an existing simulation
     * Resumes the simulation loop without reinitializing the game
     */
    private continueSimulation(): void {
        this.startInterval();
    }

    /**
     * Starts the simulation interval loop
     * Updates the game engine every 100ms until the game finishes
     */
    private startInterval(): void {
        if (this.simulationInterval) {
            throw new Error('Simulation already running');
        }

        this.engine.update(this.engine.turnInterval);

        this.simulationInterval = setInterval(() => {
            if (this.engine.phase !== 'running') {
                this.stopInterval();
                return;
            }

            this.engine.update(this.engine.turnInterval);
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
        else {
            throw new Error('Simulation not running');
        }
    }
}
