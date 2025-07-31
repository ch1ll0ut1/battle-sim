import { EventEmitter } from 'events';
import { Map } from '../../game/Map/Map';
import { generateForestMap } from '../../game/Map/MapGenerator';
import { GameMode, GameModeConstructor } from '../GameMode/GameMode';
import { Logger } from '../ServerLogger';
import { TickUpdate } from '../TickUpdate';

type EnginePhase = 'initialized' | 'paused' | 'running' | 'finished';

interface EventEmitterMessage {
    updated: [];
    finished: [];
}

/**
 * GameEngine class responsible for simulating games and generating events
 * Simulation flow is handled by SimulationController (for controllable server) & runGame() (for CLI)
 */
export class GameEngine extends EventEmitter<EventEmitterMessage> implements TickUpdate {
    public readonly turnInterval = 0.1; // 100ms per turn

    private _phase: EnginePhase = 'initialized';
    private logger: Logger;
    private currentTime = 0;
    private gameMode: GameMode;
    private map: Map;

    /**
     * Creates a new GameEngine instance
     * @param units - Array of units participating in the game
     * @param logger - Logger instance to record game events
     */
    constructor(
        logger: Logger,
        gameMode: GameModeConstructor,
    ) {
        super();

        this.gameMode = new gameMode(logger, this);
        this.map = generateForestMap(100 * 100, 100 * 100, 1);
        // this.map = new Map(10 * 100, 10 * 100);
        this.logger = logger;
    }

    get phase(): EnginePhase {
        return this._phase;
    }

    set phase(phase: EnginePhase) {
        this.logger.debug(`GameEngine: state changed from ${this._phase} to ${phase}`);

        if (phase === this._phase) {
            throw new Error('GameEngine: state cannot be set to the same value');
        }

        this._phase = phase;

        if (phase === 'finished') {
            this.emit('finished');
        }
    }

    /**
     * Starts a new game simulation
     */
    reset() {
        this.logger.debug('GameEngine: reset');
        this.phase = 'initialized';
        this.currentTime = 0;
        this.logger.clear();
        this.logger.log('Game started');

        this.gameMode.reset();

        this.emit('updated');
    }

    /**
     * Updates the game state by one turn (used for server)
     * @param setToPause - If true, state will be set to "paused"
     */
    update(delayTime: number, setToPause = false) {
        this.logger.debug('GameEngine: update', delayTime, setToPause);

        if (this.phase === 'finished') {
            throw new Error('Game is finished');
        }

        if (this.phase !== 'running') {
            this.phase = 'running';
        }

        if (setToPause) {
            this.phase = 'paused';
        }

        this.currentTime += delayTime;
        this.logger.setTime(this.currentTime);

        this.gameMode.update(delayTime);

        this.emit('updated');
    }

    /**
     * Pauses the game (just sets the state to paused)
     */
    pause() {
        this.phase = 'paused';
        this.emit('updated');
    }

    /**
     * Runs the complete game simulation (used for CLI)
     * @returns Game result including winner and duration
     */
    runGame() {
        // Run game until it ends
        while (this.phase !== 'finished') {
            this.update(this.turnInterval);
        }

        // const winner = this.determineWinner();
        // if (winner) {
        //     this.logger.log(`${winner} wins the game!`);
        // } else {
        //     this.logger.log('Game ends in a draw!');
        // }

        // return gamemode.gameResult

        return {
            // winner: winner,
            duration: this.currentTime,
            events: this.logger.getEvents(),
        };
    }

    getState() {
        return {
            time: this.currentTime,
            phase: this.phase,
            gameMode: this.gameMode.getState(),
            map: this.map.getState(),
        };
    }
}
